# TODO

## Subtask comments visibility (Admin + User)
- [ ] Identify where subtask comments are rendered for Admin view and User view
- [ ] Ensure comment object includes author role/source (admin vs user) or derive from author
- [ ] Update TaskDetailsPanel subtask comment UI so that:
  - [ ] Admin comment shows to user and admin
  - [ ] User comment shows to admin and user
  - [ ] No separate filtered view exists (or role-based filter removed)
- [ ] If backend endpoints are role-based, add/adjust endpoint to return subtask comments to both roles
- [ ] Run frontend build / backend tests and verify in UI

