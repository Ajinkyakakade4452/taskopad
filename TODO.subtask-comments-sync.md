# Subtask Comments Sync Implementation Plan

## Changes needed:

### 1. UserDashboard.tsx - Add subtask comment support for users
- Add state for expanded subtask and new comment text
- Add ability to expand a subtask to view/add comments in the task detail panel
- When user adds a comment to a subtask, also append to task-level `comments[]` array
- Persist both changes to backend

### 2. TaskDetailsPanel.tsx - Sync subtask comments to main comments
- Modify `handleAddSubtaskComment` to also append the comment to the task-level `comments[]` array
- This ensures admin sees subtask comments at the task level too

### 3. TaskModal.tsx - Sync subtask comments to main comments
- Modify `addModalSubtaskComment` to also append the comment to the task-level `comments[]` array
- This ensures subtask comments appear in task-level comment history

## Implementation Order:
1. ✅ TaskDetailsPanel.tsx - subtask comments → main comments sync
2. ✅ TaskModal.tsx - subtask comments → main comments sync  
3. ✅ UserDashboard.tsx - add subtask comment UI + sync

