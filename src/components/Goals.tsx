import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Trophy, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { GoalRecord } from '../types';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function Goals() {
  const { profile, updateProfile, stats, accounts } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: 'RATING' as GoalRecord['type'],
    target: '',
    deadline: '',
    title: '',
  });

  const goals = profile?.goals || [];

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();

    const target = Number(newGoal.target);
    if (!Number.isFinite(target) || target <= 0) return;

    // Determine current value based on goal type
    let currentValue = 0;
    switch (newGoal.type) {
      case 'RATING':
        currentValue = accounts[0]?.rating ?? 0;
        break;
      case 'SOLVED_COUNT':
        currentValue = stats?.totalSolved ?? 0;
        break;
      case 'STREAK':
        currentValue = stats?.currentStreak ?? 0;
        break;
      case 'CONTEST_PARTICIPATION':
        currentValue = stats?.totalContests ?? 0;
        break;
    }

    const goal: GoalRecord = {
      id: generateUUID(),
      type: newGoal.type,
      title: newGoal.title.trim() || `${newGoal.type.replaceAll('_', ' ')} Goal`,
      target,
      current: currentValue,
      deadline: newGoal.deadline || undefined,
      status: 'IN_PROGRESS',
    };

    updateProfile({
      goals: [...goals, goal],
    });
    setIsAdding(false);
    setNewGoal({ type: 'RATING', target: '', deadline: '', title: '' });
  };

  const removeGoal = (id: string) => {
    updateProfile({
      goals: goals.filter((g) => g.id !== id),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 leading-tight">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Strategic Goals</h1>
          <p className="text-slate-500 text-sm mt-1">
            Set milestones to push your competitive coding limits.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider"
        >
          {isAdding ? (
            'Cancel'
          ) : (
            <>
              <Plus className="w-4 h-4" />
              New Goal
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">
            Create New Goal
          </h3>
          <form
            onSubmit={handleAddGoal}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
          >
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Goal Type
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-medium outline-none"
                value={newGoal.type}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, type: e.target.value as GoalRecord['type'] })
                }
              >
                <option value="RATING">Rating Target</option>
                <option value="SOLVED_COUNT">Solved Count</option>
                <option value="STREAK">Streak Length</option>
                <option value="CONTEST_PARTICIPATION">Contest Count</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Goal Title
              </label>
              <input
                type="text"
                placeholder="e.g. Master DP"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-medium outline-none"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Target Value
              </label>
              <input
                type="number"
                placeholder="e.g. 2100"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-medium outline-none"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                required
                min={1}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Deadline Date
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-medium outline-none"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>
            <div className="col-span-1">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-blue-600 rounded-xl p-8 text-white shadow-xl shadow-blue-100/50 h-full relative overflow-hidden group">
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">
              My Focus
            </p>
            <h2 className="text-2xl font-bold mb-4">{goals[0]?.title || 'No active focus'}</h2>
            <p className="text-blue-100 text-xs leading-relaxed mb-8 font-medium">
              "Excellence is not an act, but a habit. Grind daily."
            </p>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-lg shrink-0">
                <p className="text-[9px] opacity-70 font-bold uppercase tracking-widest">Current</p>
                <p className="text-lg font-bold">{goals[0]?.current || 0}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg shrink-0">
                <p className="text-[9px] opacity-70 font-bold uppercase tracking-widest">Target</p>
                <p className="text-lg font-bold">{goals[0]?.target || '-'}</p>
              </div>
            </div>
            <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {goals.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <Target className="w-10 h-10 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No active goals</h3>
              <p className="text-slate-500 text-sm mt-1 italic max-w-sm mx-auto">
                Set a target rating or problem count to track progress.
              </p>
            </div>
          )}

          {goals.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2">
                Milestones for Success
              </h3>
              <div className="space-y-6">
                {goals.map((goal) => (
                  <MilestoneItem
                    key={goal.id}
                    title={goal.title}
                    progress={Math.min(
                      100,
                      Math.round((goal.current / Math.max(1, goal.target)) * 100)
                    )}
                    target={goal.target}
                    deadline={goal.deadline || 'No deadline'}
                    completed={goal.status === 'COMPLETED'}
                    onRemove={() => removeGoal(goal.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MilestoneItem({
  title,
  progress,
  target,
  deadline,
  completed,
  onRemove,
}: {
  key?: React.Key;
  title: string;
  progress: number;
  target: number;
  deadline: string;
  completed: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-4 group">
      <div
        className={cn(
          'mt-0.5 p-1 rounded',
          completed ? 'text-emerald-500 bg-emerald-50' : 'text-slate-200'
        )}
      >
        {completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-sm font-bold text-slate-900',
                completed && 'line-through opacity-50'
              )}
            >
              {title}
            </p>
            <button
              onClick={onRemove}
              className="text-slate-300 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">Remove</span>
            </button>
          </div>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
            <Calendar className="w-3 h-3" />
            {deadline}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-1000',
                completed ? 'bg-emerald-500' : 'bg-blue-600'
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-widest">
            {progress}% / {target}
          </span>
        </div>
      </div>
    </div>
  );
}
