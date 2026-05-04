export enum Platform {
  CODEFORCES = 'Codeforces',
}

export interface UserProfile {
  id: string;
  displayName: string;
  timezone: string;
  deadline?: string;
  settings: UserSettings;
  goals: GoalRecord[];
  createdAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  primaryPlatform?: Platform;
}

export interface Account {
  id: string;
  userId: string;
  platform: Platform;
  handle: string;
  profileUrl: string;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  lastSyncTime?: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  solvedCount?: number;
  rawStats?: {
    verdicts: Record<string, number>;
    languages: Record<string, number>;
  };
}

export interface ContestRecord {
  id: string;
  platform: Platform;
  title: string;
  date: string;
  rank: number;
  ratingBefore?: number;
  ratingAfter?: number;
  delta?: number;
  solvedCount: number;
  totalProblems: number;
  problems: {
    id: string;
    title: string;
    index: string;
    solved: boolean;
    points?: number;
  }[];
}

export interface ProblemRecord {
  id: string;
  platform: Platform;
  title: string;
  url: string;
  difficulty: number | string;
  tags: string[];
  index?: string;
  inferredTopic?: string;
  status: 'SOLVED' | 'UNSOLVED' | 'ATTEMPTED';
  attempts: number;
  firstSolveTime?: string;
  lastAttemptTime: string;
}

export interface GoalRecord {
  id: string;
  type: 'RATING' | 'SOLVED_COUNT' | 'STREAK' | 'CONTEST_PARTICIPATION';
  title: string;
  target: number;
  current: number;
  deadline?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  platform?: Platform;
}

export interface DashboardStats {
  totalSolved: number;
  totalContests: number;
  currentStreak: number;
  maxStreak: number;
  ratingTrends: { date: string; [platform: string]: number | string }[];
  topicDistribution: { topic: string; count: number }[];
  weaknessAreas: {
    topic: string;
    score: number;
    reason: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];

  consistencyScore: number;
  readinessScore: number;
  upsolveScore: number;
  difficultyDistribution: { level: string; count: number }[];
  recentActivityMap: { date: string; count: number }[];
  platformBreakdown: { platform: string; rating: number; solved: number; contests: number }[];
  solvingSpeedTrend: { date: string; avgAttempts: number }[];

  verdictsDistribution: { name: string; value: number }[];
  languagesDistribution: { name: string; value: number }[];
  indexDistribution: { level: string; count: number }[];

  overallSummary: {
    tried: number;
    solved: number;
    avgAttempts: number;
    maxAttempts: { count: number; problem: string };
    oneShotSolves: { count: number; percentage: string };
    maxACs: number;
  };

  contestSummary: {
    count: number;
    bestRank: { rank: number; contest: string };
    worstRank: { rank: number; contest: string };
    maxUp: number;
    maxDown: number;
  };
}
