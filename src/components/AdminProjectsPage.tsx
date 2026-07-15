import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2, PencilLine, X } from 'lucide-react';
import { Project } from '../types';

interface LoggedInUserLike {
  role: 'admin' | 'user';
}

const API_BASE = '/api/projects';

type PartialProjectCreate = {
  name: string;
  creator?: string;
  color?: string;
  hasEndDate?: boolean;
  endDate?: string;
};

type PartialProjectUpdate = {
  name?: string;
  creator?: string;
  color?: string;
  hasEndDate?: boolean;
  endDate?: string;
};

function randomProjectColor() {
  const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function AdminProjectsPage() {
  // Admin gate: App routes only render this for admin, but keep component safe.
  // (We cannot access loggedInUser here; so we do soft rendering: show UI regardless if not admin.)

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Add Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState<PartialProjectCreate>({
    name: '',
    creator: 'Admin',
    color: '',
    hasEndDate: false,
    endDate: '',
  });

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<(Project & { password?: string }) | null>(null);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetAddForm = () => {
    setForm({
      name: '',
      creator: 'Admin',
      color: '',
      hasEndDate: false,
      endDate: '',
    });
  };

  const openAdd = () => {
    resetAddForm();
    setIsAddOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditForm({ ...p });
    setIsEditOpen(true);
  };

  const handleAdd = async () => {
    const name = (form.name || '').trim();
    const hasEndDate = !!form.hasEndDate;
    const endDate = (form.endDate || '').trim();
    if (!name) {
      setError('Project name is required');
      return;
    }
    if (hasEndDate && !endDate) {
      setError('endDate is required when hasEndDate is true');
      return;
    }

    setBusy('add');
    setError(null);
    try {
      const payload: PartialProjectCreate = {
        name,
        creator: (form.creator || 'Admin').trim(),
        color: (form.color || '').trim() || randomProjectColor(),
        hasEndDate,
        endDate: hasEndDate ? endDate : undefined,
      };

      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to add project');
      }

      await fetchProjects();
      setIsAddOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to add project');
    } finally {
      setBusy(null);
    }
  };

  const handleEdit = async () => {
    if (!editForm) return;

    const name = (editForm.name || '').trim();
    const hasEndDate = !!editForm.hasEndDate;
    const endDate = (editForm.endDate || '').trim();
    if (!name) {
      setError('Project name is required');
      return;
    }
    if (hasEndDate && !endDate) {
      setError('endDate is required when hasEndDate is true');
      return;
    }

    setBusy('edit');
    setError(null);
    try {
      const payload: PartialProjectUpdate = {
        name,
        creator: (editForm.creator || 'Admin').trim(),
        color: (editForm.color || '').trim() || randomProjectColor(),
        hasEndDate,
        endDate: hasEndDate ? endDate : undefined,
      };

      const res = await fetch(`${API_BASE}/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to update project');
      }

      await fetchProjects();
      setIsEditOpen(false);
      setEditForm(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update project');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setBusy('delete');
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${deleteId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to delete project');
      }

      await fetchProjects();
      setDeleteId(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to delete project');
    } finally {
      setBusy(null);
    }
  };

  const headerRight = useMemo(() => (
    <div className="flex items-center gap-3">
      <button
        onClick={openAdd}
        disabled={busy === 'add'}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400/30 hover:from-cyan-400 hover:to-blue-500"
      >
        <Plus className="w-3.5 h-3.5" /> Add Project
      </button>
    </div>
  ), [busy]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Project Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Add, edit and delete projects</p>
        </div>
        {headerRight}
      </div>

      {error && (
        <div className="mt-5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-xs">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">No projects found</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[820px] grid gap-4">
              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr] gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                <div>Project</div>
                <div className="text-right">Timeline</div>
                <div className="text-right">Progress</div>
                <div className="text-right">Actions</div>
              </div>

              {projects.map((p) => {
                const percent = p.totalTasks ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
                return (
                  <div
                    key={p.id}
                    className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.name
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((s) => s[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-white truncate">{p.name}</h3>
                        <p className="text-xs text-slate-400 truncate">Created by {p.creator}</p>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      {p.hasEndDate ? (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold">
                          Ends {p.endDate}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
                          No end date
                        </span>
                      )}
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      <div className="font-bold text-slate-200">{p.completedTasks}/{p.totalTasks || 0} ({percent}%)</div>
                      <div className="mt-2 h-2.5 w-40 ml-auto rounded-full overflow-hidden bg-[#0D1631]">
                        <div
                          className="h-full bg-cyan-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        disabled={busy === 'edit' || busy === 'delete'}
                        className="p-2 rounded-lg border border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-800/60 hover:text-white transition text-xs"
                        title="Edit project"
                      >
                        <PencilLine className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        disabled={busy === 'delete'}
                        className="p-2 rounded-lg border border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-800/60 hover:text-red-200 transition text-xs"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0A1128] border-l border-slate-700 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">Add Project</p>
                <p className="text-xs text-slate-400">Create a new project</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Project Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                  placeholder="e.g., Om Associates"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Color (CSS color)</label>
                <input
                  value={form.color || ''}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                  placeholder="#0ea5e9"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Has End Date</label>
                <select
                  value={String(!!form.hasEndDate)}
                  onChange={(e) => setForm((p) => ({ ...p, hasEndDate: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {form.hasEndDate && (
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">End Date</label>
                  <input
                    type="date"
                    value={form.endDate || ''}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-800/50 flex items-center gap-2">
              <button
                onClick={() => setIsAddOpen(false)}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={busy === 'add'}
                className="flex-[1.2] px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy === 'add' ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editForm && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => {
              setIsEditOpen(false);
              setEditForm(null);
            }}
          />
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0A1128] border-l border-slate-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">Edit Project</p>
                <p className="text-xs text-slate-400">Update project details</p>
              </div>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditForm(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Project Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => (p ? { ...p, name: e.target.value } : p))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Color (CSS color)</label>
                <input
                  value={editForm.color}
                  onChange={(e) => setEditForm((p) => (p ? { ...p, color: e.target.value } : p))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Has End Date</label>
                <select
                  value={String(!!editForm.hasEndDate)}
                  onChange={(e) => {
                    const next = e.target.value === 'true';
                    setEditForm((p) => (p ? { ...p, hasEndDate: next, endDate: next ? p.endDate : '' } : p));
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {editForm.hasEndDate && (
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate || ''}
                    onChange={(e) => setEditForm((p) => (p ? { ...p, endDate: e.target.value } : p))}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-800/50 flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditForm(null);
                }}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={busy === 'edit'}
                className="flex-[1.2] px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy === 'edit' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative w-full max-w-md bg-[#0A1128] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-red-300">Delete Project</p>
                  <p className="text-xs text-slate-400 mt-1">This action cannot be undone</p>
                </div>
                <button
                  onClick={() => setDeleteId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="text-xs text-slate-300">
                Are you sure you want to delete this project?
                <div className="mt-2 text-[10px] text-amber-300/90">
                  If any task references it, deletion will be blocked.
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800/50 flex items-center gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={busy === 'delete'}
                className="flex-[1.2] px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-400 hover:to-rose-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy === 'delete' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

