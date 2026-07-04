import { Sparkles, CheckCircle2, Calendar } from 'lucide-react';

interface Update {
  version: string;
  date: string;
  title: string;
  changes: string[];
  type: 'feature' | 'fix' | 'improvement';
}

interface WhatsNewPageProps {
  theme: 'dark' | 'light';
}

export default function WhatsNewPage({ theme }: WhatsNewPageProps) {
  const updates: Update[] = [
    {
      version: 'v1.2.0',
      date: '4 Jul 2026',
      title: 'Real Dashboard & Reports',
      type: 'feature',
      changes: [
        'Real-time stats and charts',
        'Updated reports page',
        'Better user performance tracking',
        'New priority breakdown'
      ]
    },
    {
      version: 'v1.1.0',
      date: '1 Jul 2026',
      title: 'User Management & Teams',
      type: 'feature',
      changes: [
        'Admin-only user management',
        'Team assignment sync with real users',
        'Documents page with project folders'
      ]
    },
    {
      version: 'v1.0.0',
      date: '20 Jun 2026',
      title: 'Initial Launch',
      type: 'feature',
      changes: [
        'Full task management system',
        'Project tracking',
        'Discussion threads',
        'Notes and timesheets'
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'fix': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'improvement': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            What's New
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Latest features and updates</p>
        </div>
      </div>

      {/* Updates Timeline */}
      <div className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.version}
            className={`p-6 rounded-2xl border ${
              theme === 'dark' ? 'bg-[#141C38] border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-extrabold">{update.version}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(update.type)}`}>
                    {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{update.date}</span>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4">{update.title}</h3>
            <ul className="space-y-2">
              {update.changes.map(change => (
                <li key={change} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
