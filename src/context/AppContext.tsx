import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { format } from 'date-fns';
import {
  Account,
  ContestRecord,
  DashboardStats,
  Platform,
  ProblemRecord,
  UserProfile,
} from '../types';
import { storage } from '../lib/storage';
import { fetchCodeforcesData } from '../services/platformService';
import { makeId } from '../lib/normalise';

interface AppContextType {
  profile: UserProfile | null;
  accounts: Account[];
  contests: ContestRecord[];
  problems: ProblemRecord[];
  stats: DashboardStats | null;
  isLoading: boolean;
  addAccount: (platform: Platform, handle: string) => Promise<void>;
  removeAccount: (accountId: string) => void;
  syncAccount: (accountId: string) => Promise<void>;
  syncAllAccounts: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const dateKey = (value: string | Date) => format(new Date(value), 'yyyy-MM-dd');
const dateFromKey = (key: string) => new Date(`${key}T12:00:00`);

function safeLocaleDateLabel(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const calculateUserStats = (
  problems: ProblemRecord[],
  contests: ContestRecord[],
  accounts: Account[]
): DashboardStats => {
  const solved = problems.filter((p) => p.status === 'SOLVED');

  const topics: Record<string, number> = {};
  solved.forEach((p) => {
    (p.tags ?? []).forEach((tag) => {
      topics[tag] = (topics[tag] || 0) + 1;
    });
  });

  const topicDistribution = Object.entries(topics)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const sortedContests = [...contests].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const platformRatings: Record<string, number> = {};
  const ratingTrends = sortedContests.map((c) => {
    platformRatings[c.platform] = c.ratingAfter ?? c.ratingBefore ?? 0;
    return {
      date: safeLocaleDateLabel(c.date),
      timestamp: new Date(c.date).getTime(),
      ...platformRatings,
    };
  });

  type WeaknessArea = {
    topic: string;
    score: number;
    reason: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  const weaknessAreas: WeaknessArea[] = [];
  const topicStats: Record<string, { solved: number; attempted: number; avgDifficulty: number }> =
    {};

  problems.forEach((p) => {
    (p.tags ?? []).forEach((tag) => {
      if (!topicStats[tag]) topicStats[tag] = { solved: 0, attempted: 0, avgDifficulty: 0 };
      if (p.status === 'SOLVED') {
        topicStats[tag].solved += 1;
        topicStats[tag].avgDifficulty += Number(p.difficulty) || 0;
      }
      topicStats[tag].attempted += 1;
    });
  });

  Object.entries(topicStats).forEach(([topic, s]) => {
    if (s.attempted < 2) return;

    const successRate = s.solved / s.attempted;
    const avgDiff = s.solved > 0 ? s.avgDifficulty / s.solved : 0;
    let priority: WeaknessArea['priority'] = 'LOW';
    let reason = '';

    if (successRate < 0.4 && s.attempted >= 3) {
      priority = 'HIGH';
      reason = `Critical failure rate (${Math.round(successRate * 100)}%) across ${s.attempted} attempts.`;
    } else if (successRate < 0.6) {
      priority = 'MEDIUM';
      reason = `Inconsistent performance (${Math.round(successRate * 100)}%) - needs reinforcement.`;
    } else if (s.solved > 0 && avgDiff < 1200 && solved.length > 50) {
      priority = 'MEDIUM';
      reason = 'Solving only low-difficulty problems in this category.';
    }

    if (priority !== 'LOW') {
      weaknessAreas.push({ topic, score: Math.round(successRate * 100), reason, priority });
    }
  });

  const sortedWeakness = weaknessAreas.sort((a, b) => {
    const priorityOrder: Record<WeaknessArea['priority'], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const delta = priorityOrder[a.priority] - priorityOrder[b.priority];
    return delta !== 0 ? delta : a.score - b.score;
  });

  const difficulties: Record<string, number> = {};
  solved.forEach((p) => {
    const diffKey =
      typeof p.difficulty === 'number' ? String(p.difficulty) : String(p.difficulty || 'Unknown');
    difficulties[diffKey] = (difficulties[diffKey] || 0) + 1;
  });

  const difficultyDistribution = Object.entries(difficulties)
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => {
      const aNum = Number.parseInt(a.level, 10);
      const bNum = Number.parseInt(b.level, 10);
      if (Number.isNaN(aNum) && Number.isNaN(bNum)) return a.level.localeCompare(b.level);
      if (Number.isNaN(aNum)) return 1;
      if (Number.isNaN(bNum)) return -1;
      return aNum - bNum;
    });

  const platformBreakdown = accounts.map((acc) => {
    const accContests = contests.filter((c) => c.platform === acc.platform);
    const accSolved = solved.filter((p) => p.platform === acc.platform);
    return {
      platform: acc.platform,
      rating: acc.rating || 0,
      solved: accSolved.length,
      contests: accContests.length,
    };
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSolves = solved.filter(
    (p) => p.firstSolveTime && new Date(p.firstSolveTime) > thirtyDaysAgo
  );
  const activeDays = new Set(recentSolves.map((p) => dateKey(p.firstSolveTime!))).size;
  const consistencyScore = Math.min(100, Math.round((activeDays / 20) * 100));

  const recentContests = sortedContests.slice(-5);
  const avgDelta =
    recentContests.length > 0
      ? recentContests.reduce((sum, c) => sum + (c.delta || 0), 0) / recentContests.length
      : 0;
  const readinessScore = Math.min(100, Math.max(0, Math.round(50 + avgDelta * 2)));

  let totalMissed = 0;
  let upsolvedCount = 0;
  contests.forEach((c) => {
    c.problems?.forEach((p) => {
      if (!p.solved) {
        totalMissed += 1;
        const isSolvedLater = problems.some((pr) => pr.id === p.id && pr.status === 'SOLVED');
        if (isSolvedLater) upsolvedCount += 1;
      }
    });
  });
  const upsolveScore = totalMissed > 0 ? Math.round((upsolvedCount / totalMissed) * 100) : 100;

  const activityMap: Record<string, number> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - today.getDay());
  const startDate = new Date(lastSunday);
  startDate.setDate(lastSunday.getDate() - 11 * 7);

  const recentDays: string[] = [];
  for (let i = 0; i < 84; i += 1) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = dateKey(d);
    activityMap[key] = 0;
    recentDays.push(key);
  }

  solved.forEach((p) => {
    if (!p.firstSolveTime) return;
    const firstSolve = new Date(p.firstSolveTime);
    if (Number.isNaN(firstSolve.getTime())) return;
    const key = dateKey(firstSolve);
    if (activityMap[key] !== undefined) activityMap[key] += 1;
  });

  const recentActivityMap = recentDays.map((date) => ({ date, count: activityMap[date] ?? 0 }));

  let currentStreak = 0;
  let maxStreak = 0;
  const todayKey = dateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);

  const streakAnchor =
    activityMap[todayKey] > 0 ? today : activityMap[yesterdayKey] > 0 ? yesterday : null;
  if (streakAnchor) {
    let cursor = new Date(streakAnchor);
    while (activityMap[dateKey(cursor)] > 0) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const solveDates = Array.from(
    new Set(
      solved
        .filter((p) => {
          if (!p.firstSolveTime) return false;
          const d = new Date(p.firstSolveTime);
          return !Number.isNaN(d.getTime());
        })
        .map((p) => dateKey(p.firstSolveTime!))
    )
  ).sort();
  if (solveDates.length > 0) {
    let run = 0;
    let lastDate: Date | null = null;

    solveDates.forEach((key) => {
      const currentDate = dateFromKey(key);
      if (!lastDate) {
        run = 1;
      } else {
        const diffDays = Math.round(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        run = diffDays === 1 ? run + 1 : 1;
      }
      maxStreak = Math.max(maxStreak, run);
      lastDate = currentDate;
    });
  }

  const verdicts: Record<string, number> = {};
  const languages: Record<string, number> = {};
  accounts.forEach((acc) => {
    if (acc.rawStats?.verdicts) {
      Object.entries(acc.rawStats.verdicts).forEach(([verdict, count]) => {
        if (!verdict || verdict === 'undefined' || verdict === 'null') return;
        const pretty = String(verdict)
          .replace(/_/g, ' ')
          .toLowerCase()
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');
        verdicts[pretty] = (verdicts[pretty] || 0) + Number(count || 0);
      });
    }

    if (acc.rawStats?.languages) {
      Object.entries(acc.rawStats.languages).forEach(([language, count]) => {
        if (!language || language === 'undefined' || language === 'null') return;
        languages[String(language)] = (languages[String(language)] || 0) + Number(count || 0);
      });
    }
  });

  const verdictsDistribution = Object.entries(verdicts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const languagesDistribution = Object.entries(languages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const indices: Record<string, number> = {};
  solved.forEach((p) => {
    if (!p.index) return;
    const level = String(p.index).trim().toUpperCase().charAt(0);
    if (/[A-Z0-9]/.test(level)) indices[level] = (indices[level] || 0) + 1;
  });
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((level) => {
    if (indices[level] === undefined) indices[level] = 0;
  });
  const indexDistribution = Object.entries(indices)
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => a.level.localeCompare(b.level));

  const totalTried = problems.length;
  const totalSolvedProblemCount = solved.length;
  const totalAttempts = problems.reduce((sum, p) => sum + p.attempts, 0);
  const avgAttemptsOverall = totalTried > 0 ? Number((totalAttempts / totalTried).toFixed(2)) : 0;

  let maxAttMap = { count: 0, problem: 'None' };
  problems.forEach((p) => {
    if (p.attempts > maxAttMap.count)
      maxAttMap = { count: p.attempts, problem: `${p.title} (${p.id})` };
  });

  const oneShotSolves = solved.filter((p) => p.attempts === 1).length;
  const oneShotPercentage =
    totalSolvedProblemCount > 0
      ? `${((oneShotSolves / totalSolvedProblemCount) * 100).toFixed(2)}%`
      : '0%';
  const maxACs =
    recentActivityMap.length > 0 ? Math.max(...recentActivityMap.map((d) => d.count)) : 0;

  let bestRank = { rank: Number.POSITIVE_INFINITY, contest: 'None' };
  let worstRank = { rank: 0, contest: 'None' };
  let maxUp = 0;
  let maxDown = 0;

  contests.forEach((c) => {
    if (c.rank < bestRank.rank) bestRank = { rank: c.rank, contest: c.title };
    if (c.rank > worstRank.rank) worstRank = { rank: c.rank, contest: c.title };
    if (typeof c.delta === 'number') {
      if (c.delta > maxUp) maxUp = c.delta;
      if (c.delta < maxDown) maxDown = c.delta;
    }
  });

  const solvingSpeedAccumulator = new Map<string, { sum: number; count: number }>();
  solved.forEach((p) => {
    if (!p.firstSolveTime) return;
    const key = dateKey(p.firstSolveTime);
    const current = solvingSpeedAccumulator.get(key) || { sum: 0, count: 0 };
    current.sum += p.attempts;
    current.count += 1;
    solvingSpeedAccumulator.set(key, current);
  });

  const solvingSpeedTrend = Array.from(solvingSpeedAccumulator.entries())
    .map(([date, entry]) => ({ date, avgAttempts: Number((entry.sum / entry.count).toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSolved: solved.length,
    totalContests: contests.length,
    currentStreak,
    maxStreak,
    ratingTrends,
    topicDistribution,
    weaknessAreas: sortedWeakness.slice(0, 3),
    consistencyScore,
    readinessScore,
    upsolveScore,
    difficultyDistribution,
    recentActivityMap,
    platformBreakdown,
    solvingSpeedTrend,
    verdictsDistribution,
    languagesDistribution,
    indexDistribution,
    overallSummary: {
      tried: totalTried,
      solved: totalSolvedProblemCount,
      avgAttempts: avgAttemptsOverall,
      maxAttempts: maxAttMap,
      oneShotSolves: { count: oneShotSolves, percentage: oneShotPercentage },
      maxACs,
    },
    contestSummary: {
      count: contests.length,
      bestRank: Number.isFinite(bestRank.rank) ? bestRank : { rank: 0, contest: 'None' },
      worstRank,
      maxUp,
      maxDown,
    },
  };
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contests, setContests] = useState<ContestRecord[]>([]);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const accountsRef = useRef<Account[]>([]);
  const syncCounterRef = useRef(0);

  useEffect(() => {
    accountsRef.current = accounts;
  }, [accounts]);

  useEffect(() => {
    try {
      let loadedProfile = storage.getProfile();
      const loadedAccounts = storage.getAccounts();
      const loadedContests = storage.getContests();
      const loadedProblems = storage.getProblems();

      if (!loadedProfile) {
        loadedProfile = {
          id:
            typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
              ? crypto.randomUUID()
              : makeId('profile'),
          displayName: 'Guest Grinder',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          createdAt: new Date().toISOString(),
          settings: { theme: 'system', primaryPlatform: Platform.CODEFORCES },
          goals: [],
        };
        storage.saveProfile(loadedProfile);
      }

      setProfile(loadedProfile);
      setAccounts(loadedAccounts);
      setContests(loadedContests);
      setProblems(loadedProblems);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistAccounts = useCallback((next: Account[]) => {
    storage.saveAccounts(next);
    setAccounts(next);
  }, []);

  const persistContests = useCallback((next: ContestRecord[]) => {
    storage.saveContests(next);
    setContests(next);
  }, []);

  const persistProblems = useCallback((next: ProblemRecord[]) => {
    storage.saveProblems(next);
    setProblems(next);
  }, []);

  const beginSync = useCallback(() => {
    syncCounterRef.current += 1;
    setIsSyncing(true);
  }, []);

  const endSync = useCallback(() => {
    syncCounterRef.current = Math.max(0, syncCounterRef.current - 1);
    if (syncCounterRef.current === 0) setIsSyncing(false);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next: UserProfile = {
        ...prev,
        ...updates,
        settings: {
          ...prev.settings,
          ...(updates.settings || {}),
        },
      };
      storage.saveProfile(next);
      return next;
    });
  }, []);

  const syncAccount = useCallback(
    async (accountId: string, overrideAccount?: Account) => {
      const existing =
        overrideAccount ?? accountsRef.current.find((account) => account.id === accountId);
      if (!existing) throw new Error('Account not found.');

      beginSync();
      try {
        persistAccounts(
          accountsRef.current.some((account) => account.id === accountId)
            ? accountsRef.current.map((account) =>
                account.id === accountId ? { ...account, syncStatus: 'syncing' } : account
              )
            : [...accountsRef.current, { ...existing, syncStatus: 'syncing' }]
        );

        const data = await fetchCodeforcesData(existing.handle);
        const updatedAccount: Account = {
          ...existing,
          ...data.accountInfo,
          platform: Platform.CODEFORCES,
          syncStatus: 'success',
          lastSyncTime: new Date().toISOString(),
        };

        const nextAccounts = accountsRef.current.some((account) => account.id === accountId)
          ? accountsRef.current.map((account) =>
              account.id === accountId ? updatedAccount : account
            )
          : [...accountsRef.current, updatedAccount];
        persistAccounts(nextAccounts);

        const nextContests = [
          ...contests.filter((c) => c.platform !== Platform.CODEFORCES),
          ...data.contests.filter((newC) => !contests.some((existing) => existing.id === newC.id)),
        ];

        const nextProblems = [
          ...problems.filter((p) => p.platform !== Platform.CODEFORCES),
          ...data.problems.filter((newP) => !problems.some((existing) => existing.id === newP.id)),
        ];

        persistContests(nextContests);
        persistProblems(nextProblems);
      } catch (error) {
        console.error('Sync failed', error);
        const nextAccounts = accountsRef.current.map((account) =>
          account.id === accountId ? { ...account, syncStatus: 'error' as const } : account
        );
        persistAccounts(nextAccounts);
        throw error;
      } finally {
        endSync();
      }
    },
    [beginSync, endSync, persistAccounts, persistContests, persistProblems, contests, problems]
  );

  const addAccount = useCallback(
    async (_platform: Platform, handle: string) => {
      const cleanHandle = handle.trim();
      if (!cleanHandle) {
        throw new Error('Codeforces handle is required.');
      }

      const newAccount: Account = {
        id: makeId('account'),
        userId: profile?.id || 'default',
        platform: Platform.CODEFORCES,
        handle: cleanHandle,
        profileUrl: '',
        syncStatus: 'idle',
      };

      await syncAccount(newAccount.id, newAccount);
    },
    [profile?.id, syncAccount]
  );

  const removeAccount = useCallback((accountId: string) => {
    const remainingAccounts = accountsRef.current.filter((account) => account.id !== accountId);
    storage.saveAccounts(remainingAccounts);
    setAccounts(remainingAccounts);
  }, []);

  const syncAllAccounts = useCallback(async () => {
    const snapshot = [...accountsRef.current];
    await Promise.allSettled(snapshot.map((account) => syncAccount(account.id)));
  }, [syncAccount]);

  const stats = useMemo(
    () => (profile ? calculateUserStats(problems, contests, accounts) : null),
    [profile, problems, contests, accounts]
  );

  return (
    <AppContext.Provider
      value={{
        profile,
        accounts,
        contests,
        problems,
        stats,
        isLoading,
        addAccount,
        removeAccount,
        syncAccount,
        syncAllAccounts,
        updateProfile,
        isSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
