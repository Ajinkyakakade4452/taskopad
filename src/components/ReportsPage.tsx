import { useState } from 'react';
import { BarChart3, FileText, Calendar, Download, Filter, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface ReportsPageProps {
  theme: 'dark' | 'light';
  tasks: Task[];
  users: any[];
}

export default function ReportsPage({ theme, tasks, users }: ReportsPageProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const tasksByPriority = {
    high: tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length,
    medium: tasks.filter(t => t.priority === 'Medium' && t.status !== 'Completed').length,
    low: tasks.filter(t => t.priority === 'Low' && t.status !== 'Completed').length
  };

  const userStats = users.map(user => {
    const userTasks = tasks.filter(t =>
      t.assignTo === user.name || (t.assignees && t.assignees.includes(user.name))
    );
    return {
      user,
      total: userTasks.length,
      completed: userTasks.filter(t => t.status === 'Completed').length,
      pending: userTasks.filter(t => t.status !== 'Completed').length
    };
  });

  const projectStats = Array.from(new Set(tasks.map(t => t.project).filter(Boolean))).map(project => {
    const projectTasks = tasks.filter(t => t.project === project);
    return {
      project,
      total: projectTasks.length,
      completed: projectTasks.filter(t => t.status === 'Completed').length
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Reports</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Analytics and performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border outline-none transition focus:ring-2 focus:ring-cyan-400 ${
              theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-md shadow-cyan-500/10 flex items-center gap-1.5 cursor-pointer">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Tasks</p>
          <p className="text-2xl font-extrabold font-mono">{totalTasks}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Completed</p>
          <p className="text-2xl font-extrabold font-mono text-emerald-400">{completedTasks}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-extrabold font-mono text-amber-400">{pendingTasks}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Completion Rate</p>
          <p className="text-2xl font-extrabold font-mono text-cyan-400">{completionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Performance */}
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">User Performance</h3>
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="space-y-3">
            {userStats.map(stat => (
              <div key={stat.user.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{stat.user.name}</span>
                  <span className="text-slate-400">{stat.completed}/{stat.total}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-[#0D1631]' : 'bg-slate-100'
                }`}>
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${stat.total > 0 ? (stat.completed / stat.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Status */}
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Project Status</h3>
            <FolderKanban className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-3">
            {projectStats.map(stat => (
              <div key={stat.project} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{stat.project}</span>
                  <span className="text-slate-400">{stat.completed}/{stat.total}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-[#0D1631]' : 'bg-slate-100'
                }`}>
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-500"
                    style={{ width: `${stat.total > 0 ? (stat.completed / stat.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className={`p-5 rounded-2xl border ${
        theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Priority Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-3xl font-extrabold font-mono text-red-400">{tasksByPriority.high}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">High Priority</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-3xl font-extrabold font-mono text-amber-400">{tasksByPriority.medium}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Medium Priority</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-3xl font-extrabold font-mono text-green-400">{tasksByPriority.low}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Low Priority</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import fix
import { FolderKanban } from 'lucide-react';
