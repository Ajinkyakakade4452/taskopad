import { useState, useCallback, useMemo } from 'react';
import { Check, CheckCircle2, Circle, Clock, Flame, Star, AlertCircle, Send, ThumbsUp, ThumbsDown, Square, CheckSquare, Trash2, Search, Filter, RotateCcw } from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';
import { checkAndApplyTaskPenalty } from '../utils/penaltyUtils';

interface TaskTableProps {
  theme: 'dark' | 'light';
  tasks: Task[];
  onToggleStatus: (taskId: string) => void;
  onAddTaskClick: () => void;
  onDeleteTask?: (taskId: string) => void;
  onBulkDeleteTasks?: (taskIds: string[]) => void;
  onDuplicateTask?: (taskId: string) => void;
  onSubmitDraft?: (taskId: string) => void;
  onSelectTask?: (task: Task) => void;
  onUpdateTaskStatus?: (taskId: string, status: TaskStatus) => void;
  onBulkApproveReject?: (taskIds: string[], action: 'approve' | 'reject') => void;
  isSubtaskFilterMode?: boolean;
}


export default function TaskTable({ 
  theme, 
  tasks, 
  onToggleStatus, 
  onAddTaskClick, 
  onDeleteTask,
  onBulkDeleteTasks,
  onDuplicateTask,
  onSubmitDraft,
  onSelectTask,
  onUpdateTaskStatus,
  onBulkApproveReject,
  isSubtaskFilterMode = false
}: TaskTableProps) {
  const [activeGroupTab, setActiveGroupTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'review' | 'drafts'>('today');
  // ids of tasks currently showing tick animation
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  // ids of tasks currently fading out
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());
  // Bulk selection state for Under Review tasks
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  // Bulk selection state for Delete (used in today, upcoming, overdue tabs)
  const [selectedBulkDeleteIds, setSelectedBulkDeleteIds] = useState<Set<string>>(new Set());

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDueDate, setFilterDueDate] = useState('');

  // Tabs that support bulk delete
  const bulkDeleteTabs = new Set(['all', 'today', 'upcoming', 'overdue']);
  const isBulkDeleteTab = bulkDeleteTabs.has(activeGroupTab);

  // Labels for each tab's bulk delete section
  const tabLabels: Record<string, string> = {
    all: 'All Tasks',
    today: 'Today & Future',
    upcoming: 'Upcoming',
    overdue: 'Overdue Queue',
    review: 'Under Review',
    drafts: 'Draft Tasks',
  };

  // Animate-then-complete handler: show tick → fade → update
  const handleCompleteWithAnimation = useCallback((taskId: string, action: () => void) => {
    // Phase 1: show green tick immediately
    setCompletingIds(prev => new Set(prev).add(taskId));
    // Phase 2: start fade-out after 600ms
    setTimeout(() => {
      setFadingIds(prev => new Set(prev).add(taskId));
    }, 600);
    // Phase 3: trigger actual status update after fade completes
    setTimeout(() => {
      action();
      setCompletingIds(prev => { const s = new Set(prev); s.delete(taskId); return s; });
      setFadingIds(prev => { const s = new Set(prev); s.delete(taskId); return s; });
    }, 1000);
  }, []);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  const today = getTodayDate();

  const allTasks = useMemo(() => tasks.map(t => checkAndApplyTaskPenalty(t)), [tasks]);

  // Exclude completed tasks UNLESS they are currently animating (completing/fading)
  const todayTasks = allTasks.filter(t =>
    !t.isDraft && t.dueDate >= today &&
    (t.status !== 'Completed' || completingIds.has(t.id) || fadingIds.has(t.id))
  );

  const upcomingTasks = allTasks.filter(t => {
    if (t.isDraft) return false;
    if (t.status === 'Completed' && !completingIds.has(t.id) && !fadingIds.has(t.id)) return false;
    return !!t.dueDate && t.dueDate > today;
  });

  const overdueTasks = allTasks.filter(t =>
    !t.isDraft && t.dueDate < today &&
    (t.status !== 'Completed' || completingIds.has(t.id) || fadingIds.has(t.id))
  );
  const reviewTasks = allTasks.filter(t =>
    (t.status === 'Under Review' || completingIds.has(t.id) || fadingIds.has(t.id)) &&
    !t.isDraft
  );
  const draftTasks = allTasks.filter(t => t.isDraft);

  const displayedTasks = isSubtaskFilterMode
    ? allTasks // Show all pseudo-subtasks when in subtask mode
    : activeGroupTab === 'all'
    ? allTasks
    : activeGroupTab === 'today'
    ? todayTasks
    : activeGroupTab === 'upcoming'
    ? upcomingTasks
    : activeGroupTab === 'overdue'
    ? overdueTasks
    : activeGroupTab === 'review'
    ? reviewTasks
    : draftTasks;

  // Extract unique options for dropdowns
  const uniqueProjects = Array.from(new Set(tasks.flatMap(t => t.projects && t.projects.length > 0 ? t.projects : (t.project ? [t.project] : [])))).filter(Boolean);
  const uniqueAssignees = Array.from(new Set(tasks.flatMap(t => t.assignees && t.assignees.length > 0 ? t.assignees : (t.assignTo ? [t.assignTo] : [])))).filter(Boolean);

  // Apply multi-filter matching
  const filteredTasks = displayedTasks.filter(t => {
    if (searchQuery.trim() && !t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
    if (filterProject !== 'all') {
      const taskProjs = t.projects && t.projects.length > 0 ? t.projects : (t.project ? [t.project] : []);
      if (!taskProjs.includes(filterProject)) return false;
    }
    if (filterAssignee !== 'all') {
      const taskAssignees = t.assignees && t.assignees.length > 0 ? t.assignees : (t.assignTo ? [t.assignTo] : []);
      if (!taskAssignees.includes(filterAssignee)) return false;
    }
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterDueDate && t.dueDate !== filterDueDate) return false;
    return true;
  });

  // Helper for initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarBgColor = (initials: string) => {
    const colors = [
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ];
    let sum = 0;
    for (let i = 0; i < initials.length; i++) sum += initials.charCodeAt(i);
    return colors[sum % colors.length];
  };

  // Format date helper: "2026-07-01" to "1 Jul 2026"
  const formatDateFriendly = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${day} ${months[monthIdx]} ${parts[0]}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="task-table-card"
      className={`rounded-2xl p-6 transition-all duration-300 shadow-lg border ${
        theme === 'dark'
          ? 'bg-[#141C38] border-slate-800 text-slate-200'
          : 'bg-white border-slate-100 text-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-lg tracking-tight">My Tasks Table</h3>
          <p className="text-xs text-slate-400 mt-0.5">Interactive queue of active and completed tasks</p>
        </div>
        <button
          onClick={onAddTaskClick}
          className="self-start sm:self-auto text-xs font-semibold px-4 py-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition cursor-pointer flex items-center gap-2"
        >
          <span>Create Task Queue</span>
        </button>
      </div>

      {/* Grouping/Queue Segments - only show when not in subtask mode */}
      {!isSubtaskFilterMode && (
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-800/10 pb-4 select-none">
          <button
            onClick={() => setActiveGroupTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeGroupTab === 'all'
                ? theme === 'dark'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-cyan-500 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>📋 All Tasks</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
              activeGroupTab === 'all'
                ? theme === 'dark' ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/20 text-white'
                : theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {allTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveGroupTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeGroupTab === 'today'
                ? theme === 'dark'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-cyan-500 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>📅 Today & Future</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
              activeGroupTab === 'today'
                ? theme === 'dark' ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/20 text-white'
                : theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {todayTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveGroupTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeGroupTab === 'upcoming'
                ? theme === 'dark'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'bg-blue-500 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>📅 Upcoming</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
              activeGroupTab === 'upcoming'
                ? theme === 'dark' ? 'bg-blue-400/20 text-blue-300' : 'bg-white/20 text-white'
                : theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {upcomingTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveGroupTab('overdue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeGroupTab === 'overdue'
                ? theme === 'dark'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-rose-500 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>⚠️ Overdue Queue</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
              activeGroupTab === 'overdue'
                ? theme === 'dark' ? 'bg-rose-400/20 text-rose-300' : 'bg-white/20 text-white'
                : theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {overdueTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveGroupTab('review')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeGroupTab === 'review'
                ? theme === 'dark'
                  ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                  : 'bg-violet-500 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>⏳ Under Review</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
              activeGroupTab === 'review'
                ? theme === 'dark' ? 'bg-violet-400/20 text-violet-300' : 'bg-white/20 text-white'
                : theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {reviewTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveGroupTab('drafts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeGroupTab === 'drafts'
                ? theme === 'dark'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-amber-500 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>📝 Draft Tasks</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
              activeGroupTab === 'drafts'
                ? theme === 'dark' ? 'bg-amber-400/20 text-amber-300' : 'bg-white/20 text-white'
                : theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {draftTasks.length}
            </span>
          </button>
        </div>
      )}

      {/* Filter Toolbar (Search, Project, Employee, Priority, Status, Date) */}
      <div className={`p-3.5 rounded-xl mb-4 border flex flex-wrap items-center gap-2.5 ${
        theme === 'dark' ? 'bg-[#0D1631]/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-800 focus:border-cyan-500'
            }`}
          />
        </div>

        {/* Project Filter */}
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className={`px-2.5 py-1.5 text-xs rounded-lg border outline-none cursor-pointer transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          <option value="all">📁 All Projects</option>
          {uniqueProjects.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Employee/Assignee Filter */}
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className={`px-2.5 py-1.5 text-xs rounded-lg border outline-none cursor-pointer transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          <option value="all">👤 All Employees</option>
          {uniqueAssignees.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className={`px-2.5 py-1.5 text-xs rounded-lg border outline-none cursor-pointer transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          <option value="all">⚡ All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-2.5 py-1.5 text-xs rounded-lg border outline-none cursor-pointer transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          <option value="all">📌 All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Review">Under Review</option>
          <option value="Completed">Completed</option>
          <option value="Approved">Approved</option>
        </select>

        {/* Date Filter */}
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value)}
            className={`px-2.5 py-1.5 text-xs rounded-lg border outline-none cursor-pointer transition ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
            }`}
            title="Filter by Due Date"
          />
        </div>

        {/* Reset Filters button if any active */}
        {(searchQuery || filterProject !== 'all' || filterAssignee !== 'all' || filterPriority !== 'all' || filterStatus !== 'all' || filterDueDate) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterProject('all');
              setFilterAssignee('all');
              setFilterPriority('all');
              setFilterStatus('all');
              setFilterDueDate('');
            }}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Compute review tasks in current displayed list for bulk toolbar */}
      {(() => {
        const displayedReviewTasks = filteredTasks.filter(t => t.status === 'Under Review');
        const hasReviewTasks = displayedReviewTasks.length > 0;
        if (!onBulkApproveReject || !hasReviewTasks) return null;
        return (
          <div className={`flex items-center gap-2 mb-3 px-4 py-2.5 rounded-xl border ${
            theme === 'dark' ? 'bg-violet-500/8 border-violet-500/25' : 'bg-violet-50 border-violet-200'
          }`}>
            <button
              onClick={() => {
                const reviewIds = displayedReviewTasks.map(t => t.id);
                setSelectedTaskIds(prev => 
                  prev.size === reviewIds.length ? new Set() : new Set(reviewIds)
                );
              }}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-800/50"
            >
              {selectedTaskIds.size === displayedReviewTasks.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              {selectedTaskIds.size === displayedReviewTasks.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-[10px] text-slate-500 font-mono">
              {selectedTaskIds.size} of {displayedReviewTasks.length} selected
            </span>
            {selectedTaskIds.size > 0 && (
              <>
                <div className="w-px h-5 bg-slate-700/50 mx-1" />
                <button
                  onClick={() => onBulkApproveReject(Array.from(selectedTaskIds), 'approve')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/35 transition"
                >
                  <ThumbsUp className="w-3 h-3" />
                  Approve Selected ({selectedTaskIds.size})
                </button>
                <button
                  onClick={() => onBulkApproveReject(Array.from(selectedTaskIds), 'reject')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/35 transition"
                >
                  <ThumbsDown className="w-3 h-3" />
                  Reject Selected ({selectedTaskIds.size})
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* Bulk Delete toolbar for today, upcoming, overdue tabs */}
      {isBulkDeleteTab && onBulkDeleteTasks && filteredTasks.length > 0 && (
        <div className={`flex items-center gap-2 mb-3 px-4 py-2.5 rounded-xl border ${
          theme === 'dark' ? 'bg-rose-500/8 border-rose-500/25' : 'bg-rose-50 border-rose-200'
        }`}>
          <button
            onClick={() => {
              const ids = filteredTasks.map(t => t.id);
              setSelectedBulkDeleteIds(prev => 
                prev.size === ids.length ? new Set() : new Set(ids)
              );
            }}
            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-800/50"
          >
            {selectedBulkDeleteIds.size === filteredTasks.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            {selectedBulkDeleteIds.size === filteredTasks.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-[10px] text-slate-500 font-mono">
            {selectedBulkDeleteIds.size} of {filteredTasks.length} selected
          </span>
          {selectedBulkDeleteIds.size > 0 && (
            <>
              <div className="w-px h-5 bg-slate-700/50 mx-1" />
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedBulkDeleteIds.size} selected task(s)?`)) {
                    onBulkDeleteTasks(Array.from(selectedBulkDeleteIds));
                    setSelectedBulkDeleteIds(new Set());
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/35 transition"
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected ({selectedBulkDeleteIds.size})
              </button>
            </>
          )}
          <div className="ml-auto">
            <button
              onClick={() => {
                if (window.confirm(`Delete ALL ${filteredTasks.length} ${tabLabels[activeGroupTab] || ''} tasks? This cannot be undone.`)) {
                  onBulkDeleteTasks(filteredTasks.map(t => t.id));
                  setSelectedBulkDeleteIds(new Set());
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-red-500/30 text-red-400 border border-red-500/40 hover:bg-red-500/45 transition"
            >
              <Trash2 className="w-3 h-3" />
              Delete All {tabLabels[activeGroupTab] || ''} ({filteredTasks.length})
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-x-auto custom-scrollbar rounded-xl border border-slate-800/10">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs">
          <thead>
            <tr className={`border-b ${theme === 'dark' ? 'bg-[#0D1631]/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
              {/* Checkbox column for Under Review tasks in any tab */}
              {onBulkApproveReject && displayedTasks.some(t => t.status === 'Under Review') && (
                <th className="px-3 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={displayedTasks.filter(t => t.status === 'Under Review').length > 0 && selectedTaskIds.size === displayedTasks.filter(t => t.status === 'Under Review').length}
                    onChange={() => {
                      const reviewIds = displayedTasks.filter(t => t.status === 'Under Review').map(t => t.id);
                      setSelectedTaskIds(prev => 
                        prev.size === reviewIds.length ? new Set() : new Set(reviewIds)
                      );
                    }}
                    className="w-4 h-4 rounded text-violet-500 bg-slate-800 border-slate-600 focus:ring-violet-500 accent-violet-500 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-5 py-3.5 font-semibold text-slate-400 rounded-tl-xl">Task Name</th>
              <th className="px-5 py-3.5 font-semibold text-slate-400">Project</th>
              <th className="px-5 py-3.5 font-semibold text-slate-400">Due Date</th>
              <th className="px-5 py-3.5 font-semibold text-slate-400">Assignee</th>
              <th className="px-5 py-3.5 font-semibold text-slate-400">Priority</th>
              <th className="px-5 py-3.5 font-semibold text-slate-400 text-center">Status</th>
              <th className="px-5 py-3.5 font-semibold text-red-400/70 text-center rounded-tr-xl">Penalty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/10">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={onBulkApproveReject && allTasks.some(t => t.status === 'Under Review') ? 7 : 6} className="px-5 py-12 text-center text-slate-400 select-none">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-600 animate-pulse" />
                    <p className="font-semibold text-xs text-slate-300">No tasks found matching current filters</p>
                    <p className="text-[10px] text-slate-500 font-medium">Try clearing or adjusting search & filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
              const initials = getInitials(task.assignTo);
              const avatarClass = getAvatarBgColor(initials);
              const isCompleted = task.status === 'Completed';
              const isCompleting = completingIds.has(task.id);
              const isFading = fadingIds.has(task.id);
              const showTick = isCompleted || isCompleting;

              return (
                <tr
                  key={task.id}
                  onClick={() => !isCompleting && !isFading && onSelectTask?.(task)}
                  style={{
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                    opacity: isFading ? 0 : 1,
                    transform: isFading ? 'translateX(20px)' : 'translateX(0)',
                    pointerEvents: isFading ? 'none' : undefined,
                  }}
                  className={`group cursor-pointer select-none ${
                    showTick
                      ? theme === 'dark'
                        ? 'bg-emerald-950/20'
                        : 'bg-emerald-50/60'
                      : selectedTaskIds.has(task.id)
                      ? theme === 'dark'
                        ? 'bg-violet-500/10'
                        : 'bg-violet-50'
                      : theme === 'dark'
                      ? 'hover:bg-[#0D1631]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Selection checkbox for Under Review tasks in any tab */}
                  {onBulkApproveReject && task.status === 'Under Review' && (
                    <td className="px-3 py-4 w-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => {
                          setSelectedTaskIds(prev => {
                            const next = new Set(prev);
                            next.has(task.id) ? next.delete(task.id) : next.add(task.id);
                            return next;
                          });
                        }}
                        className="w-4 h-4 rounded text-violet-500 bg-slate-800 border-slate-600 focus:ring-violet-500 accent-violet-500 cursor-pointer"
                      />
                    </td>
                  )}
                  {/* Task Name Column */}
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3 max-w-[280px]">
                      {/* Checkbox button to complete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (showTick) return; // prevent double-click
                          handleCompleteWithAnimation(task.id, () => onToggleStatus(task.id));
                        }}
                        className={`mt-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center flex-shrink-0 cursor-pointer ${
                          showTick
                            ? 'bg-emerald-500 border-emerald-500 scale-110'
                            : theme === 'dark'
                            ? 'border-slate-600 hover:border-emerald-400 hover:bg-emerald-500/10 text-transparent'
                            : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 text-transparent'
                        }`}
                        style={{ transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
                        title={showTick ? 'Completed' : 'Mark as complete'}
                      >
                        <Check
                          className="w-3 h-3 font-black stroke-[3.5]"
                          style={{
                            color: showTick ? 'white' : 'transparent',
                            transition: 'color 0.2s ease, transform 0.3s ease',
                            transform: showTick ? 'scale(1)' : 'scale(0)',
                          }}
                        />
                      </button>

                      <div className="space-y-0.5 flex flex-col items-start">
                        <p className={`font-semibold text-xs leading-normal transition cursor-pointer hover:text-cyan-400 hover:underline underline-offset-2 group-hover:text-cyan-400 ${showTick ? 'line-through text-slate-400' : ''}`}
                          style={{ transition: 'all 0.3s ease' }}>
                          {task.name}
                        </p>
                        {/* Subtask Blue Highlight Badge */}
                        {(task as any).subTask && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            theme === 'dark' 
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>
                            SUBTASK
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Project Column */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {task.projects && task.projects.length > 0 ? (
                        <>
                          {task.projects.slice(0, 2).map((proj) => (
                            <span
                              key={proj}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                theme === 'dark'
                                  ? 'bg-cyan-950/30 text-cyan-400 border-cyan-800/30'
                                  : 'bg-cyan-50 text-cyan-700 border-cyan-150'
                              }`}
                            >
                              {proj}
                            </span>
                          ))}
                          {task.projects.length > 2 && (
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                                theme === 'dark'
                                  ? 'bg-slate-800/50 text-slate-300 border-slate-700/50'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              +{task.projects.length - 2} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            theme === 'dark'
                              ? 'bg-slate-800/30 text-slate-400 border-slate-700/30'
                              : 'bg-slate-50 text-slate-600 border-slate-150'
                          }`}
                        >
                          {task.project || 'No Project'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Due Date Column */}
                  <td className="px-5 py-4 text-slate-400 font-medium font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{formatDateFriendly(task.dueDate)}</span>
                    </div>
                  </td>

                  {/* Assignee Column */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {(task.assignees && task.assignees.length > 0 ? task.assignees : [task.assignTo]).slice(0, 3).map((assignee, idx) => {
                          const initials = getInitials(assignee);
                          const avatarClass = getAvatarBgColor(initials);
                          return (
                            <div
                              key={assignee + idx}
                              title={assignee}
                              className={`w-7 h-7 rounded-full border-2 font-extrabold text-[9px] flex items-center justify-center select-none ${avatarClass} ${
                                theme === 'dark' ? 'border-[#141C38]' : 'border-white'
                              }`}
                            >
                              {initials}
                            </div>
                          );
                        })}
                        {task.assignees && task.assignees.length > 3 && (
                          <div
                            className={`w-7 h-7 rounded-full border-2 font-extrabold text-[9px] flex items-center justify-center select-none ${
                              theme === 'dark'
                                ? 'bg-slate-800 text-slate-300 border-[#141C38]'
                                : 'bg-slate-100 text-slate-600 border-white'
                            }`}
                          >
                            +{task.assignees.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-xs leading-none truncate max-w-[100px]">
                          {task.assignees && task.assignees.length > 1
                            ? `${task.assignees[0]} +${task.assignees.length - 1}`
                            : task.assignTo}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 font-mono">ID: T-1345</p>
                      </div>
                    </div>
                  </td>

                  {/* Priority Column */}
                  <td className="px-5 py-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        task.priority === 'Critical'
                          ? 'bg-red-950/40 text-red-500 border border-red-900/30'
                          : task.priority === 'High'
                          ? 'bg-rose-500/15 text-rose-400'
                          : task.priority === 'Medium'
                          ? 'bg-yellow-500/15 text-yellow-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {task.priority === 'Critical' ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      ) : task.priority === 'High' ? (
                        <Flame className="w-3 h-3 text-rose-400" />
                      ) : (
                        <Star className="w-3 h-3 text-current" />
                      )}
                      <span>{task.priority}</span>
                    </span>
                  </td>

                  {/* Status Column */}
              <td className="px-5 py-4 text-center">
                    {task.isDraft ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            onSubmitDraft?.(task.id);
                          } catch (err) {
                            console.error('onSubmitDraft failed', err);
                          }
                        }}
                        className="text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/35 border border-emerald-500/30 transition transform active:scale-95 flex items-center gap-1 mx-auto cursor-pointer"
                        title="Submit task to active queue"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Submit</span>
                      </button>
                    ) : task.status === 'Under Review' ? (
                      /* Admin Approve / Reject controls for tasks submitted by users */
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 mr-1">
                          Under Review
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCompleting || isFading) return;
                            handleCompleteWithAnimation(task.id, () => onUpdateTaskStatus?.(task.id, 'Completed'));
                          }}
                          title="Approve — mark as Completed"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/30 transition cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateTaskStatus?.(task.id, 'Rejected');
                          }}
                          title="Reject task"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-extrabold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/30 transition cursor-pointer"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    ) : (
                    <select
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (onUpdateTaskStatus) {
                            onUpdateTaskStatus(task.id, e.target.value as TaskStatus);
                          } else {
                            onToggleStatus(task.id);
                          }
                        }}
                        className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full cursor-pointer transition outline-none appearance-none border text-center ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                            : task.status === 'In Progress'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                            : task.status === 'Rejected'
                            ? 'bg-red-500/15 text-red-400 border-red-500/20'
                            : task.status === 'Incomplete'
                            ? 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                            : 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20'
                        }`}
                      >
                        <option value="Pending" className={theme === 'dark' ? 'bg-[#141C38] text-slate-200' : 'bg-white text-slate-800'}>Pending</option>
                        <option value="Completed" className={theme === 'dark' ? 'bg-[#141C38] text-slate-200' : 'bg-white text-slate-800'}>Completed</option>
                        <option value="In Progress" className={theme === 'dark' ? 'bg-[#141C38] text-slate-200' : 'bg-white text-slate-800'}>In Progress</option>
                        <option value="Under Review" className={theme === 'dark' ? 'bg-[#141C38] text-slate-200' : 'bg-white text-slate-800'}>Under Review</option>
                        <option value="Rejected" className={theme === 'dark' ? 'bg-[#141C38] text-slate-200' : 'bg-white text-slate-800'}>Rejected</option>
                        <option value="Incomplete" className={theme === 'dark' ? 'bg-[#141C38] text-slate-200' : 'bg-white text-slate-800'}>Incomplete</option>
                      </select>
                    )}

                    {/* Duplicate action */}
                    {onDuplicateTask && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCompleting || isFading) return;
                          onDuplicateTask(task.id);
                        }}
                        title="Duplicate task (creates new Pending task)"
                        className={`ml-2 text-[9px] font-extrabold px-2 py-1 rounded-lg border transition cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-slate-800/30 text-slate-300 border-slate-700/50 hover:bg-slate-800/60 hover:text-white'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        Duplicate
                      </button>
                    )}

                    {/* Delete action */}
                    {onDeleteTask && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCompleting || isFading) return;
                          if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        title="Delete task permanently"
                        className={`ml-2 text-[9px] font-extrabold px-2 py-1 rounded-lg border transition cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/25 hover:text-red-300'
                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700'
                        }`}
                      >
                        Delete
                      </button>
                    )}
                  </td>

                  {/* Penalty Column */}
                  <td className="px-5 py-4 text-center">
                    {task.isPenalized ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-extrabold bg-red-950/40 text-red-400 border border-red-800/40 whitespace-nowrap">
                        ⚠️ ₹{task.penaltyAmount ?? 200}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[9px]">—</span>
                    )}
                  </td>
                </tr>
              );
            }))}

          </tbody>
        </table>
      </div>

      {/* Table Stats Footer */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>Showing {filteredTasks.length} tasks matching filters ({allTasks.length} total across all)</span>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span>{filteredTasks.filter(t => t.status !== 'Completed').length} Uncompleted</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{filteredTasks.filter(t => t.status === 'Completed').length} Completed</span>
          </span>
        </div>
      </div>
    </div>
  );
}
