import React, { useState, useEffect } from 'react';
import { 
  X, Edit2, Save, Plus, MessageSquare, Paperclip, Clock, 
  History, ListTodo, CheckSquare, Square, Trash2, User, 
  Folder, Calendar, AlertCircle, Play, CheckCircle2 
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';

interface TaskDetailsPanelProps {
  theme: 'light' | 'dark';
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  users: { id: string; name: string; email: string; role: 'admin' | 'user'; initials: string; avatarColor: string }[];
}

export default function TaskDetailsPanel({ theme, isOpen, task, onClose, onSave, users }: TaskDetailsPanelProps) {
  // Local edit states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [priority, setPriority] = useState<Priority>('High');
  const [selectedProject, setSelectedProject] = useState('');
  const [assignTo, setAssignTo] = useState('');

  // Local state for interactive features (comments, subtasks, checklist, attachments, timelogs)
  const [subTasks, setSubTasks] = useState<{ id: string; name: string; completed: boolean }[]>([]);
  const [checklist, setChecklist] = useState<{ id: string; name: string; checked: boolean }[]>([]);
  const [comments, setComments] = useState<{ id: string; author: string; text: string; date: string }[]>([]);
  const [timeLogs, setTimeLogs] = useState<{ id: string; user: string; duration: string; date: string }[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [activityLogs, setActivityLogs] = useState<{ id: string; user: string; action: string; date: string }[]>([]);

  // New item inputs
  const [newSubTaskName, setNewSubTaskName] = useState('');
  const [newChecklistItemName, setNewChecklistItemName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [newTimeDuration, setNewTimeDuration] = useState('');
  const [newTimeUser, setNewTimeUser] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');

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

      // Populate interactive elements or supply high-fidelity mock data if undefined
      const initialSubTasks = task.subTasks || [
        { id: 'sub-1', name: 'Draft requirements alignment', completed: true },
        { id: 'sub-2', name: 'Develop proof-of-concept visual', completed: false },
        { id: 'sub-3', name: 'Submit for stakeholder approval', completed: false }
      ];
      setSubTasks(initialSubTasks);

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

      const initialAttachments = task.documents || ['project_brief_v2.pdf', 'mood_board_preview.png'];
      setAttachments(initialAttachments);

      const initialActivity = [
        { id: 'act-1', user: 'Aditya Kirat Karve', action: 'Created task queue assignment', date: '2026-06-29 09:12 AM' },
        { id: 'act-2', user: 'Krishna Lokhande', action: 'Added initial comments and description details', date: '2026-06-30 02:40 PM' },
        { id: 'act-3', user: 'System', action: `Status auto-synchronized to: ${task.status}`, date: '2026-07-01 11:00 AM' }
      ];
      setActivityLogs(initialActivity);

      setIsEditing(false);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  // Save Edit Mode changes
  const handleSaveChanges = () => {
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
    };
    onSave(updatedTask);
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
  const handleAddComment = (e: React.FormEvent) => {
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
  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskName.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      name: newSubTaskName.trim(),
      completed: false
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
    };
    onSave(updatedTask);
  };

  // Add Checklist Item
  const handleAddChecklist = (e: React.FormEvent) => {
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
  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToUse = newAttachmentName.trim() || 'unnamed_attachment.png';
    const updated = [...attachments, nameToUse];
    setAttachments(updated);
    setNewAttachmentName('');

    // Save state instantly to App
    const updatedTask: Task = {
      ...task,
      subTasks,
      checklist,
      comments,
      timeLogs,
      documents: updated,
    };
    onSave(updatedTask);

    // Log Activity
    const newActLog = {
      id: `act-${Date.now()}`,
      user: 'Krishna Lokhande',
      action: `Attached file: ${nameToUse}`,
      date: new Date().toLocaleString()
    };
    setActivityLogs(prev => [newActLog, ...prev]);
  };

  // Drag and drop mock trigger
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const mockFileName = 'dragged_file_' + Math.floor(Math.random() * 100) + '.pdf';
    const updated = [...attachments, mockFileName];
    setAttachments(updated);

    // Save state instantly to App
    const updatedTask: Task = {
      ...task,
      subTasks,
      checklist,
      comments,
      timeLogs,
      documents: updated,
    };
    onSave(updatedTask);

    // Log Activity
    const newActLog = {
      id: `act-${Date.now()}`,
      user: 'Krishna Lokhande',
      action: `Uploaded file via drag-and-drop: ${mockFileName}`,
      date: new Date().toLocaleString()
    };
    setActivityLogs(prev => [newActLog, ...prev]);
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
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
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
                </select>
              ) : (
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    status === 'Completed'
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

            {/* List */}
            <div className="space-y-2">
              {subTasks.map(st => (
                <div 
                  key={st.id} 
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                    theme === 'dark' ? 'border-slate-800/50 bg-[#141C38]/40 hover:bg-[#141C38]/70' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
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
                  <span className={`text-xs font-medium transition ${st.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {st.name}
                  </span>
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
                  key={idx} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    theme === 'dark' ? 'border-slate-800/50 bg-[#141C38]/40 hover:bg-[#141C38]/70' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs font-mono font-bold text-slate-300 truncate max-w-[200px]">{file}</span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = attachments.filter((_, i) => i !== idx);
                      setAttachments(updated);
                      onSave({ ...task, documents: updated });
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-800/20 transition cursor-pointer"
                    title="Remove attachment"
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

            <form onSubmit={handleAddAttachment} className="flex gap-2">
              <input
                type="text"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                placeholder="Mock attachment filename..."
                className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-cyan-500 outline-none border ${
                  theme === 'dark' 
                    ? 'bg-[#141C38] border-slate-800 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-xs font-bold hover:bg-cyan-500/20 cursor-pointer transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
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
