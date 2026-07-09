import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Shield, Plus, Trash2, PencilLine, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
  avatarColor: string;
}

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
  avatarColor: string;
  token: string;
}

interface UsersPageProps {
  user: LoggedInUser;
}

const API_BASE = '/api/auth';

type PartialUserCreate = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  avatarColor?: string;
};

type PartialUserUpdate = {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  avatarColor?: string;
};

function genInitials(name: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || '';
  const b = parts[1]?.[0] || '';
  return (a + b).toUpperCase();
}

function randomAvatarColor() {
  const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function UsersPage({ user }: UsersPageProps) {
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // action identifier

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<PartialUserCreate>({

    name: '',
    email: '',
    password: '',
    role: 'user',
    avatarColor: '',
  });

  const [editForm, setEditForm] = useState<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatarColor: string;
    password: string; // optional; empty means no change
  } | null>(null);

  const adminsCount = useMemo(() => users.filter((u) => u.role === 'admin').length, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAddForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'user',
      avatarColor: '',
    });
  };

  const openAdd = () => {
    if (!isAdmin) return;
    resetAddForm();
    setIsAddOpen(true);
  };

  const openEdit = (u: User) => {
    if (!isAdmin) return;
    setEditForm({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarColor: u.avatarColor,
      password: '',
    });
    setIsEditOpen(true);
  };

  const handleAdd = async () => {
    if (!isAdmin) return;
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;
    const role = form.role;

    if (!name || !email || !password || !role) {
      setError('Name, Email, Password, Role are required');
      return;
    }

    setBusy('add');
    setError(null);
    try {
      const payload: any = {
        name,
        email,
        password,
        role,
        avatarColor: (form.avatarColor || '').trim() || randomAvatarColor(),
      };

      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to add user');
      }

      await fetchUsers();
      setIsAddOpen(false);
      resetAddForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to add user');
    } finally {
      setBusy(null);
    }
  };

  const handleEdit = async () => {
    if (!isAdmin || !editForm) return;

    const payload: PartialUserUpdate = {
      name: editForm.name.trim() || editForm.name,
      email: editForm.email.trim() || editForm.email,
      role: editForm.role,
      avatarColor: editForm.avatarColor?.trim() || randomAvatarColor(),
    };

    if (editForm.password.trim()) payload.password = editForm.password;

    setBusy('edit');
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to update user');
      }

      await fetchUsers();
      setIsEditOpen(false);
      setEditForm(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update user');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !deleteId) return;
    setBusy('delete');
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/users/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to delete user');
      }

      await fetchUsers();
      setDeleteId(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to delete user');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">User Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin ? 'Admin: add/edit/delete users' : 'Read-only: view users who can access the system'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-xs text-slate-400">Admins: {adminsCount}</div>
            <div className="text-xs text-slate-500">Total: {users.length}</div>
          </div>

          <button
            onClick={openAdd}
            disabled={!isAdmin}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              isAdmin
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400/30 hover:from-cyan-400 hover:to-blue-500'
                : 'bg-slate-800/30 text-slate-500 border-slate-700/50 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add User
          </button>
        </div>
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
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px] grid gap-4">
              <div className="grid grid-cols-[1.5fr_0.8fr_0.6fr_0.6fr] gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                <div>User</div>
                <div>Role</div>
                <div className="text-right">Actions</div>
                <div className="text-right"> </div>
              </div>

              {users.map((u) => {
                const isOnlyAdmin = u.role === 'admin' && adminsCount <= 1;

                return (
                  <div
                    key={u.id}
                    className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white truncate">{u.name}</h3>
                          {u.role === 'admin' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 capitalize">{u.role}</div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        disabled={!isAdmin}
                        className={`p-2 rounded-lg border transition text-xs ${
                          isAdmin
                            ? 'bg-slate-800/30 border-slate-700/50 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'bg-slate-800/20 border-slate-700/50 text-slate-600 cursor-not-allowed'
                        }`}
                        title="Edit user"
                      >
                        <PencilLine className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteId(u.id)}
                        disabled={!isAdmin || isOnlyAdmin}
                        className={`p-2 rounded-lg border transition text-xs ${
                          !isAdmin
                            ? 'bg-slate-800/20 border-slate-700/50 text-slate-600 cursor-not-allowed'
                            : isOnlyAdmin
                              ? 'bg-slate-800/20 border-slate-700/50 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800/30 border-slate-700/50 text-slate-300 hover:bg-slate-800/60 hover:text-red-200'
                        }`}
                        title={isOnlyAdmin ? 'Cannot delete the only admin' : 'Delete user'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-0" />
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
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">Add User</p>
                <p className="text-xs text-slate-400">Create a new account</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                  placeholder="Full name"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Initials (auto)</label>
                  <div className="px-3 py-2 rounded-xl text-xs border border-slate-700/50 bg-slate-800/30 text-slate-200">
                    {genInitials(form.name) || '—'}
                  </div>
                </div>
                <div className="w-20">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Preview</label>
                  <div className="mt-1 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-md" style={{ backgroundColor: form.avatarColor?.trim() || randomAvatarColor() }}>
                    {genInitials(form.name) || '??'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Password</label>
                <input
                  value={form.password}
                  type="password"
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                  placeholder="Set password"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                >
                  <option value="admin">admin</option>
                  <option value="user">user</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Avatar Color (optional)</label>
                <input
                  value={form.avatarColor || ''}
                  onChange={(e) => setForm((p) => ({ ...p, avatarColor: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                  placeholder="#0ea5e9"
                />
              </div>
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
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => { setIsEditOpen(false); setEditForm(null); }} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0A1128] border-l border-slate-700 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">Edit User</p>
                <p className="text-xs text-slate-400">Update account details</p>
              </div>
              <button onClick={() => { setIsEditOpen(false); setEditForm(null); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => (p ? { ...p, name: e.target.value } : p))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Email</label>
                <input
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => (p ? { ...p, email: e.target.value } : p))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((p) => (p ? { ...p, role: e.target.value as any } : p))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                >
                  <option value="admin">admin</option>
                  <option value="user">user</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Password (optional)</label>
                <input
                  value={editForm.password}
                  type="password"
                  onChange={(e) => setEditForm((p) => (p ? { ...p, password: e.target.value } : p))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                  placeholder="Leave empty to keep"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Avatar Color</label>
                <input
                  value={editForm.avatarColor}
                  onChange={(e) => setEditForm((p) => (p ? { ...p, avatarColor: e.target.value } : p))}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-800/50 flex items-center gap-2">
              <button
                onClick={() => { setIsEditOpen(false); setEditForm(null); }}
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
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-md bg-[#0A1128] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-red-300">Delete User</p>
                  <p className="text-xs text-slate-400 mt-1">This action cannot be undone</p>
                </div>
                <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="text-xs text-slate-300">
                Are you sure you want to delete this user?
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

