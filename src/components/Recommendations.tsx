import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  ArrowRight,
  Flame,
  Lightbulb,
  BookOpen,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Platform } from '../types';

type RecommendationProblem = {
  id: string;
  platform: Platform;
  title: string;
  url: string;
  difficulty: number | string;
  tags: string[];
  index?: string;
  status: 'SOLVED' | 'UNSOLVED' | 'ATTEMPTED';
  attempts: number;
  lastAttemptTime: string;
  firstSolveTime?: string;
};

function getCodeforcesContestProblemUrl(contestId?: string, index?: string) {
  if (!contestId || !index) return 'https://codeforces.com/problemset';
  return `https://codeforces.com/contest/${contestId}/problem/${index}`;
}

function getCodeforcesTagUrl(tag?: string) {
  if (!tag) return 'https://codeforces.com/problemset';
  return `https://codeforces.com/problemset?tags=${encodeURIComponent(tag.trim())}`;
}

function getRecommendationUrl(problem: RecommendationProblem) {
  if (problem.platform === Platform.CODEFORCES) {
    if (problem.url && problem.url !== '#') return problem.url;
    return getCodeforcesTagUrl(problem.tags[0]);
  }

  return problem.url && problem.url !== '#' ? problem.url : '#';
}

export default function Recommendations() {
  const { stats, problems, contests } = useApp();

  if (!stats) return null;

  const lastContest = contests[contests.length - 1];
  const upsolveTasks = lastContest?.problems.filter((p) => !p.solved) || [];

  const weaknessTags = stats.weaknessAreas.map((w) => w.topic);

  let recommendedProblems = problems
    .filter(
      (p) =>
        p.status !== 'SOLVED' &&
        p.platform === Platform.CODEFORCES &&
        p.tags.some((t) => weaknessTags.includes(t))
    )
    .slice(0, 5);

  if (recommendedProblems.length === 0 && weaknessTags.length > 0) {
    recommendedProblems = weaknessTags.slice(0, 4).map((tag, idx) => ({
      id: `rec-${tag}-${idx}`,
      platform: Platform.CODEFORCES,
      title: `${tag} Practice Set ${idx + 1}`,
      url: getCodeforcesTagUrl(tag),
      difficulty: 1200 + idx * 200,
      tags: [tag],
      index: tag.slice(0, 1).toUpperCase(),
      status: 'UNSOLVED' as const,
      attempts: 0,
      lastAttemptTime: new Date().toISOString(),
    })) as RecommendationProblem[];
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
          Practice Recommendations
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Surgically precise targets based on your {stats.totalSolved} solved problems.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[200px]">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Flame className="w-5 h-5 fill-current" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Critical Upsolve</h3>
              </div>
              <span className="text-[10px] font-bold text-blue-100 uppercase bg-blue-700 px-2 py-1 rounded">
                High Priority
              </span>
            </div>

            <div className="p-6 flex-1">
              {upsolveTasks.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Targets from{' '}
                    <span className="font-bold text-slate-900">{lastContest?.title}</span>.
                    Mastering these will close your current skill gap.
                  </p>

                  <div className="space-y-2">
                    {upsolveTasks.map((p, idx) => {
                      const href = getCodeforcesContestProblemUrl(lastContest?.id, p.index);

                      return (
                        <a
                          key={`${p.index}-${idx}`}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group border border-transparent hover:border-slate-200"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center font-mono text-xs font-bold text-slate-400 shrink-0">
                              {p.index}
                            </div>
                            <span className="text-sm font-semibold text-slate-700 truncate">
                              {p.title}
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase shrink-0">
                            Launch <ArrowRight className="w-3 h-3" />
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-4 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                  <p className="text-sm font-bold text-slate-900">Competitive Cleanliness</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                    You've upsolved 100% of your recent missed problems. Your growth index is
                    excellent.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[300px]">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
                Topic Reinforcement: {weaknessTags.slice(0, 2).join(' & ')}
              </h3>
            </div>

            <div className="p-6 flex-1">
              {recommendedProblems.length > 0 ? (
                <div className="space-y-6">
                  <p className="text-sm text-slate-600">
                    We've identified these targets to improve your{' '}
                    <span className="text-rose-600 font-bold uppercase text-[10px] tracking-widest">
                      {stats.weaknessAreas[0]?.topic}
                    </span>{' '}
                    success rate.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedProblems.map((p, idx) => (
                      <a
                        key={p.id || idx}
                        href={getRecommendationUrl(p)}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all group block"
                      >
                        <div className="flex justify-between items-start mb-3 gap-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {p.platform}
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                            Rating: {p.difficulty || 'Custom'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 mb-2 truncate group-hover:text-blue-700 transition-colors">
                          {p.title}
                        </h4>

                        <div className="flex flex-wrap gap-1">
                          {p.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-8 text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Equilibrium Detected</p>
                  <p className="text-xs mt-1">
                    No significant weakness clusters identified yet. Keep solving!
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Weekly Goal Status
            </h4>

            <div className="space-y-4">
              <GoalProgress
                label="Contests"
                current={
                  contests.filter((c) => {
                    const d = new Date(c.date);
                    const now = new Date();
                    return d.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000;
                  }).length
                }
                target={2}
              />

              <GoalProgress
                label="Solved Problems"
                current={
                  problems.filter((p) => {
                    if (!p.firstSolveTime) return false;
                    const d = new Date(p.firstSolveTime);
                    const now = new Date();
                    return d.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000;
                  }).length
                }
                target={15}
              />
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Skill Gap Warning
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed italic">
              "{stats.weaknessAreas[0]?.topic || 'Dynamic Programming'}" accuracy is below 40%.
              Avoid attempting hard problems in this category until you complete easier
              reinforcement tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalProgress({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const percent = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
        <span>{label}</span>
        <span>
          {current}/{target}
        </span>
      </div>

      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-1000',
            percent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
