# Task: Subtask completion should not auto-complete main task (admin approval required)

## Steps
1. Update backend model: extend `SubTask` with `approvedByAdmin` (+ optional timestamp) and ensure getters/setters.
2. Update backend controller: add endpoint `POST /api/tasks/{taskId}/subtasks/{subtaskId}/approve`. ✅
3. Update backend status recompute logic:
   - in `PUT /api/tasks/{id}` recompute status based on `all subtasks completed && all approved`. ✅

4. Update backend converter (`SubTaskListConverter`) if needed so the new field is serialized/deserialized.
5. Update frontend types: extend `subTasks` type to include `approvedByAdmin?: boolean`.
6. Update `TaskDetailsPanel`:
   - add admin-only approve button per subtask
   - call approve endpoint
   - refresh task state from returned task

7. Wire admin context into `TaskDetailsPanel` caller (pass `isAdmin` or current user role).
8. Update subtask rendering to show approval state.
9. Build + run checks:
   - `backend` compile/package
   - `frontend` typecheck/build
10. Manual test checklist:
   - user completes all subtasks => main NOT Completed
   - admin approves all subtasks => main becomes Completed

