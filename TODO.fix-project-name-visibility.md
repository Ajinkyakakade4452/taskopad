# Fix Project Name Visibility

## Issue
Project names are being truncated/not fully visible in the UI.

## Steps

### 1. UserDashboard.tsx - Task List Grid ✅
- [x] Increase project column grid width from `[2fr_1fr_1fr_1fr_1fr]` to `[2fr_1.5fr_1fr_1fr_1fr]`
- [x] Remove `max-w-[120px]` truncation on project badge (changed to `max-w-full`)
- [x] Add `title` attribute tooltip on project badge
- [x] Add `title` tooltips on dashboard project list buttons

### 2. AdminProjectsPage.tsx - Project List ✅
- [x] Remove `truncate` class from project name
- [x] Add `title` attribute for tooltip

### 3. index.html - App Title Fix ✅
- [x] Fix "taskopad" typo title to "Edigital TaskPad"

### 4. Sidebar.tsx - Workspace Name ✅
- [x] Remove `truncate` from workspace name, add `title` tooltip

### 5. ProjectsSection.tsx - Project Cards ✅
- [x] Add `title` tooltip attribute on project name in cards

### 6. TaskTable.tsx - Project Badges ✅
- [x] Replace `max-w-[180px]` with `max-w-full`
- [x] Add `title` tooltip attribute on project badges
- [x] Add smart truncation with ellipsis for very long names (20 chars for multi-project, 25 for single)

