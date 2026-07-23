import { useEffect, useState } from 'react';
import { User, Bell, Palette, Shield, Database, HelpCircle, Save, CheckCircle2 } from 'lucide-react';
import { getStoredPenaltyConfig, setStoredPenaltyConfig } from '../utils/penaltyUtils';

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

  // Admin-only: documents mandatory toggle
  const [documentsMandatory, setDocumentsMandatory] = useState<boolean>(false);
  const [docsMandatoryLoading, setDocsMandatoryLoading] = useState<boolean>(false);

  // Admin-only: penalty system settings
  const [penaltyEnabled, setPenaltyEnabled] = useState<boolean>(true);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(200);
  const [penaltyAmountInput, setPenaltyAmountInput] = useState<string>('200');
  const [penaltySaving, setPenaltySaving] = useState<boolean>(false);
  const [penaltySaved, setPenaltySaved] = useState<boolean>(false);

  useEffect(() => {
    // Only admins should see this; backend endpoint is lightweight.
    const role = (sessionStorage.getItem('taskpad_user')
      ? (JSON.parse(sessionStorage.getItem('taskpad_user') as string)?.role)
      : undefined) as 'admin' | 'user' | undefined;

    if (role !== 'admin') return;

    (async () => {
      try {
        const res = await fetch('/api/tasks/admin/documents-mandatory');
        if (!res.ok) return;
        const data = await res.json();
        setDocumentsMandatory(!!data?.mandatory);
      } catch {
        // ignore
      }
    })();

    // Load penalty settings (from localStorage first, then try API)
    const stored = getStoredPenaltyConfig();
    setPenaltyEnabled(stored.enabled);
    setPenaltyAmount(stored.amount);
    setPenaltyAmountInput(String(stored.amount));

    // Try to sync from backend too
    fetch('/api/tasks/admin/penalty-settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setPenaltyEnabled(typeof data.enabled === 'boolean' ? data.enabled : stored.enabled);
          const amt = typeof data.amount === 'number' ? data.amount : stored.amount;
          setPenaltyAmount(amt);
          setPenaltyAmountInput(String(amt));
        }
      })
      .catch(() => {});
  }, []);


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
              {(() => {
                const role = (sessionStorage.getItem('taskpad_user')
                  ? (JSON.parse(sessionStorage.getItem('taskpad_user') as string)?.role)
                  : undefined) as 'admin' | 'user' | undefined;

                const isAdmin = role === 'admin';

                if (isAdmin && activeTab === 'security') {
                  return (
                    <div className="space-y-5">
                      <h3 className="text-lg font-bold">Admin Controls</h3>

                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0D1631] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold">Documents mandatory on submit</p>
                            <p className="text-xs text-slate-400 mt-1">
                              If enabled, user cannot submit a task without attaching documents.
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              disabled={docsMandatoryLoading}
                              onClick={async () => {
                                const next = !documentsMandatory;
                                setDocsMandatoryLoading(true);
                                try {
                                  const res = await fetch('/api/tasks/admin/documents-mandatory', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ mandatory: next }),
                                  });
                                  if (!res.ok) return;
                                  setDocumentsMandatory(next);
                                } finally {
                                  setDocsMandatoryLoading(false);
                                }
                              }}
                              className={`w-14 h-7 rounded-full transition flex items-center px-1 ${
                                documentsMandatory ? 'bg-cyan-500' : 'bg-slate-700'
                              } opacity-90 disabled:opacity-50`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                                  documentsMandatory ? 'translate-x-7' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                            <p className="text-[10px] text-slate-400">{docsMandatoryLoading ? 'Saving...' : (documentsMandatory ? 'ON' : 'OFF')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Penalty System Settings */}
                      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0D1631] border-red-900/30' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <p className="text-sm font-bold text-red-400 flex items-center gap-2">
                              <span>⚠️</span> Penalty System
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Automatically apply a penalty (₹) when a user completes a task after its due date.
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                const next = !penaltyEnabled;
                                setPenaltyEnabled(next);
                                await setStoredPenaltyConfig({ enabled: next, amount: penaltyAmount });
                              }}
                              className={`w-14 h-7 rounded-full transition flex items-center px-1 ${
                                penaltyEnabled ? 'bg-red-600' : 'bg-slate-700'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                                  penaltyEnabled ? 'translate-x-7' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                            <p className="text-[10px] text-slate-400">{penaltyEnabled ? 'ENABLED' : 'DISABLED'}</p>
                          </div>
                        </div>

                        {penaltyEnabled && (
                          <div className="space-y-3">
                            <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                              <label className="text-xs text-slate-400 block mb-2 font-semibold uppercase tracking-wider">
                                Default Penalty Amount (₹)
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-red-400">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="50"
                                  value={penaltyAmountInput}
                                  onChange={(e) => {
                                    setPenaltyAmountInput(e.target.value);
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val) && val >= 0) setPenaltyAmount(val);
                                  }}
                                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold border outline-none focus:ring-2 focus:ring-red-500 ${
                                    theme === 'dark' ? 'bg-[#0D1631] border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                                  }`}
                                  placeholder="200"
                                />
                                <button
                                  type="button"
                                  disabled={penaltySaving}
                                  onClick={async () => {
                                    const val = parseFloat(penaltyAmountInput);
                                    const finalAmount = (!isNaN(val) && val >= 0) ? val : 200;
                                    setPenaltySaving(true);
                                    try {
                                      await setStoredPenaltyConfig({ enabled: penaltyEnabled, amount: finalAmount });
                                      setPenaltyAmount(finalAmount);
                                      setPenaltySaved(true);
                                      setTimeout(() => setPenaltySaved(false), 2000);
                                    } finally {
                                      setPenaltySaving(false);
                                    }
                                  }}
                                  className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                                    penaltySaved
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30'
                                  } disabled:opacity-50`}
                                >
                                  {penaltySaving ? 'Saving...' : penaltySaved ? '✓ Saved' : 'Save'}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-2">
                                Current penalty: <span className="text-red-400 font-bold">₹{penaltyAmount}</span> — applied when task is completed after due date.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Settings for {tabs.find(t => t.id === activeTab)?.label} coming soon!
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
