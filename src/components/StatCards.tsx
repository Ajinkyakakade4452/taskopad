import { CheckSquare, UserCheck, CalendarDays, AlertTriangle, Plus } from 'lucide-react';
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

export default function StatCards({ theme, tasks, user, onAddTaskClick }: StatCardsProps) {
  // Calculate real stats from tasks
  const totalTaskCount = tasks.length;

  const userNameLower = user.name.toLowerCase();
  const assignedToMeCount = tasks.filter(t =>
    (t.assignTo && t.assignTo.toLowerCase().includes(userNameLower)) ||
    (t.assignees && t.assignees.some(a => a.toLowerCase().includes(userNameLower)))
  ).length;

  const dueTodayCount = tasks.filter(t => isToday(t.dueDate)).length;

  const pastDueCount = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Completed').length;

  const stats = [
    {
      title: 'Total Task',
      value: totalTaskCount,
      icon: CheckSquare,
      color: 'from-cyan-400 to-blue-500',
      bgOpacity: 'bg-cyan-500/10',
      textAccent: 'text-cyan-400',
      id: 'stat-total',
    },
    {
      title: 'Assigned to me',
      value: assignedToMeCount,
      icon: UserCheck,
      color: 'from-indigo-400 to-purple-500',
      bgOpacity: 'bg-indigo-500/10',
      textAccent: 'text-indigo-400',
      id: 'stat-assigned',
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
      {/* 4 Stats Cards (8 columns on xl) */}
      <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              id={stat.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm flex items-center justify-between group ${
                theme === 'dark'
                  ? 'bg-[#141C38] border-slate-800 text-slate-200 hover:border-slate-700'
                  : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <p className="text-slate-400 font-medium text-xs tracking-wide uppercase">
                  {stat.title}
                </p>
                <h4 className="text-3xl font-extrabold font-mono tracking-tight leading-none">
                  {stat.value}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <span className="text-emerald-400 font-bold">▲ +12%</span>
                  <span>vs last month</span>
                </div>
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

      {/* Right Top Welcome Card (4 columns on xl) */}
      <div
        id="welcome-card"
        className={`xl:col-span-4 rounded-2xl p-5.5 border transition-all duration-300 shadow-md relative overflow-hidden flex flex-col justify-between ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border-cyan-500/30 text-slate-200'
            : 'bg-gradient-to-br from-cyan-50/70 via-slate-50 to-indigo-50/50 border-slate-150 text-slate-800'
        }`}
      >
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="z-10 relative flex gap-4 items-start">
          <div className="space-y-2 max-w-[65%]">
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-bold tracking-wider uppercase">
              Get Started
            </span>
            <h3 className="font-bold text-base leading-snug tracking-tight">
              Welcome to Edigital TaskPad!
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              You haven’t added any personal tasks for today. Let’s get started.
            </p>
          </div>

          {/* SVG Vector Illustration Placeholder */}
          <div className="w-[35%] flex justify-end">
            <svg
              className="w-16 h-16 opacity-90 select-none pointer-events-none"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Laptop screen */}
              <rect x="15" y="30" width="70" height="42" rx="3" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
              {/* Laptop base */}
              <line x1="10" y1="72" x2="90" y2="72" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
              {/* Checkmark block */}
              <rect x="25" y="40" width="30" height="6" rx="1.5" fill="#22d3ee" fillOpacity="0.8" />
              <rect x="25" y="50" width="40" height="6" rx="1.5" fill="#3b82f6" fillOpacity="0.8" />
              {/* Circle avatar placeholder */}
              <circle cx="70" cy="50" r="8" fill="#10b981" fillOpacity="0.5" />
              {/* Check tick */}
              <path d="M68 50 L70 52 L74 48" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className={`z-10 mt-4 pt-3 border-t flex ${theme === 'dark' ? 'border-cyan-500/20' : 'border-slate-800/10'}`}>
          <button
            onClick={onAddTaskClick}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
              theme === 'dark'
                ? 'bg-white text-blue-900 shadow-lg shadow-white/10 hover:bg-slate-100'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/15'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
