import { Task } from '../types';

export interface PenaltyConfig {
  enabled: boolean;
  amount: number;
}

const PENALTY_STORAGE_KEY = 'taskpad_penalty_config';

export const getStoredPenaltyConfig = (): PenaltyConfig => {
  try {
    const stored = localStorage.getItem(PENALTY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
        amount: typeof parsed.amount === 'number' && parsed.amount >= 0 ? parsed.amount : 200,
      };
    }
  } catch {
    // fallback
  }
  return { enabled: true, amount: 200 };
};

export const setStoredPenaltyConfig = async (config: PenaltyConfig): Promise<void> => {
  try {
    localStorage.setItem(PENALTY_STORAGE_KEY, JSON.stringify(config));
    // Best effort API sync to backend
    fetch('/api/tasks/admin/penalty-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).catch(() => {});
  } catch {
    // ignore
  }
};

/**
 * Checks if a task is overdue / completed late and computes penalty.
 */
export const checkAndApplyTaskPenalty = (
  task: Task,
  overrideConfig?: PenaltyConfig
): Task => {
  const config = overrideConfig || getStoredPenaltyConfig();
  if (!config.enabled) {
    return {
      ...task,
      isPenalized: false,
      penaltyAmount: 0,
    };
  }

  // Determine penalty rate (per-task custom penalty or global config default ₹200)
  const penaltyRate = typeof task.customPenalty === 'number' && task.customPenalty >= 0 
    ? task.customPenalty 
    : config.amount;

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  // Task is overdue if dueDate is strictly prior to today's date and task is not completed/approved, OR if it was already marked penalized
  let dueDateClean = (task.dueDate || '').split('T')[0];
  const isOverdue = !!(dueDateClean && dueDateClean < todayStr && task.status !== 'Completed' && task.status !== 'Approved');

  if (isOverdue || task.isPenalized) {
    return {
      ...task,
      isPenalized: true,
      penaltyAmount: penaltyRate,
    };
  }

  return {
    ...task,
    isPenalized: false,
    penaltyAmount: 0,
  };
};
