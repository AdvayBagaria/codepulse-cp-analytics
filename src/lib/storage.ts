import { Account, ContestRecord, ProblemRecord, UserProfile } from '../types';
import {
  normalizeAccounts,
  normalizeContests,
  normalizeProblems,
  normalizeProfile,
} from './normalise';

const STORAGE_KEYS = {
  PROFILE: 'cp_atlas_profile',
  ACCOUNTS: 'cp_atlas_accounts',
  CONTESTS: 'cp_atlas_contests',
  PROBLEMS: 'cp_atlas_problems',
} as const;

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const data = window.localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!hasStorage()) return;
  try {
    const json = JSON.stringify(value);
    // Check size (5MB typical localStorage limit)
    if (json.length > 5 * 1024 * 1024) {
      throw new Error('Data exceeds storage limit (5MB)');
    }
    window.localStorage.setItem(key, json);
  } catch (error) {
    console.error('Storage write failed:', error);
    // Dispatch event for UI notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('storageError', {
          detail: { error, key },
        })
      );
    }
  }
}

function removeJson(key: string) {
  if (!hasStorage()) return;
  window.localStorage.removeItem(key);
}

export const storage = {
  saveProfile: (profile: UserProfile) => writeJson(STORAGE_KEYS.PROFILE, profile),
  getProfile: (): UserProfile | null =>
    normalizeProfile(readJson<unknown>(STORAGE_KEYS.PROFILE, null)),

  saveAccounts: (accounts: Account[]) => writeJson(STORAGE_KEYS.ACCOUNTS, accounts),
  getAccounts: (): Account[] => normalizeAccounts(readJson<unknown>(STORAGE_KEYS.ACCOUNTS, [])),

  saveContests: (contests: ContestRecord[]) => writeJson(STORAGE_KEYS.CONTESTS, contests),
  getContests: (): ContestRecord[] =>
    normalizeContests(readJson<unknown>(STORAGE_KEYS.CONTESTS, [])),

  saveProblems: (problems: ProblemRecord[]) => writeJson(STORAGE_KEYS.PROBLEMS, problems),
  getProblems: (): ProblemRecord[] =>
    normalizeProblems(readJson<unknown>(STORAGE_KEYS.PROBLEMS, [])),

  exportData: () => {
    const data = {
      profile: storage.getProfile(),
      accounts: storage.getAccounts(),
      contests: storage.getContests(),
      problems: storage.getProblems(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (json: string) => {
    try {
      const parsed = JSON.parse(json) as Partial<{
        profile: unknown;
        accounts: unknown;
        contests: unknown;
        problems: unknown;
      }>;

      const profile = normalizeProfile(parsed.profile);
      if (profile) storage.saveProfile(profile);
      storage.saveAccounts(normalizeAccounts(parsed.accounts));
      storage.saveContests(normalizeContests(parsed.contests));
      storage.saveProblems(normalizeProblems(parsed.problems));
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  clear: () => {
    removeJson(STORAGE_KEYS.PROFILE);
    removeJson(STORAGE_KEYS.ACCOUNTS);
    removeJson(STORAGE_KEYS.CONTESTS);
    removeJson(STORAGE_KEYS.PROBLEMS);
  },
};
