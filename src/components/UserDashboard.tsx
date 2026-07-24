import React, { useEffect, useMemo, useState, useRef } from 'react';
import Notifications, { Notification } from './Notification';
import {
  LayoutDashboard,
  CheckSquare,
  Square,
  FolderKanban,
  MessageSquare,
  FileText,
  Clock,
  StickyNote,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  LogOut,
  ChevronDown,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Star,
  Flame,
  TrendingUp,
  Circle,
  Bell,
  List,
  Columns,
  CalendarDays,
  MoreHorizontal,
  X,
  Loader2,
  Paperclip,
  Trash2,
  ThumbsDown,
  User,
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { openDocument, readFileAsDataURL } from '../utils/documentViewer';
import { checkAndApplyTaskPenalty } from '../utils/penaltyUtils';
import ProjectsSection from './ProjectsSection';
import DiscussionCard from './DiscussionCard';
import DocumentsPage from './DocumentsPage';
import TimesheetPage from './TimesheetPage';
import NotesPage from './NotesPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import WhatsNewPage from './WhatsNewPage';
import UsersPage from './UsersPage';









interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
  avatarColor: string;
  token: string;
}

interface UserDashboardProps {
  user: LoggedInUser;
  onLogout: () => void;
}

const API_BASE = '/api';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  Pending: {
    label: 'Pending',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  'In Progress': {
    label: 'In Progress',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  Completed: {
    label: 'Completed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  'Under Review': {
    label: 'Under Review',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/30',
    dot: 'bg-violet-400',
  },
  Rejected: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    dot: 'bg-red-400',
  },
  Incomplete: {
    label: 'Incomplete',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
    dot: 'bg-orange-400',
  },
};

const priorityConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Critical: { label: 'Critical', color: 'text-red-400', icon: <Flame className="w-3 h-3" /> },
  High: { label: 'High', color: 'text-orange-400', icon: <TrendingUp className="w-3 h-3" /> },
  Medium: { label: 'Medium', color: 'text-amber-400', icon: <Star className="w-3 h-3" /> },
  Low: { label: 'Low', color: 'text-slate-400', icon: <Circle className="w-3 h-3" /> },
};

