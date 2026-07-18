# TODO: Documents Mandatory option (admin-configurable)

- [ ] Backend: add API endpoints to get/set documentsMandatory
- [ ] Backend: return proper error message (400) when documents missing on submit
- [ ] Frontend: add admin toggle UI in SettingsPage
- [ ] Frontend: fetch toggle value and pass/consume in TaskModal
- [ ] Frontend: block Submit Task when mandatory enabled and no documents
- [ ] Quick manual test cases
  - [ ] mandatory OFF: user submit without docs works
  - [ ] mandatory ON: user submit without docs blocked (UI)
  - [ ] mandatory ON: bypass UI → backend returns 400

