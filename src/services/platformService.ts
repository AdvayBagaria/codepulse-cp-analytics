import { Account, ContestRecord, Platform, ProblemRecord } from '../types';

const CF_API_BASE = 'https://codeforces.com/api';

type CFResponse<T> = {
  status: 'OK' | 'FAILED';
  comment?: string;
  result: T;
};

interface CFUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
}

interface CFContestRatingRow {
  contestId: number;
  contestName: string;
  ratingUpdateTimeSeconds: number;
  rank: number;
  oldRating: number;
  newRating: number;
}

interface CFSubmission {
  id: number;
  creationTimeSeconds: number;
  verdict?: string;
  programmingLanguage?: string;
  contestId?: number;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    rating?: number;
    tags?: string[];
    points?: number;
  };
}

interface CFProblem {
  contestId?: number;
  index: string;
  name: string;
  rating?: number;
  tags?: string[];
  points?: number;
}

async function fetchCodeforcesJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${CF_API_BASE}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Codeforces API request failed (${response.status}) for ${endpoint}`);
  }

  const data = (await response.json()) as CFResponse<T>;
  if (!data || data.status !== 'OK') {
    throw new Error((data && data.comment) || `Codeforces API returned an error for ${endpoint}`);
  }

  return data.result;
}

export async function fetchCodeforcesData(handle: string): Promise<{
  accountInfo: Partial<Account>;
  contests: ContestRecord[];
  problems: ProblemRecord[];
}> {
  const cleanHandle = handle.trim();
  if (!cleanHandle) {
    throw new Error('Codeforces handle is required.');
  }

  const MAX_SUBMISSIONS = 1000;

  // Fetch sequentially to respect Codeforces rate limits
  const userResult = await fetchCodeforcesJson<CFUser[]>(
    `user.info?handles=${encodeURIComponent(cleanHandle)}`
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  const ratingResult = await fetchCodeforcesJson<CFContestRatingRow[]>(
    `user.rating?handle=${encodeURIComponent(cleanHandle)}`
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  const statusResult = await fetchCodeforcesJson<CFSubmission[]>(
    `user.status?handle=${encodeURIComponent(cleanHandle)}&from=1&count=${MAX_SUBMISSIONS}`
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  const problemsetResult = await fetchCodeforcesJson<{ problems: CFProblem[] }>(
    'problemset.problems'
  );

  const user = userResult[0];
  if (!user) {
    throw new Error('No Codeforces user returned for that handle.');
  }

  const allKnownProblems = Array.isArray(problemsetResult?.problems)
    ? problemsetResult.problems
    : [];
  const contestProblemMap = new Map<
    string,
    {
      id: string;
      title: string;
      index: string;
      solved: boolean;
      points?: number;
    }[]
  >();

  allKnownProblems.forEach((p) => {
    if (!p.contestId) return;
    const cid = String(p.contestId);
    const next = contestProblemMap.get(cid) || [];
    next.push({
      id: `${cid}${p.index}`,
      title: p.name,
      index: p.index,
      solved: false,
      points: p.points || (p.rating ? Math.floor(p.rating / 2) : 500),
    });
    contestProblemMap.set(cid, next);
  });

  const verdictsCount: Record<string, number> = {};
  const languagesCount: Record<string, number> = {};
  const problemMap = new Map<string, ProblemRecord>();

  for (const sub of statusResult) {
    const p = sub.problem;
    const contestId = String(sub.contestId || p.contestId || '');
    const hasContest = contestId.length > 0;
    const id = hasContest ? `${contestId}${p.index}` : `${p.name}-${p.index}`;

    const verdict = sub.verdict || 'UNKNOWN';
    verdictsCount[verdict] = (verdictsCount[verdict] || 0) + 1;

    const language = sub.programmingLanguage || 'Unknown';
    languagesCount[language] = (languagesCount[language] || 0) + 1;

    if (hasContest) {
      const list = contestProblemMap.get(contestId) || [];
      const existingContestProblem = list.find((item) => item.index === p.index);

      if (sub.verdict === 'OK') {
        if (existingContestProblem) {
          existingContestProblem.solved = true;
        } else {
          list.push({
            id,
            title: p.name,
            index: p.index,
            solved: true,
            points: p.points || 500,
          });
        }
        contestProblemMap.set(contestId, list);
      } else if (!contestProblemMap.has(contestId)) {
        contestProblemMap.set(contestId, [
          {
            id,
            title: p.name,
            index: p.index,
            solved: false,
            points: p.points || 500,
          },
        ]);
      }
    }

    const existing = problemMap.get(id);
    const solvedAt = new Date(sub.creationTimeSeconds * 1000).toISOString();

    if (!existing) {
      problemMap.set(id, {
        id,
        platform: Platform.CODEFORCES,
        title: p.name,
        url: hasContest
          ? `https://codeforces.com/contest/${contestId}/problem/${p.index}`
          : `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
        index: p.index,
        difficulty: p.rating || 0,
        tags: Array.isArray(p.tags) ? p.tags : [],
        status: sub.verdict === 'OK' ? 'SOLVED' : 'ATTEMPTED',
        attempts: 1,
        lastAttemptTime: solvedAt,
        firstSolveTime: sub.verdict === 'OK' ? solvedAt : undefined,
      });
    } else {
      existing.attempts += 1;
      existing.lastAttemptTime = solvedAt;
      if (sub.verdict === 'OK') {
        existing.status = 'SOLVED';
        if (!existing.firstSolveTime || solvedAt < existing.firstSolveTime) {
          existing.firstSolveTime = solvedAt;
        }
      } else if (existing.status !== 'SOLVED') {
        existing.status = existing.attempts > 1 ? 'ATTEMPTED' : existing.status;
      }
    }
  }

  const contests: ContestRecord[] = ratingResult.map((r) => {
    const contestId = String(r.contestId);
    const contestProblems = contestProblemMap.get(contestId) || [];
    return {
      id: contestId,
      platform: Platform.CODEFORCES,
      title: r.contestName,
      date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString(),
      rank: r.rank,
      ratingBefore: r.oldRating,
      ratingAfter: r.newRating,
      delta: r.newRating - r.oldRating,
      solvedCount: contestProblems.filter((cp) => cp.solved).length,
      totalProblems: contestProblems.length,
      problems: contestProblems.sort((a, b) => a.index.localeCompare(b.index)),
    };
  });

  return {
    accountInfo: {
      id: `cf_${user.handle}`,
      userId: `cf_${user.handle}`,
      platform: Platform.CODEFORCES,
      handle: user.handle,
      profileUrl: `https://codeforces.com/profile/${user.handle}`,
      syncStatus: 'success',
      lastSyncTime: new Date().toISOString(),
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      solvedCount: Array.from(problemMap.values()).filter((p) => p.status === 'SOLVED').length,
      rawStats: {
        verdicts: verdictsCount,
        languages: languagesCount,
      },
    },
    contests,
    problems: Array.from(problemMap.values()),
  };
}
