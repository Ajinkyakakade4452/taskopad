# TODO: Admin Task Duplicate Feature

## Goal
Admin can duplicate an existing task. Duplicate includes subtasks, checklist, comments, timeLogs, and results in a **new Pending** task with a **new id** while keeping **dueDate** the same.

## Implemented/To-Implement Steps
1. **Backend**: Add endpoint `POST /api/tasks/{taskId}/duplicate` in `TaskController.java`.
   - Fetch source task by id
   - Create new Task
   - Copy: name, description, project, projects, priority, dueDate, time, assignTo, assignees, status (override to `Pending`), documents, subTasks, checklist, comments, timeLogs, isDraft, isRecurring, recurrence, startTime, endTime, reminderBefore, client/service/follower
   - Deep copy nested lists; generate new ids for nested items (at least for subTasks) where ids exist
   - Generate new top-level task id (server-side)
   - Save and return duplicated task
2. **Frontend**: Add Duplicate action button in `src/components/TaskTable.tsx`.
   - Add prop `onDuplicateTask(taskId: string)`
   - Render “Duplicate” button for each row
   - On click: call prop
3. **Frontend**: Implement handler in `src/App.tsx`.
   - Call `POST ${API_BASE}/tasks/${taskId}/duplicate`
   - On success: prepend new task to `tasks`
   - Show notification toast
4. **Test**
   - Duplicate any task in admin dashboard
   - Ensure new task appears with `status = Pending`
   - Ensure new id generated and dueDate unchanged
   - Ensure nested data (subtasks/checklist/comments/timeLogs) copied

