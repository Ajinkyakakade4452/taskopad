import { useState } from 'react';
import { Menu, Bell, Sun, Moon, LogOut, User, ShieldAlert, BadgeInfo, CheckCircle, Settings, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onMobileMenuToggle: () => void;
  userEmail?: string;
  userName?: string;
  userInitials?: string;
  userAvatarColor?: string;
  onLogout?: () => void;
}

export default function Header({ theme, onThemeToggle, onMobileMenuToggle, userEmail, userName, userInitials, userAvatarColor, onLogout }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName = userName || 'Krishna Lokhande';
  const displayInitials = userInitials || 'KL';
  const displayColor = userAvatarColor || '#0ea5e9';

  const mockAlerts = [
    { id: 1, type: 'alert', text: 'Task "Graphic Designing Batch" is due in 10 minutes!', time: 'Just now', icon: ShieldAlert, iconColor: 'text-amber-500' },
    { id: 2, type: 'info', text: 'Team member Kriti completed a task: "Daily 5 Engagable Story Idea"', time: '1 hour ago', icon: CheckCircle, iconColor: 'text-emerald-500' },
    { id: 3, type: 'update', text: 'System update v4.1.2 is now live with enhanced security.', time: '4 hours ago', icon: BadgeInfo, iconColor: 'text-cyan-500' },
  ];

  return (
    <header
      id="top-header"
      className={`relative z-30 flex items-center justify-between px-6 py-4.5 border-b transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#0D1631]/50 backdrop-blur-sm border-slate-800 text-white'
          : 'bg-white border-slate-100 text-slate-800'
      }`}
    >
      {/* Left side: Hamburger + Alert */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-400 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Expires on 5 Jul 2026 – <strong className="font-bold">3 days left</strong></span>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-3.5">
        {/* Mobile Expiry Badge */}
        <div className="sm:hidden flex items-center px-2 py-1 rounded-full bg-amber-500/10 text-[9px] font-semibold text-amber-400">
          <span>5 Jul (3d left)</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
            theme === 'dark'
              ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-700/60 text-yellow-400'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-indigo-600'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`relative p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-700/60 text-slate-300'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full ring-2 ring-[#0D1631]">
              99+
            </span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div
                className={`absolute right-0 mt-3.5 w-80 rounded-2xl shadow-2xl border z-50 p-4 transform origin-top-right transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-[#141C38] border-slate-800 text-white'
                    : 'bg-white border-slate-150 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/10 pb-2.5 mb-2.5">
                  <h4 className="font-bold text-xs tracking-tight">System Notifications</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-bold font-mono">
                    3 New
                  </span>
                </div>
                <div className="space-y-3">
                  {mockAlerts.map((alert) => {
                    const AlertIcon = alert.icon;
                    return (
                      <div
                        key={alert.id}
                        className={`p-2.5 rounded-xl flex gap-3 text-xs transition ${
                          theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <AlertIcon className={`w-5 h-5 flex-shrink-0 ${alert.iconColor}`} />
                        <div>
                          <p className="font-medium leading-normal">{alert.text}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className={`w-full mt-3 py-2 text-center text-[11px] font-semibold rounded-xl border hover:opacity-90 transition ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-[#0D1631] text-cyan-400'
                      : 'border-slate-200 bg-slate-50 text-cyan-500'
                  }`}
                >
                  Mark all as read
                </button>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className={`h-6 w-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 text-left hover:opacity-90 transition cursor-pointer"
          >
            <div
              className="w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shadow-md"
              style={{ backgroundColor: displayColor }}
            >
              {displayInitials}
            </div>
            <div className="hidden md:block select-none">
              <p className="text-xs font-bold leading-none">{displayName}</p>
              <p className="text-[9px] text-slate-400 font-mono mt-1">{userEmail || ''}</p>
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div
                className={`absolute right-0 mt-3.5 w-64 rounded-2xl shadow-2xl border z-50 p-4 transform origin-top-right transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-[#141C38] border-slate-800 text-white'
                    : 'bg-white border-slate-150 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-800/10">
                  <div
                    className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: displayColor }}
                  >
                    {displayInitials}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">{displayName}</h5>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                      <span className="text-[9px] text-amber-400 font-semibold">Administrator</span>
                    </div>
                    {userEmail && <p className="text-[9px] text-cyan-400 truncate mt-0.5 max-w-[160px]">{userEmail}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition ${
                      theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition ${
                      theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Workspace Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout?.();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 text-rose-500 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Session</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
