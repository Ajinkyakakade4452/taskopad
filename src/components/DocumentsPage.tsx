import { useState } from 'react';
import { FileText, Folder, Plus, Search, Calendar, ExternalLink, Trash2, MoreHorizontal } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'ppt' | 'folder';
  project: string;
  date: string;
  size: string;
}

interface DocumentsPageProps {
  theme: 'dark' | 'light';
  tasks: any[];
}

export default function DocumentsPage({ theme, tasks }: DocumentsPageProps) {
  // Extract unique project names from tasks to use as folders
  const uniqueProjects = Array.from(new Set(tasks.map(t => t.project).filter(Boolean) as string[]));

  const [documents, setDocuments] = useState<Document[]>([
    ...uniqueProjects.map((project, i) => ({
      id: `folder-${i}`,
      name: project,
      type: 'folder' as const,
      project,
      date: new Date(Date.now() - i * 86400000).toLocaleDateString('en-IN'),
      size: `${Math.floor(Math.random() * 100)} files`
    })),
    {
      id: 'doc-1',
      name: 'Om Associates Design Mockups.pdf',
      type: 'pdf',
      project: 'Om Associates',
      date: '2 Jul 2026',
      size: '4.5 MB'
    },
    {
      id: 'doc-2',
      name: 'YouGo Content Strategy.xlsx',
      type: 'xls',
      project: 'YouGo',
      date: '1 Jul 2026',
      size: '2.1 MB'
    },
    {
      id: 'doc-3',
      name: 'Net Access SLA Draft.docx',
      type: 'doc',
      project: 'Net Access Internet',
      date: '30 Jun 2026',
      size: '1.2 MB'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconForType = (type: string) => {
    switch (type) {
      case 'folder': return Folder;
      case 'pdf': return FileText;
      default: return FileText;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'folder': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'pdf': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'xls': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'doc': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Documents</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage your project documents and files</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition focus:ring-2 focus:ring-cyan-400 ${
                theme === 'dark'
                  ? 'bg-[#0D1631] border-slate-700 text-slate-100 placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
              }`}
            />
          </div>
          <button className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-md shadow-cyan-500/10 flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => {
          const Icon = getIconForType(doc.type);
          const colorClass = getColorForType(doc.type);
          
          return (
            <div
              key={doc.id}
              className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm group ${
                theme === 'dark'
                  ? 'bg-[#141C38] border-slate-800 text-slate-200 hover:border-slate-700'
                  : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <button className="p-1.5 rounded-lg hover:bg-slate-800/20 text-slate-400 hover:text-slate-200 transition opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-bold truncate">{doc.name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Folder className="w-3 h-3" />
                    {doc.project}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {doc.date}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">{doc.size}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/10 flex items-center gap-2">
                <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition flex items-center justify-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  Open
                </button>
                <button className="p-1.5 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="py-12 text-center text-xs text-slate-500">
          No documents found
        </div>
      )}
    </div>
  );
}
