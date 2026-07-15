# TODO: Make Admin Panel Notifications Real Working

## Step 1 — Backend Notification storage (DB)
- Create `Notification` entity (id, userEmail or userId, type, title, message, read flag, createdAt).
- Create `NotificationRepository`.
- Create `NotificationController` with endpoints:
  - `GET /api/notifications` (notifications for current user/role; for now admin can fetch all)
  - `POST /api/notifications` (optional internal)

## Step 2 — Trigger notifications from Task status updates
- In `TaskController.updateTask(...)`, when status changes to:
  - `Under Review`: create notification for admin.
  - `Completed`: create notification for assignee(s)/assigned user(s).

## Step 3 — Frontend: Admin panel uses backend notifications
- In `src/App.tsx` replace localStorage-based admin notification effect with API polling or fetch:
  - `GET /api/notifications`
- Render notifications using existing `Notifications` component.

## Step 4 — (Optional) Unread count in Header
- Compute unread count from fetched notifications and show it in `Header`.

## Step 5 — Test
- Login as user -> submit task -> verify admin UI shows persistent notification after refresh.
- Login as admin -> approve task -> verify user gets persistent notification.
