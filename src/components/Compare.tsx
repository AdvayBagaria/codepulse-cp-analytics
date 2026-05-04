import React, { useState } from 'react';
import { useApp, calculateUserStats } from '../context/AppContext';
import { fetchCodeforcesData } from '../services/platformService';
import { Search, Users, Zap, TrendingUp, Target, BarChart3, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardStats, Platform } from '../types';

export default function Compare() {
  const { stats: myStats, accounts } = useApp();
  const [handle, setHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparedStats, setComparedStats] = useState<DashboardStats | null>(null);
  const [comparedHandle, setComparedHandle] = useState('');

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCodeforcesData(handle);
      const computed = calculateUserStats(data.problems, data.contests, [
        {
          ...data.accountInfo,
          platform: Platform.CODEFORCES,
          id: 'temp',
          userId: 'temp',
          handle: handle,
          profileUrl: '',
          syncStatus: 'success',
        },
      ]);
      setComparedStats(computed);
      setComparedHandle(handle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Compare Users</h1>
        <p className="text-slate-500 text-sm mt-1">
          Benchmark your progress against any Codeforces handle.
        </p>
      </header>

      {/* Comparison Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleCompare} className="flex gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Codeforces handle (e.g. tourist)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Zap className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Compare
          </button>
        </form>
        {error && (
          <p className="mt-3 text-rose-600 text-xs font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>

      {!comparedStats ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h3 className="text-slate-900 font-bold">Ready to benchmark?</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Enter a handle above to see a side-by-side analysis of solving patterns.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Headline Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UserHeader stats={myStats!} handle={accounts[0]?.handle || 'You'} isMe />
            <UserHeader stats={comparedStats} handle={comparedHandle} />
          </div>

          {/* Key Metrics Comparison */}
          <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8 text-center italic">
              Head-to-Head Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <MetricCompare
                label="Total Solved"
                val1={myStats?.totalSolved ?? 0}
                val2={comparedStats.totalSolved}
              />
              <MetricCompare
                label="Contests Played"
                val1={myStats?.totalContests ?? 0}
                val2={comparedStats.totalContests}
              />
              <MetricCompare
                label="Avg Attempts"
                val1={myStats?.overallSummary?.avgAttempts ?? 0}
                val2={comparedStats.overallSummary.avgAttempts}
                inverse
              />
            </div>
          </section>

          {/* Detailed Summary Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {myStats && <StatTable title="Your Summary" stats={myStats} />}
            <StatTable title={`${comparedHandle}'s Summary`} stats={comparedStats} />
          </div>
        </div>
      )}
    </div>
  );
}

function UserHeader({
  stats,
  handle,
  isMe,
}: {
  stats: DashboardStats;
  handle: string;
  isMe?: boolean;
}) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl border flex items-center justify-between',
        isMe ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
            isMe ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
          )}
        >
          {handle[0].toUpperCase()}
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{handle}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isMe ? 'Primary Account' : 'Comparison Target'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-slate-400 uppercase">Solve Count</p>
        <p className="text-2xl font-black text-slate-900">{stats.totalSolved}</p>
      </div>
    </div>
  );
}

function MetricCompare({
  label,
  val1,
  val2,
  inverse,
}: {
  label: string;
  val1: number;
  val2: number;
  inverse?: boolean;
}) {
  const diff = val1 - val2;
  const isBetter = inverse ? diff < 0 : diff > 0;

  return (
    <div className="space-y-4 text-center">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center justify-center gap-6">
        <span className={cn('text-2xl font-black', isBetter ? 'text-blue-600' : 'text-slate-400')}>
          {val1}
        </span>
        <div className="w-px h-8 bg-slate-100"></div>
        <span
          className={cn('text-2xl font-black', !isBetter ? 'text-amber-500' : 'text-slate-400')}
        >
          {val2}
        </span>
      </div>
      <div
        className={cn(
          'text-[10px] font-bold px-2 py-1 rounded inline-block',
          isBetter ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        )}
      >
        {isBetter ? 'LEAD' : 'BEHIND'} BY {Math.abs(diff).toFixed(diff % 1 === 0 ? 0 : 2)}
      </div>
    </div>
  );
}

function StatTable({ title, stats }: { title: string; stats: DashboardStats }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
        <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-4 space-y-3">
        <TableRow label="Tried" value={stats.overallSummary.tried} />
        <TableRow label="Solved" value={stats.overallSummary.solved} />
        <TableRow label="Avg Attempts" value={stats.overallSummary.avgAttempts} />
        <TableRow label="Max Attempts" value={stats.overallSummary.maxAttempts.count} />
        <TableRow label="Best Rank" value={stats.contestSummary.bestRank.rank} />
        <TableRow label="Max Rating Up" value={`+${stats.contestSummary.maxUp}`} />
      </div>
    </div>
  );
}

function TableRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-900 font-mono">{value}</span>
    </div>
  );
}
