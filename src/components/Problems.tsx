import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, ExternalLink, Tag, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Problems() {
  const { problems } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'SOLVED' | 'ATTEMPTED'>('all');

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [problems, searchTerm, filter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Problem Ledger</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track every problem you've touched across platforms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problems..."
              className="bg-white border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500 transition-all font-medium w-64"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-md p-1 shadow-sm">
            {(['all', 'SOLVED', 'ATTEMPTED'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={cn(
                  'px-4 py-1.5 rounded text-[10px] uppercase tracking-widest font-bold transition-all',
                  filter === opt ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 leading-tight">
        {filteredProblems.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-200 transition-all group overflow-hidden relative shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest',
                  p.status === 'SOLVED'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                )}
              >
                {p.status}
              </span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase">
                Rating {p.difficulty || '?'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 mb-2">
              {p.title}
            </h3>

            <div className="flex flex-wrap gap-1.5 mb-5 h-10 overflow-hidden">
              {p.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100 italic"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600">
                {p.platform[0]}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {p.attempts} attempts
                </span>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded hover:bg-blue-50 text-slate-300 hover:text-blue-600 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No problems found</h3>
          <p className="text-slate-500 text-sm mt-1 italic">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
