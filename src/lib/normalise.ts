import { Account, ContestRecord, GoalRecord, Platform, ProblemRecord, UserProfile } from '../types';

const GOAL_TYPES: GoalRecord['type'][] = [
  'RATING',
  'SOLVED_COUNT',
  'STREAK',
  'CONTEST_PARTICIPATION',
];
const GOAL_STATUSES: GoalRecord['status'][] = ['IN_PROGRESS', 'COMPLETED', 'FAILED'];
const SYNC_STATUSES: Account['syncStatus'][] = ['idle', 'syncing', 'error', 'success'];
const THEMES: UserProfile['settings']['theme'][] = ['light', 'dark', 'system'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function safeNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function safeDateIso(value: unknown, fallback = new Date().toISOString()): string {
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) ? date.toISOString() : fallback;
}

export function makeId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePlatform(_: unknown): Platform {
  return Platform.CODEFORCES;
}

function normalizeGoalType(value: unknown): GoalRecord['type'] {
  return typeof value === 'string' && GOAL_TYPES.includes(value as GoalRecord['type'])
    ? (value as GoalRecord['type'])
    : 'RATING';
}

function normalizeGoalStatus(value: unknown): GoalRecord['status'] {
  return typeof value === 'string' && GOAL_STATUSES.includes(value as GoalRecord['status'])
    ? (value as GoalRecord['status'])
    : 'IN_PROGRESS';
}

function normalizeSyncStatus(value: unknown): Account['syncStatus'] {
  return typeof value === 'string' && SYNC_STATUSES.includes(value as Account['syncStatus'])
    ? (value as Account['syncStatus'])
    : 'idle';
}

function normalizeTheme(value: unknown): UserProfile['settings']['theme'] {
  return typeof value === 'string' && THEMES.includes(value as UserProfile['settings']['theme'])
    ? (value as UserProfile['settings']['theme'])
    : 'system';
}

export function normalizeGoal(value: unknown): GoalRecord {
  const source = isRecord(value) ? value : {};
  const type = normalizeGoalType(source.type);
  const target = Math.max(0, safeNumber(source.target, 0));
  const current = Math.max(0, safeNumber(source.current, 0));

  return {
    id: safeString(source.id, makeId('goal')),
    type,
    title:
      safeString(source.title, `${type.replaceAll('_', ' ')} Goal`).trim() ||
      `${type.replaceAll('_', ' ')} Goal`,
    target,
    current,
    deadline:
      typeof source.deadline === 'string' && source.deadline.trim()
        ? safeDateIso(source.deadline)
        : undefined,
    status: normalizeGoalStatus(source.status),
    platform: source.platform === undefined ? undefined : Platform.CODEFORCES,
  };
}

export function normalizeAccount(value: unknown): Account {
  const source = isRecord(value) ? value : {};
  const handle = safeString(source.handle, '').trim() || 'unknown';
  const platform = normalizePlatform(source.platform);
  const profileUrl = safeString(
    source.profileUrl,
    handle !== 'unknown' ? `https://codeforces.com/profile/${handle}` : '#'
  );

  const rawStats = isRecord(source.rawStats) ? source.rawStats : {};
  const verdicts: Record<string, number> = {};
  const languages: Record<string, number> = {};

  if (isRecord(rawStats.verdicts)) {
    Object.entries(rawStats.verdicts).forEach(([key, value]) => {
      verdicts[key] = safeNumber(value, 0);
    });
  }
  if (isRecord(rawStats.languages)) {
    Object.entries(rawStats.languages).forEach(([key, value]) => {
      languages[key] = safeNumber(value, 0);
    });
  }

  return {
    id: safeString(source.id, makeId('account')),
    userId: safeString(source.userId, 'default'),
    platform,
    handle,
    profileUrl,
    syncStatus: normalizeSyncStatus(source.syncStatus),
    lastSyncTime:
      typeof source.lastSyncTime === 'string' ? safeDateIso(source.lastSyncTime) : undefined,
    rating: source.rating === undefined ? undefined : safeNumber(source.rating, 0),
    maxRating: source.maxRating === undefined ? undefined : safeNumber(source.maxRating, 0),
    rank: typeof source.rank === 'string' && source.rank.trim() ? source.rank.trim() : undefined,
    solvedCount:
      source.solvedCount === undefined ? undefined : Math.max(0, safeNumber(source.solvedCount, 0)),
    rawStats: { verdicts, languages },
  };
}

