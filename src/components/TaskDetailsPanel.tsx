import React, { useState, useEffect } from 'react';



import { 
  X, Edit2, Save, Plus, MessageSquare, Paperclip, Clock, 
  History, ListTodo, CheckSquare, Square, Trash2, User, 
  Folder, Calendar, AlertCircle, Play, CheckCircle2, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';

interface TaskDetailsPanelProps {
  theme: 'light' | 'dark';
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  users: { id: string; name: string; email: string; role: 'admin' | 'user'; initials: string; avatarColor: string }[];
  loggedInUser?: { id: string; name: string; email: string; role: 'admin' | 'user'; initials: string; avatarColor: string; token: string };
}


export default function TaskDetailsPanel({ theme, isOpen, task, onClose, onSave, users, loggedInUser }: TaskDetailsPanelProps) {
  // Local edit states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [priority, setPriority] = useState<Priority>('High');
  const [selectedProject, setSelectedProject] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [subtaskWarning, setSubtaskWarning] = useState(false); // gate warning flag
  const [perTaskDocumentsMandatory, setPerTaskDocumentsMandatory] = useState<boolean>(false); // per-task setting
  const [globalDocumentsMandatory, setGlobalDocumentsMandatory] = useState<boolean>(false); // global setting

  // Local state for interactive features (comments, subtasks, checklist, attachments, timelogs)
  const [subTasks, setSubTasks] = useState<{
    id: string;
    name: string;
    completed: boolean;
    approvedByAdmin?: boolean;
  }[]>([]);

  const [checklist, setChecklist] = useState<{ id: string; name: string; checked: boolean }[]>([]);
  const [comments, setComments] = useState<{ id: string; author: string; text: string; date: string }[]>([]);
  const [timeLogs, setTimeLogs] = useState<{ id: string; user: string; duration: string; date: string }[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [userAttachments, setUserAttachments] = useState<string[]>([]);
  const [activityLogs, setActivityLogs] = useState<{ id: string; user: string; action: string; date: string }[]>([]);

  // New item inputs
  const [newSubTaskName, setNewSubTaskName] = useState('');
  const [newChecklistItemName, setNewChecklistItemName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [newTimeDuration, setNewTimeDuration] = useState('');
  const [newTimeUser, setNewTimeUser] = useState('Krishna Lokhande');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  // Subtask comments state
  const [expandedSubtaskId, setExpandedSubtaskId] = useState<string | null>(null); // Which subtask's comments are expanded
  const [subtaskNewCommentText, setSubtaskNewCommentText] = useState(''); // Text for new comment on current subtask

  // Subtask selection state for bulk approve
  const [selectedSubtaskIds, setSelectedSubtaskIds] = useState<Set<string>>(new Set());

  // Dropdown list options
  const projectsList = [
    'Edigital Knowledge Academy',
    'Om Associates',
    'YouGo',
    'Easy Bank Loans',
    'My Nest',
    'Priyal Makeup Institute',
    'Graphic Designing Batch',
    'Net Access Internet',
    'Success Visionary'
  ];

  const teammates = users.map(u => u.name);

  // Set default newTimeUser when users load
  useEffect(() => {
    if (users.length > 0 && !newTimeUser) {
      setNewTimeUser(users[0].name);
    }
  }, [users]);

  // Load task details when task changes or panel opens
  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setDueDate(task.dueDate);
      setStatus(task.status);
      setPriority(task.priority);
      setSelectedProject(task.project || (task.projects && task.projects[0]) || 'Om Associates');
      setAssignTo(task.assignTo);
      setPerTaskDocumentsMandatory(task.documentsMandatory || false);

      // Populate interactive elements or supply high-fidelity mock data if undefined
      const initialSubTasks = (task.subTasks || [
        { id: 'sub-1', name: 'Draft requirements alignment', completed: true },
        { id: 'sub-2', name: 'Develop proof-of-concept visual', completed: false },
        { id: 'sub-3', name: 'Submit for stakeholder approval', completed: false }
      ]).map(st => ({ ...st, comments: st.comments || [] })); // Make sure every subtask has a comments array
      setSubTasks(initialSubTasks);

      // Ensure admin-attached documents are shown immediately.
      // Avoid overriding backend-provided documents with mock attachments.


      const initialChecklist = task.checklist || [
        { id: 'chk-1', name: 'Verify typography styling details', checked: true },
        { id: 'chk-2', name: 'Test responsive scaling viewport', checked: false },
        { id: 'chk-3', name: 'Ensure strict theme compliance', checked: false }
      ];
      setChecklist(initialChecklist);

      const initialComments = task.comments || [
        { id: 'com-1', author: 'Aditya Kirat Karve', text: 'Let’s make sure we deliver this before the client presentation.', date: '2026-06-30 04:30 PM' },
        { id: 'com-2', author: 'Krishna Lokhande', text: 'On it! Doing final structural polish right now.', date: '2026-07-01 10:15 AM' }
      ];
      setComments(initialComments);

      const initialTimeLogs = task.timeLogs || [
        { id: 'time-1', user: 'Krishna Lokhande', duration: '2h 15m', date: '2026-06-30' },
        { id: 'time-2', user: 'Aditya Kirat Karve', duration: '45m', date: '2026-07-01' }
      ];
      setTimeLogs(initialTimeLogs);

      // Show backend documents if present; only fallback to mocks if truly missing.
      const initialAttachments = (task.documents && task.documents.length > 0)
        ? task.documents
        : ['project_brief_v2.pdf', 'mood_board_preview.png'];
      setAttachments(initialAttachments);

      setUserAttachments(task.userDocuments || []);


      const initialActivity = [
        { id: 'act-1', user: 'Aditya Kirat Karve', action: 'Created task queue assignment', date: '2026-06-29 09:12 AM' },
        { id: 'act-2', user: 'Krishna Lokhande', action: 'Added initial comments and description details', date: '2026-06-30 02:40 PM' },
        { id: 'act-3', user: 'System', action: `Status auto-synchronized to: ${task.status}`, date: '2026-07-01 11:00 AM' }
      ];
      setActivityLogs(initialActivity);

      // Reset subtask selection when switching tasks
      setSelectedSubtaskIds(new Set());

      setIsEditing(false);

      // Fetch global documents mandatory setting
      (async () => {
        try {
          const res = await fetch('/api/tasks/admin/documents-mandatory');
          if (res.ok) {
            const data = await res.json();
            setGlobalDocumentsMandatory(!!data.mandatory);
          }
        } catch {
          // ignore
        }
      })();
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  // Save Edit Mode changes
  const handleSaveChanges = () => {
    // Gate: block saving as Completed or Approved if subtasks are pending or not approved
    if (status === 'Completed' || status === 'Approved') {
      const pendingCount = subTasks.filter(st => !st.completed).length;
      const unapprovedCount = subTasks.filter(st => st.approvedByAdmin !== true).length;
      if (pendingCount > 0 || unapprovedCount > 0) {
        setSubtaskWarning(true);
        return;
      }
    }

    // Gate: check if documents are required (only for non-admins)
    const needsDocuments = globalDocumentsMandatory || perTaskDocumentsMandatory;
    if (loggedInUser?.role !== 'admin' && needsDocuments && (!userAttachments || userAttachments.length === 0)) {
      alert('Documents are mandatory for this task!');
      return;
    }

    setSubtaskWarning(false);
    const updatedTask: Task = {
      ...task,
      name: name.trim() || task.name,
      description: description.trim(),
      dueDate,
      status,
      priority,
      project: selectedProject,
      projects: [selectedProject],
      assignTo,
      assignees: [assignTo],
      subTasks,
      checklist,
      comments,
      timeLogs,
      documents: attachments,
      userDocuments: userAttachments,
      documentsMandatory: perTaskDocumentsMandatory,
    };
    onSave(updatedTask);
    setIsEditing(false);

    // Append to activity log
    const newLog = {
      id: `act-${Date.now()}`,
      user: 'Krishna Lokhande',
      action: 'Updated core details (Name, description, priority, or dates)',
      date: new Date().toLocaleString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Helper for toggle functions
  const toggleSubTask = (subId: string) => {
    const updated = subTasks.map(st => st.id === subId ? { ...st, completed: !st.completed } : st);
    setSubTasks(updated);
    
    // Save state instantly to App
    const updatedTask: Task = {
      ...task,
      subTasks: updated,
      checklist,
      comments,
      timeLogs,
      documents: attachments,
      userDocuments: userAttachments,
    };
    onSave(updatedTask);
  };

  // Approve Subtask (Admin only) — calls backend API
  const approveSubTask = async (subId: string) => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks/${subId}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        const updatedTask: Task = await res.json();
        setSubTasks(updatedTask.subTasks || []);
        onSave(updatedTask);
      }
    } catch {
      // fallback: local update
      const updated = subTasks.map(st => st.id === subId ? { ...st, approvedByAdmin: true } : st);
      setSubTasks(updated);
      const updatedTask: Task = {
        ...task,
        subTasks: updated,
        checklist,
        comments,
        timeLogs,
        documents: attachments,
        userDocuments: userAttachments,
      };
      onSave(updatedTask);
    }
  };

  // Approve ALL subtasks at once — calls backend API
  const approveAllSubTasks = async () => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks/approve-all`, {
        method: 'POST',
      });
      if (res.ok) {
        const updatedTask: Task = await res.json();
        setSubTasks(updatedTask.subTasks || []);
        setSelectedSubtaskIds(new Set());
        onSave(updatedTask);
      }
    } catch {
      // fallback: local update
      const updated = subTasks.map(st => ({ ...st, approvedByAdmin: true }));
      setSubTasks(updated);
      setSelectedSubtaskIds(new Set());
      const updatedTask: Task = {
        ...task,
        subTasks: updated,
        checklist,
        comments,
        timeLogs,
        documents: attachments,
        userDocuments: userAttachments,
      };
      onSave(updatedTask);
    }
  };

  // Approve SELECTED subtasks — calls backend API
  const approveSelectedSubTasks = async () => {
    if (!task || selectedSubtaskIds.size === 0) return;
    const idsArray = Array.from(selectedSubtaskIds);
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks/approve-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idsArray),
      });
      if (res.ok) {
        const updatedTask: Task = await res.json();
        setSubTasks(updatedTask.subTasks || []);
        setSelectedSubtaskIds(new Set());
        onSave(updatedTask);
      }
    } catch {
      // fallback: local update
      const updated = subTasks.map(st => 
        selectedSubtaskIds.has(st.id) ? { ...st, approvedByAdmin: true } : st
      );
      setSubTasks(updated);
      setSelectedSubtaskIds(new Set());
      const updatedTask: Task = {
        ...task,
        subTasks: updated,
        checklist,
        comments,
        timeLogs,
        documents: attachments,
        userDocuments: userAttachments,
      };
      onSave(updatedTask);
    }
  };

  // Toggle selection of a subtask
  const toggleSubTaskSelection = (subId: string) => {
    setSelectedSubtaskIds(prev => {
      const next = new Set(prev);
      if (next.has(subId)) {
        next.delete(subId);
      } else {
        next.add(subId);
      }
      return next;
    });
  };

  // Toggle select all subtasks (only unapproved ones)
  const toggleSelectAllSubTasks = () => {
    const unapprovedIds = subTasks.filter(st => st.approvedByAdmin !== true).map(st => st.id);
    setSelectedSubtaskIds(prev => {
      // If all unapproved are already selected, deselect all
      const allUnapprovedSelected = unapprovedIds.every(id => prev.has(id));
      if (allUnapprovedSelected) {
        return new Set();
      }
      // Otherwise select all unapproved
      return new Set(unapprovedIds);
    });
  };

  const toggleChecklist = (chkId: string) => {
    const updated = checklist.map(cl => cl.id === chkId ? { ...cl, checked: !cl.checked } : cl);
    setChecklist(updated);

    // Save state instantly to App
    const updatedTask: Task = {
      ...task,
      subTasks,
      checklist: updated,
      comments,
      timeLogs,
      documents: attachments,
    };
    onSave(updatedTask);
  };

  // Add Comment
  const handleAddComment = (e: any) => {

    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `com-${Date.now()}`,
      // Use current assignee as a reasonable proxy for the active commenter in this UI
      author: (assignTo || users?.[0]?.name || 'Unknown'),
      text: newCommentText.trim(),
      date: new Date().toLocaleString()
    };
    const updated = [...comments, newComment];
    setComments(updated);
    setNewCommentText('');

    // Save state instantly to App
    const updatedTask: Task = {
      ...task,
      subTasks,
      checklist,
      comments: updated,
      timeLogs,
      documents: attachments,
      userDocuments: userAttachments,
    };
    onSave(updatedTask);

    // Log Activity
    const newLog = {
      id: `act-${Date.now()}`,
      user: 'Krishna Lokhande',
      action: 'Added a new comment on task',
      date: new Date().toLocaleString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Add Sub Task
  const handleAddSubTask = (e: any) => {

    e.preventDefault();
    if (!newSubTaskName.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      name: newSubTaskName.trim(),
      completed: false,
      comments: [] // Initialize with empty comments array
    };
    const updated = [...subTasks, newSub];
    setSubTasks(updated);
    setNewSubTaskName('');

    // Save state instantly to App
    const updatedTask: Task = {
      ...task,
      subTasks: updated,
      checklist,
      comments,
      timeLogs,
      documents: attachments,
      userDocuments: userAttachments,
    };
    onSave(updatedTask);
  };

  // Add Checklist Item
  const handleAddChecklist = (e: any) => {

    e.preventDefault();
    if (!newChecklistItemName.trim()) return;
    const newChk = {
      id: `chk-${Date.now()}`,
      name: newChecklistItemName.trim(),
      checked: false
    };
    const updated = [...checklist, newChk];
    setChecklist(updated);
    setNewChecklistItemName('');

    // Save state instantly to App
    const updatedTask: Task = {
      ...task,
      subTasks,
      checklist: updated,
      comments,
      timeLogs,
      documents: attachments,
    };
    onSave(updatedTask);
  };

  // Add Time Log
  const handleAddTimeLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeDuration.trim()) return;
    const newLog = {
      id: `time-${Date.now()}`,
      user: newTimeUser,
      duration: newTimeDuration.trim(),
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [...timeLogs, newLog];
    setTimeLogs(updated);
    setNewTimeDuration('');

    // Save state instantly to App
    const updatedTask: Task = {
      ...task,
      subTasks,
      checklist,
      comments,
      timeLogs: updated,
      documents: attachments,
      userDocuments: userAttachments,
    };
    onSave(updatedTask);

    // Log Activity
    const newActLog = {
      id: `act-${Date.now()}`,
      user: newTimeUser,
      action: `Logged ${newTimeDuration.trim()} of active time`,
      date: new Date().toLocaleString()
    };
    setActivityLogs(prev => [newActLog, ...prev]);
  };

  // Mock Attachment Upload
  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload && !newAttachmentName.trim()) return;
    
    let uploadedUrl = newAttachmentName.trim() || 'unnamed_attachment.png';
    if (fileToUpload) {
      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        const uploadRes = await fetch('http://localhost:8081/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          uploadedUrl = 'http://localhost:8081' + data.url;
        }
      } catch (err) {
        console.error('File upload failed', err);
      }
    }
    
    let updatedTask: Task;
    if (loggedInUser?.role === 'admin') {
      const updated = [...attachments, uploadedUrl];
      setAttachments(updated);
      updatedTask = {
        ...task,
        subTasks,
        checklist,
        comments,
        timeLogs,
        documents: updated,
        userDocuments: userAttachments,
      };
    } else {
      const updated = [...userAttachments, uploadedUrl];
      setUserAttachments(updated);
      updatedTask = {
        ...task,
        subTasks,
        checklist,
        comments,
        timeLogs,
        documents: attachments,
        userDocuments: updated,
      };
    }
    
    setNewAttachmentName('');
    setFileToUpload(null);

    // Save state instantly to App
    onSave(updatedTask);

    // Log Activity
    const newActLog = {
      id: `act-${Date.now()}`,
      user: loggedInUser?.name || 'User',
      action: `Attached file: ${fileToUpload?.name || uploadedUrl}`,
      date: new Date().toLocaleString()
    };
    setActivityLogs(prev => [newActLog, ...prev]);
  };

  // Drag and drop real upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    
    let uploadedUrl = droppedFile.name;
    try {
      const formData = new FormData();
      formData.append('file', droppedFile);
      const uploadRes = await fetch('http://localhost:8081/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        uploadedUrl = 'http://localhost:8081' + data.url;
      }
    } catch (err) {
      console.error('Drag-and-drop upload failed', err);
    }

    let updatedTask: Task;
    if (loggedInUser?.role === 'admin') {
      const updated = [...attachments, uploadedUrl];
      setAttachments(updated);
      updatedTask = {
        ...task,
        subTasks,
        checklist,
        comments,
        timeLogs,
        documents: updated,
        userDocuments: userAttachments,
      };
    } else {
      const updated = [...userAttachments, uploadedUrl];
      setUserAttachments(updated);
      updatedTask = {
        ...task,
        subTasks,
        checklist,
        comments,
        timeLogs,
        documents: attachments,
        userDocuments: updated,
      };
    }

    // Save state instantly to App
    onSave(updatedTask);

    // Log Activity
    const newActLog = {
      id: `act-${Date.now()}`,
      user: loggedInUser?.name || 'User',
      action: `Uploaded file via drag-and-drop: ${droppedFile.name}`,
      date: new Date().toLocaleString()
    };
    setActivityLogs(prev => [newActLog, ...prev]);
  };

  // Toggle expanding a subtask's comments
  const toggleSubtaskComments = (subtaskId: string) => {
    setExpandedSubtaskId(expandedSubtaskId === subtaskId ? null : subtaskId);
    setSubtaskNewCommentText(''); // Reset comment input when toggling
  };

  // Add comment to a specific subtask
  const handleAddSubtaskComment = (e: React.FormEvent, subtaskId: string) => {
    e.preventDefault();
    if (!subtaskNewCommentText.trim()) return;

    const updatedSubtasks = subTasks.map(st => {
      if (st.id === subtaskId) {
        const newComment = {
          id: `sub-comment-${Date.now()}`,
          author: loggedInUser?.name || 'Unknown User',
          text: subtaskNewCommentText.trim(),
          date: new Date().toLocaleString()
        };
        return {
          ...st,
          comments: [...(st.comments || []), newComment]
        };
      }
      return st;
    });
    setSubTasks(updatedSubtasks);
    setSubtaskNewCommentText('');

    // Save state instantly to App
    const updatedTask: Task = {
      ...task,
      subTasks: updatedSubtasks,
      checklist,
      comments,
      timeLogs,
      documents: attachments,
      userDocuments: userAttachments,
    };
    onSave(updatedTask);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden select-none">
      {/* Semi-transparent Backdrop with subtle blur */}
      <div 
        className="absolute inset-0 bg-[#070b19]/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div 
        id="task-details-sidebar"
        className={`relative w-full md:w-[45%] h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out border-l z-10 ${
          theme === 'dark' 
            ? 'bg-[#0E1631] border-slate-800 text-slate-200' 
            : 'bg-white border-slate-100 text-slate-800'
        }`}
      >
        {/* Header Section */}
        <div className={`p-5 border-b flex items-center justify-between select-none ${
          theme === 'dark' ? 'border-slate-800 bg-[#121B3A]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
              theme === 'dark' ? 'bg-cyan-950/40 text-cyan-400' : 'bg-cyan-50 text-cyan-700'
            }`}>
              T-1345
            </span>
            <span className="text-xs text-slate-400 font-semibold">Task Details & Queue telemetry</span>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 flex items-center gap-1 cursor-pointer shadow shadow-cyan-500/10 transition transform active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs hover:text-white hover:bg-slate-700 flex items-center gap-1 cursor-pointer transition transform active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Task</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl hover:bg-slate-800/10 transition cursor-pointer ${
                theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Under Review — Admin Approve/Reject Banner */}
        {task.status === 'Under Review' && !isEditing && (
          <div className={`px-5 py-3 border-b flex items-center justify-between gap-3 ${
            theme === 'dark' ? 'bg-violet-900/20 border-violet-500/20' : 'bg-violet-50 border-violet-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              <p className="text-xs font-bold text-violet-300">Awaiting Admin Approval</p>
              <span className="text-[10px] text-violet-400/70">User submitted for review</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const approved: Task = { ...task, status: 'Completed' };
                  onSave(approved);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/35 transition cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => {
                  const rejected: Task = { ...task, status: 'Rejected' };
                  onSave(rejected);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/35 transition cursor-pointer"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Content Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* 1. Task Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Task Name</label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-cyan-500 outline-none border ${
                  theme === 'dark' 
                    ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            ) : (
              <h2 className="text-xl font-extrabold tracking-tight text-cyan-400 leading-snug">
                {name}
              </h2>
            )}
          </div>

          {/* 2. & 3. Grid for Metadata details: Project, Status, Priority, Due Date, Assignee */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Project */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Project</label>
              {isEditing ? (
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-1 focus:ring-cyan-500 outline-none border ${
                    theme === 'dark' 
                      ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {projectsList.map(proj => (
                    <option key={proj} value={proj}>{proj}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-bold text-slate-300">{selectedProject}</span>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Due Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-1 focus:ring-cyan-500 outline-none border ${
                    theme === 'dark' 
                      ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              ) : (
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-bold text-slate-300">{dueDate}</span>
                </div>
              )}
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Assignee</label>
              {isEditing ? (
                <select
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-1 focus:ring-cyan-500 outline-none border ${
                    theme === 'dark' 
                      ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {teammates.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-bold text-slate-300">{assignTo}</span>
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Priority</label>
              {isEditing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-1 focus:ring-cyan-500 outline-none border ${
                    theme === 'dark' 
                      ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Critical">🛑 Critical</option>
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🟢 Low</option>
                </select>
              ) : (
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                    priority === 'Critical'
                      ? 'bg-red-950/40 text-red-500 border-red-900/30'
                      : priority === 'High'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                      : priority === 'Medium'
                      ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      priority === 'Critical' ? 'bg-red-500 animate-pulse' : priority === 'High' ? 'bg-rose-400' : priority === 'Medium' ? 'bg-yellow-400' : 'bg-emerald-400'
                    }`} />
                    <span>{priority}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Status</label>
              {isEditing ? (
                <>
                  <select
                    value={status}
                    onChange={(e) => {
                      const newStatus = e.target.value as TaskStatus;
                      setStatus(newStatus);
                      // Auto-clear the warning when user changes away from Completed or Approved
                      if (newStatus !== 'Completed' && newStatus !== 'Approved') setSubtaskWarning(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-1 focus:ring-cyan-500 outline-none border ${
                      theme === 'dark' 
                        ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Incomplete">Incomplete</option>
                  <option value="Approved">Approved</option>
                  </select>
                  {/* Subtask gate warning — shown when saving blocked */}
                  {subtaskWarning && (status === 'Completed' || status === 'Approved') && (() => {
                    const safeSubTasks = Array.isArray(subTasks) ? subTasks : [];
                    const pending = safeSubTasks.filter(st => !st.completed);
                    const unapproved = safeSubTasks.filter(st => st.approvedByAdmin !== true);
                    const hasIssues = pending.length > 0 || unapproved.length > 0;
                    if (!hasIssues) return null;

                    return (
                      <div className="flex items-start gap-2 mt-2 px-3 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                        <div>
                          <p className="text-[11px] font-bold text-amber-300">Complete and approve all subtasks first!</p>
                          <ul className="mt-1 space-y-0.5">
                            {pending.map(st => (
                              <li key={st.id} className="text-[10px] text-amber-400 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                                {st.name} (pending)
                              </li>
                            ))}
                            {unapproved.map(st => (
                              <li key={st.id} className="text-[10px] text-amber-400 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                                {st.name} (needs approval)
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    status === 'Completed' || status === 'Approved'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                      : status === 'In Progress'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                      : status === 'Under Review'
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20'
                      : status === 'Rejected'
                      ? 'bg-red-500/15 text-red-400 border-red-500/20'
                      : status === 'Incomplete'
                      ? 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                      : 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {status}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* 7. Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Description</label>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full px-4 py-2 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-cyan-500 outline-none border ${
                  theme === 'dark' 
                    ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
                placeholder="Type comprehensive task details and telemetry information..."
              />
            ) : (
              <p className={`text-xs leading-relaxed p-4 rounded-xl font-medium ${
                theme === 'dark' ? 'bg-[#111A37] text-slate-300' : 'bg-slate-50 text-slate-700'
              }`}>
                {description || 'No description provided for this task.'}
              </p>
            )}
          </div>

          {/* Documents Required (Admin Only) */}
          {loggedInUser?.role === 'admin' && isEditing && (
            <div className="space-y-1 pt-2 border-t border-slate-800/10">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Documents Mandatory</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="task-detail-doc-mandatory"
                  checked={perTaskDocumentsMandatory}
                  onChange={(e) => setPerTaskDocumentsMandatory(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 accent-emerald-500"
                />
                <label
                  htmlFor="task-detail-doc-mandatory"
                  className="text-xs font-bold text-slate-300 cursor-pointer select-none"
                >
                  Require documents for user submissions
                </label>
              </div>
            </div>
          )}

          {/* 12. Sub Tasks */}
          <div className="space-y-3 pt-2 border-t border-slate-800/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <ListTodo className="w-4 h-4" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider">Sub Tasks</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {subTasks.filter(st => st.completed).length}/{subTasks.length} Done
              </span>
            </div>

            {/* Admin actions: Approve All + Select All + Approve Selected */}
            {loggedInUser?.role === 'admin' && subTasks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={approveAllSubTasks}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/35 transition cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Approve All
                </button>
                <button
                  onClick={toggleSelectAllSubTasks}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/35 transition cursor-pointer"
                >
                  {(() => {
                    const unapprovedIds = subTasks.filter(st => st.approvedByAdmin !== true).map(st => st.id);
                    const allUnapprovedSelected = unapprovedIds.length > 0 && unapprovedIds.every(id => selectedSubtaskIds.has(id));
                    return allUnapprovedSelected ? 'Deselect All' : 'Select All';
                  })()}
                </button>
                {selectedSubtaskIds.size > 0 && (
                  <button
                    onClick={approveSelectedSubTasks}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/35 transition cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Approve Selected ({selectedSubtaskIds.size})
                  </button>
                )}
              </div>
            )}

            {/* Subtask gate notice (read-only view) — shown when subtasks are pending or unapproved */}
            {(() => {
              const pending = subTasks.filter(st => !st.completed);
              const unapproved = subTasks.filter(st => st.approvedByAdmin !== true);
              const hasIssues = pending.length > 0 || unapproved.length > 0;
              return !isEditing && subTasks.length > 0 && hasIssues ? (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/8">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-300">Subtasks pending or unapproved — task cannot be marked Complete or Approved yet</p>
                    <p className="text-[10px] text-amber-400/70 mt-0.5">{pending.length + unapproved.length} of {subTasks.length} subtask(s) remaining</p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* List */}
            <div className="space-y-2">
              {subTasks.map(st => (
                <div 
                  key={st.id} 
                  className={`rounded-xl border transition overflow-hidden ${
                    theme === 'dark' ? 'border-slate-800/50 bg-[#141C38]/40 hover:bg-[#141C38]/70' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  {/* Subtask main row */}
                  <div className="flex items-center gap-3 p-2.5">
                    {/* Selection checkbox for admin */}
                    {loggedInUser?.role === 'admin' && (
                      <input
                        type="checkbox"
                        checked={selectedSubtaskIds.has(st.id)}
                        onChange={() => toggleSubTaskSelection(st.id)}
                        className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 accent-cyan-500 flex-shrink-0"
                        title="Select for bulk approve"
                      />
                    )}
                    <button
                      onClick={() => toggleSubTask(st.id)}
                      className={`p-0.5 rounded-md hover:bg-slate-800/10 transition cursor-pointer`}
                    >
                      {st.completed ? (
                        <CheckSquare className="w-4.5 h-4.5 text-cyan-500" />
                      ) : (
                        <Square className="w-4.5 h-4.5 text-slate-400 hover:text-cyan-400" />
                      )}
                    </button>
                    <span className={`text-xs font-medium transition flex-1 ${st.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {st.name}
                    </span>
                    {/* Comment toggle button */}
                    <button
                      type="button"
                      onClick={() => toggleSubtaskComments(st.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800/20 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {st.approvedByAdmin ? (
                      <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => approveSubTask(st.id)}
                        className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                  
                  {/* Expanded comments section */}
                  {expandedSubtaskId === st.id && (
                    <div className="px-4 pb-4 space-y-2 border-t border-slate-700/30">
                      {/* Existing comments */}
                      {(st.comments || []).length > 0 ? (
                        <div className="space-y-1.5 pt-2">
                          {(st.comments || []).map(comment => (
                            <div key={comment.id} className="space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-cyan-400">{comment.author}</span>
                                <span className="text-[9px] text-slate-500 font-mono">{comment.date}</span>
                              </div>
                              <p className={`text-xs px-2.5 py-1 rounded-lg border leading-relaxed ${
                                theme === 'dark' 
                                  ? 'bg-slate-900/50 border-slate-700/30 text-slate-300' 
                                  : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}>
                                {comment.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 pt-2">No comments yet.</p>
                      )}
                      
                      {/* Add new comment form */}
                      <form onSubmit={(e) => handleAddSubtaskComment(e, st.id)} className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={subtaskNewCommentText}
                          onChange={(e) => setSubtaskNewCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-cyan-500 outline-none border ${
                            theme === 'dark' 
                              ? 'bg-slate-900 border-slate-700 text-slate-200' 
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={!subtaskNewCommentText.trim()}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Add Subtask */}
            <form onSubmit={handleAddSubTask} className="flex gap-2">
              <input
                type="text"
                value={newSubTaskName}
                onChange={(e) => setNewSubTaskName(e.target.value)}
                placeholder="Quick add subtask..."
                className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-cyan-500 outline-none border ${
                  theme === 'dark' 
                    ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-xs font-black hover:bg-cyan-500/20 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* 13. Checklist */}
          <div className="space-y-3 pt-2 border-t border-slate-800/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider">Checklist</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {checklist.filter(c => c.checked).length}/{checklist.length} Verified
              </span>
            </div>

            {/* List */}
            <div className="space-y-2">
              {checklist.map(chk => (
                <div 
                  key={chk.id} 
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                    theme === 'dark' ? 'border-slate-800/50 bg-[#141C38]/40 hover:bg-[#141C38]/70' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  <button
                    onClick={() => toggleChecklist(chk.id)}
                    className="p-0.5 rounded-md transition cursor-pointer"
                  >
                    {chk.checked ? (
                      <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                    ) : (
                      <Square className="w-4.5 h-4.5 text-slate-400 hover:text-emerald-500" />
                    )}
                  </button>
                  <span className={`text-xs font-medium transition ${chk.checked ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {chk.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Add Checklist Item */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                type="text"
                value={newChecklistItemName}
                onChange={(e) => setNewChecklistItemName(e.target.value)}
                placeholder="Add checklist item..."
                className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-cyan-500 outline-none border ${
                  theme === 'dark' 
                    ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-black hover:bg-emerald-500/20 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* 9. Attachments */}
          <div className="space-y-3 pt-2 border-t border-slate-800/10">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Paperclip className="w-4 h-4" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Attachments</h4>
            </div>

            {/* List */}
            <div className="space-y-2">
              {attachments.map((file, idx) => (
                <div 
                  key={`admin-${idx}`} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    theme === 'dark' ? 'border-slate-800/50 bg-[#141C38]/40 hover:bg-[#141C38]/70' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span 
                      onClick={() => window.open(file.startsWith('http') ? file : `#${file}`, '_blank')}
                      className="text-xs font-mono font-bold text-slate-300 truncate max-w-[200px] cursor-pointer hover:text-cyan-400 hover:underline"
                      title="Click to open"
                    >
                      {file.split('/').pop()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = attachments.filter((_, i) => i !== idx);
                      setAttachments(updated);
                      onSave({ ...task, documents: updated, userDocuments: userAttachments });
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-800/20 transition cursor-pointer"
                    title="Remove admin attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {userAttachments.map((file, idx) => (
                <div 
                  key={`user-${idx}`} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    theme === 'dark' ? 'border-slate-800/50 bg-[#141C38]/40 hover:bg-[#141C38]/70' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span 
                      onClick={() => window.open(file.startsWith('http') ? file : `#${file}`, '_blank')}
                      className="text-xs font-mono font-bold text-emerald-300 truncate max-w-[200px] cursor-pointer hover:text-emerald-400 hover:underline"
                      title="Click to open"
                    >
                      {file.split('/').pop()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = userAttachments.filter((_, i) => i !== idx);
                      setUserAttachments(updated);
                      onSave({ ...task, documents: attachments, userDocuments: updated });
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-800/20 transition cursor-pointer"
                    title="Remove user attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* File Drag Zone & Mock Upload Form */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-center transition ${
                theme === 'dark' 
                  ? 'border-slate-800 bg-[#141C38]/20 text-slate-400 hover:border-cyan-500/30' 
                  : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-cyan-500/30'
              }`}
            >
              <Paperclip className="w-6 h-6 text-slate-500 animate-pulse" />
              <p className="text-[10px] font-bold">Drag and drop file here or use form below</p>
            </div>

            <div className="flex gap-2">
              <input
                type="file"
                id="task-details-file-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileToUpload(e.target.files[0]);
                    setNewAttachmentName(e.target.files[0].name);
                  }
                }}
              />
              <label
                htmlFor="task-details-file-upload"
                className={`flex-1 flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition truncate ${
                  theme === 'dark' 
                    ? 'bg-[#141C38] border-slate-800 text-slate-400 hover:text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                {newAttachmentName ? newAttachmentName : 'Select file to upload...'}
              </label>
              <button
                type="button"
                onClick={handleAddAttachment}
                disabled={!newAttachmentName.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-xs font-bold hover:bg-cyan-500/20 cursor-pointer transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* 11. Time Log */}
          <div className="space-y-3 pt-2 border-t border-slate-800/10">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Clock className="w-4 h-4" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Time Log</h4>
            </div>

            {/* List */}
            <div className="space-y-2">
              {timeLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold ${
                    theme === 'dark' ? 'border-slate-800/50 bg-[#141C38]/40' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-extrabold flex items-center justify-center text-[8px]">
                      {log.user.split(' ').map(n=>n[0]).join('').toUpperCase()}
                    </div>
                    <span className="text-slate-300 font-bold">{log.user}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-400 font-medium">{log.date}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-black border border-cyan-500/20">
                      {log.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Log Time Form */}
            <form onSubmit={handleAddTimeLog} className="space-y-2 bg-slate-800/5 p-3 rounded-xl border border-slate-800/5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newTimeDuration}
                  onChange={(e) => setNewTimeDuration(e.target.value)}
                  placeholder="e.g., 1h 30m"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-cyan-500 outline-none border ${
                    theme === 'dark' 
                      ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <select
                  value={newTimeUser}
                  onChange={(e) => setNewTimeUser(e.target.value)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-cyan-500 outline-none border ${
                    theme === 'dark' 
                      ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {teammates.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black hover:bg-cyan-400 cursor-pointer transition flex items-center justify-center gap-1 shadow"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Log Time Session</span>
              </button>
            </form>
          </div>

          {/* 8. Comments */}
          <div className="space-y-3 pt-2 border-t border-slate-800/10">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <MessageSquare className="w-4 h-4" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Comments</h4>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {comments.map(com => (
                <div key={com.id} className="space-y-1 text-xs font-medium text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-cyan-400">{com.author}</span>
                    <span className="text-[9px] font-mono font-medium text-slate-500">{com.date}</span>
                  </div>
                  <p className={`p-2.5 rounded-xl border leading-relaxed ${
                    theme === 'dark' ? 'bg-[#141C38]/50 border-slate-800/50 text-slate-300' : 'bg-slate-50/50 border-slate-100 text-slate-700'
                  }`}>
                    {com.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Type a comment or status update..."
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-cyan-500 outline-none border ${
                  theme === 'dark' 
                    ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black hover:bg-cyan-400 cursor-pointer transition shadow"
              >
                Send
              </button>
            </form>
          </div>

          {/* 10. Activity Log */}
          <div className="space-y-3 pt-2 border-t border-slate-800/10">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <History className="w-4 h-4" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Activity Log</h4>
            </div>

            {/* Timeline */}
            <div className="relative border-l border-slate-800/30 ml-2.5 pl-4 space-y-4 text-xs font-medium text-left">
              {activityLogs.map((log) => (
                <div key={log.id} className="relative">
                  {/* Timeline bullet indicator */}
                  <div className="absolute -left-[21.5px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-[#0E1631]" />
                  
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-300">{log.user}</span>
                    <span className="text-[9px] font-mono font-medium text-slate-500">{log.date}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">{log.action}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
