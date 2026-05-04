import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExternalLink,
  Filter,
  Search,
  ChevronRight,
  Trophy,
  ArrowLeft,
  ExternalLink as ExternalLinkIcon,
  CheckCircle2,
  XCircle,
  Zap,
  TrendingUp,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { ContestRecord, Platform } from '../types';

export default function Contests() {
  const { contests, accounts, syncAccount, syncAllAccounts, isSyncing } = useApp();
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedContest = contests.find((c) => c.id === selectedContestId);

  const filteredContests = contests
    .filter((c) => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (selectedContest) {
    return <ContestDetail contest={selectedContest} onBack={() => setSelectedContestId(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Contest History</h1>
          <p className="text-slate-500 text-sm mt-1">
            Analysis of your performance in timed rounds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const cfAcc = accounts.find((a) => a.platform === Platform.CODEFORCES);
              if (cfAcc) syncAccount(cfAcc.id);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider"
          >
            <Trophy className="w-3.5 h-3.5" />
            Sync Now
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contests..."
              className="bg-white border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500 transition-all font-medium w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Contest</th>
              <th className="px-6 py-4 text-center">Rank</th>
              <th className="px-6 py-4">Delta</th>
              <th className="px-6 py-4 text-right">Final Rating</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContests.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => setSelectedContestId(c.id)}
              >
                <td className="px-6 py-5">
                  <div>
                    <p className="font-bold text-slate-900 text-sm line-clamp-1">{c.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      {format(new Date(c.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    #{c.rank}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={cn(
                      'font-bold text-sm',
                      c.delta && c.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    {c.delta ? (c.delta > 0 ? `+${c.delta}` : c.delta) : '0'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right font-bold text-slate-900 text-sm">
                  {c.ratingAfter}
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-1.5 rounded hover:bg-white text-slate-300 group-hover:text-blue-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContests.length === 0 && (
          <div className="py-20 text-center">
            <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 text-sm italic">No contest data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContestDetail({ contest, onBack }: { contest: ContestRecord; onBack: () => void }) {
  const { syncAllAccounts, isSyncing } = useApp();
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {contest.platform}
          </span>
          <a
            href={`https://codeforces.com/contest/${contest.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
              Round Analysis
            </p>
            <h2 className="text-3xl font-bold mb-6 max-w-2xl leading-tight">{contest.title}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Final Rank
                </p>
                <p className="text-2xl font-bold font-mono">#{contest.rank}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Rating Change
                </p>
                <p
                  className={cn(
                    'text-2xl font-bold font-mono',
                    contest.delta && contest.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {contest.delta && contest.delta >= 0 ? `+${contest.delta}` : contest.delta}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  New Rating
                </p>
                <p className="text-2xl font-bold font-mono">{contest.ratingAfter}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Solved
                </p>
                <p className="text-2xl font-bold font-mono">
                  {contest.solvedCount} / {contest.totalProblems || '?'}
                </p>
              </div>
            </div>
          </div>
          <Trophy className="absolute -right-8 -bottom-8 w-64 h-64 opacity-5" />
        </div>

        <div className="p-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
            Problem Breakdown
          </h3>
          <div className="space-y-3">
            {contest.problems?.length > 0 ? (
              contest.problems.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-400 shadow-sm">
                      {p.index}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{p.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {p.points || 500} pts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {p.solved ? (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Solved
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                        <XCircle className="w-3 h-3" /> Unsolved
                      </div>
                    )}
                    <a
                      href={`https://codeforces.com/contest/${contest.id}/problem/${p.index}`}
                      target="_blank"
                      rel="noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 px-6">
                <p className="text-slate-900 font-bold text-sm mb-1">Problem Data Unavailable</p>
                <p className="text-slate-500 text-xs mb-6 max-w-xs mx-auto">
                  This contest is older than your fetched submission history (recent 10,000). Try
                  syncing again or solving a new problem to refresh your cache.
                </p>
                <button
                  disabled={isSyncing}
                  onClick={() => syncAllAccounts()}
                  className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Force Global Refresh'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3">
                Performance Insights
              </h4>
              <ul className="space-y-3 text-xs text-blue-800/80 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Zap className="w-3 h-3 mt-0.5 text-blue-600 shrink-0" />
                  <span>
                    <strong>Accuracy:</strong> You solved {contest.solvedCount} out of{' '}
                    {contest.problems?.length || contest.totalProblems || '?'} problems.
                    {contest.solvedCount > 3
                      ? ' This indicates high tactical efficiency.'
                      : ' Focus on speed for easier problems.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 mt-0.5 text-blue-600 shrink-0" />
                  <span>
                    <strong>Rating Impact:</strong> This performance{' '}
                    {contest.delta && contest.delta > 0
                      ? `increased your rating by ${contest.delta}`
                      : 'resulted in a rating adjustment'}
                    .
                    {contest.rank < 500
                      ? ' Exceptional positioning.'
                      : ' Target a top 10% finish for steeper growth.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-3 h-3 mt-0.5 text-blue-600 shrink-0" />
                  <span>
                    <strong>Upsolve Priority:</strong>{' '}
                    {contest.problems?.filter((p) => !p.solved).length > 0
                      ? `Problem ${contest.problems.find((p) => !p.solved)?.index} is the high-priority target for upsolving.`
                      : 'Clean sweep! You mastered all available problems in this set.'}
                  </span>
                </li>
              </ul>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
                Round Strategy
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                Note: Analyze your time distribution between problems to optimize your next
                performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
