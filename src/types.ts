export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Pending' | 'Completed' | 'In Progress' | 'Under Review' | 'Rejected' | 'Incomplete';

export interface Task {
  id: string;
  name: string;
  description: string;
  project: string;
  projects?: string[]; // For multi-select projects
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  time?: string; // e.g. "11:00 AM - 12:30 PM"
  assignTo: string; // Main assignee Name
  assignees?: string[]; // Multiple assignees
  status: TaskStatus;
  client?: string;
  service?: string;
  follower?: string;
  documents?: string[];
  subTasks?: { id: string; name: string; completed: boolean; approvedByAdmin?: boolean; assignTo?: string }[];

  checklist?: { id: string; name: string; checked: boolean }[];
  comments?: { id: string; author: string; text: string; date: string }[];
  timeLogs?: { id: string; user: string; duration: string; date: string }[];
  isDraft?: boolean;
  // Recurring and Time features
  isRecurring?: boolean;
  recurrence?: {
    repeatType: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
    repeatEvery: number;
    weekdays?: string[]; // e.g., ['Mon', 'Tue']
    repeatOn?: string; // 'same-date' | 'first-monday' | 'last-friday' | 'custom'
    customRule?: string;
    endOption: 'Never' | 'On Date' | 'After Occurrences';
    endDate?: string;
    occurrences?: number;
  };
  startTime?: string; // e.g. "05:30 PM"
  endTime?: string; // e.g. "06:30 PM"
  reminderBefore?: string; // e.g. "30 minutes before"
}

export interface Project {
  id: string;
  name: string;
  creator: string;
  hasEndDate: boolean;
  endDate?: string;
  completedTasks: number;
  totalTasks: number;
  color: string; // CSS color or Tailwind class prefix
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  avatarColor: string; // Tailwind bg color class
  incompleteTaskCount: number;
}

export interface DiscussionMessage {
  id: string;
  userName: string;
  userInitials: string;
  avatarColor: string;
  date: string;
  message: string;
  category: 'General' | 'Task';
}

export interface ChartDataPoint {
  month: string;
  completed: number;
  incomplete: number;
}
