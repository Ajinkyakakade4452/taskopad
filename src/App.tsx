import { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCards from './components/StatCards';
import { StatisticsChart, PriorityTaskSummary } from './components/Charts';
import CalendarCard from './components/CalendarCard';
import TeamIncomplete from './components/TeamIncomplete';
import TaskTable from './components/TaskTable';
import ProjectsSection from './components/ProjectsSection';
import AdminProjectsPage from './components/AdminProjectsPage';

import DiscussionCard from './components/DiscussionCard';
import TaskModal from './components/TaskModal';
import BulkTaskModal from './components/BulkTaskModal';
import TaskDetailsPanel from './components/TaskDetailsPanel';
import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import Notifications, { Notification as UiNotification } from './components/Notification';

import UsersPage from './components/UsersPage';
import DocumentsPage from './components/DocumentsPage';
import TimesheetPage from './components/TimesheetPage';
import NotesPage from './components/NotesPage';
import ReportsPage from './components/ReportsPage';
import DepartmentsPage from './components/DepartmentsPage';
import SettingsPage from './components/SettingsPage';
import WhatsNewPage from './components/WhatsNewPage';
import { Task, TaskStatus } from './types';

const API_BASE = '/api';

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
  avatarColor: string;
  token: string;
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isBulkTaskModalOpen, setIsBulkTaskModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('Dashboard');
  const [taskFilterMode, setTaskFilterMode] = useState<'main' | 'subtask' | 'subtask-approved' | 'all' | 'review'>('all');

  // Auth state — persist in sessionStorage
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('taskpad_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // API-backed tasks (admin view)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  // API-backed users (admin view)
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: 'admin' | 'user'; initials: string; avatarColor: string }[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  // Task Details Panel
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  // Notifications (UI)
  const [notifications, setNotifications] = useState<UiNotification[]>([]);



  const addNotification = (notification: Omit<UiNotification, 'id'>) => {
    setNotifications((prev: UiNotification[]) => [

      ...prev,
      { ...notification, id: Date.now().toString() },
    ]);
  };


  const removeNotification = (id: string) => {
    setNotifications((prev: UiNotification[]) => prev.filter((n) => n.id !== id));
  };



  // ── Fetch all tasks from backend ──────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (tasksLoading) return;
    setTasksLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (res.ok) {
        const data: Task[] = await res.json();
        setTasks(data);
        setTasksLoaded(true);

        // Check for overdue tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueTasks = data.filter(
          (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'Completed'
        );
        if (overdueTasks.length > 0) {
          addNotification({
            type: 'warning',
            title: 'Overdue Tasks',
            message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}!`,
          });
        }
      }
    } catch (err) {
      console.warn('Backend not reachable, using empty task list', err);
      setTasksLoaded(true);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // ── Fetch all users from backend ──────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setUsersLoaded(true);
      }
    } catch (err) {
      console.warn('Backend not reachable, using empty user list', err);
    }
  }, []);

  useEffect(() => {
    if (loggedInUser?.role === 'admin') {
      fetchTasks();
      fetchUsers();
    }
  }, [loggedInUser]);

  // ── Admin: Load real notifications from backend ─────────────────────────────
  useEffect(() => {
    if (loggedInUser?.role !== 'admin') return;

    const loadNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications?userEmail=${encodeURIComponent(loggedInUser.email)}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // Convert backend notifications -> UI notifications
          const mapped: UiNotification[] = data
            .slice(0, 30)
            .map((n: any) => ({
              id: String(n.id),
              type: n.type === 'UNDER_REVIEW' ? 'warning' : n.type === 'COMPLETED' ? 'success' : 'info',
              title: n.title || 'Notification',
              message: n.message || '',
            }));

          setNotifications(mapped);
        }
      } catch {
        // ignore; keep existing notifications
      }
    };

    loadNotifications();

    // polling to make it "real working" without auth/websocket
    const t = window.setInterval(() => {
      loadNotifications();
      fetchTasks();
    }, 5000);

    return () => window.clearInterval(t);
  }, [loggedInUser, fetchTasks]);


  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = (user: LoggedInUser) => {
    sessionStorage.setItem('taskpad_user', JSON.stringify(user));
    setLoggedInUser(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('taskpad_user');
    setLoggedInUser(null);
    setTasks([]);
    setTasksLoaded(false);
  };

  // ── Task CRUD handlers ────────────────────────────────────────────────────

  const handleToggleTaskStatus = async (taskId: string) => {

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await handleUpdateTaskStatus(taskId, nextStatus);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updated = { ...task, status };
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const saved: Task = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? saved : t));
        if (selectedTaskForDetails?.id === taskId) setSelectedTaskForDetails(saved);
        addNotification({
          type: 'success',
          title: 'Task Updated',
          message: `Task "${task.name}" marked as ${status}`,
        });
        // Notify UserDashboard (same browser) to re-fetch when admin completes/updates a task
        const completedPayload = JSON.stringify({
          taskId,
          taskName: task.name,
          status,
          timestamp: Date.now(),
        });
        localStorage.setItem('taskpad_task_completed', completedPayload);
        // Also dispatch for same-tab listeners (storage event only fires in other tabs by default)
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'taskpad_task_completed',
          newValue: completedPayload,
        }));
      }
    } catch {
      // optimistic local update on failure
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      if (selectedTaskForDetails?.id === taskId) setSelectedTaskForDetails(updated);
    }
  };

  const handleBulkApproveReject = async (taskIds: string[], action: 'approve' | 'reject') => {
    let successCount = 0;
    
    // First try the dedicated bulk endpoint
    try {
      const res = await fetch(`${API_BASE}/tasks/approve-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds, action }),
      });
      if (res.ok) {
        const updatedTasks: Task[] = await res.json();
        setTasks(prev => {
          const updated = [...prev];
          for (const ut of updatedTasks) {
            const idx = updated.findIndex(t => t.id === ut.id);
            if (idx >= 0) updated[idx] = ut;
          }
          return updated;
        });
        addNotification({
          type: 'success',
          title: 'Bulk Task Update',
          message: `${updatedTasks.length} tasks ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        });
        return;
      }
    } catch {
      // fall through to individual updates
    }

    // Fallback: update each task individually using the proven PUT endpoint
    const newStatus: TaskStatus = action === 'approve' ? 'Completed' : 'Rejected';
    for (const taskId of taskIds) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) continue;
      const updated = { ...task, status: newStatus };
      try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        if (res.ok) {
          const saved: Task = await res.json();
          setTasks(prev => prev.map(t => t.id === taskId ? saved : t));
          successCount++;
        } else {
          setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
          successCount++;
        }
      } catch {
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        successCount++;
      }
    }

    if (successCount > 0) {
      addNotification({
        type: 'success',
        title: 'Bulk Task Update',
        message: `${successCount} tasks ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
    }
  };

  const handleSaveTaskDetails = async (updatedTask: Task) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        const saved: Task = await res.json();
        setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
        setSelectedTaskForDetails(saved);
        addNotification({
          type: 'success',
          title: 'Task Updated',
          message: `Task "${saved.name}" updated successfully`,
        });
      }
    } catch {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      setSelectedTaskForDetails(updatedTask);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        if (selectedTaskForDetails?.id === taskId) {
          setIsDetailsPanelOpen(false);
          setSelectedTaskForDetails(null);
        }
        addNotification({
          type: 'success',
          title: 'Task Deleted',
          message: `Task "${task?.name || taskId}" has been deleted successfully`,
        });
      }
    } catch {
      // optimistic local delete on failure
      setTasks(prev => prev.filter(t => t.id !== taskId));
      if (selectedTaskForDetails?.id === taskId) {
        setIsDetailsPanelOpen(false);
        setSelectedTaskForDetails(null);
      }
    }
  };

  const handleBulkDeleteTasks = async (taskIds: string[]) => {
    if (!taskIds || taskIds.length === 0) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => prev.filter(t => !taskIds.includes(t.id)));
        if (selectedTaskForDetails && taskIds.includes(selectedTaskForDetails.id)) {
          setIsDetailsPanelOpen(false);
          setSelectedTaskForDetails(null);
        }
        addNotification({
          type: 'success',
          title: 'Bulk Delete',
          message: data.message || `${taskIds.length} task(s) deleted successfully`,
        });
      } else {
        // optimistic local delete on failure
        setTasks(prev => prev.filter(t => !taskIds.includes(t.id)));
        addNotification({
          type: 'success',
          title: 'Bulk Delete',
          message: `${taskIds.length} task(s) deleted successfully`,
        });
      }
    } catch {
      // optimistic local delete on failure
      setTasks(prev => prev.filter(t => !taskIds.includes(t.id)));
      addNotification({
        type: 'success',
        title: 'Bulk Delete',
        message: `${taskIds.length} task(s) deleted successfully`,
      });
    }
  };

  const handleDuplicateTask = async (taskId: string) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/duplicate`, {
        method: 'POST',
      });

      if (!res.ok) return;
      const duplicated: Task = await res.json();

      setTasks(prev => [duplicated, ...prev]);
      addNotification({
        type: 'success',
        title: 'Task Duplicated',
        message: `Task "${duplicated.name}" duplicated as Pending`,
      });
    } catch {
      // no-op
    }
  };

  const handleSelectTaskForDetails = (task: Task) => {
    setSelectedTaskForDetails(task);
    setIsDetailsPanelOpen(true);

    // Ensure the details panel shows latest documents from backend (especially after admin attaches docs)
    if (task?.id) {
      fetch(`${API_BASE}/tasks/${task.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((fresh) => {
          if (fresh) {
            setSelectedTaskForDetails(fresh);
            setTasks((prev) => prev.map((t) => (t.id === fresh.id ? fresh : t)));
          }
        })
        .catch(() => {
          // ignore
        });
    }
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id'>) => {
    const taskWithId: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
    };
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithId),
      });
      if (res.ok) {
        const saved: Task = await res.json();
        setTasks(prev => [saved, ...prev]);
        addNotification({
          type: 'success',
          title: 'Task Added',
          message: `Task "${saved.name}" added successfully`,
        });
      } else {
        setTasks(prev => [taskWithId, ...prev]);
      }
    } catch {
      setTasks(prev => [taskWithId, ...prev]);
    }
    setIsAddTaskModalOpen(false);
  };

  // Bulk task save handler
  const handleSaveMultipleTasks = async (newTasksData: Omit<Task, 'id'>[]) => {
    const tasksToSend: Task[] = newTasksData.map((taskData, idx) => ({
      ...(taskData as any),
      id: `task-${Date.now()}-${idx}-${Math.random()}`,
    }));

    try {
      const res = await fetch(`${API_BASE}/tasks/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasksToSend),
      });

      if (res.ok) {
        const saved: Task[] = await res.json();
        setTasks(prev => [...saved, ...prev]);
        addNotification({
          type: 'success',
          title: 'Bulk Tasks Added',
          message: `${saved.length} tasks added successfully`,
        });
        return;
      }
    } catch {
      // fall back below
    }

    // Fallback: if bulk API fails, still try sequential create (older behavior)
    const savedTasks: Task[] = [];
    for (const taskData of newTasksData) {
      const taskWithId: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random()}`,
      };
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskWithId),
        });
        if (res.ok) {
          const saved: Task = await res.json();
          savedTasks.push(saved);
        } else {
          savedTasks.push(taskWithId);
        }
      } catch {
        savedTasks.push(taskWithId);
      }
    }

    setTasks(prev => [...savedTasks, ...prev]);
    addNotification({
      type: 'success',
      title: 'Bulk Tasks Added',
      message: `${savedTasks.length} tasks added successfully`,
    });
  };

  const handleSubmitDraft = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updated = { ...task, isDraft: false };
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const saved: Task = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? saved : t));
      } else {
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      }
    } catch {
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    }
  };

  const handleThemeToggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const handleMobileSidebarToggle = () => setIsMobileSidebarOpen(prev => !prev);

  const filteredTasks = selectedProject
    ? tasks.filter(t => t.project === selectedProject && t.status !== 'Approved' && t.status !== 'Completed')
    : tasks.filter(t => t.status !== 'Approved' && t.status !== 'Completed');

  const displayedTableTasks = useMemo(() => {
    let base = filteredTasks;
    if (taskFilterMode === 'main') {
      return base;
    } else if (taskFilterMode === 'subtask' || taskFilterMode === 'subtask-approved') {
      const pseudoSubtasks: Task[] = [];
      base.forEach(task => {
        if (task.subTasks && task.subTasks.length > 0) {
          task.subTasks.forEach((sub, index) => {
            if (taskFilterMode === 'subtask-approved' && sub.approvedByAdmin) {
              return; // Skip approved subtasks for this filter (show only pending approval)
            }
            pseudoSubtasks.push({
              ...task,
              id: sub.id || `${task.id}-sub-${index}`,
              name: `↳ ${sub.name}`,
              status: sub.completed ? 'Completed' : (task.status === 'Completed' ? 'Completed' : 'Pending'),
              subTask: sub, // Store the subtask object for reference
            } as any);
          });
        }
      });
      return pseudoSubtasks;
    } else if (taskFilterMode === 'review') {
      return base.filter(task => task.status === 'Under Review');
    }
    return base;
  }, [filteredTasks, taskFilterMode]);
  // ── Routing ───────────────────────────────────────────────────────────────

  // Not logged in → show Login page
  if (!loggedInUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Regular user → show simplified User Dashboard
  if (loggedInUser.role === 'user') {
    return <UserDashboard user={loggedInUser} onLogout={handleLogout} />;
  }

  // Admin → show full Enterprise Dashboard
  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#0A1128] text-slate-200' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        theme={theme}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeItem={activeView}
        onSelectItem={(item) => {
          setActiveView(item);
          setIsMobileSidebarOpen(false);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <Header
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onMobileMenuToggle={handleMobileSidebarToggle}
          userEmail={loggedInUser.email}
          userName={loggedInUser.name}
          userInitials={loggedInUser.initials}
          userAvatarColor={loggedInUser.avatarColor}
          onLogout={handleLogout}
        />

        {/* Main Content based on activeView */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full flex-1">
          {(() => {
            switch (activeView) {
              case 'Users':
                return <UsersPage user={loggedInUser} />;
              
              case 'Dashboard':
                return (
                  <>
                    {/* Loading indicator */}
                    {tasksLoading && !tasksLoaded && (
                      <div className="flex items-center gap-3 text-slate-400 text-sm py-4">
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        Loading tasks from database...
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                          Enterprise Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Workspace: <span className="text-cyan-400 font-semibold">Edigital Knowledge</span>
                          {' '}• Live telemetry for {loggedInUser.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium">
                          Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                      </div>
                    </div>

                    <StatCards
                        theme={theme}
                        tasks={tasks}
                        user={loggedInUser}
                        onAddTaskClick={() => setIsAddTaskModalOpen(true)}
                        onFilterClick={(filter) => {
                          // When client-approved action is clicked, open the "review" queue
                          if (filter === 'review') {
                            setTaskFilterMode('review');
                            // ensure the table/queue is visible in dashboard context
                            setActiveView('Dashboard');
                            return;
                          }
                          setTaskFilterMode(filter);
                        }}
                        activeFilter={taskFilterMode}
                      />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-8 space-y-8">
                        <StatisticsChart theme={theme} tasks={tasks} />
                        <ProjectsSection
                          theme={theme}
                          tasks={tasks}
                          onProjectSelect={setSelectedProject}
                          selectedProject={selectedProject}
                        />
                        <TaskTable
                          theme={theme}
                          tasks={displayedTableTasks}
                          onToggleStatus={handleToggleTaskStatus}
                          onAddTaskClick={() => setIsAddTaskModalOpen(true)}
                          onDuplicateTask={(taskId) => handleDuplicateTask(taskId)}
                          onDeleteTask={(taskId) => handleDeleteTask(taskId)}
                          onBulkDeleteTasks={handleBulkDeleteTasks}
                          onSubmitDraft={handleSubmitDraft}
                          onSelectTask={handleSelectTaskForDetails}
                          onUpdateTaskStatus={handleUpdateTaskStatus}
                          onBulkApproveReject={handleBulkApproveReject}
                          isSubtaskFilterMode={taskFilterMode === 'subtask' || taskFilterMode === 'subtask-approved'}
                        />
                      </div>
                      <div className="lg:col-span-4 space-y-8">
                        <PriorityTaskSummary theme={theme} tasks={tasks} />
                        <CalendarCard theme={theme} tasks={tasks} />
                        <TeamIncomplete theme={theme} tasks={tasks} users={users} />
                        <DiscussionCard theme={theme} />
                      </div>
                    </div>
                  </>
                );

              case 'Tasks':
                return (
                  <div className="space-y-8">
                    {/* Loading indicator */}
                    {tasksLoading && !tasksLoaded && (
                      <div className="flex items-center gap-3 text-slate-400 text-sm py-4">
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        Loading tasks from database...
                      </div>
                    )}

                    {/* Tasks View Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                          Tasks Workspace
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Workspace: <span className="text-cyan-400 font-semibold">Edigital Knowledge</span>
                          {' '}• Manage tasks, priorities, and draft queues
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsAddTaskModalOpen(true)}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-md shadow-cyan-500/10 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>+ Add Task</span>
                        </button>
                      </div>
                    </div>
                    <TaskTable
                      theme={theme}
                      tasks={displayedTableTasks}
                      onToggleStatus={handleToggleTaskStatus}
                      onAddTaskClick={() => setIsAddTaskModalOpen(true)}
                      onDuplicateTask={(taskId) => handleDuplicateTask(taskId)}
                      onDeleteTask={(taskId) => handleDeleteTask(taskId)}
                      onBulkDeleteTasks={handleBulkDeleteTasks}
                      onSubmitDraft={handleSubmitDraft}
                      onSelectTask={handleSelectTaskForDetails}
                      onUpdateTaskStatus={handleUpdateTaskStatus}
                      onBulkApproveReject={handleBulkApproveReject}
                      isSubtaskFilterMode={taskFilterMode === 'subtask' || taskFilterMode === 'subtask-approved'}
                    />
                  </div>
                );

case 'Projects':
                return (
                  <div className="space-y-8">
                    {/* Projects View Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                          Projects
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Manage projects (admin)
                        </p>
                      </div>
                    </div>
                    <AdminProjectsPage />
                  </div>
                );


              case 'Discussion':
                return (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/10 pb-5 select-none">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                          Discussion
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Team conversations and updates
                        </p>
                      </div>
                    </div>
                    <div className="max-w-4xl">
                      <DiscussionCard theme={theme} />
                    </div>
                  </div>
                );

              case 'Documents':
                return <DocumentsPage theme={theme} tasks={tasks} />;

              case 'Timesheet':
                return <TimesheetPage theme={theme} tasks={tasks} users={users} />;

              case 'Notes':
                return <NotesPage theme={theme} />;

              case 'Reports':
                return <ReportsPage theme={theme} tasks={tasks} users={users} />;

              case 'Departments':
                return <DepartmentsPage theme={theme} users={users} />;

              case 'Settings':
                return loggedInUser ? (
                  <SettingsPage
                    theme={theme}
                    user={{ id: loggedInUser.id, name: loggedInUser.name, email: loggedInUser.email }}
                    onThemeToggle={handleThemeToggle}
                    onUserUpdated={(updated) => {
                      const next = {
                        ...loggedInUser,
                        name: updated.name,
                        email: updated.email,
                      };
                      setLoggedInUser(next);
                      sessionStorage.setItem('taskpad_user', JSON.stringify(next));
                    }}
                  />
                ) : (
                  <SettingsPage theme={theme} user={{ id: '', name: '', email: '' }} onThemeToggle={handleThemeToggle} />
                );

              case "What's New":
                return <WhatsNewPage theme={theme} />;

              default:
                return (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="p-8 bg-slate-800/30 rounded-2xl border border-slate-700 text-center max-w-md">
                      <h2 className="text-xl font-bold text-white mb-2">{activeView}</h2>
                      <p className="text-slate-400 text-sm mb-4">This page is under development!</p>
                    </div>
                  </div>
                );
            }
          })()}
        </main>
      </div>

      {/* Task Modal */}
      <TaskModal
        theme={theme}
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSave={handleAddTask}
        users={users}
        loggedInUser={loggedInUser}
      />

      {/* Task Details Panel */}
      <TaskDetailsPanel
        theme={theme}
        isOpen={isDetailsPanelOpen}
        task={selectedTaskForDetails}
        onClose={() => setIsDetailsPanelOpen(false)}
        onSave={handleSaveTaskDetails}
        onDeleteTask={(taskId) => handleDeleteTask(taskId)}
        users={users}
        loggedInUser={loggedInUser}
      />

    </div>
  );
}
