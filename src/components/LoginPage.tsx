import { useState } from 'react';
import { Eye, EyeOff, LayoutDashboard, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface LoginUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
  avatarColor: string;
  token: string;
}

interface LoginPageProps {
  onLogin: (user: LoginUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
      } else {
        onLogin(data as LoginUser);
      }
    } catch {
      setError('Cannot connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#070F23] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/30 mb-4">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Edigital TaskPad</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Enterprise Task Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@edigitalknowledge.com"
                required
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Workspace'
              )}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-6 pt-5 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center font-semibold uppercase tracking-wider mb-3">
              Quick Access
            </p>
            <div className="flex flex-col gap-2">
              {/* Admin quick fill */}
              <button
                id="quick-admin-login"
                type="button"
                onClick={() => quickFill('admin@edigitalknowledge.com', 'admin@123')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition">
                    Admin Access
                  </p>
                  <p className="text-[10px] text-slate-500">admin@edigitalknowledge.com</p>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 uppercase tracking-wider">
                  Full Access
                </span>
              </button>

              {/* User 1 quick fill */}
              <button
                id="quick-user1-login"
                type="button"
                onClick={() => quickFill('krishna@edigitalknowledge.com', 'user@123')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/15 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0 text-xs font-bold text-white">
                  KL
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-violet-400 group-hover:text-violet-300 transition">
                    Krishna Lokhande
                  </p>
                  <p className="text-[10px] text-slate-500">krishna@edigitalknowledge.com</p>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-500/20 text-violet-400 uppercase tracking-wider">
                  User
                </span>
              </button>

              {/* User 2 quick fill */}
              <button
                id="quick-user2-login"
                type="button"
                onClick={() => quickFill('alister@edigitalknowledge.com', 'user@123')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center shadow-md flex-shrink-0 text-xs font-bold text-white">
                  AM
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition">
                    Alister Manikam
                  </p>
                  <p className="text-[10px] text-slate-500">alister@edigitalknowledge.com</p>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 uppercase tracking-wider">
                  User
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          © 2026 Edigital Knowledge · v4.1.2 SaaS-Live ·{' '}
          <span className="text-emerald-600">● Secured Network</span>
        </p>
      </div>
    </div>
  );
}