function parseLocalDateOnly(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Expecting backend seed format: YYYY-MM-DD
  const parts = dateStr.split('-').map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  const due = parseLocalDateOnly(dueDate);
  if (!due) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function isToday(dueDate: string): boolean {
  if (!dueDate) return false;
  const due = parseLocalDateOnly(dueDate);
  if (!due) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() === today.getTime();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const addNotification = (n: Omit<Notification, 'id'>) => {
    setNotifications((prev) => {
      // Dedup by (type + title + message): if same toast already exists, skip adding.
      const isDuplicate = prev.some(
        (x) => x.type === n.type && x.title === n.title && x.message === n.message
      );
      if (isDuplicate) return prev;

      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      return [...prev, { ...n, id }];
    });
  };
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((x) => x.id !== id));
  };
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'draft'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter UI state (real working filters)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'Any'>('Any');
  const [filterPriority, setFilterPriority] = useState<
    'Critical' | 'High' | 'Medium' | 'Low' | 'Any'
  >('Any');
  const [filterProject, setFilterProject] = useState<string>('Any');
  const [filterDueSegment, setFilterDueSegment] = useState<'Any' | 'TodayFuture' | 'Overdue'>('Any');

  const [activeView, setActiveView] = useState<string>('Dashboard');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);



  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !fileToUpload) return;
    
    let uploadedUrl = newAttachmentName.trim();
    if (fileToUpload) {
      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          uploadedUrl = data.url;
        } else {
          uploadedUrl = await readFileAsDataURL(fileToUpload);
        }
      } catch (err) {
        console.error('File upload fallback to data URL', err);
        uploadedUrl = await readFileAsDataURL(fileToUpload);
      }
    }
    if (!uploadedUrl) uploadedUrl = fileToUpload.name;

    const updatedUserDocuments = [...(selectedTask.userDocuments || []), uploadedUrl];
    const updated = { ...selectedTask, userDocuments: updatedUserDocuments };
    
    try {
      const res = await fetch(`${API_BASE}/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updated : t)));
        setSelectedTask(updated);
        setNewAttachmentName('');
        setFileToUpload(null);
      }
    } catch {
      console.error('Failed to update attachments');
    }
  };

  // Clipboard paste support for user screenshot attachments
  const userAttachmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = userAttachmentRef.current;
    if (!el || !selectedTask) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length === 0) return;
      e.preventDefault();

      for (const file of imageFiles) {
        let uploadedUrl = file.name || 'pasted_screenshot.png';
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            uploadedUrl = data.url;
          } else {
            uploadedUrl = await readFileAsDataURL(file);
          }
        } catch {
          uploadedUrl = await readFileAsDataURL(file);
        }

        if (!selectedTask) return;
        const updatedUserDocuments = [...(selectedTask.userDocuments || []), uploadedUrl];
        const updated = { ...selectedTask, userDocuments: updatedUserDocuments };

        try {
          const res = await fetch(`${API_BASE}/tasks/${selectedTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          });
          if (res.ok) {
            setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updated : t)));
            setSelectedTask(updated);
          }
        } catch {
          console.error('Failed to update pasted attachment');
        }
      }
    };

    el.addEventListener('paste', handlePaste);
    return () => el.removeEventListener('paste', handlePaste);
  }, [selectedTask]);

  const handleRemoveUserAttachment = async (idx: number) => {
    if (!selectedTask) return;
    const updatedUserDocuments = (selectedTask.userDocuments || []).filter((_, i) => i !== idx);
    const updated = { ...selectedTask, userDocuments: updatedUserDocuments };
    
    try {
      const res = await fetch(`${API_BASE}/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updated : t)));
        setSelectedTask(updated);
      }
    } catch {
      console.error('Failed to update attachments');
    }
  };

  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      await fetchTasks();
      try {
        const res = await fetch(`${API_BASE}/auth/users`);
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch {
        // best-effort; keep empty users
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Listen for admin "Completed" events via localStorage ──────────────────
  useEffect(() => {
    const handleAdminCompleted = (e: StorageEvent) => {
      if (e.key === 'taskpad_task_completed' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue) as { taskId: string; taskName: string; status: string };
          if (data.status === 'Completed') {
            // Re-fetch so task disappears from user's list
            fetchTasks();
            addNotification({
              type: 'success',
              title: '✅ Task Approved!',
              message: `Admin marked "${data.taskName}" as Completed. Great work!`,
            });
          }
        } catch { /* ignore */ }
      }
    };

    window.addEventListener('storage', handleAdminCompleted);
    return () => window.removeEventListener('storage', handleAdminCompleted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const normalizePerson = (s?: string | null) => (s ? s.trim().toLowerCase().replace(/\s+/g, ' ') : '');

  const isSubTaskVisibleToUser = (st: any, task: Task, userName: string) => {
    const normUser = userName.trim().toLowerCase();
    
    // 1. If user is in subtask assignees or is st.assignTo
    const subAssignees = (st.assignees || []).map((a: string) => a.trim().toLowerCase());
    const subAssignTo = st.assignTo ? st.assignTo.trim().toLowerCase() : '';
    
    if (subAssignees.includes(normUser) || subAssignTo === normUser) {
      return true;
    }
    
    // 2. If subtask is unassigned, it is visible to task assignees
    const hasSubAssignees = subAssignees.length > 0 || !!subAssignTo;
    if (!hasSubAssignees) {
      const taskAssignees = (task.assignees || []).map((a: string) => a.trim().toLowerCase());
      const taskAssignTo = task.assignTo ? task.assignTo.trim().toLowerCase() : '';
      if (taskAssignees.includes(normUser) || taskAssignTo === normUser) {
        return true;
      }
    }
    
    return false;
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const all: Task[] = await res.json();

      // Make matching tolerant to spacing/case.
      const userName = normalizePerson(user.name);
      const userEmail = normalizePerson(user.email);

      const isMainAssignee = (t: Task): boolean => {
        const assignTo = normalizePerson(t.assignTo as any);
        
        // Collect subtask assignees to distinguish them from main task assignees
        const subtaskAssigneeSet = new Set(
          (t.subTasks || [])
            .flatMap((st) => [st.assignTo, ...(st.assignees || [])])
            .filter(Boolean)
            .map((a) => normalizePerson(a))
        );

        // Filter t.assignees: an assignee is a main assignee if they match assignTo OR are not ONLY in subtasks
        const mainAssignees = (t.assignees || [])
          .map((a) => normalizePerson(a))
          .filter((a) => {
            if (a === assignTo) return true;
            return !subtaskAssigneeSet.has(a);
          });

        if (userName) {
          if (assignTo && assignTo.includes(userName)) return true;
          if (mainAssignees.some((a) => a.includes(userName))) return true;
        }
        if (userEmail) {
          if (assignTo && assignTo.includes(userEmail)) return true;
          if (mainAssignees.some((a) => a.includes(userEmail))) return true;
        }
        return false;
      };

      const isSubtaskAssignee = (st: any): boolean => {
        const subAssignees = (st.assignees || []).map((a: string) => normalizePerson(a));
        const subAssignTo = normalizePerson(st.assignTo);
        if (userName) {
          if (subAssignTo && subAssignTo.includes(userName)) return true;
          if (subAssignees.some((a: string) => a.includes(userName))) return true;
        }
        if (userEmail) {
          if (subAssignTo && subAssignTo.includes(userEmail)) return true;
          if (subAssignees.some((a: string) => a.includes(userEmail))) return true;
        }
        return false;
      };

      // 1. Direct tasks — user is a main-task assignee
      const directTasks = all
        .filter((t) => isMainAssignee(t) && t.status !== 'Completed')
        .map((t) => checkAndApplyTaskPenalty(t));

      // 2. Synthetic subtask entries — user is ONLY assigned to a subtask (not the main task)
      //    Each assigned subtask becomes its own card in the list.
      const subtaskEntries: Task[] = [];
      for (const t of all) {
        if (isMainAssignee(t)) continue; // already in directTasks
        if (t.status === 'Completed') continue;
        for (const st of t.subTasks || []) {
          if (!isSubtaskAssignee(st)) continue;
          // Build a synthetic Task that represents this single subtask
          const syntheticStatus: TaskStatus = st.completed ? 'Completed' : (st.rejectedByAdmin ? 'Rejected' : 'Pending');
          const entry: Task & {
            _isSubtaskEntry: boolean;
            _parentTaskId: string;
            _parentTaskName: string;
            _subtaskId: string;
          } = {
            ...t,
            id: t.id, // parent task id — needed for toggleSubTask API calls
            name: st.name,
            dueDate: (st as any).endDate || t.dueDate,
            status: syntheticStatus,
            subTasks: [st], // only this one subtask
            _isSubtaskEntry: true,
            _parentTaskId: t.id,
            _parentTaskName: t.name,
            _subtaskId: st.id,
          } as any;
          if (entry.status !== 'Completed') {
            subtaskEntries.push(checkAndApplyTaskPenalty(entry));
          }
        }
      }

      setTasks([...directTasks, ...subtaskEntries]);
    } catch {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    // Check for mandatory documents when submitting for review
    if (newStatus === 'Under Review') {
      if (task.documentsMandatory && (!task.userDocuments || task.userDocuments.length === 0)) {
        alert('Documents are mandatory for this task! Please upload a document before submitting.');
        return;
      }
    }

    const taskId = task.id;
    setUpdatingId(taskId);
    try {
      // ── Penalty check when completing/submitting a task ──────────────────────
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const isLate = !!(task.dueDate && task.dueDate < todayStr);

      let penaltyData: { isPenalized?: boolean; penaltyAmount?: number; completedAt?: string } = {};
      if ((newStatus === 'Completed' || newStatus === 'Under Review') && isLate) {
        // Load penalty config from localStorage
        let penaltyRate = 200;
        try {
          const stored = localStorage.getItem('taskpad_penalty_config');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (!parsed.enabled) {
              penaltyRate = 0;
            } else {
              penaltyRate = typeof task.customPenalty === 'number' && task.customPenalty >= 0
                ? task.customPenalty
                : (typeof parsed.amount === 'number' ? parsed.amount : 200);
            }
          }
        } catch { /* ignore */ }

        if (penaltyRate > 0) {
          penaltyData = {
            isPenalized: true,
            penaltyAmount: penaltyRate,
            completedAt: now.toISOString(),
          };
        }
      } else if (newStatus === 'Completed' || newStatus === 'Under Review') {
        penaltyData = {
          completedAt: now.toISOString(),
        };
      }

      const updated = { ...task, status: newStatus, ...penaltyData };

      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, ...penaltyData } : t)));
        if (selectedTask?.id === taskId) setSelectedTask({ ...selectedTask, status: newStatus, ...penaltyData });

        // Toast notification
        const isPenalized = penaltyData.isPenalized;
        const penaltyAmt = penaltyData.penaltyAmount;

        addNotification({
          type: newStatus === 'Completed' ? 'success' : 'info',
          title: isPenalized ? `⚠️ Penalty Applied — ₹${penaltyAmt}` : 'Task updated',
          message: isPenalized
            ? `${task.name} was completed LATE. A penalty of ₹${penaltyAmt} has been applied.`
            : `${task.name} is now ${newStatus}`,
        });

        // ── Notify Admin: user submitted for review ──────────────────────────────
        if (newStatus === 'Under Review') {
          const reviewPayload = JSON.stringify({
            taskId: task.id,
            taskName: task.name,
            submittedBy: user.name,
            timestamp: Date.now(),
          });
          localStorage.setItem('taskpad_review_submitted', reviewPayload);
          // Also dispatch for same-tab listeners
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'taskpad_review_submitted',
            newValue: reviewPayload,
          }));
        }
      }
    } catch {
      console.error('Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle a single subtask's completed state and persist to backend
  const handleToggleSubTask = async (task: Task, subTaskId: string) => {
    const updatedSubTasks = (task.subTasks || []).map((st) =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    const updatedTask: Task = { ...task, subTasks: updatedSubTasks };

    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    setSelectedTask(updatedTask);

    try {
      await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
    } catch {
      // revert on failure
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setSelectedTask(task);
    }
  };

  // Subtask comment expand state
  const [expandedSubtaskId, setExpandedSubtaskId] = useState<string | null>(null);
  const [subtaskNewCommentText, setSubtaskNewCommentText] = useState('');

  // Toggle subtask comments expand/collapse
  const toggleSubtaskComments = (subtaskId: string) => {
    setExpandedSubtaskId(expandedSubtaskId === subtaskId ? null : subtaskId);
    setSubtaskNewCommentText('');
  };

  // Add comment to a specific subtask (User Dashboard)
  const handleAddSubtaskComment = async (e: React.FormEvent, task: Task, subtaskId: string) => {
    e.preventDefault();
    if (!subtaskNewCommentText.trim()) return;

    const newComment = {
      id: `sub-comment-${Date.now()}`,
      author: user.name,
      text: subtaskNewCommentText.trim(),
      date: new Date().toLocaleString()
    };

    const updatedSubTasks = (task.subTasks || []).map((st) => {
      if (st.id === subtaskId) {
        return { ...st, comments: [...(st.comments || []), newComment] };
      }
      return st;
    });

    // Also append to main task-level comments array
    const updatedComments = [...(task.comments || []), newComment];
    const updatedTask: Task = { ...task, subTasks: updatedSubTasks, comments: updatedComments };

    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
    setSubtaskNewCommentText('');

    try {
      await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
    } catch {
      // revert on failure
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setSelectedTask(task);
    }
  };

  const todayTasks = tasks.filter(
    (t) => isToday(t.dueDate) || (!isOverdue(t.dueDate) && t.status !== 'Completed')
  );
  const upcomingTasks = tasks.filter((t) => {
    if (t.status === 'Completed') return false;
    
    // Recurring tasks appear in Upcoming even if their current dueDate has passed,
    // since they will generate future instances.
    if (t.isRecurring) return true;
    
    if (!t.dueDate) return false;
    // Upcoming = due date strictly after today (exclude today tasks)
    const due = parseLocalDateOnly(t.dueDate);
    if (!due) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due.getTime() > today.getTime();
  });
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'Completed');
  const draftTasks = tasks.filter((t) => Boolean(t.isDraft));


  const activeList = (() => {
    let list =
      activeTab === 'today'
        ? todayTasks
        : activeTab === 'upcoming'
          ? upcomingTasks
          : activeTab === 'overdue'
            ? overdueTasks
            : draftTasks;


    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.name?.toLowerCase().includes(q) || t.project?.toLowerCase().includes(q));
    }

    // Status filter
    if (filterStatus !== 'Any') {
      list = list.filter((t) => t.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'Any') {
      list = list.filter((t) => t.priority === filterPriority);
    }

    // Project filter
    if (filterProject !== 'Any') {
      list = list.filter((t) => (t.project || '').toLowerCase() === filterProject.toLowerCase());
    }

    // Due segment filter (independent from activeTab)
    if (filterDueSegment !== 'Any') {
      if (filterDueSegment === 'Overdue') {
        list = list.filter((t) => isOverdue(t.dueDate) && t.status !== 'Completed');
      } else if (filterDueSegment === 'TodayFuture') {
        list = list.filter((t) => !isOverdue(t.dueDate) && t.status !== 'Completed');
      }
    }

    return list;
  })();


  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const pendingCount = tasks.filter((t) => t.status !== 'Completed').length;

  // Pending subtask counts
  const totalSubtaskCount = tasks.reduce((sum, t) => {
    const visibleSubtasks = (t.subTasks || []).filter(st => isSubTaskVisibleToUser(st, t, user.name));
    return sum + visibleSubtasks.length;
  }, 0);
  const completedSubtaskCount = tasks.reduce((sum, t) => {
    const visibleSubtasks = (t.subTasks || []).filter(st => isSubTaskVisibleToUser(st, t, user.name));
    return sum + visibleSubtasks.filter(st => st.completed).length;
  }, 0);
  const pendingSubtaskCount = totalSubtaskCount - completedSubtaskCount;
  const pendingApprovalSubtaskCount = tasks.reduce((sum, t) => {
    const visibleSubtasks = (t.subTasks || []).filter(st => isSubTaskVisibleToUser(st, t, user.name));
    return sum + visibleSubtasks.filter(st => st.completed && (st as any).approvedByAdmin !== true).length;
  }, 0);

  const renderTasksView = () => (
    <>
      {/* Filter Drawer */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-[60]"
          onClick={() => setIsFilterOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0A1128] border-l border-slate-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">Advanced Filters</p>
                <p className="text-xs text-slate-400">Refine your task list</p>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Status</p>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'Any')}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                >
                  <option value="Any">Any</option>
                  {(Object.keys(statusConfig) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Priority</p>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                >
                  <option value="Any">Any</option>
                  {(['Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Project</p>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                >
                  <option value="Any">Any</option>
                  {Array.from(new Set(tasks.map((t) => t.project).filter(Boolean))).map((p) => (
                    <option key={p as string} value={p as string}>{p as string}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Due segment</p>
                <select
                  value={filterDueSegment}
                  onChange={(e) => setFilterDueSegment(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400 bg-[#0D1631] border-slate-800 text-slate-200"
                >
                  <option value="Any">Any</option>
                  <option value="TodayFuture">Main Tasks</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-800/50 flex items-center gap-2">
              <button
                onClick={() => {
                  setFilterStatus('Any');
                  setFilterPriority('Any');
                  setFilterProject('Any');
                  setFilterDueSegment('Any');
                }}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 transition"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-[1.2] px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task header/search */}
      <header className="bg-[#060D1F]/80 backdrop-blur border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">

        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-white">Tasks</h1>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Filter className="w-3 h-3" /> Filter
          </button>


          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition">
            <Plus className="w-3 h-3" /> Add Task
          </button>

          <button
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition relative"
            onClick={() => {
              // quick action: show a test toast when there are no notifications yet
              if (notifications.length === 0) {
                addNotification({
                  type: 'info',
                  title: 'Notifications',
                  message: 'No notifications yet. Update a task status to see alerts.',
                });
              }
            }}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* View Tabs */}
      <div className="px-6 py-2 border-b border-slate-800 flex items-center gap-2 bg-[#060D1F]/40 flex-shrink-0">
        {[
          { key: 'list', icon: <List className="w-3 h-3" />, label: 'List', active: true },
          { key: 'kanban', icon: <Columns className="w-3 h-3" />, label: 'Kanban', active: false },
          { key: 'calendar', icon: <CalendarDays className="w-3 h-3" />, label: 'Calendar', active: false },
        ].map((v) => (

          <button
            key={v.key}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              v.active ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {v.icon} {v.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition">Draft Tasks</button>
          <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition">Customize</button>
        </div>
      </div>

          {/* Stats Bar */}
      <div className="px-6 py-3 border-b border-slate-800/50 bg-[#070F23]/60 flex items-center gap-6 flex-shrink-0">

        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'today'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Today
          <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">{todayTasks.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'upcoming'
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Upcoming
          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold">{upcomingTasks.length}</span>
        </button>


        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'overdue'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Overdue Queue
          <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] font-bold">{overdueTasks.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('draft')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'draft'
              ? 'bg-slate-700 text-slate-200'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Draft Tasks
          <span className="px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[9px] font-bold">{draftTasks.length}</span>
        </button>

        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {pendingCount} Uncompleted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {completedCount} Completed
          </span>
        </div>
      </div>

      {/* NOTE: Delete controls intentionally omitted — users cannot delete tasks */}

      {/* Task List */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-sm">Loading your tasks...</span>
          </div>
        ) : activeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <CheckCircle2 className="w-10 h-10 mb-3 text-emerald-500/40" />
            <p className="text-sm font-semibold">No tasks in this section</p>
            <p className="text-xs mt-1">You're all caught up! 🎉</p>
          </div>
        ) : (
          <div>
            <div className="sticky top-0 z-10 bg-[#070F23]/95 backdrop-blur border-b border-slate-800 px-6 py-2 grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Task Name</span>
              <span>Project</span>
              <span>Due Date</span>
              <span>Priority</span>
              <span>Status</span>
            </div>

            <div>
              {activeList.map((task, idx) => {
                const sc = statusConfig[task.status] || statusConfig['Pending'];
                const pc = priorityConfig[task.priority] || priorityConfig['Medium'];
                const overdue = isOverdue(task.dueDate) && task.status !== 'Completed';
                const isSubtaskEntry = !!(task as any)._isSubtaskEntry;
                const parentTaskName = (task as any)._parentTaskName as string | undefined;
                const subtaskId = (task as any)._subtaskId as string | undefined;
                // Unique key: for subtask entries include subtaskId to avoid duplicate key issues
                const rowKey = isSubtaskEntry && subtaskId ? `${task.id}__st__${subtaskId}` : task.id;

                return (
                  <div
                    key={rowKey}
                    onClick={() => setSelectedTask(task)}
                    className={`px-6 py-3.5 grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center border-b border-slate-800/40 hover:bg-slate-800/25 transition cursor-pointer group ${
                      isSubtaskEntry ? 'border-l-2 border-l-pink-500/40' : ''
                    } ${idx % 2 === 0 ? '' : 'bg-slate-900/20'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isSubtaskEntry ? (
                        /* Subtask-only entry: toggle the single subtask directly */
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (subtaskId) handleToggleSubTask(task, subtaskId);
                          }}
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                            task.status === 'Completed' || (task.subTasks?.[0]?.completed)
                              ? 'bg-emerald-500 border-emerald-500'
                              : (task.subTasks?.[0] as any)?.rejectedByAdmin
                              ? 'bg-red-500 border-red-500 cursor-not-allowed'
                              : 'border-slate-600 hover:border-pink-400'
                          }`}
                          title={
                            (task.subTasks?.[0] as any)?.rejectedByAdmin
                              ? 'Rejected by admin'
                              : task.subTasks?.[0]?.completed
                              ? 'Subtask completed'
                              : 'Mark subtask as done'
                          }
                        >
                          {task.subTasks?.[0]?.completed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                        </button>
                      ) : (
                        /* Normal task: existing status-submit workflow */
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            if (task.status === 'Completed') {
                              addNotification({
                                type: 'info',
                                title: 'Task Completed',
                                message: 'Completed tasks can only be reopened/modified by the admin.',
                              });
                              return;
                            }

                            if (task.status === 'Under Review') {
                              handleStatusChange(task, 'Pending');
                              addNotification({
                                type: 'info',
                                title: 'Retracted Review',
                                message: `Task "${task.name}" retracted from review. Status is now Pending.`,
                              });
                              return;
                            }

                            const hasSubTasks = task.subTasks && task.subTasks.length > 0;
                            const pendingSubTasks = hasSubTasks ? task.subTasks!.filter(st => !st.completed) : [];
                            if (hasSubTasks && pendingSubTasks.length > 0) {
                              addNotification({
                                type: 'warning',
                                title: 'Cannot Complete Task',
                                message: `Please complete all subtasks first! (${pendingSubTasks.length} pending)`,
                              });
                              return;
                            }

                            handleStatusChange(task, 'Under Review');
                            addNotification({
                              type: 'success',
                              title: 'Submitted for Review',
                              message: `Task "${task.name}" submitted for admin review.`,
                            });
                          }}
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                            task.status === 'Completed'
                              ? 'bg-emerald-500 border-emerald-500 cursor-not-allowed'
                              : task.status === 'Under Review'
                              ? 'bg-violet-500 border-violet-500 hover:bg-violet-600'
                              : 'border-slate-600 hover:border-cyan-400'
                          }`}
                          title={
                            task.status === 'Completed'
                              ? 'Completed (Admin approved)'
                              : task.status === 'Under Review'
                              ? 'Awaiting admin approval (Click to retract)'
                              : 'Mark as completed (submits for review)'
                          }
                        >
                          {task.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                          {task.status === 'Under Review' && <Clock3 className="w-3 h-3 text-white" />}
                          {updatingId === task.id && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
                        </button>
                      )}

                      <div className="flex flex-col min-w-0">
                        {isSubtaskEntry && (
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-pink-500/15 text-pink-400 border border-pink-500/25 flex-shrink-0">
                              ↳ Subtask
                            </span>
                            {parentTaskName && (
                              <span className="text-[9px] text-slate-500 truncate">{parentTaskName}</span>
                            )}
                          </div>
                        )}
                        <span
                          className={`text-xs font-medium truncate ${
                            task.status === 'Completed' || task.subTasks?.[0]?.completed
                              ? 'line-through text-slate-500'
                              : 'text-slate-200 group-hover:text-white'
                          }`}
                        >
                          {task.name}
                        </span>
                      </div>
                      {(task.isPenalized || overdue) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-red-950/60 text-red-400 border border-red-800/50 flex-shrink-0">
                          ⚠️ ₹{task.penaltyAmount ?? 200}
                        </span>
                      )}
                    </div>

                    <div>
                      {task.project ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 truncate max-w-[120px]">
                          {task.project}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock3 className={`w-3 h-3 flex-shrink-0 ${overdue ? 'text-red-400' : 'text-slate-500'}`} />
                      <span className={`text-xs font-medium ${overdue ? 'text-red-400' : 'text-slate-300'}`}>{formatDate(task.dueDate)}</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${pc.color}`}>
                      {pc.icon}
                      <span className="text-xs font-semibold">{task.priority}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${sc.bg} ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-white transition"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-3 text-xs text-slate-500 border-t border-slate-800/40 flex justify-between">
              <span>
                Showing {activeList.length} task{activeList.length !== 1 ? 's' : ''} in this section ({tasks.length} total across all)
              </span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" />{pendingCount} Uncompleted
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />{completedCount} Completed
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Slide-Over Panel */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setSelectedTask(null)}>
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl h-full bg-[#0A1128] border-l border-slate-700 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
              <h3 className="text-sm font-bold text-white">
                {(selectedTask as any)._isSubtaskEntry ? 'Subtask Details' : 'Task Details'}
              </h3>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-6">
              {/* Subtask-only banner */}
              {(selectedTask as any)._isSubtaskEntry && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-pink-500/30 bg-pink-500/8 text-pink-300">
                  <span className="text-base flex-shrink-0">↳</span>
                  <div>
                    <p className="text-xs font-extrabold text-pink-400">You are assigned to this Subtask only</p>
                    <p className="text-[11px] text-pink-300/80 mt-0.5">
                      Parent Task: <span className="font-bold text-pink-200">{(selectedTask as any)._parentTaskName}</span>
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-lg font-bold text-white">{selectedTask.name}</h2>
                {!(selectedTask as any)._isSubtaskEntry && selectedTask.description && (
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{selectedTask.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {(() => {
                  const sc = statusConfig[selectedTask.status] || statusConfig['Pending'];
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${sc.bg} ${sc.color}`}>
                      <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  );
                })()}

                {(() => {
                  const pc = priorityConfig[selectedTask.priority] || priorityConfig['Medium'];
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 ${pc.color}`}>
                      {pc.icon} {selectedTask.priority}
                    </span>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Project', value: selectedTask.project },
                  { label: 'Assigned To', value: selectedTask.assignTo },
                  { label: 'Due Date', value: formatDate(selectedTask.dueDate) },
                  { label: 'Time Slot', value: (selectedTask as any).time || '—' },
                  { label: 'Service', value: (selectedTask as any).service || '—' },
                ].map((field) => (
                  <div key={field.label} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{field.label}</p>
                    <p className="text-xs font-semibold text-slate-200">{field.value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Penalty Badge */}
              {selectedTask.isPenalized && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-800/50 bg-red-950/30 animate-pulse">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="text-xs font-extrabold text-red-400 uppercase tracking-wider">Late Penalty Applied</p>
                    <p className="text-[11px] text-red-300/80 mt-0.5">
                      This task was completed after its due date. A penalty of{' '}
                      <span className="font-extrabold text-red-300">₹{selectedTask.penaltyAmount ?? 200}</span> has been applied.
                    </p>
                  </div>
                </div>
              )}

              {/* Subtask completion gate notice — only for direct main-task assignees */}
              {!(selectedTask as any)._isSubtaskEntry && (() => {
                const hasSubTasks = selectedTask.subTasks && selectedTask.subTasks.length > 0;
                const pendingSubTasks = hasSubTasks
                  ? selectedTask.subTasks!.filter((st) => !(st as any).completed)
                  : [];
                const allSubTasksDone = hasSubTasks && pendingSubTasks.length === 0;
                return hasSubTasks && !allSubTasksDone ? (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold">Complete all subtasks first!</p>
                      <p className="text-[11px] text-amber-400/80">Pending subtasks ({pendingSubTasks.length}):</p>
                      <ul className="space-y-0.5">
                        {pendingSubTasks.map((st) => {
                          const assigneesStr = (st.assignees && st.assignees.length > 0 ? st.assignees : [st.assignTo]).filter(Boolean).join(', ');
                          return (
                            <li key={st.id} className="text-[11px] text-amber-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                              <span>{st.name} {assigneesStr ? `(Assigned to: ${assigneesStr})` : ''}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Hide main task status controls for subtask-only entries */}
              {!(selectedTask as any)._isSubtaskEntry && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(statusConfig) as TaskStatus[]).map((s) => {
                      const sc = statusConfig[s];
                      const isActive = selectedTask.status === s;
                      // "Completed" is admin-only — user cannot directly set it
                      const isAdminOnly = s === 'Completed';
                      // "Under Review" is set via the Submit button, not here
                      const isReviewBlocked = s === 'Under Review';
                      // Block "Completed" also when subtasks pending
                      const hasSubTasks = selectedTask.subTasks && selectedTask.subTasks.length > 0;
                      const pendingSubTasks = hasSubTasks
                        ? selectedTask.subTasks!.filter((st) => !(st as any).completed)
                        : [];
                      const isBlocked = isAdminOnly || isReviewBlocked;

                      return (
                        <button
                          key={s}
                          onClick={() => {
                            if (isBlocked) return;
                            handleStatusChange(selectedTask, s);
                          }}
                          disabled={isActive || isBlocked}
                          title={
                            isAdminOnly
                              ? 'Only admin can approve & mark Completed'
                              : isReviewBlocked
                              ? 'Use "Submit for Review" button below'
                              : undefined
                          }
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                            isActive
                              ? `${sc.bg} ${sc.color} border-current cursor-default`
                              : isBlocked
                              ? 'bg-slate-800/20 text-slate-600 border-slate-800/30 cursor-not-allowed opacity-40'
                              : 'bg-slate-800/40 text-slate-400 border-slate-700/30 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                          {sc.label}
                          {isActive && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedTask.subTasks && selectedTask.subTasks.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {(selectedTask as any)._isSubtaskEntry ? 'Your Assigned Subtask' : 'Sub Tasks'}
                  </p>
                  <div className="space-y-2">
                    {selectedTask.subTasks.filter((st: any) => isSubTaskVisibleToUser(st, selectedTask, user.name)).map((st: any) => {
                      const isRejected = st.rejectedByAdmin === true;
                      const isApproved = st.approvedByAdmin === true && st.completed;
                      const isExpanded = expandedSubtaskId === st.id;
                      return (
                        <div key={st.id} className="overflow-hidden">
                          {/* Subtask main row */}
                          <div className={`flex items-center gap-1.5 p-2.5 rounded-lg border transition cursor-pointer group ${
                            isRejected
                              ? 'bg-red-500/8 border-red-500/20 hover:bg-red-500/15'
                              : isApproved
                              ? 'bg-emerald-500/8 border-emerald-500/20 hover:bg-emerald-500/15'
                              : 'bg-slate-800/30 border-slate-700/20 hover:bg-slate-700/40'
                          } ${isExpanded ? 'rounded-b-none border-b-0' : ''}`}>
                            <button
                              onClick={() => {
                                if (isRejected) return;
                                handleToggleSubTask(selectedTask, st.id);
                              }}
                              className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                            >
                              {isRejected ? (
                                <ThumbsDown className="w-4 h-4 text-red-500 flex-shrink-0" />
                              ) : isApproved ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              ) : st.completed ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 transition" />
                              )}
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className={`text-xs transition flex-1 ${
                                  isRejected
                                    ? 'line-through text-red-400'
                                    : isApproved
                                    ? 'line-through text-slate-500'
                                    : st.completed
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-200 group-hover:text-white'
                                }`}>
                                  {st.name}
                                </span>
                                {((st.assignees && st.assignees.length > 0) || st.assignTo) && (
                                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                    <User className="w-2.5 h-2.5 text-pink-400 flex-shrink-0" />
                                    {(st.assignees && st.assignees.length > 0 ? st.assignees : [st.assignTo]).filter(Boolean).map((name: any, idx: number) => (
                                      <span key={idx} className="text-[8px] font-bold text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20 whitespace-nowrap">
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                                isRejected
                                  ? 'bg-red-500/10 text-red-400'
                                  : isApproved
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : st.completed
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {isRejected ? 'Rejected' : isApproved ? 'Approved' : st.completed ? 'Done' : 'Pending'}
                              </span>
                            </button>
                            {/* Comment toggle button */}
                            <button
                              type="button"
                              onClick={() => setExpandedSubtaskId(isExpanded ? null : st.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-700/50 transition flex-shrink-0"
                              title="Toggle comments"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              {(st.comments || []).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 text-[7px] font-bold text-white flex items-center justify-center">
                                  {st.comments.length}
                                </span>
                              )}
                            </button>
                          </div>
                          {/* Expanded comments section */}
                          {isExpanded && (
                            <div className={`px-4 pb-3 pt-2 space-y-2 border border-t-0 rounded-b-lg ${
                              isRejected
                                ? 'bg-red-500/5 border-red-500/20'
                                : isApproved
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-slate-800/20 border-slate-700/20'
                            }`}>
                              {/* Existing comments */}
                              {(st.comments || []).length > 0 ? (
                                <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                                  {(st.comments || []).map((comment: any) => (
                                    <div key={comment.id} className="space-y-0.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-cyan-400">{comment.author}</span>
                                        <span className="text-[8px] text-slate-500 font-mono">{comment.date}</span>
                                      </div>
                                      <p className="text-[11px] px-2.5 py-1 rounded-lg border leading-relaxed bg-slate-900/50 border-slate-700/30 text-slate-300">
                                        {comment.text}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-500">No comments yet.</p>
                              )}
                              {/* Add comment form */}
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleAddSubtaskComment(e, selectedTask, st.id);
                                }}
                                className="flex gap-2 pt-1"
                              >
                                <input
                                  type="text"
                                  value={subtaskNewCommentText}
                                  onChange={(e) => setSubtaskNewCommentText(e.target.value)}
                                  placeholder="Add a comment..."
                                  className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium focus:ring-1 focus:ring-cyan-500 outline-none border bg-slate-900 border-slate-700 text-slate-200"
                                />
                                <button
                                  type="submit"
                                  disabled={!subtaskNewCommentText.trim()}
                                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-[10px] font-black hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                  Send
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Attachments Section */}
              <div className="pt-2 border-t border-slate-700/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attachments</p>
                <div className="space-y-2 mb-3">
                  {/* Admin Documents */}
                  {(selectedTask.documents || []).map((doc, idx) => (
                    <div
                      key={`admin-${idx}`}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-800/20 border-slate-700/30"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span 
                          onClick={() => openDocument(doc)}
                          className="text-xs font-mono text-slate-300 truncate max-w-[200px] cursor-pointer hover:text-cyan-400 hover:underline"
                          title="Click to open document"
                        >
                          {doc.startsWith('data:') ? 'admin_document' : doc.split('/').pop()}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-cyan-400/70 bg-cyan-500/10 px-1.5 py-0.5 rounded">Admin</span>
                    </div>
                  ))}
                  
                  {/* User Documents */}
                  {(selectedTask.userDocuments || []).map((doc, idx) => (
                    <div
                      key={`user-${idx}`}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-800/30 border-slate-700/50"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span 
                          onClick={() => openDocument(doc)}
                          className="text-xs font-mono text-emerald-300 truncate max-w-[200px] cursor-pointer hover:text-emerald-400 hover:underline"
                          title="Click to open document"
                        >
                          {doc.startsWith('data:') ? 'user_document' : doc.split('/').pop()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveUserAttachment(idx)}
                        className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 transition cursor-pointer"
                        title="Remove attachment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  {!(selectedTask.documents?.length) && !(selectedTask.userDocuments?.length) && (
                    <p className="text-xs text-slate-500 italic px-1">No attachments</p>
                  )}
                </div>

                {/* Upload Form */}
                <div ref={userAttachmentRef} tabIndex={0} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="user-file-upload-dash"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFileToUpload(e.target.files[0]);
                          setNewAttachmentName(e.target.files[0].name);
                        }
                      }}
                    />
                    <label
                      htmlFor="user-file-upload-dash"
                      className="flex-1 flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer transition truncate"
                    >
                      {newAttachmentName ? newAttachmentName : 'Select file to upload...'}
                    </label>
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      disabled={!newAttachmentName.trim()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upload
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-500 text-center">Or <span className="text-emerald-400 font-bold">Ctrl+V</span> to paste screenshots</p>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition"
                >
                  Close
                </button>
                {/* Delete button intentionally omitted — users cannot delete tasks */}
              </div>
              {/* Submit for Review — only for direct main-task assignees, not subtask-only entries */}
              {!(selectedTask as any)._isSubtaskEntry && (() => {
                const hasSubTasks = selectedTask.subTasks && selectedTask.subTasks.length > 0;
                const pendingSubTasks = hasSubTasks
                  ? selectedTask.subTasks!.filter((st) => !(st as any).completed)
                  : [];
                const isBlocked = hasSubTasks && pendingSubTasks.length > 0;
                const isAlreadyReview = selectedTask.status === 'Under Review';
                const isAlreadyDone = selectedTask.status === 'Completed';
                return (
                  <button
                    onClick={() => {
                      if (isBlocked || isAlreadyReview || isAlreadyDone) return;
                      handleStatusChange(selectedTask, 'Under Review');
                    }}
                    disabled={isAlreadyDone || isAlreadyReview || isBlocked}
                    title={
                      isBlocked
                        ? `Complete ${pendingSubTasks.length} pending subtask(s) first`
                        : isAlreadyReview
                        ? 'Waiting for admin approval'
                        : isAlreadyDone
                        ? 'Task already approved & completed'
                        : 'Submit task for admin review'
                    }
                    className={`px-4 py-2 text-xs font-bold rounded-lg shadow-md transition ${
                      isAlreadyDone
                        ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-600 opacity-50 cursor-not-allowed'
                        : isAlreadyReview
                        ? 'text-violet-300 bg-violet-500/15 border border-violet-500/30 cursor-not-allowed'
                        : isBlocked
                        ? 'text-slate-400 bg-slate-800 border border-slate-700 cursor-not-allowed opacity-60'
                        : 'text-white bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-400 hover:to-blue-500'
                    }`}
                  >
                    {isAlreadyDone
                      ? '✓ Approved & Completed'
                      : isAlreadyReview
                      ? '⏳ Awaiting Admin Approval'
                      : isBlocked
                      ? `🔒 Complete Subtasks First (${pendingSubTasks.length} left)`
                      : '📤 Submit for Review'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderProjectsView = () => {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/10 pb-4 select-none">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Projects</h1>
            <p className="text-xs text-slate-400 mt-1">Your active projects and progress</p>
          </div>
          <div className="text-xs text-slate-400">{tasks.length} tasks</div>
        </div>

        <ProjectsSection
          theme="dark"
          tasks={tasks}
          selectedProject={selectedProject}
          onProjectSelect={(p) => {
            setSelectedProject(p);
          }}
        />
      </div>
    );
  };

  const renderDiscussionView = () => {

    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/10 pb-4 select-none">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Discussion</h1>
            <p className="text-xs text-slate-400 mt-1">General updates and task threads</p>
          </div>
          <div className="text-xs text-slate-400">Recent feed</div>
        </div>

        <div className="max-w-4xl">
          <DiscussionCard theme="dark" />
        </div>
      </div>
    );
  };

  const renderDashboardView = () => {

    const projects = Array.from(new Set(tasks.map((t) => t.project).filter(Boolean)));
    const recent = [...tasks]
      .sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''))
      .slice(0, 5);

    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-6 py-4 border-b border-slate-800/50 bg-[#070F23]/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Hi {user.name.split(' ')[0] || user.name} 👋</h1>
              <p className="text-xs text-slate-400 mt-1">Here’s your task summary, project status, and recent activity.</p>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Overall</div>
              <div className="text-sm font-bold text-white">{completedCount} completed • {pendingCount} open</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-800/30">
              <div className="text-[10px] font-bold uppercase text-slate-500">Main Tasks</div>
              <div className="text-3xl font-extrabold text-cyan-300 mt-2">{todayTasks.length}</div>
              <div className="text-xs text-slate-400 mt-1">Upcoming work items</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-800/30">
              <div className="text-[10px] font-bold uppercase text-slate-500">Overdue</div>
              <div className="text-3xl font-extrabold text-red-300 mt-2">{overdueTasks.length}</div>
              <div className="text-xs text-slate-400 mt-1">Needs attention</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-800/30">
              <div className="text-[10px] font-bold uppercase text-slate-500">Pending Subtasks</div>
              <div className="text-3xl font-extrabold text-indigo-300 mt-2">{pendingSubtaskCount}</div>
              <div className="text-xs text-slate-400 mt-1">{completedSubtaskCount} of {totalSubtaskCount} completed</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-800/30">
              <div className="text-[10px] font-bold uppercase text-slate-500">Pending Approvals</div>
              <div className="text-3xl font-extrabold text-violet-300 mt-2">{pendingApprovalSubtaskCount}</div>
              <div className="text-xs text-slate-400 mt-1">Completed subtasks awaiting admin approval</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-800/30">
              <div className="text-[10px] font-bold uppercase text-slate-500">Drafts</div>
              <div className="text-3xl font-extrabold text-slate-200 mt-2">{draftTasks.length}</div>
              <div className="text-xs text-slate-400 mt-1">Not submitted yet</div>
            </div>
          </div>

          {/* Projects + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white">Projects</h2>
                  <div className="text-xs text-slate-400">{projects.length} active</div>
                </div>
                <div className="mt-4 space-y-2">
                  {projects.length === 0 ? (
                    <div className="text-xs text-slate-500">No projects assigned.</div>
                  ) : (
                    projects.slice(0, 6).map((p: string) => {
                      const prTasks = tasks.filter((t) => t.project === p);
                      const done = prTasks.filter((t) => t.status === 'Completed').length;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setActiveView('Tasks');
                            setActiveTab('today');
                            setSearchQuery(p);
                          }}
                          className="w-full text-left p-3 rounded-xl border border-slate-700/30 hover:border-cyan-500/30 hover:bg-slate-900/20 transition"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs font-semibold text-slate-100 truncate">{p}</div>
                            <div className="text-[10px] font-bold text-cyan-300">{done}/{prTasks.length}</div>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Completed {done} of {prTasks.length}</div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white">Recent activity</h2>
                  <div className="text-xs text-slate-400">Last 5 due items</div>
                </div>

                <div className="mt-4">
                  {recent.length === 0 ? (
                    <div className="text-xs text-slate-500">No recent tasks.</div>
                  ) : (
                    <div className="space-y-2">
                      {recent.map((t) => {
                        const sc = statusConfig[t.status] || statusConfig['Pending'];
                        const overdue = isOverdue(t.dueDate) && t.status !== 'Completed';
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTask(t)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-700/30 hover:border-cyan-500/30 hover:bg-slate-900/20 transition"
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                            <div className="min-w-0 flex-1">
                              <div className={`text-xs font-semibold truncate ${t.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{t.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{t.project || '—'}</div>
                            </div>
                            <div className={`text-[10px] font-bold ${overdue ? 'text-red-300' : 'text-slate-300'}`}>{formatDate(t.dueDate)}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setActiveView('Tasks');
                setActiveTab('today');
              }}
              className="p-4 rounded-2xl border border-slate-800/60 bg-slate-800/30 hover:bg-slate-800/50 transition text-left"
            >
              <div className="text-[10px] font-bold uppercase text-slate-500">Quick filter</div>
              <div className="mt-1 text-sm font-extrabold text-cyan-300">Today</div>
              <div className="mt-1 text-xs text-slate-400">{todayTasks.length} items</div>
            </button>
            <button
              onClick={() => {
                setActiveView('Tasks');
                setActiveTab('upcoming');
              }}
              className="p-4 rounded-2xl border border-slate-800/60 bg-slate-800/30 hover:bg-slate-800/50 transition text-left"
            >
              <div className="text-[10px] font-bold uppercase text-slate-500">Quick filter</div>
              <div className="mt-1 text-sm font-extrabold text-blue-300">Upcoming</div>
              <div className="mt-1 text-xs text-slate-400">{upcomingTasks.length} items</div>
            </button>

            <button
              onClick={() => {
                setActiveView('Tasks');
                setActiveTab('overdue');
              }}
              className="p-4 rounded-2xl border border-slate-800/60 bg-slate-800/30 hover:bg-slate-800/50 transition text-left"
            >
              <div className="text-[10px] font-bold uppercase text-slate-500">Quick filter</div>
              <div className="mt-1 text-sm font-extrabold text-red-300">Overdue Queue</div>
              <div className="mt-1 text-xs text-slate-400">{overdueTasks.length} items</div>
            </button>
            <button
              onClick={() => {
                setActiveView('Tasks');
                setActiveTab('draft');
              }}
              className="p-4 rounded-2xl border border-slate-800/60 bg-slate-800/30 hover:bg-slate-800/50 transition text-left"
            >
              <div className="text-[10px] font-bold uppercase text-slate-500">Quick filter</div>
              <div className="mt-1 text-sm font-extrabold text-slate-200">Draft Tasks</div>
              <div className="mt-1 text-xs text-slate-400">{draftTasks.length} items</div>
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-[#0A1128] text-slate-200 flex">

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#060D1F] border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Edigital TaskPad</p>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">SaaS Enterprise</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-2 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[9px] font-bold">EK</div>
            <div>
              <p className="text-[10px] font-semibold text-white">Edigital Knowledge</p>
              <p className="text-[8px] text-slate-400">Default Workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Tasks', icon: CheckSquare, badge: tasks.filter((t) => t.status !== 'Completed').length },
            { name: 'Projects', icon: FolderKanban },
            { name: 'Discussion', icon: MessageSquare },
            { name: 'Documents', icon: FileText },
            { name: 'Time sheet', icon: Clock },
            { name: 'Notes', icon: StickyNote },
            { name: 'Reports', icon: BarChart3 },
            { name: 'Users', icon: Users },
            { name: 'Settings', icon: Settings },
            { name: "What's New", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = item.name === activeView;

            return (
              <button
                        key={item.name}
                        onClick={() => {
                          setActiveView(item.name);
                          if (item.name !== 'Dashboard') setSelectedTask(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] font-medium transition ${
                          isActive
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-cyan-500/15 text-cyan-400">{item.badge}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.initials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[11px] font-semibold text-white truncate">{user.name}</p>
              <p className="text-[9px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button onClick={onLogout} title="Logout" className="text-slate-500 hover:text-red-400 transition p-1 rounded">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Notifications notifications={notifications} onRemove={removeNotification} theme="dark" />
        {activeView === 'Dashboard' ? (
          renderDashboardView()
        ) : activeView === 'Tasks' ? (
          renderTasksView()
        ) : activeView === 'Projects' ? (
          renderProjectsView()
        ) : activeView === 'Discussion' ? (
          renderDiscussionView()
        ) : activeView === 'Documents' ? (
          <DocumentsPage theme="dark" tasks={tasks as any} />
        ) : activeView === 'Time sheet' ? (
          <TimesheetPage theme="dark" tasks={tasks} users={users} />
        ) : activeView === 'Notes' ? (
          <NotesPage theme="dark" />
        ) : activeView === 'Reports' ? (
          <ReportsPage theme="dark" tasks={tasks} users={users as any} />
        ) : activeView === 'Users' ? (
          <UsersPage user={user} />
        ) : activeView === 'Settings' ? (
          <SettingsPage theme="dark" user={user} onThemeToggle={() => {}} />
        ) : activeView === "What's New" ? (

          <WhatsNewPage theme="dark" />
        ) : (


          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">



            <div className="text-xs text-slate-400 mb-3">User view: {activeView}</div>
            <div className="p-6 rounded-2xl border border-slate-800/40 bg-slate-800/30 text-slate-300">
              {activeView} page will be wired here.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

