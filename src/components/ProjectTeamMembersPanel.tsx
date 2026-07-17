import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2, X } from 'lucide-react';

type User = { /* typed */
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
  avatarColor: string;
};

type ProjectMember = {
  userId: string;
};

type Project = {
  id: string;
  name: string;
};

const PROJECT_API = '/api/projects';
const AUTH_API = '/api/auth';

export default function ProjectTeamMembersPanel({ project }: { project: Project }) {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const fetchUsers = async () => {
    const res = await fetch(`${AUTH_API}/users`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  const fetchMembers = async () => {
    const res = await fetch(`${PROJECT_API}/${project.id}/members`);
    const data: unknown = await res.json();
    if (Array.isArray(data)) {
      const next: ProjectMember[] = (data as any[])
        .map((x: { userId: unknown }) => ({ userId: String(x.userId) }));
      setMembers(next);
    } else {
      setMembers([]);
    }
  };


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchUsers();
        await fetchMembers();
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load team members');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const memberSet = useMemo(() => new Set(members.map((m) => m.userId)), [members]);

  const availableUsers = useMemo(() => users.filter((u) => !memberSet.has(u.id)), [users, memberSet]);

  const onAdd = async () => {
    if (selectedUserIds.length === 0) return;
    setBusy('add');
    setError(null);
    try {
      const res = await fetch(`${PROJECT_API}/${project.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to add members');
      }
      setIsAddOpen(false);
      setSelectedUserIds([]);
      await fetchMembers();
    } catch (e: any) {
      setError(e?.message || 'Failed to add members');
    } finally {
      setBusy(null);
    }
  };

  const onRemove = async (userId: string) => {
    setBusy('remove');
    setError(null);
    try {
      const res = await fetch(`${PROJECT_API}/${project.id}/members/${userId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to remove member');
      }
      await fetchMembers();
    } catch (e: any) {
      setError(e?.message || 'Failed to remove member');
    } finally {
      setBusy(null);
    }
  };

  const memberUsers = useMemo(() => {
    const byId = new Map(users.map((u) => [u.id, u]));
    return members
      .map((m) => byId.get(m.userId))
      .filter(Boolean)
      .map((u) => u as User);
  }, [members, users]);

  return (
    <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Team Members</div>
          <div className="text-sm font-bold text-white mt-1">{memberUsers.length} members</div>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          disabled={busy === 'add' || availableUsers.length === 0}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-800/60 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {memberUsers.length === 0 ? (
            <div className="text-xs text-slate-500">No members added yet</div>
          ) : (
            memberUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/50 bg-slate-900/50 px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: u.avatarColor }}>
                    {u.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(u.id)}
                  disabled={busy === 'remove'}
                  className="p-2 rounded-lg border border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-800/60 hover:text-red-200 transition text-xs disabled:opacity-50"
                  title="Remove member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {error && <div className="mt-3 text-xs text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}

      {isAddOpen && (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0A1128] border-l border-slate-700 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">Add Team Members</p>
                <p className="text-xs text-slate-400">Select users to add</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
              {availableUsers.length === 0 ? (
                <div className="text-xs text-slate-500">No available users to add</div>
              ) : (
                availableUsers.map((u) => {
                  const checked = selectedUserIds.includes(u.id);
                  return (
                    <label key={u.id} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 cursor-pointer transition ${checked ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-slate-800/50 bg-slate-900/40 hover:border-slate-700/70'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: u.avatarColor }}>
                          {u.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...selectedUserIds, u.id]
                            : selectedUserIds.filter((id) => id !== u.id);
                          setSelectedUserIds(next);
                        }}
                      />
                    </label>
                  );
                })
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-800/50 flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setSelectedUserIds([]);
                }}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={onAdd}
                disabled={busy === 'add' || selectedUserIds.length === 0}
                className="flex-[1.2] px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy === 'add' ? 'Adding...' : `Add (${selectedUserIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

