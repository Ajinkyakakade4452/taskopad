# TODO.md

## Admin Project page वर Team/Members add करण्याची फीचर

- [ ] Backend मध्ये Project ↔ Users (team members) साठी model/relationship जोडा (जसे: Project.teamMembers : List<User> किंवा join table).
- [ ] ProjectController मध्ये endpoints जोडा:
  - [ ] GET `/api/projects/{id}/members`
  - [ ] POST `/api/projects/{id}/members` (members जोडणे)
  - [ ] (optional) DELETE `/api/projects/{id}/members/{userId}`
- [ ] Frontend मध्ये AdminProjectsPage मध्ये “Team Members” section/modal जोडा.
- [ ] Frontend मध्ये backend मधून available users fetch करा.
- [ ] Selected members list + add/remove UI तयार करा.
- [ ] Project team add केल्यावर projects re-fetch / members refresh implement करा.
- [ ] App मध्ये notifications/user emails mapping बाबत सुसंगतता तपासा (जर project members वरून notify करायचं असेल तर).
- [ ] सर्व बदल build/test करा (frontend dev + backend start).

