import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Trophy,
  BookOpen,
  Target,
  Settings,
  Zap,
  Menu,
  BarChart3,
  BrainCircuit,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import LoadingSkeleton from './LoadingSkeleton';

const Overview = lazy(() => import('./Overview'));
const Accounts = lazy(() => import('./Accounts'));
const Analytics = lazy(() => import('./Analytics'));
const Compare = lazy(() => import('./Compare'));
const Topics = lazy(() => import('./Topics'));
const Recommendations = lazy(() => import('./Recommendations'));
const Contests = lazy(() => import('./Contests'));
const Problems = lazy(() => import('./Problems'));
const Goals = lazy(() => import('./Goals'));
const SettingsPage = lazy(() => import('./SettingsPage'));

const navItems = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard },
  { id: 'accounts', name: 'Accounts', icon: Users },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'compare', name: 'Compare', icon: Users },
  { id: 'topics', name: 'Topics', icon: BrainCircuit },
  { id: 'recommendations', name: 'Recommendations', icon: Zap },
  { id: 'contests', name: 'Contests', icon: Trophy },
  { id: 'problems', name: 'Problems', icon: BookOpen },
  { id: 'goals', name: 'Goals', icon: Target },
  { id: 'settings', name: 'Settings', icon: Settings },
] as const;

type TabId = (typeof navItems)[number]['id'];

export type { TabId };

const ACTIVE_TAB_KEY = 'cp_atlas_active_tab';

function isTabId(value: string | null): value is TabId {
  return Boolean(value && navItems.some((item) => item.id === value));
}

function readStoredTab(): TabId {
  if (typeof window === 'undefined') return 'overview';
  try {
    const stored = localStorage.getItem(ACTIVE_TAB_KEY);
    return isTabId(stored) ? stored : 'overview';
  } catch {
    return 'overview';
  }
}

function storeTab(tab: TabId) {
  try {
    localStorage.setItem(ACTIVE_TAB_KEY, tab);
  } catch {
    // Ignore storage failures in private/incognito or restricted environments.
  }
}

export default function DashboardShell() {
  const { profile, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>(() => readStoredTab());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    storeTab(activeTab);
  }, [activeTab]);

  const ActiveIcon = useMemo(() => {
    const match = navItems.find((item) => item.id === activeTab);
    return match?.icon ?? LayoutDashboard;
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Zap className="h-12 w-12 animate-pulse text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Loading analytics workspace…</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onNavigate={setActiveTab} />;
      case 'accounts':
        return <Accounts />;
      case 'analytics':
        return <Analytics />;
      case 'compare':
        return <Compare />;
      case 'topics':
        return <Topics />;
      case 'recommendations':
        return <Recommendations />;
      case 'contests':
        return <Contests />;
      case 'problems':
        return <Problems />;
      case 'goals':
        return <Goals />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Overview onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans text-slate-900">
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 -translate-x-full transform flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen && 'translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <Zap className="h-5 w-5 fill-current text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">CodePulse</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-100 p-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Account</span>
                <ActiveIcon className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-700">
                  {profile?.displayName?.[0] || 'U'}
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {profile?.displayName || 'Set Name'}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {profile?.settings.primaryPlatform || profile?.timezone || 'No linked account'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between bg-[#F8FAFC] px-8 pt-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto hidden text-right lg:block">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Production Build • Stable
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pt-4">
          <div className="mx-auto max-w-7xl">
            <Suspense
              fallback={
                <div className="space-y-6">
                  <LoadingSkeleton lines={1} className="h-10 w-56" />
                  <LoadingSkeleton lines={2} />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <LoadingSkeleton lines={6} />
                    <LoadingSkeleton lines={6} />
                  </div>
                </div>
              }
            >
              {renderContent()}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
