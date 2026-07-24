# Subtask Assignee Visibility Fix

## Problem
When subtasks are assigned to different people in a task, those users don't see the parent task in their dashboard because the dashboard filter only checks task-level `assignTo`/`assignees` fields.

## Plan
- [x] Step 1: `UserDashboard.tsx` — Update `fetchTasks()` to include tasks where user is assigned as a subtask assignee
- [x] Step 2: `TaskModal.tsx` — Auto-sync subtask assignees to task-level `assignees` array when saving
- [x] Step 3: `TaskDetailsPanel.tsx` — Same sync when saving from the details panel

