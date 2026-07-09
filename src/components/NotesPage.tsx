import { useEffect, useState } from 'react';

import { Plus, Search, Calendar, Trash2, Star, Loader2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  starred: boolean;
  color: 'yellow' | 'blue' | 'pink' | 'green';
}

interface NotesPageProps {
  theme: 'dark' | 'light';
}

const API_BASE = '/api';

export default function NotesPage({ theme }: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState<Omit<Note, 'id' | 'date'>>({
    title: '',
    content: '',
    starred: false,
    color: 'yellow'
  });

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ title: string; content: string } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/notes`);
      if (res.ok) {
        const data: Note[] = await res.json();
        setNotes(data.reverse());
      }
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
    setLoading(false);
    }
  };

  const filteredNotes = notes.filter((n) =>
    (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddNote = async () => {
    if (!newNote.title.trim()) return;

    const noteData = {
      title: newNote.title,
      content: newNote.content,
      date: new Date().toLocaleDateString('en-IN'),
      starred: newNote.starred,
      color: newNote.color
    };

    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });

      console.log('POST /api/notes status', res.status);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Save note failed response', text);
        throw new Error(`Save note failed: ${res.status} ${text}`);
      }

      const saved: Note = await res.json();
      setNotes((prev) => [saved, ...prev]);
      setShowAddNote(false);
      setNewNote({ title: '', content: '', starred: false, color: 'yellow' });

      await fetchNotes();
    } catch (err) {
      console.error('Failed to save note', err);
      alert('Failed to save note. Check console for details.');
    }
  };

  const handleToggleStar = async (note: Note) => {
    const updated: Note = { ...note, starred: !note.starred };

    try {
      const res = await fetch(`${API_BASE}/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      if (res.ok) {
        setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
      }
    } catch (err) {
      console.error('Failed to update note', err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Delete note failed: ${res.status} ${text}`);
      }

      setNotes((prev) => prev.filter((n) => n.id !== id));
      await fetchNotes();
    } catch (err) {
      console.error('Failed to delete note', err);
      alert('Failed to delete note. Check console for details.');
    }
  };

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditDraft({ title: note.title, content: note.content });
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditDraft(null);
  };

  const handleUpdateNote = async (id: string) => {
    if (!editDraft) return;

    setSavingEdit(true);
    try {
      const existing = notes.find((n) => n.id === id);

      const noteToUpdate: Note = {
        id,
        title: editDraft.title,
        content: editDraft.content,
        date: new Date().toLocaleDateString('en-IN'),
        starred: existing?.starred ?? false,
        color: existing?.color ?? 'yellow'
      };

      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteToUpdate)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Update note failed: ${res.status} ${text}`);
      }

      const saved: Note = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === id ? saved : n)));
      cancelEditingNote();
    } catch (err) {
      console.error('Failed to update note', err);
      alert('Failed to save changes. Check console for details.');
    } finally {
      setSavingEdit(false);
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border-yellow-400/30';
      case 'blue':
        return 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-400/30';
      case 'pink':
        return 'from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 border-pink-400/30';
      case 'green':
        return 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 border-green-400/30';
      default:
        return 'from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border-yellow-400/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Notes</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Quick notes and reminders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
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
            onClick={() => setShowAddNote(!showAddNote)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-md shadow-cyan-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <div
          className={`p-5 rounded-2xl border bg-gradient-to-br ${getColorClass(newNote.color)} ${
            theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <input
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full bg-transparent text-lg font-bold outline-none mb-3"
          />
          <textarea
            placeholder="Write your note here..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            rows={4}
            className="w-full bg-transparent text-sm outline-none resize-none"
          />
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Color:</span>
              {(['yellow', 'blue', 'pink', 'green'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => setNewNote({ ...newNote, color })}
                  className={`w-6 h-6 rounded-full border-2 ${
                    color === 'yellow'
                      ? 'bg-yellow-400'
                      : color === 'blue'
                        ? 'bg-blue-400'
                        : color === 'pink'
                          ? 'bg-pink-400'
                          : 'bg-green-400'
                  } ${newNote.color === color ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddNote(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border text-slate-400 hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading notes...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => {
              const isEditing = editingNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className={`p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] ${getColorClass(
                    note.color
                  )}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDraft?.title ?? ''}
                        onChange={(e) =>
                          setEditDraft((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                        }
                        className="w-full bg-transparent text-sm font-bold outline-none mr-2"
                        placeholder="Note title..."
                      />
                    ) : (
                      <h3 className="text-sm font-bold flex-1 mr-2">{note.title}</h3>
                    )}

                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleUpdateNote(note.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-100 disabled:opacity-60"
                            disabled={savingEdit}
                            title="Save"
                          >
                            {savingEdit ? (
                              <span className="text-[10px]">Saving...</span>
                            ) : (
                              <span className="text-[10px] font-bold">Save</span>
                            )}
                          </button>
                          <button
                            onClick={cancelEditingNote}
                            className="p-1 rounded text-slate-400 hover:text-slate-200"
                            title="Cancel"
                          >
                            <span className="text-[10px] font-semibold">Cancel</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleToggleStar(note)}
                            className={`p-1 rounded ${
                              note.starred
                                ? 'text-yellow-500'
                                : 'text-slate-400 hover:text-yellow-500'
                            }`}
                            title="Star"
                          >
                            <Star
                              className="w-4 h-4"
                              fill={note.starred ? 'currentColor' : 'none'}
                            />
                          </button>
                          <button
                            onClick={() => startEditingNote(note)}
                            className="p-1 rounded text-slate-400 hover:text-cyan-400"
                            title="Edit"
                          >
                            <span className="text-[10px] font-bold">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editDraft?.content ?? ''}
                      onChange={(e) =>
                        setEditDraft((prev) =>
                          prev ? { ...prev, content: e.target.value } : prev
                        )
                      }
                      rows={5}
                      className="w-full bg-transparent text-xs outline-none resize-none mb-3"
                      placeholder="Write your note here..."
                    />
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 whitespace-pre-line">
                      {note.content}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{note.date}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNotes.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">No notes found</div>
          )}
        </>
      )}
    </div>
  );
}

