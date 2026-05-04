import React, { useState } from 'react';
import { Plus, RefreshCw, ExternalLink, Trash2, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Platform } from '../types';
import { cn } from '../lib/utils';

export default function Accounts() {
  const { accounts, addAccount, removeAccount, syncAccount } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newHandle, setNewHandle] = useState('');
  const [platform] = useState(Platform.CODEFORCES);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await addAccount(platform, newHandle);
      setNewHandle('');
      setIsAdding(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to link account. Please check the handle and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, handle: string) => {
    if (window.confirm(`Are you sure you want to remove ${handle}?`)) {
      removeAccount(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Connected Codeforces Account
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your Codeforces handle and sync your data.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          Add Handle
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Codeforces Handle
              </label>
              <input
                type="text"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                placeholder="e.g. tourist"
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-bold hover:bg-blue-700 transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Linking...' : 'Link Handle'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-slate-100 text-slate-600 px-4 py-2 rounded-md text-xs font-bold hover:bg-slate-200 transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-3 text-xs font-bold text-red-500 bg-red-50 p-2 rounded border border-red-100 italic">
              {error}
            </p>
          )}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200">
          <div className="w-12 h-12 bg-slate-50 rounded flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-slate-400" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No account linked</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
            Connect your Codeforces profile to aggregate your data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col hover:border-blue-200 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center font-bold text-slate-400 text-sm">
                    {acc.platform[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{acc.handle}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {acc.platform}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => syncAccount(acc.id)}
                    className={cn(
                      'p-1.5 rounded hover:bg-slate-50 text-slate-400 transition-all',
                      acc.syncStatus === 'syncing' && 'animate-spin text-blue-600'
                    )}
                    aria-label={`Sync ${acc.handle}`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={acc.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded hover:bg-slate-50 text-slate-400"
                    aria-label={`Open ${acc.handle} on Codeforces`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <div className="flex-1 bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Rating
                  </p>
                  <p className="text-sm font-bold text-slate-900 uppercase font-mono">
                    {acc.rating || '—'}
                  </p>
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Rank
                  </p>
                  <p className="text-sm font-bold text-blue-600 uppercase font-mono">
                    {acc.rank || '—'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      acc.syncStatus === 'success'
                        ? 'bg-emerald-500'
                        : acc.syncStatus === 'error'
                          ? 'bg-red-500'
                          : 'bg-slate-300'
                    )}
                  />
                  <span className="text-[10px] font-medium text-slate-400">
                    {acc.syncStatus === 'syncing'
                      ? 'Syncing...'
                      : acc.syncStatus === 'success'
                        ? `Last sync: ${acc.lastSyncTime ? new Date(acc.lastSyncTime).toLocaleDateString() : 'Just now'}`
                        : 'Not synced'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(acc.id, acc.handle)}
                  className="text-slate-200 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${acc.handle}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