function normalizeContestProblem(value: unknown) {
  const source = isRecord(value) ? value : {};
  return {
    id: safeString(source.id, makeId('contest-problem')),
    title: safeString(source.title, 'Problem'),
    index: safeString(source.index, 'A'),
    solved: Boolean(source.solved),
    points: source.points === undefined ? undefined : safeNumber(source.points, 0),
  };
}

export function normalizeContest(value: unknown): ContestRecord {
  const source = isRecord(value) ? value : {};
  const problems = Array.isArray(source.problems)
    ? source.problems.map(normalizeContestProblem)
    : [];

  return {
    id: safeString(source.id, makeId('contest')),
    platform: Platform.CODEFORCES,
    title: safeString(source.title, 'Contest').trim() || 'Contest',
    date: safeDateIso(source.date, new Date().toISOString()),
    rank: Math.max(0, safeNumber(source.rank, 0)),
    ratingBefore:
      source.ratingBefore === undefined ? undefined : safeNumber(source.ratingBefore, 0),
    ratingAfter: source.ratingAfter === undefined ? undefined : safeNumber(source.ratingAfter, 0),
    delta: source.delta === undefined ? undefined : safeNumber(source.delta, 0),
    solvedCount: Math.max(0, safeNumber(source.solvedCount, 0)),
    totalProblems: Math.max(problems.length, safeNumber(source.totalProblems, problems.length)),
    problems,
  };
}

export function normalizeProblem(value: unknown): ProblemRecord {
  const source = isRecord(value) ? value : {};
  const tags = Array.isArray(source.tags)
    ? source.tags.map((tag) => safeString(tag, '').trim()).filter(Boolean)
    : [];

  const status =
    typeof source.status === 'string' && ['SOLVED', 'UNSOLVED', 'ATTEMPTED'].includes(source.status)
      ? (source.status as ProblemRecord['status'])
      : 'ATTEMPTED';

  return {
    id: safeString(source.id, makeId('problem')),
    platform: Platform.CODEFORCES,
    title: safeString(source.title, 'Untitled Problem').trim() || 'Untitled Problem',
    url: safeString(source.url, '#'),
    difficulty:
      typeof source.difficulty === 'number'
        ? source.difficulty
        : typeof source.difficulty === 'string'
          ? Number.parseInt(source.difficulty, 10) || 0
          : 0,
    tags,
    index:
      typeof source.index === 'string' && source.index.trim()
        ? source.index.trim().toUpperCase()
        : undefined,
    inferredTopic:
      typeof source.inferredTopic === 'string' && source.inferredTopic.trim()
        ? source.inferredTopic.trim()
        : undefined,
    status,
    attempts: Math.max(0, safeNumber(source.attempts, 1)),
    firstSolveTime:
      typeof source.firstSolveTime === 'string' ? safeDateIso(source.firstSolveTime) : undefined,
    lastAttemptTime: safeDateIso(source.lastAttemptTime, new Date().toISOString()),
  };
}

export function normalizeProfile(value: unknown): UserProfile | null {
  if (!isRecord(value)) return null;
  const settings = isRecord(value.settings) ? value.settings : {};
  const goals = Array.isArray(value.goals) ? value.goals.map(normalizeGoal) : [];

  return {
    id: safeString(value.id, makeId('profile')),
    displayName: safeString(value.displayName, 'Guest Grinder').trim() || 'Guest Grinder',
    timezone: safeString(value.timezone, Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'),
    deadline:
      typeof value.deadline === 'string' && value.deadline.trim()
        ? safeDateIso(value.deadline)
        : undefined,
    settings: {
      theme: normalizeTheme(settings.theme),
      primaryPlatform: settings.primaryPlatform === undefined ? undefined : Platform.CODEFORCES,
    },
    goals,
    createdAt: safeDateIso(value.createdAt, new Date().toISOString()),
  };
}

export function normalizeAccounts(value: unknown): Account[] {
  return Array.isArray(value) ? value.map(normalizeAccount) : [];
}

export function normalizeContests(value: unknown): ContestRecord[] {
  return Array.isArray(value) ? value.map(normalizeContest) : [];
}

export function normalizeProblems(value: unknown): ProblemRecord[] {
  return Array.isArray(value) ? value.map(normalizeProblem) : [];
}
