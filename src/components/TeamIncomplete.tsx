import { useState } from 'react';
import { Users2, Search, ArrowUpRight, Award, MessageSquare } from 'lucide-react';
import { TeamMember, Task } from '../types';

interface TeamIncompleteProps {
  theme: 'dark' | 'light';
  tasks: Task[];
  users: { id: string; name: string; email: string; role: 'admin' | 'user'; initials: string; avatarColor: string }[];
}

// Helper function to map color to Tailwind classes
const getAvatarClasses = (color: string): string => {
  const colorMap: Record<string, string> = {
    '#0ea5e9': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    '#8b5cf6': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    '#f59e0b': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    '#10b981': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    '#ef4444': 'bg-red-500/10 text-red-400 border-red-500/20',
    '#3b82f6': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    '#ec4899': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    '#14b8a6': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  };
  return colorMap[color] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

export default function TeamIncomplete({ theme, tasks, users }: TeamIncompleteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Convert users to TeamMember format and calculate incomplete task counts
  const safeUsers = Array.isArray(users) ? users : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const members: TeamMember[] = safeUsers.map(user => {
    // Count tasks assigned to this user (either assignTo or in assignees array)
    const incompleteTaskCount = safeTasks.filter(task => {
      const isAssigned = task?.assignTo === user?.name || 
        (task?.assignees && Array.isArray(task.assignees) && task.assignees.includes(user?.name));
      const isIncomplete = task?.status !== 'Completed';
      return isAssigned && isIncomplete;
    }).length;
    
    return {
      id: user?.id || Math.random().toString(),
      name: user?.name || 'User',
      initials: user?.initials || 'U',
      avatarColor: getAvatarClasses(user?.avatarColor || ''),
      incompleteTaskCount
    };
  });

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find teammate of the month (most tasks completed)
  const topTeammate = members.length > 0 
    ? members.reduce((min, m) => (m.incompleteTaskCount < min.incompleteTaskCount ? m : min), members[0]) 
    : null;

  return (
    <div
      id="team-incomplete-section"
      className={`rounded-2xl p-6 transition-all duration-300 shadow-lg border h-full flex flex-col justify-between ${
        theme === 'dark'
          ? 'bg-[#141C38] border-slate-800 text-slate-200'
          : 'bg-white border-slate-100 text-slate-800'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users2 className="w-4.5 h-4.5 text-rose-400" />
            <h3 className="font-semibold text-base tracking-tight">Team Incomplete Task</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold font-mono">
            {members.length} Members
          </span>
        </div>

        {/* Mini Search input */}
        <div className="relative mb-4">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search team member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border outline-none transition focus:ring-2 focus:ring-rose-400 ${
              theme === 'dark'
                ? 'bg-[#0D1631] border-slate-700 text-slate-200 placeholder-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Employee List */}
        <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition group ${
                  theme === 'dark'
                    ? 'bg-[#0D1631] border-slate-800 hover:bg-[#0D1631]/80 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-150 hover:bg-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Initials Avatar */}
                  <div
                    className={`w-8.5 h-8.5 rounded-xl border font-bold text-xs flex items-center justify-center select-none ${member.avatarColor}`}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-normal group-hover:text-cyan-400 transition">
                      {member.name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium">
                      {member.incompleteTaskCount > 10 ? 'High workload' : 'Optimal load'}
                    </p>
                  </div>
                </div>

                {/* Task Count Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-1 rounded-lg ${
                      member.incompleteTaskCount >= 15
                        ? 'bg-red-500/15 text-red-400'
                        : member.incompleteTaskCount >= 10
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {member.incompleteTaskCount} Left
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No team members match your filter
            </div>
          )}
        </div>
      </div>

      {/* Footer Top Performer info */}
      <div className={`mt-4 pt-3.5 border-t border-slate-800/10 flex items-center justify-between text-xs`}>
        <div className="flex items-center gap-2">
          <Award className="w-4.5 h-4.5 text-yellow-500" />
          <div className="text-left">
            <p className="font-semibold text-[10px] uppercase text-slate-400 tracking-wider">Top Performer</p>
            {topTeammate ? (
              <p className="font-bold text-xs text-yellow-500">{topTeammate.name}</p>
            ) : (
              <p className="text-xs text-slate-500">No team members yet</p>
            )}
          </div>
        </div>
        <button className={`p-1.5 rounded-lg border hover:opacity-90 transition ${
          theme === 'dark' ? 'border-slate-800 bg-[#0D1631]' : 'border-slate-200 bg-slate-50'
        }`}>
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
