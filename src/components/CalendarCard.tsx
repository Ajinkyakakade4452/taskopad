import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Star, Flame, ArrowUpRight } from 'lucide-react';
import { Task, Priority } from '../types';

interface CalendarCardProps {
  theme: 'dark' | 'light';
  tasks: Task[];
}

export default function CalendarCard({ theme, tasks }: CalendarCardProps) {
  // We are focused on July 2026
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1st of July

  const daysInJuly = 31;
  const startDayOffset = 3; // Wednesday (0: Sun, 1: Mon, 2: Tue, 3: Wed)
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // July 1, 2026 Tasks from request + any user-created tasks due on 2026-07-01
  const defaultJuly1Tasks: Task[] = [
    {
      id: 'cal-1',
      name: 'Graphic Designing Batch',
      description: 'Training and design review session',
      project: 'Om Associates',
      priority: 'High',
      startDate: '2026-07-01',
      dueDate: '2026-07-01',
      time: '11:00 AM - 12:30 PM',
      assignTo: 'Krishna Lokhande',
      status: 'Pending',
    },
    {
      id: 'cal-2',
      name: 'Daily 5 Stories (Engagable)',
      description: 'Social media interactive story updates',
      project: 'YouGo',
      priority: 'Medium',
      startDate: '2026-07-01',
      dueDate: '2026-07-01',
      time: '1:00 PM - 2:00 PM',
      assignTo: 'Alister Manikam',
      status: 'Pending',
    },
    {
      id: 'cal-3',
      name: 'Daily 5 Engagable Story Idea',
      description: 'Ideation and alignment with content strategy',
      project: 'YouGo',
      priority: 'Medium',
      startDate: '2026-07-01',
      dueDate: '2026-07-01',
      time: '3:00 PM - 4:00 PM',
      assignTo: 'Kriti Khandelwal',
      status: 'Pending',
    },
    {
      id: 'cal-4',
      name: 'Leads Sending Task Morning 9.30',
      description: 'Disbursal of freshly processed leads',
      project: 'Net Access Internet',
      priority: 'High',
      startDate: '2026-07-01',
      dueDate: '2026-07-01',
      time: '9:30 AM - 10:00 AM',
      assignTo: 'Aditya Kirat Karve',
      status: 'Pending',
    },
    {
      id: 'cal-5',
      name: 'Leads sending Task Daily 5.30 Evening',
      description: 'End of day leads update and client report',
      project: 'Net Access Internet',
      priority: 'High',
      startDate: '2026-07-01',
      dueDate: '2026-07-01',
      time: '5:30 PM - 6:00 PM',
      assignTo: 'Ajinkya Kakade',
      status: 'Pending',
    },
  ];

  // Merge default tasks with new ones due on selected day
  const getTasksForSelectedDay = () => {
    const formattedDate = `2026-07-${selectedDay.toString().padStart(2, '0')}`;
    const dynamicTasks = tasks.filter(t => t.dueDate === formattedDate);

    if (selectedDay === 1) {
      // Add dynamic tasks due on July 1st
      return [...defaultJuly1Tasks, ...dynamicTasks];
    }
    return dynamicTasks;
  };

  const dayTasks = getTasksForSelectedDay();

  // Avatar helper
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
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    ];
    let sum = 0;
    for (let i = 0; i < initials.length; i++) sum += initials.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div
      id="calendar-section"
      className={`rounded-2xl p-6 transition-all duration-300 shadow-lg border h-full flex flex-col justify-between ${
        theme === 'dark'
          ? 'bg-[#141C38] border-slate-800 text-slate-200'
          : 'bg-white border-slate-100 text-slate-800'
      }`}
    >
      <div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4.5 h-4.5 text-cyan-400" />
            <span className="font-bold text-base tracking-tight">Calendar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono px-2 py-1 rounded bg-cyan-500/10 text-cyan-400">
              July 2026
            </span>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-slate-800/20 transition text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 rounded hover:bg-slate-800/20 transition text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-2">
            {weekdays.map((w, i) => (
              <div key={i} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium font-mono">
            {/* Offset blanks for July 2026 */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="py-1.5 opacity-0"></div>
            ))}

            {/* Days in July */}
            {Array.from({ length: daysInJuly }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay;
              const isToday = day === 1; // Wednesday, July 1st is today in metadata
              const hasTask = day === 1 || tasks.some(t => t.dueDate === `2026-07-${day.toString().padStart(2, '0')}`);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`py-1.5 rounded-lg flex flex-col items-center justify-center relative group transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold scale-105 shadow-md shadow-cyan-500/20'
                      : isToday
                      ? theme === 'dark'
                        ? 'bg-[#0D1631] text-cyan-400 border border-cyan-400/30'
                        : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                      : theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <span>{day}</span>
                  {hasTask && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px w-full my-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-150'}`} />

        {/* Selected Day Agenda Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Agenda — July {selectedDay}, 2026
          </h4>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-mono">
            {dayTasks.length} {dayTasks.length === 1 ? 'Task' : 'Tasks'}
          </span>
        </div>

        {/* Tasks List */}
        <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
          {dayTasks.length > 0 ? (
            dayTasks.map((task) => {
              const initials = getInitials(task.assignTo);
              const avatarClass = getAvatarBgColor(initials);

              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 group transition duration-200 ${
                    theme === 'dark'
                      ? 'bg-[#0D1631] border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-150 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold leading-snug group-hover:text-cyan-400 transition">
                        {task.name}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-1">
                        {task.project}
                      </p>
                    </div>

                    {/* Priority Badge */}
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 ${
                        task.priority === 'High'
                          ? 'bg-rose-500/15 text-rose-400'
                          : task.priority === 'Medium'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {task.priority === 'High' ? (
                        <Flame className="w-2.5 h-2.5" />
                      ) : (
                        <Star className="w-2.5 h-2.5" />
                      )}
                      <span>{task.priority}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/10 pt-2 text-[10px]">
                    {/* Time / Clock */}
                    <div className="flex items-center gap-1 text-slate-400 font-medium">
                      <Clock className="w-3 h-3 text-cyan-500" />
                      <span>{task.time || 'Flexible Time'}</span>
                    </div>

                    {/* Assignee Avatar Initials */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">By</span>
                      <div
                        title={task.assignTo}
                        className={`w-5.5 h-5.5 rounded-full border text-[9px] font-bold flex items-center justify-center select-none ${avatarClass}`}
                      >
                        {initials}
                      </div>
                      <span className="text-yellow-500 font-bold uppercase tracking-wider text-[8px] bg-yellow-500/10 px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-500">No events scheduled for this day</p>
              <p className="text-[10px] text-slate-400 mt-1">Enjoy a clean calendar! Or click July 1st to see standard items.</p>
            </div>
          )}
        </div>
      </div>

      <div className={`text-[10px] text-slate-400 font-medium border-t border-slate-800/10 pt-3 flex items-center justify-between ${dayTasks.length > 0 ? 'mt-4' : ''}`}>
        <span>Selected July {selectedDay}, 2026</span>
        <span className="text-cyan-400 font-semibold cursor-pointer flex items-center gap-0.5 hover:underline">
          View full calendar <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
