import { useEffect, useState } from 'react';

import { User, Bell, Palette, Shield, Database, HelpCircle, Save, CheckCircle2 } from 'lucide-react';

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
}

interface SettingsPageProps {
  theme: 'dark' | 'light';
  user?: LoggedInUser;
  onThemeToggle: () => void;
  onUserUpdated?: (user: { id: string; name: string; email: string }) => void;
}

export default function SettingsPage({ theme, user, onThemeToggle, onUserUpdated }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'security' | 'backup' | 'help'>('profile');
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    notifications: {
      email: true,
      push: true,
      desktop: false,
    },
    language: 'English',
    timezone: 'Asia/Kolkata',
  });

  useEffect(() => {
    if (!user) return;
    setSettings((prev: any) => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
    }));
  }, [user?.id]);

  const handleSave = async () => {
    const API_BASE = '/api/auth';
    setSaved(false);
      try {
      if (!user) return;

      const updatedUser = {
        id: user.id,
        name: settings.name,
        email: settings.email,
      };
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          email: settings.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to save profile');
      }

      if (onUserUpdated) onUserUpdated(updatedUser);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Keep UI simple; existing pages don't have global toast
      setSaved(false);
      alert('Failed to update profile');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage your account and app preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-md shadow-cyan-500/10 flex items-center gap-1.5 cursor-pointer"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className={`p-4 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className={`p-6 rounded-2xl border space-y-6 ${
              theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <h3 className="text-lg font-bold">Profile Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Full Name</label>
                  
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e: any) =>
                      setSettings({ ...settings, name: (e.target as HTMLInputElement).value })}
                    className={`w-full px-4 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-cyan-400 ${
                      theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e: any) =>
                      setSettings({ ...settings, email: (e.target as HTMLInputElement).value })}
                    className={`w-full px-4 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-cyan-400 ${
                      theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className={`p-6 rounded-2xl border space-y-6 ${
              theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <h3 className="text-lg font-bold">Appearance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${
                  theme === 'dark' ? 'bg-[#0D1631] border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className="text-xs text-slate-400 block mb-3">Theme</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onThemeToggle()}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950'
                          : 'border border-slate-200 text-slate-700'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => onThemeToggle()}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        theme === 'light'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950'
                          : 'border border-slate-700 text-slate-300'
                      }`}
                    >
                      Light
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={`p-6 rounded-2xl border space-y-6 ${
              theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <h3 className="text-lg font-bold">Notification Settings</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications' },
                  { key: 'push', label: 'Push Notifications' },
                  { key: 'desktop', label: 'Desktop Notifications' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/20">
                    <span className="text-sm">{item.label}</span>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [item.key]: !settings.notifications[item.key as keyof typeof settings.notifications]
                        }
                      })}
                      className={`w-12 h-6 rounded-full transition ${
                        settings.notifications[item.key as keyof typeof settings.notifications]
                          ? 'bg-cyan-500'
                          : 'bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        settings.notifications[item.key as keyof typeof settings.notifications]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'security' || activeTab === 'backup' || activeTab === 'help') && (
            <div className={`p-6 rounded-2xl border ${
              theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="py-8 text-center text-xs text-slate-500">
                Settings for {tabs.find(t => t.id === activeTab)?.label} coming soon!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
