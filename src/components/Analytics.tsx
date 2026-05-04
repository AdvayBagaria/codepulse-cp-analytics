import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Zap, Target, TrendingUp, AlertCircle, Activity, Globe, Award, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface ScoreCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  description: string;
  color: 'blue' | 'amber' | 'emerald';
}

export default function Analytics() {
  const { stats, accounts } = useApp();

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Zap className="w-12 h-12 text-slate-200 animate-pulse" />
      </div>
    );
  }

  // Pre-processed data for Radar Chart (Topic Mastery)
  const maxTopicCount = Math.max(1, ...stats.topicDistribution.map((x) => x.count));
  const topicData = stats.topicDistribution.map((t) => ({
    subject: t.topic,
    A: t.count,
    fullMark: maxTopicCount * 1.2,
  }));

  const COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#F97316',
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Advanced Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">
          Deep analysis of your performance patterns and strategic readiness.
        </p>
      </header>

      {/* Summary Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Some numbers about User */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              Global Statistics
            </h3>
            <div className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">
              {accounts[0]?.handle || 'User'}
            </div>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-2 gap-y-4 gap-x-8">
              <SummaryRow label="Tried" value={stats.overallSummary.tried} />
              <SummaryRow label="Solved" value={stats.overallSummary.solved} />
              <SummaryRow label="Avg Attempts" value={stats.overallSummary.avgAttempts} />
              <SummaryRow
                label="Max Attempts"
                value={stats.overallSummary.maxAttempts.count}
                subValue={stats.overallSummary.maxAttempts.problem}
              />
              <SummaryRow
                label="One Shot Solves"
                value={stats.overallSummary.oneShotSolves.count}
                subValue={stats.overallSummary.oneShotSolves.percentage}
              />
              <SummaryRow label="Max ACs" value={stats.overallSummary.maxACs || 0} />
            </dl>
          </div>
        </div>

        {/* Contests of User */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              Contest Performance
            </h3>
            <Globe className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-2 gap-y-4 gap-x-8">
              <SummaryRow label="Number of contests" value={stats.contestSummary.count} />
              <SummaryRow
                label="Best Rank"
                value={stats.contestSummary.bestRank.rank}
                subValue={stats.contestSummary.bestRank.contest}
              />
              <SummaryRow
                label="Worst Rank"
                value={stats.contestSummary.worstRank.rank}
                subValue={stats.contestSummary.worstRank.contest}
              />
              <SummaryRow
                label="Max Rating Increase"
                value={`+${stats.contestSummary.maxUp}`}
                color="text-emerald-600"
              />
              <SummaryRow
                label="Max Rating Decrease"
                value={stats.contestSummary.maxDown === 0 ? '---' : stats.contestSummary.maxDown}
                color="text-rose-600"
              />
            </dl>
          </div>
        </div>
      </div>

      {/* Core Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          icon={Activity}
          label="Consistency Score"
          value={stats.consistencyScore}
          description="Based on active days in the last 30 days."
          color="blue"
        />
        <ScoreCard
          icon={Award}
          label="Contest Readiness"
          value={stats.readinessScore}
          description="Performance trend across recent contests."
          color="amber"
        />
        <ScoreCard
          icon={Target}
          label="Upsolve Discipline"
          value={stats.upsolveScore}
          description="Percentage of missed contest problems revisited."
          color="emerald"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Topic Mastery Radar */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
              Topic Mastery Radar
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Normalized by solve count
            </span>
          </div>
          <div className="flex-1 w-full min-h-[350px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                />
                <Radar
                  name="Mastery"
                  dataKey="A"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tags Distribution (Top 8) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col min-h-[450px]">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">
            Tags Distribution
          </h3>
          <div className="flex-1 w-full min-h-[350px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.topicDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="topic"
                >
                  {stats.topicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-y-1 gap-x-4">
            {stats.topicDistribution.slice(0, 8).map((t, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase truncate">
                  {t.topic}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Difficulty Distribution */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">
            Difficulty Distribution
          </h3>
          <div className="flex-1 w-full min-h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.difficultyDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="level"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Tactical Insights
              </h3>
            </div>
            <div className="space-y-4">
              <InsightItem
                title="Consistency"
                text={
                  stats.consistencyScore > 70
                    ? 'Your practice rhythm is optimal. Maintain current intensity.'
                    : 'Consistent daily practice is missing. Aim for at least 3 solves every 48h.'
                }
              />
              <InsightItem
                title="Weakness Focus"
                text={
                  stats.weaknessAreas[0]
                    ? `Priority: ${stats.weaknessAreas[0].topic}. Your accuracy here is below 60%.`
                    : 'No urgent topic weaknesses detected. Focus on upsolving.'
                }
              />
              {/* Plateau Detector */}
              <InsightItem
                title="Plateau Alert"
                text={
                  stats.readinessScore < 40
                    ? "Your rating has stagnated. This usually indicates a need to switch from solving by topic to solving by 'random' mixed-topic sets."
                    : 'No stagnation detected. Growth trend remains positive.'
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
            Recent Activity (Last 12 Weeks)
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
            <span>Less</span>
            <div className="flex gap-0.5">
              {[0, 1, 3, 5, 8].map((level) => (
                <div
                  key={level}
                  className={cn('w-2.5 h-2.5 rounded-sm', getActivityColor(level))}
                ></div>
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
        <div className="flex gap-1 min-w-[800px]">
          {/* Simple column-based heatmap simulation */}
          {Array.from({ length: 12 }).map((_, weekIdx) => (
            <div key={weekIdx} className="flex-1 flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const dataIdx = weekIdx * 7 + dayIdx;
                const data = stats.recentActivityMap[dataIdx];
                return (
                  <div
                    key={dayIdx}
                    title={data ? `${data.date}: ${data.count} solves` : 'No data'}
                    className={cn(
                      'w-full aspect-square rounded-sm transition-colors',
                      getActivityColor(data?.count || 0)
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  subValue,
  color,
}: {
  label: string;
  value: string | number;
  subValue?: string | number;
  color?: string;
}) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </dt>
      <dd className="flex flex-col">
        <span className={cn('text-xl font-bold font-mono', color || 'text-slate-900')}>
          {value}
        </span>
        {subValue && (
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
            {subValue}
          </span>
        )}
      </dd>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, value, description, color }: ScoreCardProps) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-2 rounded-lg border', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-mono">{value}%</span>
        </div>
      </div>
      <h4 className="text-sm font-bold text-slate-900 mb-1">{label}</h4>
      <p className="text-[11px] text-slate-500 leading-tight">{description}</p>

      <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-1000',
            color === 'blue' ? 'bg-blue-600' : color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function InsightItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      <p className="text-xs text-slate-200 leading-relaxed italic">{text}</p>
    </div>
  );
}

function getActivityColor(count: number) {
  if (count === 0) return 'bg-slate-50';
  if (count < 2) return 'bg-blue-100';
  if (count < 4) return 'bg-blue-300';
  if (count < 6) return 'bg-blue-500';
  return 'bg-blue-700';
}
