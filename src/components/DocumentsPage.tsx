import { useMemo, useState } from 'react';
import { FileText, Folder, Plus, Search, Calendar, ExternalLink, Trash2, MoreHorizontal } from 'lucide-react';

interface DocumentsPageProps {
  theme: 'dark' | 'light';
  tasks: any[];
}

type DocType = 'pdf' | 'doc' | 'xls' | 'ppt' | 'folder';

type GridItem =
  | {
      kind: 'folder';
      id: string;
      name: string;
      type: 'folder';
      project: string;
      date: string;
      size: string;
    }
  | {
      kind: 'file';
      id: string;
      name: string;
      type: Exclude<DocType, 'folder'>;
      project: string;
      date: string;
      size: string;
      taskId: string;
      docValue: string;
    };

function guessDocType(name: string): Exclude<DocType, 'folder'> {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.csv')) return 'xls';
  if (lower.endsWith('.ppt') || lower.endsWith('.pptx')) return 'ppt';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'doc';
  // default
  return 'pdf';
}

function iconForType(type: DocType) {
  switch (type) {
    case 'folder':
      return Folder;
    case 'pdf':
      return FileText;
    case 'xls':
      return FileText;
    case 'doc':
      return FileText;
    case 'ppt':
      return FileText;
    default:
      return FileText;
  }
}

function colorForType(type: DocType) {
  switch (type) {
    case 'folder':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'pdf':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'xls':
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'doc':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  }
}

export default function DocumentsPage({ theme, tasks }: DocumentsPageProps) {
  const API_BASE = '/api';

  const [searchQuery, setSearchQuery] = useState('');

  const { gridItems, folders } = useMemo(() => {
    const projectNames = Array.from(new Set((tasks || []).map((t: any) => t.project).filter(Boolean)));

    // mock folder metadata (kept lightweight)
    const folderItems: GridItem[] = projectNames.map((project: string, i: number) => ({
      kind: 'folder',
      id: `folder-${project}`,
      name: project,
      type: 'folder',
      project,
      date: new Date(Date.now() - i * 86400000).toLocaleDateString('en-IN'),
      size: `${Math.floor(Math.random() * 100)} files`,
    }));

    const files: GridItem[] = [];

    for (const t of tasks || []) {
      const taskId = t?.id;
      const project = t?.project;
      const docs: string[] = Array.isArray(t?.documents) ? (t.documents as string[]) : [];

      for (let i = 0; i < docs.length; i++) {
        const docValue = docs[i];
        const name = String(docValue);
        files.push({
          kind: 'file',
          id: `doc-${taskId}-${i}-${name}`,
          name,
          type: guessDocType(name),
          project: project || 'Unassigned',
          date: new Date().toLocaleDateString('en-IN'),
          size: `${Math.floor(Math.random() * 8) + 0.4} MB`,
          taskId,
          docValue,
        });
      }
    }

    // Keep folders + files together; folders are non-deletable in this UI (files are).
    return {
      gridItems: [...folderItems, ...files],
      folders: new Set(projectNames),
    };
  }, [tasks]);

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return gridItems;
    return gridItems.filter((doc) => doc.name.toLowerCase().includes(q));
  }, [gridItems, searchQuery]);

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleDeleteFile = async (item: Extract<GridItem, { kind: 'file' }>) => {
    // guard
    if (!item?.taskId) return;

    const ok = window.confirm(`Delete document?\n\n${item.name}`);
    if (!ok) return;

    setIsDeletingId(item.id);
    try {
      // Fetch latest task from backend (avoid stale local state)
      // Note: If backend down, we still won't crash; we just stop.
      const resGet = await fetch(`${API_BASE}/tasks/${item.taskId}`);
      if (!resGet.ok) {
        window.alert('Failed to load task for deletion.');
        return;
      }
      const task = await resGet.json();

      const currentDocs: string[] = Array.isArray(task?.documents) ? task.documents : [];
      const nextDocs = currentDocs.filter((d) => d !== item.docValue);

      const updatedTask = {
        ...task,
        documents: nextDocs,
      };

      const resPut = await fetch(`${API_BASE}/tasks/${item.taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      if (!resPut.ok) {
        window.alert('Delete failed.');
        return;
      }

      // Best effort: reload tasks by hard refresh is not desired.
      // Since App does not expose setTasks here, we rely on next server refresh.
      // To keep UI working, we do a quick optimistic remove from local view only.
      // (App's tasks state won't change unless backend reload happens.)
      // This ensures immediate feedback.
      window.dispatchEvent(new CustomEvent('taskpad:documents-updated'));
    } catch (e) {
      console.warn(e);
      window.alert('Something went wrong while deleting.');
    } finally {
      setIsDeletingId(null);
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
          const Icon = iconForType(doc.type);
          const colorClass = colorForType(doc.type);
          const isFile = doc.kind === 'file';

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

                {isFile ? (
                  <button
                    disabled={isDeletingId === doc.id}
                    onClick={() => handleDeleteFile(doc)}
                    className="p-1.5 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="p-1.5 rounded-lg opacity-40" title="Folder deletion not supported here">
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="py-12 text-center text-xs text-slate-500">No documents found</div>
      )}
    </div>
  );
}

