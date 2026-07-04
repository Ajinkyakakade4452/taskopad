import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  MessageSquare,
  FileText,
  Clock,
  StickyNote,
  BarChart3,
  Users,
  Network,
  Settings,
  Sparkles,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  theme: 'dark' | 'light';
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  onSelectItem?: (name: string) => void;
}

export default function Sidebar({ theme, isOpen, onClose, activeItem = 'Dashboard', onSelectItem }: SidebarProps) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Tasks', icon: CheckSquare, badge: '4' },
    { name: 'Projects', icon: FolderKanban },
    { name: 'Discussion', icon: MessageSquare, badge: 'New' },
    { name: 'Documents', icon: FileText },
    { name: 'Timesheet', icon: Clock },
    { name: 'Notes', icon: StickyNote },
    { name: 'Reports', icon: BarChart3 },
    { name: 'Users', icon: Users },
    { name: 'Departments', icon: Network },
    { name: 'Settings', icon: Settings },
    { name: "What's New", icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        id="sidebar"
        className={`fixed lg:static top-0 left-0 h-full w-64 z-50 transform lg:transform-none transition-all duration-300 ease-in-out flex flex-col justify-between border-r ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          theme === 'dark'
            ? 'bg-[#060D1F] border-slate-800 text-slate-200'
            : 'bg-white border-slate-150 text-slate-800'
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-slate-800/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/15">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block">Edigital TaskPad</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">SaaS Enterprise</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workspace Area */}
          <div className="px-4 py-3 border-b border-slate-800/10">
            <div className={`p-2.5 rounded-xl flex items-center justify-between transition ${
              theme === 'dark' ? 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50' : 'bg-slate-50 hover:bg-slate-100'
            }`}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  EK
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-semibold truncate">Edigital Knowledge</p>
                  <p className="text-[9px] text-slate-400 font-medium">Default Workspace</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </div>
          </div>

          {/* Menu Items */}
          <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)] select-none custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = item.name === activeItem;
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => onSelectItem?.(item.name)}
                  className={`w-full group px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium transition duration-200 ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-cyan-600/20 text-cyan-400 border-r-2 border-cyan-400 rounded-sm'
                        : 'bg-cyan-500 text-white shadow-md shadow-cyan-500/15'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition ${isActive ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in Sidebar */}
        <div className="p-4 border-t border-slate-800/10 text-[10px] text-slate-400 flex flex-col gap-1 select-none">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider">Secured Network</span>
          </div>
          <p className="font-medium mt-1">v4.1.2 SaaS-Live</p>
          <p>© 2026 Edigital Knowledge</p>
        </div>
      </aside>
    </>
  );
}
