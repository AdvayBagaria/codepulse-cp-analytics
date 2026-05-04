import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  ArrowUpRight,
  TrendingDown,
  Target,
  BrainCircuit,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ProblemRecord } from '../types';

export default function Topics() {
  const { problems } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Calculate detailed topic stats
  const topicStats: Record<
    string,
    { solved: number; attempted: number; avgAttempts: number; problems: ProblemRecord[] }
  > = {};

  problems.forEach((p) => {
    p.tags.forEach((t) => {
      if (!topicStats[t]) topicStats[t] = { solved: 0, attempted: 0, avgAttempts: 0, problems: [] };
      if (p.status === 'SOLVED') {
        topicStats[t].solved++;
        topicStats[t].avgAttempts += p.attempts;
      }
      topicStats[t].attempted++;
      topicStats[t].problems.push(p);
    });
  });

  const sortedTopics = Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      ...stats,
      accuracy: Math.round((stats.solved / stats.attempted) * 100),
      avgAttempts: stats.solved > 0 ? (stats.avgAttempts / stats.solved).toFixed(1) : '0',
    }))
    .filter((t) => t.topic.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.attempted - a.attempted);

  if (selectedTopic) {
    const topicData = sortedTopics.find((t) => t.topic === selectedTopic);
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
        <header className="flex items-center justify-between">
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </button>
          <div className="p-1 px-3 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
            {selectedTopic}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TopicMetric label="Total Problems" value={topicData?.attempted || 0} />
          <TopicMetric label="Solve Rate" value={`${topicData?.accuracy || 0}%`} />
          <TopicMetric label="Avg Attempts" value={`${topicData?.avgAttempts || 0}x`} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Problem
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Platform
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topicData?.problems.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">{p.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {p.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase',
                        p.status === 'SOLVED'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      )}
                    >
                      {p.status === 'SOLVED' ? (
                        <Target className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      {p.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4 ml-auto" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Topic Analysis</h1>
          <p className="text-slate-500 text-sm mt-1">
            Granular breakdown of your conceptual mastery.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics..."
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTopics.map((t, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div
                className={cn(
                  'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider',
                  t.accuracy >= 80
                    ? 'bg-emerald-50 text-emerald-600'
                    : t.accuracy >= 50
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                )}
              >
                {t.accuracy}% Accuracy
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-4 capitalize">{t.topic}</h3>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Solved</p>
                <p className="text-sm font-bold font-mono text-slate-700">{t.solved}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attempts</p>
                <p className="text-sm font-bold font-mono text-slate-700">{t.attempted}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg AC</p>
                <p className="text-sm font-bold font-mono text-slate-700">{t.avgAttempts}x</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTopic(t.topic)}
              className="mt-6 w-full py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest flex items-center justify-center gap-2"
            >
              View Problems <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {sortedTopics.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 text-sm italic">No topics found matching your search.</p>
        </div>
      )}
    </div>
  );
}

function TopicMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 font-mono">{value}</p>
    </div>
  );
}
