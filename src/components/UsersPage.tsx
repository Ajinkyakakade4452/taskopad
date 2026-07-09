import React, { useEffect, useState } from 'react';
import { Loader2, Shield } from 'lucide-react';

// Read-only Users page (no add/edit/delete UI)


interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
  avatarColor: string;
}

const API_BASE = '/api/auth';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([] as User[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">User Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Read-only: view users who can access the system</p>
        </div>
        <div className="text-xs text-slate-400">No add/edit/delete actions</div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading users...
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-md"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{user.name}</h3>
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500">{user.role}</div>
              </div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="py-10 text-center text-xs text-slate-500">No users found</div>
        )}
      </div>
    </div>
  );
}

