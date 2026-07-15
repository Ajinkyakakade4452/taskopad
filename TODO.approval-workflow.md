# Approval workflow: subtask complete → admin approve → main task completed

## Backend
- [ ] Extend `SubTask` model with `approvedByAdmin` (and optionally `approvedByAdminAt`).
- [ ] Add endpoint `POST /api/tasks/{taskId}/subtasks/{subtaskId}/approve`.
- [ ] Implement rule: if **all subtasks are completed && approved**, set `Task.status = "Completed"`.
- [ ] Ensure `PUT /api/tasks/{id}` recomputes the same rule after updates.

## Frontend
- [ ] Update `src/types.ts` subTasks type to include `approvedByAdmin?: boolean`.
- [ ] Update `TaskDetailsPanel` to:
  - [ ] show an **Approve** button only for admin users
  - [ ] call the approve endpoint
  - [ ] refresh/update task state based on response.
- [ ] Update other places that render subtasks (`UserDashboard` slide-over, `TaskModal`) to handle new field safely.

## Manual test
- [ ] User marks subtasks complete; main task should NOT become `Completed`.
- [ ] Admin approves subtasks; only then main task becomes `Completed`.
