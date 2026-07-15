# TODO - Admin Projects CRUD

## Step 1: Backend (Project CRUD)
- [ ] Create `Project` entity + `ProjectRepository`
- [ ] Create `ProjectController` with endpoints:
  - [ ] GET `/api/projects`
  - [ ] POST `/api/projects`
  - [ ] PUT `/api/projects/{id}`
  - [ ] DELETE `/api/projects/{id}`
- [ ] Implement delete safety check:
  - [ ] Return 409 if any Task references the project by `project` or inside `projects` list

## Step 2: Frontend (Admin Projects page)
- [ ] Create `src/components/AdminProjectsPage.tsx` with:
  - [ ] Fetch projects from `/api/projects`
  - [ ] Add project modal
  - [ ] Edit project modal
  - [ ] Delete confirmation modal

## Step 3: Wire routing
- [ ] Update `src/App.tsx` Projects view to render `AdminProjectsPage` (admin-only)

## Step 4: Types
- [ ] Verify `src/types.ts` `Project` interface matches backend response

## Step 5: Testing
- [ ] Run backend + frontend
- [ ] Verify add/edit/delete flows
- [ ] Verify delete-blocking when projects are referenced by tasks

