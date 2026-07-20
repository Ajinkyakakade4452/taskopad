# Subtask Approval: Approve All + Select & Approve

## Steps

### Backend
- [x] 1. Add `POST /api/tasks/{taskId}/subtasks/approve-all` endpoint in `TaskController.java`
- [x] 2. Add `POST /api/tasks/{taskId}/subtasks/approve-bulk` endpoint in `TaskController.java`

### Frontend
- [x] 3. Update `TaskDetailsPanel.tsx`:
  - [x] Add `selectedSubtaskIds: Set<string>` state and selection checkboxes per subtask
  - [x] Add "Select All" checkbox in subtask header
  - [x] Add "Approve All" button at top of subtasks section (admin only)
  - [x] Add "Approve Selected (X)" button (visible when items selected)
  - [x] Wire approve functions to call backend API

### Verification
- [x] 4. Backend compiles successfully
- [ ] 5. Frontend typecheck complete (pre-existing TS errors only)

