import { CheckSquare, UserCheck, CalendarDays, AlertTriangle, Plus, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
  avatarColor: string;
  token: string;
}

interface StatCardsProps {
  theme: 'dark' | 'light';
  tasks: any[];
  user: LoggedInUser;
  onAddTaskClick: () => void;
  onFilterClick?: (filter: 'main' | 'subtask' | 'subtask-approved' | 'all' | 'review') => void;
  activeFilter?: 'main' | 'subtask' | 'subtask-approved' | 'all' | 'review';
}

function isToday(dueDate: string): boolean {
  if (!dueDate) return false;
  const today = new Date();
  const due = new Date(dueDate);
  return today.toDateString() === due.toDateString();
}

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

export default function StatCards({ theme, tasks, user, onAddTaskClick, onFilterClick, activeFilter = 'all' }: StatCardsProps) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  // Calculate real stats from tasks
  const totalTaskCount = safeTasks.length;

  const allSubtaskCount = safeTasks.reduce((sum, t) => sum + (t?.subTasks?.length || 0), 0);
  const approvedSubtaskCount = safeTasks.reduce((sum, t) => sum + (t?.subTasks?.filter(st => st?.approvedByAdmin === true).length || 0), 0);
  const pendingApprovalSubtaskCount = safeTasks.reduce((sum, t) => sum + (t?.subTasks?.filter(st => st?.completed === true && st?.approvedByAdmin !== true).length || 0), 0);
  const pendingSubtaskCount = safeTasks.reduce((sum, t) => sum + (t?.subTasks?.filter(st => !st?.completed).length || 0), 0);
  const clientApprovedTasks = safeTasks.filter(t => t?.status === 'Under Review');

  const dueTodayCount = safeTasks.filter(t => isToday(t?.dueDate)).length;

  const pastDueCount = safeTasks.filter(t => isOverdue(t?.dueDate) && t?.status !== 'Completed').length;

  const stats = [
    {
      title: 'Main Task',
      value: totalTaskCount,
      icon: CheckSquare,
      color: 'from-cyan-400 to-blue-500',
      bgOpacity: 'bg-cyan-500/10',
      textAccent: 'text-cyan-400',
      id: 'stat-total',
      filterValue: 'main' as const,
    },
    {
      title: 'All Subtask',
      value: allSubtaskCount,
      icon: UserCheck,
      color: 'from-indigo-400 to-purple-500',
      bgOpacity: 'bg-indigo-500/10',
      textAccent: 'text-indigo-400',
      id: 'stat-assigned',
      filterValue: 'subtask' as const,
    },
    {
      title: 'Pending Approval',
      value: pendingApprovalSubtaskCount,
      icon: CheckCircle,
      color: 'from-emerald-400 to-teal-500',
      bgOpacity: 'bg-emerald-500/10',
      textAccent: 'text-emerald-400',
      id: 'stat-unapproved-subtasks',
      filterValue: 'subtask-approved' as const,
    },
    {
      title: 'Due today',
      value: dueTodayCount,
      icon: CalendarDays,
      color: 'from-amber-400 to-orange-500',
      bgOpacity: 'bg-amber-500/10',
      textAccent: 'text-amber-400',
      id: 'stat-due',
    },
    {
      title: 'Past due tasks',
      value: pastDueCount,
      icon: AlertTriangle,
      color: 'from-rose-400 to-red-500',
      bgOpacity: 'bg-red-500/10',
      textAccent: 'text-rose-400',
      id: 'stat-pastdue',
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full select-none">
      {/* 5 Stats Cards (8 columns on xl) */}
      <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isActive = activeFilter === stat.filterValue;
          return (
            <motion.div
              key={stat.title}
              id={stat.id}
              onClick={() => {
                if (stat.filterValue && onFilterClick) {
                  onFilterClick(activeFilter === stat.filterValue ? 'all' : stat.filterValue);
                }
              }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm flex items-start justify-between group ${
                stat.filterValue ? 'cursor-pointer ' : ''
              }${
                isActive
                  ? theme === 'dark' 
                    ? stat.filterValue === 'main' 
                      ? 'bg-[#1e2a52] border-cyan-500/50 text-white shadow-cyan-500/10' 
                      : stat.filterValue === 'subtask'
                      ? 'bg-[#2a1e52] border-violet-500/50 text-white shadow-violet-500/10'
                      : 'bg-[#1e3a32] border-emerald-500/50 text-white shadow-emerald-500/10'
                    : stat.filterValue === 'main'
                      ? 'bg-cyan-50 border-cyan-400 text-slate-900 shadow-cyan-500/20'
                      : stat.filterValue === 'subtask'
                      ? 'bg-violet-50 border-violet-400 text-slate-900 shadow-violet-500/20'
                      : 'bg-emerald-50 border-emerald-400 text-slate-900 shadow-emerald-500/20'
                  : theme === 'dark'
                  ? 'bg-[#141C38] border-slate-800 text-slate-200 hover:border-slate-700'
                  : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200'
              }`}>
              <div className="space-y-2">
                <p className="text-slate-400 font-medium text-xs tracking-wide uppercase">
                  {stat.title}
                </p>
                <h4 className="text-3xl font-extrabold font-mono tracking-tight leading-none">
                  {stat.value}
                </h4>
                {/* Approved/Pending breakdown for All Subtask card */}
                {stat.filterValue === 'subtask' ? (
                  <div className="flex flex-col gap-1">
                    {/* Approved by admin */}
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block flex-shrink-0" />
                      {approvedSubtaskCount} Approved
                    </span>
                    {/* User completed, waiting admin approval */}
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block flex-shrink-0 animate-pulse" />
                      {pendingApprovalSubtaskCount} Sent for Approval
                    </span>
                    {/* Not started by user */}
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-500 inline-block flex-shrink-0" />
                      {pendingSubtaskCount} Not Done
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <span className="text-emerald-400 font-bold">▲ +12%</span>
                    <span>vs last month</span>
                  </div>
                )}
              </div>

              {/* Decorative Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${stat.bgOpacity}`}
              >
                <Icon className={`w-6 h-6 ${stat.textAccent}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right Top Welcome Card -> Client Approved Tasks (4 columns on xl) */}
      <div
        id="client-approved-card"
        onClick={() => {
          if (onFilterClick) {
            onFilterClick(activeFilter === 'review' ? 'all' : 'review');
          }
        }}
        className={`xl:col-span-4 rounded-2xl p-5.5 border transition-all duration-300 shadow-md relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
          activeFilter === 'review'
            ? theme === 'dark' ? 'bg-gradient-to-br from-violet-600/30 to-purple-700/30 border-violet-400/50 text-white shadow-violet-500/20' : 'bg-gradient-to-br from-violet-100 via-slate-50 to-purple-100 border-violet-400 text-slate-900'
            : theme === 'dark'
            ? 'bg-gradient-to-br from-violet-600/20 to-purple-700/20 border-violet-500/30 text-slate-200 hover:border-violet-400/40'
            : 'bg-gradient-to-br from-violet-50/70 via-slate-50 to-purple-50/50 border-slate-150 text-slate-800'
        }`}
      >
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="z-10 relative flex gap-4 items-start">
          <div className="space-y-2 max-w-[65%]">
            <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-400 text-[9px] font-bold tracking-wider uppercase">
              Action Required
            </span>
            <h3 className="font-bold text-base leading-snug tracking-tight">
              Client Approved Tasks
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              You have <strong className="text-violet-400 text-lg">{clientApprovedTasks.length}</strong> tasks pending your final approval from clients.
            </p>
          </div>

          <div className="w-[35%] flex justify-end">
             <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
               <AlertTriangle className="w-7 h-7 text-violet-400" />
             </div>
          </div>
        </div>

        <div className={`z-10 mt-4 pt-3 border-t flex ${theme === 'dark' ? 'border-violet-500/20' : 'border-slate-800/10'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onFilterClick) {
                onFilterClick(activeFilter === 'review' ? 'all' : 'review');
              }
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
              theme === 'dark'
                ? 'bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/20'
                : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-400 hover:to-purple-500 shadow-md shadow-violet-500/15'
            }`}
          >
            <span>Review Tasks</span>
          </button>
        </div>
      </div>
    </div>
  );
}
