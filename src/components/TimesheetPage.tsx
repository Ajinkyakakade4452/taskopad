import { useState } from 'react';
import { Clock, Plus, Calendar, Search, Filter, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface TimeEntry {
  id: string;
  task: Task;
  user: string;
  date: string;
  hours: number;
  description: string;
  status: 'billable' | 'non-billable';
}

interface TimesheetPageProps {
  theme: 'dark' | 'light';
  tasks: Task[];
  users: any[];
}

export default function TimesheetPage({ theme, tasks, users }: TimesheetPageProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    ...(users.length > 0 && tasks.length > 0 ? [
      {
        id: 'te-1',
        task: tasks[0],
        user: users[0].name,
        date: selectedDate,
        hours: 4,
        description: 'Frontend development for dashboard',
        status: 'billable'
      },
      {
        id: 'te-2',
        task: tasks[1] || tasks[0],
        user: users[1]?.name || users[0].name,
        date: selectedDate,
        hours: 3.5,
        description: 'Backend API integration',
        status: 'billable'
      }
    ] : [])
  ]);

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<TimeEntry, 'id'>>({
    task: tasks[0] || ({} as Task),
    user: users[0]?.name || '',
    date: selectedDate,
    hours: 0,
    description: '',
    status: 'billable'
  });

  const handleAddEntry = () => {
    if (!newEntry.task || newEntry.hours <= 0) return;
    const entry: TimeEntry = {
      ...newEntry,
      id: `te-${Date.now()}`
    };
    setTimeEntries([entry, ...timeEntries]);
    setShowAddEntry(false);
    setNewEntry({
      task: tasks[0] || ({} as Task),
      user: users[0]?.name || '',
      date: selectedDate,
      hours: 0,
      description: '',
      status: 'billable'
    });
  };

  const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
  const billableHours = timeEntries.filter(e => e.status === 'billable').reduce((sum, e) => sum + e.hours, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Timesheet</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Track and manage team time entries</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition focus:ring-2 focus:ring-cyan-400 ${
                theme === 'dark'
                  ? 'bg-[#0D1631] border-slate-700 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            />
          </div>
          <button
            onClick={() => setShowAddEntry(!showAddEntry)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-md shadow-cyan-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Hours</p>
          <p className="text-2xl font-extrabold font-mono">{totalHours.toFixed(1)}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Billable Hours</p>
          <p className="text-2xl font-extrabold font-mono text-cyan-400">{billableHours.toFixed(1)}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Entries</p>
          <p className="text-2xl font-extrabold font-mono">{timeEntries.length}</p>
        </div>
      </div>

      {/* Add Entry Form */}
      {showAddEntry && (
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <h3 className="text-sm font-bold mb-4">New Time Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Task</label>
              <select
                value={newEntry.task?.id}
                onChange={(e) => {
                  const task = tasks.find(t => t.id === e.target.value);
                  if (task) setNewEntry({ ...newEntry, task });
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">User</label>
              <select
                value={newEntry.user}
                onChange={(e) => setNewEntry({ ...newEntry, user: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Hours</label>
              <input
                type="number"
                step="0.5"
                value={newEntry.hours}
                onChange={(e) => setNewEntry({ ...newEntry, hours: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Status</label>
              <select
                value={newEntry.status}
                onChange={(e) => setNewEntry({ ...newEntry, status: e.target.value as 'billable' | 'non-billable' })}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="billable">Billable</option>
                <option value="non-billable">Non-Billable</option>
              </select>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <label className="text-xs text-slate-400">Description</label>
            <textarea
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              rows={2}
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-cyan-400 ${
                theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
              placeholder="What did you work on?"
            />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => setShowAddEntry(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border text-slate-400 hover:text-slate-200 hover:border-slate-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEntry}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Time Entries List */}
      <div className={`rounded-2xl border overflow-hidden ${
        theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="p-4 border-b border-slate-800/10 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Time Entries</span>
        </div>
        <div className="divide-y divide-slate-800/10">
          {timeEntries.map(entry => (
            <div key={entry.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-[#0D1631]' : 'bg-slate-50'}`}>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{entry.task?.name}</p>
                  <p className="text-xs text-slate-400">{entry.user} • {entry.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  entry.status === 'billable'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                }`}>
                  {entry.status}
                </span>
                <span className="text-sm font-extrabold font-mono">{entry.hours.toFixed(1)}h</span>
              </div>
            </div>
          ))}
        </div>
        {timeEntries.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">No time entries yet</div>
        )}
      </div>
    </div>
  );
}
