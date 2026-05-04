import { describe, it, expect } from 'vitest';
import { calculateUserStats } from '../context/AppContext';
import { ProblemRecord, ContestRecord, Account } from '../types';

const createProblem = (overrides: Partial<ProblemRecord> = {}): ProblemRecord => ({
  id: '1',
  platform: 'Codeforces' as any,
  title: 'Test Problem',
  url: '',
  difficulty: 1000,
  tags: [],
  status: 'SOLVED',
  attempts: 1,
  lastAttemptTime: new Date().toISOString(),
  firstSolveTime: new Date().toISOString(),
  ...overrides,
});

describe('calculateUserStats', () => {
  it('calculates totalSolved correctly', () => {
    const problems: ProblemRecord[] = [
      createProblem({ id: '1' }),
      createProblem({ id: '2' }),
      createProblem({ id: '3', status: 'ATTEMPTED' }),
    ];
    const contests: ContestRecord[] = [];
    const accounts: Account[] = [];

    const stats = calculateUserStats(problems, contests, accounts);

    expect(stats.totalSolved).toBe(2);
  });

  it('calculates totalContests correctly', () => {
    const problems: ProblemRecord[] = [];
    const contests: ContestRecord[] = [
      {
        id: 'c1',
        platform: 'Codeforces' as any,
        title: 'Contest 1',
        date: new Date().toISOString(),
        rank: 100,
        solvedCount: 3,
        totalProblems: 5,
        problems: [],
      },
      {
        id: 'c2',
        platform: 'Codeforces' as any,
        title: 'Contest 2',
        date: new Date().toISOString(),
        rank: 200,
        solvedCount: 2,
        totalProblems: 4,
        problems: [],
      },
    ];
    const accounts: Account[] = [];

    const stats = calculateUserStats(problems, contests, accounts);

    expect(stats.totalContests).toBe(2);
  });

  it('calculates topicDistribution', () => {
    const problems: ProblemRecord[] = [
      createProblem({ tags: ['math', 'dp'] }),
      createProblem({ tags: ['math'] }),
      createProblem({ tags: ['greedy'] }),
    ];
    const contests: ContestRecord[] = [];
    const accounts: Account[] = [];

    const stats = calculateUserStats(problems, contests, accounts);

    expect(stats.topicDistribution.some((t) => t.topic === 'math' && t.count === 2)).toBe(true);
    expect(stats.topicDistribution.some((t) => t.topic === 'dp' && t.count === 1)).toBe(true);
    expect(stats.topicDistribution.some((t) => t.topic === 'greedy' && t.count === 1)).toBe(true);
  });
});
