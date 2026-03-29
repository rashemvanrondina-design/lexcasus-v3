import { useState, useEffect } from 'react';
import { fetchAdminAnalytics } from '../api/client';
import { useAuthStore } from '../store/authStore';
import {
  Shield,
  BarChart3,
  TrendingUp,
  Activity,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface SubjectStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const colorPalette = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-teal-500',
];

export function AdminPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<SubjectStat[]>([]);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [lastActivity, setLastActivity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchAdminAnalytics();
      if (res.success && res.data) {
        const data = res.data;

        // Extract total
        const total = (data['total_answers_submitted'] as number) || 0;
        setTotalAnswers(total);

        // Extract last activity
        const lastAct = data['last_activity'];
        if (lastAct && typeof lastAct === 'object' && 'seconds' in lastAct) {
          setLastActivity(new Date((lastAct as { seconds: number }).seconds * 1000).toLocaleDateString());
        }

        // Extract subject stats
        const subjectEntries = Object.entries(data)
          .filter(([key]) => !['total_answers_submitted', 'last_activity'].includes(key))
          .map(([name, count]) => ({
            name,
            count: count as number,
            percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
            color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          }))
          .sort((a, b) => b.count - a.count);

        setStats(subjectEntries);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">This page is restricted to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Admin Analytics</h1>
              <p className="text-xs text-slate-500">Platform usage insights</p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-400/10 border border-red-400/20">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Total Answers
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">{totalAnswers.toLocaleString()}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Active Subjects
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.length}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Last Activity
                  </span>
                </div>
                <p className="text-xl font-bold text-white">{lastActivity || 'N/A'}</p>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <h2 className="text-lg font-semibold text-white mb-6">Subject Activity</h2>

              {stats.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No activity data yet. Students haven't submitted any answers.
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.map((stat, i) => (
                    <div key={stat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-6">#{i + 1}</span>
                          <span className="text-sm font-medium text-slate-200">{stat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white">{stat.count}</span>
                          <span className="text-xs text-slate-500 w-10 text-right">
                            {stat.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stat.color} rounded-full transition-all duration-700`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40 flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                This dashboard is secured with Firebase Admin authentication. Only authorized administrators
                with verified email ({user.email}) can access these analytics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
