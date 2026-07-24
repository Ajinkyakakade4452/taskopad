# Subtask Assignee UI Fix — While Approving, Assignee Option Removed

## Problem
In `TaskDetailsPanel.tsx`, when an admin is approving individual subtasks (using thumbs up/down buttons), each subtask row still displays an **assignee badge** (`👤 PersonName`) alongside approval controls. This creates a confusing UX where approval and assignment concerns are mixed.

## Fix

### 1. TaskDetailsPanel.tsx
- [x] Remove the per-subtask assignee badge (`👤 {st.assignTo}`) from each subtask row in the subtask list rendering
- [x] This badge is redundant since the bulk assign toolbar above handles assignments separately
- [x] Keep the bulk assign toolbar and its checkboxes (pink) as they serve a separate purpose
- [x] Keep approval checkboxes (cyan) as they are for bulk approve/reject

### 2. Verification
- [x] Verify no visual regressions in the subtask section
- [x] Bulk assign toolbar still works correctly
- [x] Per-subtask approve/reject buttons work correctly
- [x] Per-subtask checkboxes for approve/reject still work

