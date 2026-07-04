import { useState, useEffect } from 'react';
import {
  LayoutDashboard, CheckSquare, FolderKanban, MessageSquare, FileText, Clock,
  StickyNote, BarChart3, Users, Settings, Sparkles, LogOut, ChevronDown,
  Plus, Search, Filter, Calendar, AlertCircle, CheckCircle2, Clock3,
  Star, Flame, TrendingUp, Circle, Bell, List, Columns, CalendarDays,
  MoreHorizontal, X, Loader2
} from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
  avatarColor: string;
  token: string;
}

interface UserDashboardProps {
  user: LoggedInUser;
  onLogout: () => void;
}

const API_BASE = '/api';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  'Pending':      { label: 'Pending',      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',   dot: 'bg-amber-400' },
  'In Progress':  { label: 'In Progress',  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30',     dot: 'bg-blue-400' },
  'Completed':    { label: 'Completed',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400' },
  'Under Review': { label: 'Under Review', color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/30', dot: 'bg-violet-400' },
  'Rejected':     { label: 'Rejected',     color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',       dot: 'bg-red-400' },
  'Incomplete':   { label: 'Incomplete',   color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30', dot: 'bg-orange-400' },
};

const priorityConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'Critical': { label: 'Critical', color: 'text-red-400',    icon: <Flame className="w-3 h-3" /> },
  'High':     { label: 'High',     color: 'text-orange-400', icon: <TrendingUp className="w-3 h-3" /> },
  'Medium':   { label: 'Medium',   color: 'text-amber-400',  icon: <Star className="w-3 h-3" /> },
  'Low':      { label: 'Low',      color: 'text-slate-400',  icon: <Circle className="w-3 h-3" /> },
};

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

function isToday(dueDate: string): boolean {
  if (!dueDate) return false;
  const today = new Date();
  const due = new Date(dueDate);
  return today.toDateString() === due.toDateString();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'draft'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const all: Task[] = await res.json();
      // Users only see tasks assigned to them
      const userNameLower = user.name.toLowerCase();
      const myTasks = all.filter(t =>
        (t.assignTo && t.assignTo.toLowerCase().includes(userNameLower)) ||
        (t.assignees && t.assignees.some(a => a.toLowerCase().includes(userNameLower)))
      );
      setTasks(myTasks);
    } catch {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingId(taskId);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const updated = { ...task, status: newStatus };
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        if (selectedTask?.id === taskId) setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch {
      console.error('Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // Task groupings
  const todayTasks = tasks.filter(t => isToday(t.dueDate) || (!isOverdue(t.dueDate) && t.status !== 'Completed'));
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Completed');
  const draftTasks = tasks.filter(t => t.isDraft);

  const activeList = (() => {
    let list = activeTab === 'today' ? todayTasks : activeTab === 'overdue' ? overdueTasks : draftTasks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.name?.toLowerCase().includes(q) || t.project?.toLowerCase().includes(q));
    }
    return list;
  })();

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-[#0A1128] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#060D1F] border-r border-slate-800 flex flex-col">
        {/* Brand */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Edigital TaskPad</p>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">SaaS Enterprise</p>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[9px] font-bold">EK</div>
            <div>
              <p className="text-[10px] font-semibold text-white">Edigital Knowledge</p>
              <p className="text-[8px] text-slate-400">Default Workspace</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Tasks', icon: CheckSquare, badge: tasks.filter(t => t.status !== 'Completed').length },
            { name: 'Projects', icon: FolderKanban },
            { name: 'Discussion', icon: MessageSquare },
            { name: 'Documents', icon: FileText },
            { name: 'Time sheet', icon: Clock },
            { name: 'Notes', icon: StickyNote },
            { name: 'Reports', icon: BarChart3 },
            { name: 'Users', icon: Users },
            { name: 'Settings', icon: Settings },
            { name: "What's New", icon: Sparkles },
          ].map(item => {
            const Icon = item.icon;
            const isActive = item.name === 'Tasks';
            return (
              <button
                key={item.name}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-cyan-500/15 text-cyan-400">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Profile at bottom */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.initials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[11px] font-semibold text-white truncate">{user.name}</p>
              <p className="text-[9px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="text-slate-500 hover:text-red-400 transition p-1 rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#060D1F]/80 backdrop-blur border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white">Task</h1>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <Filter className="w-3 h-3" /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition">
              <Plus className="w-3 h-3" /> Add Task
            </button>
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* View Tabs */}
        <div className="px-6 py-2 border-b border-slate-800 flex items-center gap-2 bg-[#060D1F]/40 flex-shrink-0">
          {[
            { key: 'list', icon: <List className="w-3 h-3" />, label: 'List', active: true },
            { key: 'kanban', icon: <Columns className="w-3 h-3" />, label: 'Kanban', active: false },
            { key: 'calendar', icon: <CalendarDays className="w-3 h-3" />, label: 'Calendar', active: false },
          ].map(v => (
            <button
              key={v.key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                v.active ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {v.icon} {v.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition">Draft Tasks</button>
            <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition">Customize</button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 border-b border-slate-800/50 bg-[#070F23]/60 flex items-center gap-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'today' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Today &amp; Future
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">{todayTasks.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Overdue Queue
            <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] font-bold">{overdueTasks.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'draft' ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Draft Tasks
            <span className="px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[9px] font-bold">{draftTasks.length}</span>
          </button>
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {pendingCount} Uncompleted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {completedCount} Completed
            </span>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-48 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <span className="text-sm">Loading your tasks...</span>
            </div>
          ) : activeList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <CheckCircle2 className="w-10 h-10 mb-3 text-emerald-500/40" />
              <p className="text-sm font-semibold">No tasks in this section</p>
              <p className="text-xs mt-1">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div className="sticky top-0 z-10 bg-[#070F23]/95 backdrop-blur border-b border-slate-800 px-6 py-2 grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Task Name</span>
                <span>Project</span>
                <span>Due Date</span>
                <span>Priority</span>
                <span>Status</span>
              </div>

              {/* Task Rows */}
              <div>
                {activeList.map((task, idx) => {
                  const sc = statusConfig[task.status] || statusConfig['Pending'];
                  const pc = priorityConfig[task.priority] || priorityConfig['Medium'];
                  const overdue = isOverdue(task.dueDate) && task.status !== 'Completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`px-6 py-3.5 grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center border-b border-slate-800/40 hover:bg-slate-800/25 transition cursor-pointer group ${idx % 2 === 0 ? '' : 'bg-slate-900/20'}`}
                    >
                      {/* Task Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            const next: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
                            handleStatusChange(task.id, next);
                          }}
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                            task.status === 'Completed'
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-slate-600 hover:border-cyan-400'
                          }`}
                        >
                          {task.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                          {updatingId === task.id && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
                        </button>
                        <span className={`text-xs font-medium truncate ${task.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
                          {task.name}
                        </span>
                      </div>

                      {/* Project */}
                      <div>
                        {task.project ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 truncate max-w-[120px]">
                            {task.project}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center gap-1.5">
                        <Clock3 className={`w-3 h-3 flex-shrink-0 ${overdue ? 'text-red-400' : 'text-slate-500'}`} />
                        <span className={`text-xs font-medium ${overdue ? 'text-red-400' : 'text-slate-300'}`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className={`flex items-center gap-1.5 ${pc.color}`}>
                        {pc.icon}
                        <span className="text-xs font-semibold">{task.priority}</span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${sc.bg} ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedTask(task); }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-white transition"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer count */}
              <div className="px-6 py-3 text-xs text-slate-500 border-t border-slate-800/40 flex justify-between">
                <span>Showing {activeList.length} task{activeList.length !== 1 ? 's' : ''} in this section ({tasks.length} total across all)</span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />{pendingCount} Uncompleted</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />{completedCount} Completed</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Slide-Over Panel */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setSelectedTask(null)}>
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl h-full bg-[#0A1128] border-l border-slate-700 shadow-2xl flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
              <h3 className="text-sm font-bold text-white">Task Details</h3>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-6">
              {/* Task Name */}
              <div>
                <h2 className="text-lg font-bold text-white">{selectedTask.name}</h2>
                {selectedTask.description && (
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{selectedTask.description}</p>
                )}
              </div>

              {/* Status + Priority Row */}
              <div className="flex items-center gap-3 flex-wrap">
                {(() => {
                  const sc = statusConfig[selectedTask.status] || statusConfig['Pending'];
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${sc.bg} ${sc.color}`}>
                      <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  );
                })()}
                {(() => {
                  const pc = priorityConfig[selectedTask.priority] || priorityConfig['Medium'];
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 ${pc.color}`}>
                      {pc.icon} {selectedTask.priority}
                    </span>
                  );
                })()}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Project', value: selectedTask.project },
                  { label: 'Assigned To', value: selectedTask.assignTo },
                  { label: 'Due Date', value: formatDate(selectedTask.dueDate) },
                  { label: 'Time Slot', value: selectedTask.time || '—' },
                  { label: 'Client', value: selectedTask.client || '—' },
                  { label: 'Service', value: selectedTask.service || '—' },
                ].map(field => (
                  <div key={field.label} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{field.label}</p>
                    <p className="text-xs font-semibold text-slate-200">{field.value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Change Status */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(statusConfig) as TaskStatus[]).map(s => {
                    const sc = statusConfig[s];
                    const isActive = selectedTask.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedTask.id, s)}
                        disabled={isActive}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                          isActive
                            ? `${sc.bg} ${sc.color} border-current cursor-default`
                            : 'bg-slate-800/40 text-slate-400 border-slate-700/30 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                        {sc.label}
                        {isActive && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub Tasks */}
              {selectedTask.subTasks && selectedTask.subTasks.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sub Tasks</p>
                  <div className="space-y-2">
                    {selectedTask.subTasks.map(st => (
                      <div key={st.id} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg border border-slate-700/20">
                        <div className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 ${st.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`} />
                        <span className={`text-xs ${st.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{st.name}</span>
                        <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold ${st.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {st.completed ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleStatusChange(selectedTask.id, 'Completed')}
                disabled={selectedTask.status === 'Completed'}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-md hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {selectedTask.status === 'Completed' ? '✓ Already Completed' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
