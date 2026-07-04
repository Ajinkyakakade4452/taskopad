import { useState } from 'react';
import { Users, Building2, Plus, Search, MoreHorizontal } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  head: string;
  memberCount: number;
  color: string;
}

interface DepartmentsPageProps {
  theme: 'dark' | 'light';
  users: any[];
}

export default function DepartmentsPage({ theme, users }: DepartmentsPageProps) {
  const [departments, setDepartments] = useState<Department[]>([
    { id: 'd1', name: 'Development', head: 'Krishna Lokhande', memberCount: 5, color: 'cyan' },
    { id: 'd2', name: 'Design', head: 'Alister Manikam', memberCount: 3, color: 'purple' },
    { id: 'd3', name: 'Marketing', head: 'Kriti Khandelwal', memberCount: 4, color: 'pink' },
    { id: 'd4', name: 'Operations', head: 'Aditya Kirat Karve', memberCount: 2, color: 'emerald' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', head: '', memberCount: 1 });

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClass = (color: string) => {
    switch (color) {
      case 'cyan': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'purple': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'pink': return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      case 'emerald': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Departments</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage company departments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition focus:ring-2 focus:ring-cyan-400 ${
                theme === 'dark'
                  ? 'bg-[#0D1631] border-slate-700 text-slate-100 placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
              }`}
            />
          </div>
          <button
            onClick={() => setShowAddDept(!showAddDept)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-md shadow-cyan-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Add Department Form */}
      {showAddDept && (
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Department Name</label>
              <input
                type="text"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Department Head</label>
              <select
                value={newDept.head}
                onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
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
              <label className="text-xs text-slate-400">Initial Member Count</label>
              <input
                type="number"
                value={newDept.memberCount}
                onChange={(e) => setNewDept({ ...newDept, memberCount: parseInt(e.target.value) || 1 })}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
                min="1"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAddDept(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (newDept.name) {
                  setDepartments([
                    ...departments,
                    {
                      id: `d${Date.now()}`,
                      ...newDept,
                      color: 'cyan'
                    }
                  ]);
                  setShowAddDept(false);
                  setNewDept({ name: '', head: '', memberCount: 1 });
                }
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDepts.map(dept => (
          <div
            key={dept.id}
            className={`p-5 rounded-2xl border transition-all duration-300 group ${
              theme === 'dark'
                ? 'bg-[#141C38] border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl border ${getColorClass(dept.color)}`}>
                <Building2 className="w-6 h-6" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-slate-800/20 text-slate-400 hover:text-slate-200 transition opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold mb-1">{dept.name}</h3>
            <p className="text-xs text-slate-400 mb-4">Head: {dept.head}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Users className="w-4 h-4" />
              <span>{dept.memberCount} Members</span>
            </div>
          </div>
        ))}
      </div>

      {filteredDepts.length === 0 && (
        <div className="py-12 text-center text-xs text-slate-500">No departments found</div>
      )}
    </div>
  );
}
