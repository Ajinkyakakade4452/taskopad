# TODO

## Admin user management (Users page)
- [ ] Update `src/components/UsersPage.tsx` to add admin-only UI for add/edit/delete users
- [ ] Wire API calls to backend endpoints:
  - [ ] GET `/api/auth/users`
  - [ ] POST `/api/auth/users`
  - [ ] PUT `/api/auth/users/{id}`
  - [ ] DELETE `/api/auth/users/{id}`
- [ ] Pass logged-in user prop from `src/components/UserDashboard.tsx` into `UsersPage`
- [x] Hide/disable add/edit/delete for non-admin users (UI)
- [ ] Backend role-based authorization (authorization enforcement)
- [ ] Test: admin add/edit/delete + non-admin sees no actions

