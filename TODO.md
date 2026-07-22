# Edit Task UI = Add Task UI

## Task
In the Admin panel, the Edit Task UI should match the Add Task UI. The same interface used while adding a task should also be used when editing it.

## Steps

### Step 1: Modify `TaskModal.tsx` to support edit mode
- [x] Add `editingTask?: Task` and `onUpdate?: (task: Task) => void` props
- [x] Add `useEffect` to pre-populate all form fields when `editingTask` changes
- [x] Modify save logic to call `onUpdate` when in edit mode
- [x] Change header title dynamically ("Edit Workspace Task" vs "Create Live Workspace Task")

### Step 2: Modify `App.tsx` to manage edit state
- [x] Add `editingTask` state variable and `isEditTaskModalOpen` state (or reuse `isAddTaskModalOpen`)
- [x] Add `handleEditTask` function that sets `editingTask` and opens the modal
- [x] Add `handleUpdateTask` function for saving edits via TaskModal
- [x] Pass `editingTask` and `onUpdate` props to `TaskModal`
- [x] Pass `onEditTask` callback to `TaskDetailsPanel`

### Step 3: Modify `TaskDetailsPanel.tsx`
- [x] Add `onEditTask?: (task: Task) => void` prop
- [x] Update "Edit Task" button to call `onEditTask(task)` to open full TaskModal
- [x] Keep inline editing as fallback if `onEditTask` is not provided

