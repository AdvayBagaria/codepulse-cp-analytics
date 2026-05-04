import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Trophy, Target, Layout, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../lib/storage';
import { TabId } from './DashboardShell';

export default function Overview({ onNavigate }: { onNavigate?: (tab: TabId) => void }) {
  const { profile, stats, accounts, contests, problems, syncAllAccounts, isSyncing } = useApp();

  if (accounts.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Welcome, Commander</h1>
          <p className="text-slate-500 mt-1 text-sm">
            CP Atlas is ready to analyze your competitive programming journey.
          </p>
        </header>

        <div className="bg-slate-900 rounded-xl p-10 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">
              Connect your Codeforces account to begin analysis.
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Link your Codeforces profile. We'll automatically pull your contest history, solve
              statistics, and identify the topics holding you back.
            </p>
            <button
              onClick={() => onNavigate?.('accounts')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-md text-xs font-bold transition-all uppercase tracking-wider"
            >
              Link Account
            </button>
          </div>

          {/* Subtle tech background elements */}
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="absolute right-10 top-10 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute right-20 top-20 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cp-atlas-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goalsWithDeadline =
    profile?.goals?.filter((g) => g.deadline && g.status === 'IN_PROGRESS') || [];
  const nextGoal =
    goalsWithDeadline.length > 0
      ? [...goalsWithDeadline].sort(
          (a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
        )[0]
      : null;

  const daysToDeadline = nextGoal?.deadline
    ? Math.ceil(
        (new Date(nextGoal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Commander's Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Reviewing activity for{' '}
            <span className="font-semibold">{profile?.displayName || 'user'}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider shadow-sm"
          >
            Export JSON
          </button>
          <button
            disabled={isSyncing}
            onClick={() => syncAllAccounts()}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-wider disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync All'}
          </button>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Unified Rating
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{accounts[0]?.rating || 0}</span>
            <span className="text-slate-400 text-xs font-bold pb-1 uppercase tracking-tighter">
              {accounts[0]?.platform || 'None'}
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Solved Total
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{stats?.totalSolved.toLocaleString() || '0'}</span>
            <span className="text-slate-400 text-xs font-medium pb-1 underline decoration-slate-200">
              Across Platforms
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Consistency
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{stats?.consistencyScore || 0}%</span>
            <span className="text-slate-400 text-xs font-medium pb-1">Last 30 Days</span>
          </div>
        </div>
        {daysToDeadline !== null ? (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl border-b-4 border-b-rose-600 shadow-sm text-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Days to Goal
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-rose-400">{daysToDeadline}</span>
              <span className="text-slate-400 text-xs font-medium pb-1 italic">
                Focus: {nextGoal?.title}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-5 rounded-xl border-b-4 border-b-blue-600 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Readiness
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{stats?.readinessScore || 0}%</span>
              <span className="text-slate-400 text-xs font-medium pb-1 italic">Contest Form</span>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-12 gap-8">
        {/* Rating Trend Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
              Performance Trend
            </h3>
            <div className="flex gap-4 text-xs font-bold text-slate-400">
              {accounts.map((acc, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: idx === 0 ? '#3B82F6' : '#F59E0B' }}
                  ></div>
                  {acc.platform}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.ratingTrends}>
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                {accounts.map((acc, idx) => (
                  <Area
                    key={idx}
                    type="monotone"
                    dataKey={acc.platform as string}
                    stroke={idx === 0 ? '#3B82F6' : '#F59E0B'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={idx === 0 ? 'url(#colorRating)' : 'transparent'}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar: Weakness & Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div> Weakness Detection
            </h3>
            <div className="space-y-4">
              {stats?.weaknessAreas.length === 0 ? (
                <p className="text-slate-400 text-xs italic">
                  No critical vulnerabilities detected. Keep grinding.
                </p>
              ) : (
                stats?.weaknessAreas.map((w, index) => (
                  <div key={index} className="group cursor-default">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-slate-700">{w.topic}</span>
                      <span className="text-[10px] font-mono text-red-500 font-bold">
                        {w.score}% Success
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full transition-all duration-500"
                        style={{ width: `${w.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {stats?.weaknessAreas.length > 0 && (
              <button
                onClick={() => onNavigate?.('topics')}
                className="mt-6 w-full py-2 bg-slate-50 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-lg border border-slate-100"
              >
                View All Topics
              </button>
            )}
          </div>

          <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">
              Next Recommended Action
            </h3>
            <p className="text-sm leading-relaxed mb-4 font-medium italic">
              {stats?.weaknessAreas[0]
                ? `Prioritize "${stats.weaknessAreas[0].topic}" reinforcement problems. Your current accuracy in this domain is suboptimal.`
                : 'Your foundation is solid. Focus on upsolving the latest contest problems to push your limits.'}
            </p>
            <button
              onClick={() => onNavigate?.('recommendations')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg text-xs font-bold uppercase tracking-wider"
            >
              Go to Recommendations
            </button>
          </div>
        </div>
      </section>

      {/* Footer Activity Mockup */}
      <footer className="mt-8 flex flex-col md:flex-row gap-8 items-center border-t border-slate-100 pt-8">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shadow-sm">
            CF
          </div>
        </div>
        <div className="text-xs font-medium text-slate-400">CP Atlas Dashboard</div>
        <div className="ml-auto text-[10px] text-slate-400 italic">
          No backend required. Data stored locally in browser.
        </div>
      </footer>
    </div>
  );
}
