import { useState, useRef } from 'react';
import {
  X, Plus, Trash2, Copy, ChevronDown, Upload,
  CheckCircle2, AlertCircle, Loader2, Sparkles, ListPlus
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';

interface BulkTaskModalProps {
  theme: 'dark' | 'light';
  isOpen: boolean;
  onClose: () => void;
  onSaveMultiple: (tasks: Omit<Task, 'id'>[]) => void;
  users: { id: string; name: string; email?: string; initials?: string; avatarColor?: string }[];
}

interface TaskRow {
  rowId: string;
  name: string;
  description: string;
  project: string;
  priority: Priority;
  dueDate: string;
  assignTo: string;
  status: TaskStatus;
  client: string;
  service: string;
  time: string;
}

const PROJECTS = [
  'Net Access Internet', 'Om Associates', 'YouGo',
  'Easy Bank Loans', 'My Nest', 'Edigital Knowledge', 'AHC Cafe'
];
const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed', 'Under Review', 'Rejected', 'Incomplete'];
const TIME_SLOTS = [
  '9:00 AM - 10:00 AM', '9:30 AM - 10:00 AM', '10:00 AM - 11:00 AM',
  '11:00 AM - 12:30 PM', '12:00 PM - 1:00 PM', '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM', '5:30 PM - 6:00 PM', '6:00 PM - 7:00 PM',
];

function makeEmptyRow(users: BulkTaskModalProps['users']): TaskRow {
  return {
    rowId: `row-${Date.now()}-${Math.random()}`,
    name: '',
    description: '',
    project: PROJECTS[0],
    priority: 'High',
    dueDate: new Date().toISOString().split('T')[0],
    assignTo: users[0]?.name || '',
    status: 'Pending',
    client: '',
    service: '',
    time: '11:00 AM - 12:30 PM',
  };
}

const priorityColors: Record<Priority, string> = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  High:     'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Medium:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Low:      'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const statusColors: Record<TaskStatus, string> = {
  'Pending':      'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'In Progress':  'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Completed':    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Under Review': 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  'Rejected':     'text-red-400 bg-red-500/10 border-red-500/30',
  'Incomplete':   'text-orange-400 bg-orange-500/10 border-orange-500/30',
};

export default function BulkTaskModal({ theme, isOpen, onClose, onSaveMultiple, users }: BulkTaskModalProps) {
  const [rows, setRows] = useState<TaskRow[]>(() => [makeEmptyRow(users), makeEmptyRow(users), makeEmptyRow(users)]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  // ── Row management ──────────────────────────────────────────────────────────
  const addRows = (count: number) => {
    const newRows = Array.from({ length: count }, () => makeEmptyRow(users));
    setRows(prev => [...prev, ...newRows]);
  };

  const duplicateRow = (rowId: string) => {
    const idx = rows.findIndex(r => r.rowId === rowId);
    if (idx === -1) return;
    const copy = { ...rows[idx], rowId: `row-${Date.now()}-${Math.random()}`, name: rows[idx].name ? `${rows[idx].name} (copy)` : '' };
    const next = [...rows];
    next.splice(idx + 1, 0, copy);
    setRows(next);
  };

  const removeRow = (rowId: string) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(r => r.rowId !== rowId));
    setSelectedRows(prev => { const s = new Set(prev); s.delete(rowId); return s; });
  };

  const removeSelected = () => {
    if (rows.length - selectedRows.size < 1) return;
    setRows(prev => prev.filter(r => !selectedRows.has(r.rowId)));
    setSelectedRows(new Set());
  };

  const update = (rowId: string, field: keyof TaskRow, value: string) => {
    setRows(prev => prev.map(r => r.rowId === rowId ? { ...r, [field]: value } : r));
    if (error) setError('');
  };

  const toggleSelect = (rowId: string) => {
    setSelectedRows(prev => {
      const s = new Set(prev);
      s.has(rowId) ? s.delete(rowId) : s.add(rowId);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map(r => r.rowId)));
    }
  };

  // ── Apply field to all selected rows ────────────────────────────────────────
  const applyToSelected = (field: keyof TaskRow, value: string) => {
    if (selectedRows.size === 0) return;
    setRows(prev => prev.map(r => selectedRows.has(r.rowId) ? { ...r, [field]: value } : r));
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const emptyNames = rows.filter(r => !r.name.trim());
    if (emptyNames.length > 0) {
      setError(`${emptyNames.length} row${emptyNames.length > 1 ? 's' : ''} missing a task name. Please fill them in or delete.`);
      return;
    }

    setSaving(true);
    const tasksToSave: Omit<Task, 'id'>[] = rows.map(r => ({
      name: r.name.trim(),
      description: r.description.trim() || 'No description provided',
      project: r.project,
      projects: [r.project],
      priority: r.priority,
      dueDate: r.dueDate,
      time: r.time || '11:00 AM - 12:30 PM',
      assignTo: r.assignTo,
      assignees: [r.assignTo],
      status: r.status,
      client: r.client || '',
      service: r.service || '',
      follower: '',
      documents: [],
      subTasks: [],
      checklist: [],
      comments: [],
      timeLogs: [],
      isDraft: false,
      isRecurring: false,
    }));

    onSaveMultiple(tasksToSave);
    setSaved(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(false);
      setRows([makeEmptyRow(users), makeEmptyRow(users), makeEmptyRow(users)]);
      setSelectedRows(new Set());
      setError('');
      onClose();
    }, 1000);
  };

  // ── Compact select UI ────────────────────────────────────────────────────────
  const inputCls = `text-xs px-2 py-1.5 rounded-lg border outline-none w-full transition focus:ring-1 ${
    isDark
      ? 'bg-[#0D1631] border-slate-700 text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20'
      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20'
  }`;
  const selectCls = `text-xs px-2 py-1.5 rounded-lg border outline-none w-full cursor-pointer transition focus:ring-1 ${
    isDark
      ? 'bg-[#0D1631] border-slate-700 text-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20'
      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
  }`;

  const completedCount = rows.filter(r => r.name.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-8 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm"
        onClick={!saving ? onClose : undefined}
      />

      {/* Modal */}
      <div className={`relative z-10 w-full max-w-[1100px] rounded-2xl shadow-2xl border overflow-hidden mb-8 ${
        isDark ? 'bg-[#0D1631] border-slate-700/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
      }`}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-800 bg-[#080F22]' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ListPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Bulk Task Creator</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-500/15 text-violet-400 border border-violet-500/20 uppercase tracking-wider">
                  {rows.length} tasks
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Fill in all rows and save to MySQL database at once</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="text-emerald-400 font-semibold">{completedCount}</span>
              <span>/</span>
              <span>{rows.length} filled</span>
              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${rows.length ? (completedCount / rows.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <button
              onClick={!saving ? onClose : undefined}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
        <div className={`flex flex-wrap items-center gap-2 px-5 py-2.5 border-b ${isDark ? 'border-slate-800 bg-[#0A1128]' : 'border-slate-100 bg-white'}`}>
          {/* Add rows */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => addRows(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
            <button
              onClick={() => addRows(5)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition"
            >
              <Sparkles className="w-3 h-3" /> +5 Rows
            </button>
            <button
              onClick={() => addRows(10)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition"
            >
              +10 Rows
            </button>
          </div>

          {/* Selected actions */}
          {selectedRows.size > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              isDark ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-600'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>{selectedRows.size} selected</span>
              <span className="text-slate-500 mx-0.5">·</span>

              {/* Apply project to all selected */}
              <select
                className={`text-[10px] bg-transparent border-none outline-none cursor-pointer ${isDark ? 'text-violet-300' : 'text-violet-600'}`}
                defaultValue=""
                onChange={e => { if (e.target.value) applyToSelected('project', e.target.value); }}
              >
                <option value="" disabled>Set Project</option>
                {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <span className="text-slate-500">·</span>

              {/* Apply assignee */}
              <select
                className={`text-[10px] bg-transparent border-none outline-none cursor-pointer ${isDark ? 'text-violet-300' : 'text-violet-600'}`}
                defaultValue=""
                onChange={e => { if (e.target.value) applyToSelected('assignTo', e.target.value); }}
              >
                <option value="" disabled>Set Assignee</option>
                {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
              <span className="text-slate-500">·</span>

              {/* Apply priority */}
              <select
                className={`text-[10px] bg-transparent border-none outline-none cursor-pointer ${isDark ? 'text-violet-300' : 'text-violet-600'}`}
                defaultValue=""
                onChange={e => { if (e.target.value) applyToSelected('priority', e.target.value); }}
              >
                <option value="" disabled>Set Priority</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <span className="text-slate-500">·</span>

              {/* Apply due date */}
              <input
                type="date"
                className={`text-[10px] bg-transparent border-none outline-none cursor-pointer ${isDark ? 'text-violet-300' : 'text-violet-600'}`}
                onChange={e => { if (e.target.value) applyToSelected('dueDate', e.target.value); }}
              />
              <span className="text-slate-500">·</span>

              <button
                onClick={removeSelected}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 transition"
                title="Delete selected rows"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowAdvanced(a => !a)}
            className={`ml-auto text-xs flex items-center gap-1 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition`}
          >
            Advanced <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* ── Error banner ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Table ────────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto max-h-[55vh] overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead className={`sticky top-0 z-10 ${isDark ? 'bg-[#0A1128]' : 'bg-slate-50'}`}>
              <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <th className="w-10 px-3 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={rows.length > 0 && selectedRows.size === rows.length}
                    onChange={toggleSelectAll}
                    className="rounded accent-cyan-500 cursor-pointer"
                  />
                </th>
                <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-6">
                  #
                </th>
                <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[160px]">
                  Task Name <span className="text-red-400">*</span>
                </th>
                <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[140px]">
                  Description
                </th>
                <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[140px]">
                  Project
                </th>
                <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                  Priority
                </th>
                <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
                  Due Date
                </th>
                <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[130px]">
                  Assignee
                </th>
                <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[110px]">
                  Status
                </th>
                {showAdvanced && (
                  <>
                    <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[110px]">
                      Time Slot
                    </th>
                    <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                      Client
                    </th>
                    <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                      Service
                    </th>
                  </>
                )}
                <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const isSelected = selectedRows.has(row.rowId);
                const hasName = !!row.name.trim();
                return (
                  <tr
                    key={row.rowId}
                    className={`border-b transition-colors group ${
                      isDark ? 'border-slate-800/60' : 'border-slate-100'
                    } ${isSelected ? (isDark ? 'bg-violet-500/5' : 'bg-violet-50') : (isDark ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50/70')}`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(row.rowId)}
                        className="rounded accent-cyan-500 cursor-pointer"
                      />
                    </td>

                    {/* Row number */}
                    <td className="px-2 py-2 text-slate-600 font-mono select-none">{idx + 1}</td>

                    {/* Task Name */}
                    <td className="px-2 py-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter task name..."
                          value={row.name}
                          onChange={e => update(row.rowId, 'name', e.target.value)}
                          className={`${inputCls} ${!hasName && error ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        />
                        {hasName && (
                          <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-500 pointer-events-none" />
                        )}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        placeholder="Optional description..."
                        value={row.description}
                        onChange={e => update(row.rowId, 'description', e.target.value)}
                        className={inputCls}
                      />
                    </td>

                    {/* Project */}
                    <td className="px-2 py-2">
                      <select value={row.project} onChange={e => update(row.rowId, 'project', e.target.value)} className={selectCls}>
                        {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="px-2 py-2">
                      <select
                        value={row.priority}
                        onChange={e => update(row.rowId, 'priority', e.target.value)}
                        className={`${selectCls} font-semibold ${priorityColors[row.priority]}`}
                      >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>

                    {/* Due Date */}
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        value={row.dueDate}
                        onChange={e => update(row.rowId, 'dueDate', e.target.value)}
                        className={inputCls}
                      />
                    </td>

                    {/* Assignee */}
                    <td className="px-2 py-2">
                      <select value={row.assignTo} onChange={e => update(row.rowId, 'assignTo', e.target.value)} className={selectCls}>
                        {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                      </select>
                    </td>

                    {/* Status */}
                    <td className="px-2 py-2">
                      <select
                        value={row.status}
                        onChange={e => update(row.rowId, 'status', e.target.value)}
                        className={`${selectCls} font-semibold ${statusColors[row.status]}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* Advanced fields */}
                    {showAdvanced && (
                      <>
                        <td className="px-2 py-2">
                          <select value={row.time} onChange={e => update(row.rowId, 'time', e.target.value)} className={selectCls}>
                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            placeholder="Client..."
                            value={row.client}
                            onChange={e => update(row.rowId, 'client', e.target.value)}
                            className={inputCls}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            placeholder="Service..."
                            value={row.service}
                            onChange={e => update(row.rowId, 'service', e.target.value)}
                            className={inputCls}
                          />
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateRow(row.rowId)}
                          title="Duplicate this row"
                          className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition opacity-0 group-hover:opacity-100"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeRow(row.rowId)}
                          title="Delete this row"
                          disabled={rows.length <= 1}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-20 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────────── */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-t ${
          isDark ? 'border-slate-800 bg-[#080F22]' : 'border-slate-100 bg-slate-50'
        }`}>
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Total rows: <span className="font-bold text-white">{rows.length}</span>
            </span>
            <span className="text-emerald-400 font-semibold">
              ✓ {completedCount} ready
            </span>
            {rows.length - completedCount > 0 && (
              <span className="text-amber-400 font-semibold">
                ⚠ {rows.length - completedCount} empty
              </span>
            )}
            <button
              onClick={() => addRows(1)}
              className={`flex items-center gap-1 text-[10px] font-semibold hover:text-cyan-400 transition ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
            >
              <Plus className="w-3 h-3" /> Add row
            </button>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                isDark
                  ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || completedCount === 0}
              className="px-6 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
            >
              {saving ? (
                saved ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Saved!</>
                ) : (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving to database...</>
                )
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Save {completedCount} Task{completedCount !== 1 ? 's' : ''} to DB</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
