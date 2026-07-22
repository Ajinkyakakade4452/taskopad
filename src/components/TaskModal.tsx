import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  FileSpreadsheet,
  Star,
  Flame,
  Check,
  Plus,
  Search,
  Trash2,
  Paperclip,
  MessageSquare,
  Clock,
  Activity,
  FileText,
  ChevronDown,
  Briefcase,
  Users,
  Eye,
  CheckSquare,
  ListTodo
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';

interface TaskModalProps {
  theme: 'dark' | 'light';
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  onUpdate?: (task: Task) => void; // For edit mode
  editingTask?: Task | null; // When set, modal runs in edit mode
  users: { id: string; name: string; email: string; role: 'admin' | 'user'; initials: string; avatarColor: string }[];
  loggedInUser?: { id: string; name: string; email: string; role: 'admin' | 'user'; initials: string; avatarColor: string; token: string };
}

export default function TaskModal({ theme, isOpen, onClose, onSave, onUpdate, editingTask, users, loggedInUser }: TaskModalProps) {
  // --- Core State Variables ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [priority, setPriority] = useState<Priority>('High');
  const [time, setTime] = useState('11:00 AM - 12:30 PM');
  const [error, setError] = useState('');

  // --- Dropdown Lists State ---
  const [projectsList, setProjectsList] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(['Net Access Internet']);
  const [projectSearch, setProjectSearch] = useState('');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddProjectInput, setShowAddProjectInput] = useState(false);

  // --- Assignees State ---
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(users.length > 0 ? [users[0].name] : []);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);

  // --- Recurring Task State ---
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatType, setRepeatType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Custom'>('Daily');
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [repeatOn, setRepeatOn] = useState('Same date of every month');
  const [customRule, setCustomRule] = useState('');
  const [customDates, setCustomDates] = useState<string[]>([]);
  const [customDateInput, setCustomDateInput] = useState('');
  const [endOption, setEndOption] = useState<'Never' | 'On Date' | 'After Occurrences'>('Never');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [occurrences, setOccurrences] = useState(10);

  // --- Task Time State ---
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderBefore, setReminderBefore] = useState('30 minutes before');

  // --- Clients State ---
  const [clientsList, setClientsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('taskpad_clients');
    return saved ? JSON.parse(saved) : ['Om Associates', 'YouGo Corp', 'Net Access Labs', 'Star Logistics'];
  });
  const [selectedClient, setSelectedClient] = useState('Net Access Labs');
  const [newClientName, setNewClientName] = useState('');
  const [showAddClientInput, setShowAddClientInput] = useState(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientRef = useRef<HTMLDivElement>(null);

  // --- Services State ---
  const [servicesList, setServicesList] = useState<string[]>(() => {
    const saved = localStorage.getItem('taskpad_services');
    return saved ? JSON.parse(saved) : ['Web Design', 'Social Media Marketing', 'SEO Optimization', 'App Development', 'Copywriting'];
  });
  const [selectedService, setSelectedService] = useState('Web Design');
  const [newServiceName, setNewServiceName] = useState('');
  const [showAddServiceInput, setShowAddServiceInput] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const serviceRef = useRef<HTMLDivElement>(null);

  // --- Followers State ---
  const followersList = users.map(u => u.name);
  const [selectedFollower, setSelectedFollower] = useState(users.length > 0 ? users[0].name : '');

  // --- Upload Documents / Drag & Drop ---
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Sub Tasks State ---
  const [subTasks, setSubTasks] = useState<{ id: string; name: string; completed: boolean; date?: string; assignTo?: string; comments?: { id: string; author: string; text: string; date: string }[] }[]>([]);
  const [newSubTaskName, setNewSubTaskName] = useState('');
  const [newSubTaskDate, setNewSubTaskDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [subtaskExpandedId, setSubtaskExpandedId] = useState<string | null>(null);
  const [subtaskNewComment, setSubtaskNewComment] = useState('');

  // --- Checklist State ---
  const [checklist, setChecklist] = useState<{ id: string; name: string; checked: boolean }[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // --- Interactive Tabs ---
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments' | 'activity' | 'timelog'>('comments');
  const [comments, setComments] = useState<{ id: string; author: string; text: string; date: string }[]>([
    {
      id: 'com-1',
      author: 'Krishna Lokhande',
      text: 'Draft version ready to share with the client. Review guidelines.',
      date: '11:02 AM'
    }
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  const [timeLogs, setTimeLogs] = useState<{ id: string; user: string; duration: string; date: string; note: string }[]>([
    { id: 'log-1', user: 'Krishna Lokhande', duration: '1h 30m', date: '01 Jul 2026', note: 'Initial setup' }
  ]);
  const [timeLogDuration, setTimeLogDuration] = useState('');
  const [timeLogNote, setTimeLogNote] = useState('');

  const [activityLogs, setActivityLogs] = useState<{ id: string; text: string; date: string }[]>([
    { id: 'act-1', text: 'Task initiated by Krishna Lokhande', date: '11:02 AM' }
  ]);

  // Click Outside refs to close dropdowns
  const projectRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);

  // Persist clients and services to localStorage
  useEffect(() => {
    localStorage.setItem('taskpad_clients', JSON.stringify(clientsList));
  }, [clientsList]);
  
  // --- Fetch Projects ---
  useEffect(() => {
    if (isOpen) {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProjectsList(data.map(p => p.name));
          }
        })
        .catch(err => console.error('Failed to fetch projects:', err));
    }
  }, [isOpen]);
  
  useEffect(() => {
    localStorage.setItem('taskpad_services', JSON.stringify(servicesList));
  }, [servicesList]);

  // ── Edit Mode: Pre-populate all form fields when editingTask changes ──
  useEffect(() => {
    if (!editingTask) return;
    
    setName(editingTask.name || '');
    setDescription(editingTask.description || '');
    setStartDate(editingTask.startDate || (() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    })());
    setDueDate(editingTask.dueDate || (() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    })());
    setStatus(editingTask.status || 'Pending');
    setPriority(editingTask.priority || 'High');
    setTime(editingTask.time || '11:00 AM - 12:30 PM');
    
    // Projects
    if (editingTask.projects && editingTask.projects.length > 0) {
      setSelectedProjects(editingTask.projects);
    } else if (editingTask.project) {
      setSelectedProjects([editingTask.project]);
    }
    
    // Assignees
    if (editingTask.assignees && editingTask.assignees.length > 0) {
      setSelectedAssignees(editingTask.assignees);
    } else if (editingTask.assignTo) {
      setSelectedAssignees([editingTask.assignTo]);
    }
    
    // Client, Service, Follower
    if (editingTask.client) setSelectedClient(editingTask.client);
    if (editingTask.service) setSelectedService(editingTask.service);
    if (editingTask.follower) setSelectedFollower(editingTask.follower);
    
    // Documents
    if (editingTask.documents) setUploadedDocuments(editingTask.documents);
    
    // SubTasks
    if (editingTask.subTasks) setSubTasks(editingTask.subTasks as any);
    
    // Checklist
    if (editingTask.checklist) setChecklist(editingTask.checklist);
    
    // Comments
    if (editingTask.comments) setComments(editingTask.comments);
    
    // Time Logs
    if (editingTask.timeLogs) {
      setTimeLogs(editingTask.timeLogs.map(l => ({ ...l, note: '' })));
    }
    
    // Recurrence
    if (editingTask.isRecurring) {
      setIsRecurring(true);
      if (editingTask.recurrence) {
        setRepeatType(editingTask.recurrence.repeatType);
        setRepeatEvery(editingTask.recurrence.repeatEvery);
        if (editingTask.recurrence.weekdays) setSelectedWeekdays(editingTask.recurrence.weekdays);
        if (editingTask.recurrence.repeatOn) setRepeatOn(editingTask.recurrence.repeatOn);
        if (editingTask.recurrence.customRule) setCustomRule(editingTask.recurrence.customRule);
        if (editingTask.recurrence.customDates) setCustomDates(editingTask.recurrence.customDates);
        setEndOption(editingTask.recurrence.endOption);
        if (editingTask.recurrence.endDate) setRecurrenceEndDate(editingTask.recurrence.endDate);
        if (editingTask.recurrence.occurrences) setOccurrences(editingTask.recurrence.occurrences);
      }
    }
    
    // Time
    if (editingTask.startTime) setStartTime(editingTask.startTime);
    if (editingTask.endTime) setEndTime(editingTask.endTime);
    if (editingTask.reminderBefore) setReminderBefore(editingTask.reminderBefore);
    
    // Per-task documents mandatory
    if (editingTask.documentsMandatory) setPerTaskDocumentsMandatory(editingTask.documentsMandatory);
    
  }, [editingTask]);

  // Delete handlers
  const handleDeleteClient = (clientName: string) => {
    setClientsList(prev => prev.filter(c => c !== clientName));
    if (selectedClient === clientName) {
      setSelectedClient(clientsList[0] || '');
    }
    addActivity(`Deleted client worksite: ${clientName}`);
  };

  const handleDeleteService = (serviceName: string) => {
    setServicesList(prev => prev.filter(s => s !== serviceName));
    if (selectedService === serviceName) {
      setSelectedService(servicesList[0] || '');
    }
    addActivity(`Deleted associated service: ${serviceName}`);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (projectRef.current && !projectRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
      if (clientRef.current && !clientRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
      if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Logger helper to add action entries
  const addActivity = (text: string) => {
    const newAct = {
      id: `act-${Date.now()}`,
      text,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setActivityLogs((prev) => [newAct, ...prev]);
  };

  const [documentsMandatory, setDocumentsMandatory] = useState<boolean>(false); // Global setting from admin
  const [perTaskDocumentsMandatory, setPerTaskDocumentsMandatory] = useState<boolean>(false); // Per-task setting

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  // --- Projects Dropdown Handlers ---

  const handleToggleProject = (proj: string) => {
    if (selectedProjects.includes(proj)) {
      setSelectedProjects((prev) => prev.filter((p) => p !== proj));
      addActivity(`Removed project context: ${proj}`);
    } else {
      setSelectedProjects((prev) => [...prev, proj]);
      addActivity(`Added project context: ${proj}`);
    }
  };

  const handleSelectAllProjects = () => {
    setSelectedProjects([...projectsList]);
    addActivity('Selected all projects');
  };

  const handleClearAllProjects = () => {
    setSelectedProjects([]);
    addActivity('Cleared all selected projects');
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim() && !projectsList.includes(newProjectName.trim())) {
      const addedProj = newProjectName.trim();
      
      try {
        const payload = {
          name: addedProj,
          creator: loggedInUser?.name || 'User',
          color: '#3b82f6',
          hasEndDate: false,
        };
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setProjectsList((prev) => [...prev, addedProj]);
          setSelectedProjects((prev) => [...prev, addedProj]);
          setNewProjectName('');
          setShowAddProjectInput(false);
          addActivity(`Created and assigned project: ${addedProj}`);
        } else {
          console.error('Failed to create project');
        }
      } catch (err) {
        console.error('Error creating project:', err);
      }
    }
  };

  // --- Assignees Handlers ---
  const handleToggleAssignee = (member: string) => {
    if (selectedAssignees.includes(member)) {
      setSelectedAssignees((prev) => prev.filter((m) => m !== member));
      addActivity(`Removed assignee: ${member}`);
    } else {
      setSelectedAssignees((prev) => [...prev, member]);
      addActivity(`Assigned task to: ${member}`);
    }
  };

  // --- Dynamic Inline Adders ---
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName.trim() && !clientsList.includes(newClientName.trim())) {
      const addedClient = newClientName.trim();
      setClientsList((prev) => [...prev, addedClient]);
      setSelectedClient(addedClient);
      setNewClientName('');
      setShowAddClientInput(false);
      addActivity(`Registered client workspace: ${addedClient}`);
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newServiceName.trim() && !servicesList.includes(newServiceName.trim())) {
      const addedService = newServiceName.trim();
      setServicesList((prev) => [...prev, addedService]);
      setSelectedService(addedService);
      setNewServiceName('');
      setShowAddServiceInput(false);
      addActivity(`Registered enterprise service: ${addedService}`);
    }
  };

  // --- Drag & Drop File Upload ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('http://localhost:8081/api/upload', { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            urls.push('http://localhost:8081' + data.url);
          } else {
            urls.push(file.name);
          }
        } catch {
          urls.push(file.name);
        }
        addActivity(`Uploaded file: ${file.name}`);
      }
      setUploadedDocuments((prev) => [...prev, ...urls]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('http://localhost:8081/api/upload', { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            urls.push('http://localhost:8081' + data.url);
          } else {
            urls.push(file.name);
          }
        } catch {
          urls.push(file.name);
        }
        addActivity(`Uploaded file: ${file.name}`);
      }
      setUploadedDocuments((prev) => [...prev, ...urls]);
    }
  };

  const handleRemoveDocument = (fileName: string) => {
    setUploadedDocuments((prev) => prev.filter((d) => d !== fileName));
    addActivity(`Deleted document: ${fileName}`);
  };

  // --- Dynamic Sub Task Handlers ---
  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubTaskName.trim()) {
      const newSub = {
        id: `sub-${Date.now()}`,
        name: newSubTaskName.trim(),
        completed: false,
        date: newSubTaskDate || '',
        comments: []
      };
      setSubTasks((prev) => [...prev, newSub]);
      addActivity(`Added sub task: "${newSubTaskName.trim()}"`);
      setNewSubTaskName('');
    }
  };
  
  // Toggle expanding subtask comments in TaskModal
  const toggleModalSubtaskComments = (id: string) => {
    setSubtaskExpandedId(subtaskExpandedId === id ? null : id);
    setSubtaskNewComment('');
  };
  
  // Add comment to subtask in TaskModal
  const addModalSubtaskComment = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!subtaskNewComment.trim()) return;
    
    const updatedSubTasks = subTasks.map(st => {
      if (st.id === id) {
        const newComment = {
          id: `sub-comment-${Date.now()}`,
          author: loggedInUser?.name || 'Unknown',
          text: subtaskNewComment.trim(),
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return { ...st, comments: [...(st.comments || []), newComment] };
      }
      return st;
    });
    setSubTasks(updatedSubTasks);
    setSubtaskNewComment('');
  };

  const handleToggleSubTask = (id: string) => {
    setSubTasks((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          addActivity(`Sub task "${sub.name}" marked ${!sub.completed ? 'Complete' : 'Incomplete'}`);
          return { ...sub, completed: !sub.completed };
        }
        return sub;
      })
    );
  };

  const handleToggleAllSubTasks = () => {
    const allCompleted = subTasks.every(st => st.completed);
    setSubTasks(prev => prev.map(st => ({ ...st, completed: !allCompleted })));
    addActivity(`All sub tasks marked ${!allCompleted ? 'Complete' : 'Incomplete'}`);
  };

  const handleAssignSubTask = (id: string, assignTo: string) => {
    setSubTasks(prev => prev.map(st => st.id === id ? { ...st, assignTo } : st));
    addActivity(`Sub task assigned to: ${assignTo}`);
  };

  const handleRemoveSubTask = (id: string, subName: string) => {
    setSubTasks((prev) => prev.filter((sub) => sub.id !== id));
    addActivity(`Removed sub task: "${subName}"`);
  };

  // --- Dynamic Checklist Handlers ---
  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChecklistItem.trim()) {
      const newCheck = {
        id: `chk-${Date.now()}`,
        name: newChecklistItem.trim(),
        checked: false
      };
      setChecklist((prev) => [...prev, newCheck]);
      addActivity(`Added checklist item: "${newChecklistItem.trim()}"`);
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          addActivity(`Checklist item "${item.name}" toggled ${!item.checked ? 'Checked' : 'Unchecked'}`);
          return { ...item, checked: !item.checked };
        }
        return item;
      })
    );
  };

  const handleRemoveChecklistItem = (id: string, itemName: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
    addActivity(`Removed checklist item: "${itemName}"`);
  };

  // --- Tab Interactivity Handlers ---
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      const newComment = {
        id: `com-${Date.now()}`,
        author: 'Krishna Lokhande',
        text: newCommentText.trim(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setComments((prev) => [...prev, newComment]);
      addActivity(`Added discussion comment: "${newCommentText.substring(0, 20)}..."`);
      setNewCommentText('');
    }
  };

  const handleAddTimeLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLogDuration.trim()) {
      const newLog = {
        id: `log-${Date.now()}`,
        user: 'Krishna Lokhande',
        duration: timeLogDuration.trim(),
        date: '01 Jul 2026',
        note: timeLogNote.trim() || 'Work session'
      };
      setTimeLogs((prev) => [...prev, newLog]);
      addActivity(`Logged ${timeLogDuration.trim()} time spent`);
      setTimeLogDuration('');
      setTimeLogNote('');
    }
  };


  // --- Submit / Reset / Save Handlers ---
  const handleSaveSubmit = (e: React.FormEvent, isDraftFlag: boolean = false) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Task Name is required.');
      return;
    }


    if (!isDraftFlag) {
      if (loggedInUser?.role !== 'admin' && (documentsMandatory || perTaskDocumentsMandatory) && (!uploadedDocuments || uploadedDocuments.length === 0)) {
              setError('Documents are mandatory. Please attach at least one document before submitting.');
              return;
            }

      if (!dueDate) {
        setError('Due Date (Start Date) is required.');
        return;
      }

      if (!status) {
        setError('Status is required.');
        return;
      }
      if (!priority) {
        setError('Priority is required.');
        return;
      }
      if (selectedProjects.length === 0) {
        setError('At least one Project must be selected.');
        return;
      }
      if (selectedAssignees.length === 0) {
        setError('At least one Assignee Employee must be selected.');
        return;
      }

      // If Recurring Task is ON
      if (isRecurring) {
        if (!repeatType) {
          setError('Repeat Type is required for recurring tasks.');
          return;
        }
        if (!dueDate) {
          setError('Start Date (Due Date) is required for recurring tasks.');
          return;
        }
        // Time is optional, but if selected (i.e. startTime or endTime is filled) then Start Time is required
        if ((startTime.trim() || endTime.trim()) && !startTime.trim()) {
          setError('Start Time is required when task time is selected.');
          return;
        }
      }
    }

    // Build the consolidated display time string
    let displayTime = time;
    if (startTime.trim()) {
      displayTime = endTime.trim() ? `${startTime.trim()} - ${endTime.trim()}` : startTime.trim();
    }

    // Build the task data object
    const taskData = {
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      project: selectedProjects.length > 0 ? selectedProjects[0] : 'Net Access Internet',
      projects: selectedProjects,
      priority,
      startDate,
      dueDate,
      time: displayTime,
      assignTo: selectedAssignees.length > 0 ? selectedAssignees[0] : 'Krishna Lokhande',
      assignees: selectedAssignees,
      status: isDraftFlag ? 'Pending' : status,
      client: selectedClient,
      service: selectedService,
      follower: selectedFollower,
      documents: uploadedDocuments,
      subTasks,
      checklist,
      comments,
      timeLogs: timeLogs.map(l => ({ id: l.id, user: l.user, duration: l.duration, date: l.date })),
      isDraft: isDraftFlag,
      isRecurring,
      documentsMandatory: perTaskDocumentsMandatory,
      recurrence: isRecurring
        ? {
            repeatType,
            repeatEvery,
            weekdays: repeatType === 'Weekly' ? selectedWeekdays : undefined,
            repeatOn: repeatType === 'Monthly' ? repeatOn : undefined,
            customRule: repeatType === 'Custom' ? customRule : undefined,
            customDates: repeatType === 'Custom' ? customDates : undefined,
            endOption,
            endDate: endOption === 'On Date' ? recurrenceEndDate : undefined,
            occurrences: endOption === 'After Occurrences' ? occurrences : undefined,
          }
        : undefined,
      startTime: startTime.trim() || undefined,
      endTime: endTime.trim() || undefined,
      reminderBefore: startTime.trim() ? reminderBefore : undefined,
    };

    if (editingTask && onUpdate) {
      // Edit mode: call onUpdate with the full task including ID
      onUpdate({
        ...editingTask,
        ...taskData,
        id: editingTask.id,
      });
    } else {
      // Create mode: call onSave without ID
      onSave(taskData);
    }

    // Reset Form fields
    setName('');
    setDescription('');
    setSelectedProjects(['Net Access Internet']);
    setSelectedAssignees(['Krishna Lokhande']);
    setDueDate('2026-07-01');
    setStatus('Pending');
    setPriority('High');
    setTime('11:00 AM - 12:30 PM');
    setUploadedDocuments([]);
    setSubTasks([]);
    setChecklist([]);
    setError('');

    // Reset recurrence states
    setIsRecurring(false);
    setRepeatType('Daily');
    setRepeatEvery(1);
    setSelectedWeekdays([]);
    setRepeatOn('Same date of every month');
    setCustomRule('');
    setCustomDates([]);
    setCustomDateInput('');
    setEndOption('Never');
    setRecurrenceEndDate('');
    setOccurrences(10);
    setStartTime('');
    setEndTime('');
    setReminderBefore('30 minutes before');

    onClose();
  };

  // Render initials
  const getInitials = (nStr: string) => {
    return nStr
      .split(' ')
      .map((x) => x[0])
      .join('')
      .toUpperCase();
  };

  // Helper arrays for filters
  const filteredProjects = projectsList.filter((p) =>
    p.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredAssignees = users.map(u => u.name).filter((t) =>
    t.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 select-none overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Immersive Window */}
      <div
        className={`relative z-10 w-full max-w-5xl rounded-2xl shadow-2xl border flex flex-col md:flex-row h-[90vh] overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#141C38] border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Left Form inputs section (60%) */}
        <div className="flex-[1.4] flex flex-col border-r border-slate-800/15 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Header Title */}
          <div className="flex items-center justify-between border-b border-slate-800/10 pb-4">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">WORKSPACE TASK CREATOR</span>
              <h3 className="text-lg font-bold tracking-tight">{editingTask ? 'Edit Workspace Task' : 'Create Live Workspace Task'}</h3>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Task Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Redesign Landing Page Mockups"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value) setError('');
                }}
                className={`w-full text-xs px-4 py-2.5 rounded-xl border outline-none transition focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark'
                    ? 'bg-[#0D1631] border-slate-700 text-slate-100 placeholder-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
              <textarea
                placeholder="Describe key requirements, links, or expectations..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full text-xs px-4 py-2.5 rounded-xl border outline-none transition focus:ring-2 focus:ring-cyan-400 resize-none ${
                  theme === 'dark'
                    ? 'bg-[#0D1631] border-slate-700 text-slate-100 placeholder-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Projects & Assignees Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Multi-select Projects dropdown */}
              <div className="space-y-1.5 relative" ref={projectRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Projects Contexts</span>
                  </span>
                </label>

                {/* Multi selection display box */}
                <div
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className={`w-full min-h-[38px] text-xs px-3 py-1.5 rounded-xl border flex flex-wrap items-center gap-1 cursor-pointer transition focus:ring-2 focus:ring-cyan-400 ${
                    theme === 'dark'
                      ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {selectedProjects.length === 0 ? (
                    <span className="text-slate-400">Select projects...</span>
                  ) : (
                    selectedProjects.map((p) => (
                      <span
                        key={p}
                        className="bg-cyan-500/15 border border-cyan-400/20 text-cyan-400 rounded-lg text-[10px] font-bold px-2 py-0.5 flex items-center gap-1 group/chip hover:bg-cyan-500/25"
                      >
                        <span>{p}</span>
                        <X
                          className="w-2.5 h-2.5 cursor-pointer text-cyan-400/70 hover:text-cyan-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleProject(p);
                          }}
                        />
                      </span>
                    ))
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto flex-shrink-0" />
                </div>

                {/* Dropdown Menu */}
                {isProjectDropdownOpen && (
                  <div
                    className={`absolute z-30 left-0 right-0 mt-1 rounded-xl shadow-2xl border p-3 flex flex-col gap-2 max-h-64 overflow-y-auto ${
                      theme === 'dark'
                        ? 'bg-[#141C38] border-slate-800 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {/* Search Field */}
                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-900/30 rounded-lg border border-slate-800/15">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search workspace projects..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        className="bg-transparent border-none text-[11px] outline-none w-full"
                      />
                    </div>

                    {/* Bulk Selection actions */}
                    <div className="flex justify-between text-[10px] px-1 pb-1 border-b border-slate-800/10">
                      <button
                        type="button"
                        onClick={handleSelectAllProjects}
                        className="text-cyan-400 font-semibold hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllProjects}
                        className="text-slate-400 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* List of projects */}
                    <div className="space-y-1 overflow-y-auto max-h-36 pr-1">
                      {filteredProjects.map((p) => {
                        const isChecked = selectedProjects.includes(p);
                        return (
                          <div
                            key={p}
                            onClick={() => handleToggleProject(p)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer hover:bg-slate-800/30 ${
                              isChecked ? 'text-cyan-400 font-medium' : 'text-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-cyan-500 rounded"
                            />
                            <span>{p}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* + Add New Project action */}
                    <div className="border-t border-slate-800/10 pt-2">
                      {!showAddProjectInput ? (
                        <button
                          type="button"
                          onClick={() => setShowAddProjectInput(true)}
                          className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Create New Project</span>
                        </button>
                      ) : (
                        <form onSubmit={handleCreateProjectSubmit} className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Project name..."
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className={`text-[10px] px-2 py-1 rounded border outline-none w-full ${
                              theme === 'dark'
                                ? 'bg-slate-900 border-slate-700'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          />
                          <button
                            type="submit"
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] px-2 py-1 rounded"
                          >
                            Add
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-select Assignee dropdown */}
              <div className="space-y-1.5 relative" ref={assigneeRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assignee Team</label>

                {/* Selected assignee chips selection box */}
                <div
                  onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                  className={`w-full min-h-[38px] text-xs px-3 py-1.5 rounded-xl border flex flex-wrap items-center gap-1.5 cursor-pointer transition focus:ring-2 focus:ring-cyan-400 ${
                    theme === 'dark'
                      ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {selectedAssignees.length === 0 ? (
                    <span className="text-slate-400">Select assignees...</span>
                  ) : (
                    selectedAssignees.map((m) => {
                      const initials = getInitials(m);
                      return (
                        <span
                          key={m}
                          className="bg-pink-500/10 border border-pink-400/20 text-pink-300 rounded-full text-[10px] font-bold pl-1 pr-2 py-0.5 flex items-center gap-1.5 hover:bg-pink-500/20 transition"
                        >
                          <span className="w-4 h-4 rounded-full bg-pink-500 text-slate-950 font-black text-[8px] flex items-center justify-center flex-shrink-0">
                            {initials}
                          </span>
                          <span>{m}</span>
                          <X
                            className="w-2.5 h-2.5 cursor-pointer text-pink-400/70 hover:text-pink-400 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAssignee(m);
                            }}
                          />
                        </span>
                      );
                    })
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto flex-shrink-0" />
                </div>

                {/* Dropdown Menu */}
                {isAssigneeDropdownOpen && (
                  <div
                    className={`absolute z-30 left-0 right-0 mt-1 rounded-xl shadow-2xl border p-3 flex flex-col gap-2 max-h-64 overflow-y-auto ${
                      theme === 'dark'
                        ? 'bg-[#141C38] border-slate-800 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {/* Search Field */}
                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-900/30 rounded-lg border border-slate-800/15">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search team..."
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        className="bg-transparent border-none text-[11px] outline-none w-full"
                      />
                    </div>

                    {/* Bulk Selection actions */}
                    <div className="flex justify-between text-[10px] px-1 pb-1 border-b border-slate-800/10">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAssignees(users.map(u => u.name));
                          addActivity('Selected all assignees');
                        }}
                        className="text-cyan-400 font-semibold hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAssignees([]);
                          addActivity('Cleared all assignees');
                        }}
                        className="text-slate-400 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* List of teammates */}
                    <div className="space-y-1 overflow-y-auto max-h-40 pr-1">
                      {filteredAssignees.map((member) => {
                        const isChecked = selectedAssignees.includes(member);
                        return (
                          <div
                            key={member}
                            onClick={() => handleToggleAssignee(member)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer hover:bg-slate-800/30 ${
                              isChecked ? 'text-cyan-400 font-medium' : 'text-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-pink-500 rounded"
                            />
                            <div className="w-4.5 h-4.5 rounded-full bg-slate-800 text-[8px] font-bold flex items-center justify-center text-slate-300">
                              {getInitials(member)}
                            </div>
                            <span>{member}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Client & Service options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Client Selection with Add/Delete inline */}
              <div className="space-y-1.5 relative" ref={clientRef}>
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Client Worksite</span>
                  </label>
                  {!showAddClientInput && (
                    <button
                      type="button"
                      onClick={() => setShowAddClientInput(true)}
                      className="text-[9px] text-cyan-400 hover:underline font-bold"
                    >
                      + Add Client
                    </button>
                  )}
                </div>

                {showAddClientInput ? (
                  <form onSubmit={handleCreateClient} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Type client name..."
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className={`text-xs px-3 py-2 rounded-xl border outline-none w-full ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-slate-700 text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    />
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] px-3 py-2 rounded-xl"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddClientInput(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-2 py-2 rounded-xl"
                    >
                      x
                    </button>
                  </form>
                ) : (
                  <>
                    <div
                      onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                      className={`w-full min-h-[38px] text-xs px-3 py-2 rounded-xl border flex items-center justify-between cursor-pointer transition focus:ring-2 focus:ring-cyan-400 ${
                        theme === 'dark'
                          ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{selectedClient || "Select client..."}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {isClientDropdownOpen && (
                      <div
                        className={`absolute z-40 left-0 right-0 mt-1 rounded-xl shadow-2xl border p-3 flex flex-col gap-2 max-h-48 overflow-y-auto ${
                          theme === 'dark'
                            ? 'bg-[#141C38] border-slate-800 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        {clientsList.map((cl) => (
                          <div key={cl} className="flex items-center justify-between gap-2 group">
                            <div
                              onClick={() => {
                                setSelectedClient(cl);
                                addActivity(`Client changed to: ${cl}`);
                                setIsClientDropdownOpen(false);
                              }}
                              className={`flex-1 text-xs px-2 py-1 rounded-lg cursor-pointer hover:bg-slate-800/30 ${
                                selectedClient === cl ? 'text-cyan-400 font-medium' : ''
                              }`}
                            >
                              {cl}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(cl);
                              }}
                              className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Service Selection with Add/Delete inline */}
              <div className="space-y-1.5 relative" ref={serviceRef}>
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Associated Service</span>
                  </label>
                  {!showAddServiceInput && (
                    <button
                      type="button"
                      onClick={() => setShowAddServiceInput(true)}
                      className="text-[9px] text-cyan-400 hover:underline font-bold"
                    >
                      + Add Service
                    </button>
                  )}
                </div>

                {showAddServiceInput ? (
                  <form onSubmit={handleCreateService} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Service title..."
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className={`text-xs px-3 py-2 rounded-xl border outline-none w-full ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-slate-700 text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    />
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] px-3 py-2 rounded-xl"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddServiceInput(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-2 py-2 rounded-xl"
                    >
                      x
                    </button>
                  </form>
                ) : (
                  <>
                    <div
                      onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                      className={`w-full min-h-[38px] text-xs px-3 py-2 rounded-xl border flex items-center justify-between cursor-pointer transition focus:ring-2 focus:ring-cyan-400 ${
                        theme === 'dark'
                          ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{selectedService || "Select service..."}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {isServiceDropdownOpen && (
                      <div
                        className={`absolute z-40 left-0 right-0 mt-1 rounded-xl shadow-2xl border p-3 flex flex-col gap-2 max-h-48 overflow-y-auto ${
                          theme === 'dark'
                            ? 'bg-[#141C38] border-slate-800 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        {servicesList.map((sv) => (
                          <div key={sv} className="flex items-center justify-between gap-2 group">
                            <div
                              onClick={() => {
                                setSelectedService(sv);
                                addActivity(`Associated service updated: ${sv}`);
                                setIsServiceDropdownOpen(false);
                              }}
                              className={`flex-1 text-xs px-2 py-1 rounded-lg cursor-pointer hover:bg-slate-800/30 ${
                                selectedService === sv ? 'text-cyan-400 font-medium' : ''
                              }`}
                            >
                              {sv}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteService(sv);
                              }}
                              className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Priority, Status, Start Date, Due Date, Followers */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value as Priority);
                    addActivity(`Priority set to: ${e.target.value}`);
                  }}
                  className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="Critical">🛑 Critical</option>
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🟢 Low</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as TaskStatus);
                    addActivity(`Status assigned as: ${e.target.value}`);
                  }}
                  className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Incomplete">Incomplete</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    addActivity(`Start date set: ${e.target.value}`);
                  }}
                  className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    addActivity(`Target date scheduled: ${e.target.value}`);
                  }}
                  className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                />
              </div>

              {/* Follower */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Follower</label>
                <select
                  value={selectedFollower}
                  onChange={(e) => {
                    setSelectedFollower(e.target.value);
                    addActivity(`Follower registered: ${e.target.value}`);
                  }}
                  className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {followersList.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

{/* Task Time & Recurrence Engine */}
            <div className={`border rounded-xl p-4 space-y-4 ${
              theme === 'dark' ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Task Time & Recurrence Engine</span>
                </span>
              </div>

              {/* Time Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      addActivity(`Start time set to ${e.target.value}`);
                    }}
                    className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                      theme === 'dark'
                        ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      addActivity(`End time set to ${e.target.value}`);
                    }}
                    className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                      theme === 'dark'
                        ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reminder Before</label>
                  <select
                    value={reminderBefore}
                    onChange={(e) => {
                      setReminderBefore(e.target.value);
                      addActivity(`Reminder scheduled: ${e.target.value}`);
                    }}
                    className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                      theme === 'dark'
                        ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="5 minutes before">5 minutes before</option>
                    <option value="10 minutes before">10 minutes before</option>
                    <option value="30 minutes before">30 minutes before</option>
                    <option value="1 hour before">1 hour before</option>
                    <option value="1 day before">1 day before</option>
                  </select>
                </div>
              </div>

              {/* Recurring Task Checkbox/Toggle */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/10">
                <input
                  type="checkbox"
                  id="recurring-checkbox"
                  checked={isRecurring}
                  onChange={(e) => {
                    setIsRecurring(e.target.checked);
                    addActivity(`Recurring task turned ${e.target.checked ? 'ON' : 'OFF'}`);
                  }}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 accent-cyan-500"
                />
                <label htmlFor="recurring-checkbox" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                  Recurring Task
                </label>
              </div>
              {loggedInUser?.role === 'admin' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/10">
                  <input
                    type="checkbox"
                    id="per-task-documents-mandatory"
                    checked={perTaskDocumentsMandatory}
                    onChange={(e) => {
                      setPerTaskDocumentsMandatory(e.target.checked);
                      addActivity(`Per-task documents mandatory turned ${e.target.checked ? 'ON' : 'OFF'}`);
                    }}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <label htmlFor="per-task-documents-mandatory" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                    Documents Mandatory for this Task
                  </label>
                </div>
              )}

              {/* Recurrence Settings (Only if isRecurring is ON) */}
              {isRecurring && (
                <div className="space-y-4 pt-3 border-t border-slate-800/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Repeat Type</label>
                      <select
                        value={repeatType}
                        onChange={(e) => {
                          setRepeatType(e.target.value as any);
                          addActivity(`Repeat type set to: ${e.target.value}`);
                        }}
                        className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                          theme === 'dark'
                            ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    {repeatType !== 'Custom' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Repeat every
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={repeatEvery}
                            onChange={(e) => setRepeatEvery(parseInt(e.target.value) || 1)}
                            className={`w-20 text-xs px-3 py-2 rounded-xl border outline-none ${
                              theme === 'dark'
                                ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          />
                          <span className="text-xs text-slate-400">
                            {repeatType === 'Daily' ? 'day(s)' : repeatType === 'Weekly' ? 'week(s)' : 'month(s)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Weekly details */}
                  {repeatType === 'Weekly' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select weekdays</label>
                      <div className="flex flex-wrap gap-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          const isSelected = selectedWeekdays.includes(day);
                          return (
                            <button
                              type="button"
                              key={day}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedWeekdays(selectedWeekdays.filter(d => d !== day));
                                } else {
                                  setSelectedWeekdays([...selectedWeekdays, day]);
                                }
                              }}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                isSelected
                                  ? 'bg-cyan-500 text-slate-950 font-bold'
                                  : theme === 'dark'
                                  ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-950'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Monthly details */}
                  {repeatType === 'Monthly' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Repeat on</label>
                      <select
                        value={repeatOn}
                        onChange={(e) => setRepeatOn(e.target.value)}
                        className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                          theme === 'dark'
                            ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="Same date of every month">Same date of every month</option>
                        <option value="First Monday">First Monday</option>
                        <option value="Last Friday">Last Friday</option>
                        <option value="Custom date">Custom date</option>
                      </select>
                    </div>
                  )}

                  {/* Custom details — specific date picker */}
                  {repeatType === 'Custom' && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Specific Dates</label>
                      
                      {/* Add date input */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={customDateInput}
                          onChange={(e) => setCustomDateInput(e.target.value)}
                          className={`flex-1 text-xs px-3 py-2 rounded-xl border outline-none ${
                            theme === 'dark'
                              ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        />
                        <button
                          type="button"
                          disabled={!customDateInput || customDates.includes(customDateInput)}
                          onClick={() => {
                            if (customDateInput && !customDates.includes(customDateInput)) {
                              setCustomDates(prev => [...prev, customDateInput].sort());
                              setCustomDateInput('');
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>

                      {/* Selected dates chips */}
                      {customDates.length > 0 ? (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {customDates.map((date) => (
                            <div
                              key={date}
                              className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${
                                theme === 'dark'
                                  ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-300'
                                  : 'bg-cyan-50 border-cyan-200 text-cyan-700'
                              }`}
                            >
                              <span className="font-semibold">
                                {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCustomDates(prev => prev.filter(d => d !== date))}
                                className="text-slate-400 hover:text-rose-400 transition ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-[10px] italic ${ theme === 'dark' ? 'text-slate-500' : 'text-slate-400' }`}>
                          No dates added yet. Use the picker above to add specific dates.
                        </p>
                      )}

                      {/* Optional text note */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Note (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., Monthly board review, every second Tuesday"
                          value={customRule}
                          onChange={(e) => setCustomRule(e.target.value)}
                          className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                            theme === 'dark'
                              ? 'bg-[#0D1631] border-slate-700 text-slate-200 placeholder:text-slate-600'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* End Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/10">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">End Option</label>
                      <select
                        value={endOption}
                        onChange={(e) => {
                          setEndOption(e.target.value as any);
                          addActivity(`End option set to: ${e.target.value}`);
                        }}
                        className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                          theme === 'dark'
                            ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="Never">Never</option>
                        <option value="On Date">On Date</option>
                        <option value="After Occurrences">After Number of Occurrences</option>
                      </select>
                    </div>

                    {endOption === 'On Date' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">End Date</label>
                        <input
                          type="date"
                          value={recurrenceEndDate}
                          onChange={(e) => setRecurrenceEndDate(e.target.value)}
                          className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                            theme === 'dark'
                              ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        />
                      </div>
                    )}

                    {endOption === 'After Occurrences' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Occurrences</label>
                        <input
                          type="number"
                          min="1"
                          value={occurrences}
                          onChange={(e) => setOccurrences(parseInt(e.target.value) || 1)}
                          className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                            theme === 'dark'
                              ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Subtasks Section */}
            <div className="border border-slate-800/10 rounded-xl p-3 bg-slate-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ListTodo className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dynamic Subtasks ({subTasks.length})</span>
                </span>
                {subTasks.length > 0 && (
                  <label className="text-[10px] font-bold text-cyan-400 cursor-pointer flex items-center gap-1">
                    <input
                      type="checkbox"
                      className="accent-cyan-500"
                      checked={subTasks.length > 0 && subTasks.every(st => st.completed)}
                      onChange={handleToggleAllSubTasks}
                    />
                    Select All
                  </label>
                )}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom sub task detail..."
                  value={newSubTaskName}
                  onChange={(e) => setNewSubTaskName(e.target.value)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border outline-none w-full ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                />
                <button
                  type="submit"
                  className="bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </form>

              {/* Subtasks list */}
              {subTasks.length > 0 && (
                <div className="space-y-1.5 pr-1">
                  {subTasks.map((sub) => (
                    <div key={sub.id} className="rounded-lg border border-slate-800/10 overflow-hidden bg-slate-900/30">
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => handleToggleSubTask(sub.id)}
                            className="accent-cyan-500 flex-shrink-0"
                          />
                          <span className={`text-[11px] truncate flex-1 ${sub.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                            {sub.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleModalSubtaskComments(sub.id)}
                            className="text-slate-400 hover:text-cyan-400"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <select
                            value={sub.assignTo || ''}
                            onChange={(e) => handleAssignSubTask(sub.id, e.target.value)}
                            className={`text-[10px] px-1 py-0.5 rounded border outline-none ${
                              theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                              <option key={u.name} value={u.name}>{u.name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubTask(sub.id, sub.name)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Expanded comments for this subtask in TaskModal */}
                      {subtaskExpandedId === sub.id && (
                        <div className="border-t border-slate-700/30 px-2 pb-2 pt-2 space-y-2">
                          {/* Existing comments */}
                          {(sub.comments || []).length > 0 && (
                            <div className="space-y-1">
                              {(sub.comments || []).map(comment => (
                                <div key={comment.id} className="space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-cyan-400">{comment.author}</span>
                                    <span className="text-[8px] font-mono text-slate-500">{comment.date}</span>
                                  </div>
                                  <p className={`text-[10px] px-1.5 py-1 rounded border leading-relaxed ${
                                    theme === 'dark' ? 'bg-slate-900 border-slate-700/30 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                                  }`}>
                                    {comment.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Add new comment form */}
                          <form onSubmit={(e) => addModalSubtaskComment(e, sub.id)} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={subtaskNewComment}
                              onChange={(e) => setSubtaskNewComment(e.target.value)}
                              className={`flex-1 text-[10px] px-2 py-1 rounded border outline-none ${
                                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                              }`}
                            />
                            <button
                              type="submit"
                              disabled={!subtaskNewComment.trim()}
                              className={`text-[10px] px-2 py-1 rounded border ${
                                subtaskNewComment.trim() 
                                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
                                  : 'bg-slate-700/20 text-slate-500 border-slate-700/30 cursor-not-allowed'
                              }`}
                            >
                              Send
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checklist Section */}
            <div className="border border-slate-800/10 rounded-xl p-3 bg-slate-950/20 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Aesthetic Checklist ({checklist.length})</span>
              </span>

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom checklist item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border outline-none w-full ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                />
                <button
                  type="submit"
                  className="bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </form>

              {/* Checklist items list */}
              {checklist.length > 0 && (
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-900/30 px-2 py-1.5 rounded-lg border border-slate-800/10">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          className="accent-cyan-500"
                        />
                        <span className={`text-[11px] ${item.checked ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                          {item.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id, item.name)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Collaboration Section (40%) */}
        <div className="flex-1 flex flex-col bg-slate-950/20 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Header Close button for Desktop */}
          <div className="hidden md:flex items-center justify-between pb-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COLLABORATION ENGINE</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drag and Drop Document Upload Area */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Document Attachments</span>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition duration-200 ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/5'
                  : theme === 'dark'
                  ? 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Paperclip className="w-6 h-6 text-cyan-400 animate-pulse" />
              <div>
                <p className="text-[11px] font-semibold">Drag & Drop files here, or <span className="text-cyan-400">browse</span></p>
                <p className="text-[9px] text-slate-500 mt-0.5">Supports images, PDF, spreadsheets</p>
              </div>
            </div>

            {/* List of uploaded items */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {uploadedDocuments.map((doc) => (
                  <div key={doc} className="flex items-center justify-between bg-[#141C38] px-2.5 py-1.5 rounded-lg border border-slate-800/30 text-[10px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span
                        onClick={() => doc.startsWith('http') && window.open(doc, '_blank')}
                        className={`truncate font-medium ${doc.startsWith('http') ? 'text-cyan-400 cursor-pointer hover:underline' : 'text-slate-300'}`}
                        title={doc.startsWith('http') ? 'Click to open' : doc}
                      >
                        {doc.startsWith('http') ? doc.split('/').pop() : doc}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(doc)}
                      className="text-slate-400 hover:text-red-400 flex-shrink-0 ml-1.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Tabs Navigation */}
          <div className="space-y-3 flex-1 flex flex-col">
            <div className={`p-1 rounded-xl flex items-center border ${
              theme === 'dark' ? 'bg-[#0D1631] border-slate-800/80' : 'bg-slate-100 border-slate-200'
            }`}>
              {(['comments', 'attachments', 'activity', 'timelog'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all capitalize ${
                    activeTab === tab
                      ? theme === 'dark'
                        ? 'bg-slate-800 text-cyan-400 shadow-md border border-slate-700/50'
                        : 'bg-white text-cyan-600 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'timelog' ? 'Time Log' : tab === 'activity' ? 'Activity' : tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 min-h-[180px] bg-slate-900/10 rounded-xl p-3 border border-slate-800/10 flex flex-col justify-between">
              {/* --- COMMENTS TAB --- */}
              {activeTab === 'comments' && (
                <div className="flex-1 flex flex-col justify-between h-full space-y-2">
                  <div className="space-y-2 overflow-y-auto max-h-[180px] pr-1 flex-1">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-900/20 p-2.5 rounded-xl border border-slate-800/20 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-extrabold text-cyan-400 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-slate-300">
                              {getInitials(comment.author)}
                            </span>
                            {comment.author}
                          </span>
                          <span className="text-slate-500 font-mono">{comment.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal pl-5">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-800/10">
                    <input
                      type="text"
                      placeholder="Post a work updates comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className={`text-[11px] px-3 py-2 rounded-xl border outline-none w-full ${
                        theme === 'dark'
                          ? 'bg-[#0D1631] border-slate-700 text-slate-100 placeholder-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    />
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs p-2 rounded-xl flex items-center justify-center"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {/* --- ATTACHMENTS TAB --- */}
              {activeTab === 'attachments' && (
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div className="space-y-2 overflow-y-auto max-h-[180px] pr-1 flex-1">
                    {uploadedDocuments.length === 0 ? (
                      <div className="h-28 flex flex-col items-center justify-center text-center text-slate-500 text-[11px] space-y-1.5">
                        <Paperclip className="w-5 h-5 opacity-40 text-slate-400" />
                        <span>No files attached yet. Drop files above.</span>
                      </div>
                    ) : (
                      uploadedDocuments.map((doc) => (
                        <div key={doc} className="flex items-center justify-between bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/10 text-[11px]">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <span className="truncate font-semibold text-slate-300">{doc}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-md font-mono">
                            Ready
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs py-2 rounded-xl hover:bg-cyan-500/20 font-semibold"
                  >
                    + Attach Another Document
                  </button>
                </div>
              )}

              {/* --- ACTIVITY LOG TAB --- */}
              {activeTab === 'activity' && (
                <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-2.5">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex gap-2 text-[10px]">
                      <span className="text-cyan-400 font-bold font-mono text-[9px] bg-slate-900/40 px-1.5 py-0.5 rounded h-fit">
                        {log.date}
                      </span>
                      <p className="text-slate-300 mt-0.5 leading-normal">{log.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* --- TIME LOG TAB --- */}
              {activeTab === 'timelog' && (
                <div className="flex-1 flex flex-col justify-between h-full space-y-2">
                  <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-1 flex-1">
                    {timeLogs.map((log) => (
                      <div key={log.id} className="bg-slate-900/20 px-2.5 py-1.5 rounded-xl border border-slate-800/10 flex items-center justify-between text-[10px]">
                        <div className="truncate">
                          <p className="font-extrabold text-slate-200">{log.note}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5 font-mono">by {log.user} • {log.date}</p>
                        </div>
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded font-mono">
                          {log.duration}
                        </span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddTimeLog} className="space-y-1.5 pt-2 border-t border-slate-800/10">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        placeholder="Duration (e.g. 1h 30m)"
                        value={timeLogDuration}
                        onChange={(e) => setTimeLogDuration(e.target.value)}
                        className={`text-[10px] px-2.5 py-1.5 rounded-lg border outline-none w-1/3 ${
                          theme === 'dark'
                            ? 'bg-[#0D1631] border-slate-700 text-slate-100 placeholder-slate-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Session description / note..."
                        value={timeLogNote}
                        onChange={(e) => setTimeLogNote(e.target.value)}
                        className={`text-[10px] px-2.5 py-1.5 rounded-lg border outline-none w-2/3 ${
                          theme === 'dark'
                            ? 'bg-[#0D1631] border-slate-700 text-slate-100 placeholder-slate-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] py-1.5 rounded-lg transition"
                    >
                      Log Work Session
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Action buttons drawer (Submit, Draft, Close) */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-3 border-t border-slate-800/10">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                theme === 'dark'
                  ? 'border-slate-800 bg-[#0D1631] hover:bg-[#0D1631]/80 text-slate-300'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Close
            </button>

            {/* Save as Draft Button */}
            <button
              type="button"
              onClick={(e) => handleSaveSubmit(e, true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 text-slate-300'
                  : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Save as Draft
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={(e) => handleSaveSubmit(e, false)}
              className="flex-[1.2] py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold transition shadow-md shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Submit Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
