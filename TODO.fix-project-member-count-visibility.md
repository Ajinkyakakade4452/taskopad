# Fix: Show projects to users when added as team members

## Problem
When admin adds a user to a project's team members, the project is NOT shown in the user's "Projects" section if they have no tasks assigned to that project.

## Root Cause
`ProjectsSection.tsx` derives project list ONLY from the `tasks` array - if a user has 0 tasks in a project, that project won't appear.

## Steps

- [x] Step 1: Create TODO.md with plan
- [x] Step 2: Backend - Add `findByUserId` to `ProjectTeamMemberRepository.java`
- [x] Step 3: Backend - Add `GET /api/projects/user/{userId}` endpoint in `ProjectController.java`
- [x] Step 4: Frontend - Update `UserDashboard.tsx` to fetch and merge team-member projects

