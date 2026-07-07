import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCards from './components/StatCards';
import { StatisticsChart, PriorityTaskSummary } from './components/Charts';
import CalendarCard from './components/CalendarCard';
import TeamIncomplete from './components/TeamIncomplete';
import TaskTable from './components/TaskTable';
import ProjectsSection from './components/ProjectsSection';
import DiscussionCard from './components/DiscussionCard';
import TaskModal from './components/TaskModal';
import BulkTaskModal from './components/BulkTaskModal';
import TaskDetailsPanel from './components/TaskDetailsPanel';
import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import Notifications, { Notification } from './components/Notification';
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

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    setNotifications((prev) => [
      ...prev,
      { ...notification, id: Date.now().toString() },
    ]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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
      }
    } catch {
      // optimistic local update on failure
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      if (selectedTaskForDetails?.id === taskId) setSelectedTaskForDetails(updated);
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

  const handleSelectTaskForDetails = (task: Task) => {
    setSelectedTaskForDetails(task);
    setIsDetailsPanelOpen(true);
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
    ? tasks.filter(t => t.project === selectedProject)
    : tasks;

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
                return <UsersPage />;
              
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
                          tasks={filteredTasks}
                          onToggleStatus={handleToggleTaskStatus}
                          onAddTaskClick={() => setIsAddTaskModalOpen(true)}
                          onSubmitDraft={handleSubmitDraft}
                          onSelectTask={handleSelectTaskForDetails}
                          onUpdateTaskStatus={handleUpdateTaskStatus}
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
                      tasks={filteredTasks}
                      onToggleStatus={handleToggleTaskStatus}
                      onAddTaskClick={() => setIsAddTaskModalOpen(true)}
                      onSubmitDraft={handleSubmitDraft}
                      onSelectTask={handleSelectTaskForDetails}
                      onUpdateTaskStatus={handleUpdateTaskStatus}
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
                          Manage all your projects
                        </p>
                      </div>
                    </div>
                    <ProjectsSection theme={theme} tasks={tasks} onProjectSelect={() => {}} selectedProject={null} />
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
                return <SettingsPage theme={theme} onThemeToggle={handleThemeToggle} />;

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
      />

      {/* Task Details Panel */}
      <TaskDetailsPanel
        theme={theme}
        isOpen={isDetailsPanelOpen}
        task={selectedTaskForDetails}
        onClose={() => setIsDetailsPanelOpen(false)}
        onSave={handleSaveTaskDetails}
        users={users}
      />

      {/* Notifications */}
      <Notifications
        notifications={notifications}
        onRemove={removeNotification}
        theme={theme}
      />
    </div>
  );
}
