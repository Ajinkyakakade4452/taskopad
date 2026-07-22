package com.edigital.taskpad.controller;

import com.edigital.taskpad.model.Notification;
import com.edigital.taskpad.model.Task;
import com.edigital.taskpad.repository.NotificationRepository;
import com.edigital.taskpad.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;





@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;

    @Autowired
    public TaskController(TaskRepository taskRepository, NotificationRepository notificationRepository) {
        this.taskRepository = taskRepository;
        this.notificationRepository = notificationRepository;
    }


    @PostConstruct
    public void seedDatabase() {
        if (taskRepository.count() == 0) {
            List<Task> defaultTasks = new ArrayList<>();
            String today = "2026-07-03";
            String tomorrow = "2026-07-04";
            String dayAfter = "2026-07-05";
            String yesterday = "2026-07-02";

            // Task 1 - Today
            Task t1 = new Task();
            t1.setId("cal-1");
            t1.setName("Graphic Designing Batch");
            t1.setDescription("Training and design review session");
            t1.setProject("Om Associates");
            t1.setProjects(List.of("Om Associates"));
            t1.setPriority("High");
            t1.setDueDate(today);
            t1.setTime("11:00 AM - 12:30 PM");
            t1.setAssignTo("Krishna Lokhande");
            t1.setAssignees(List.of("Krishna Lokhande"));
            t1.setStatus("Pending");
            defaultTasks.add(t1);

            // Task 2 - Today
            Task t2 = new Task();
            t2.setId("cal-2");
            t2.setName("Daily 5 Stories (Engagable)");
            t2.setDescription("Social media interactive story updates");
            t2.setProject("YouGo");
            t2.setProjects(List.of("YouGo"));
            t2.setPriority("Medium");
            t2.setDueDate(today);
            t2.setTime("1:00 PM - 2:00 PM");
            t2.setAssignTo("Alister Manikam");
            t2.setAssignees(List.of("Alister Manikam"));
            t2.setStatus("In Progress");
            defaultTasks.add(t2);

            // Task 3 - Tomorrow
            Task t3 = new Task();
            t3.setId("cal-3");
            t3.setName("Daily 5 Engagable Story Idea");
            t3.setDescription("Ideation and alignment with content strategy");
            t3.setProject("YouGo");
            t3.setProjects(List.of("YouGo"));
            t3.setPriority("Medium");
            t3.setDueDate(tomorrow);
            t3.setTime("3:00 PM - 4:00 PM");
            t3.setAssignTo("Kriti Khandelwal");
            t3.setAssignees(List.of("Kriti Khandelwal"));
            t3.setStatus("Pending");
            defaultTasks.add(t3);

            // Task 4 - Today
            Task t4 = new Task();
            t4.setId("cal-4");
            t4.setName("Leads Sending Task Morning 9.30");
            t4.setDescription("Disbursal of freshly processed leads");
            t4.setProject("Net Access Internet");
            t4.setProjects(List.of("Net Access Internet"));
            t4.setPriority("High");
            t4.setDueDate(today);
            t4.setTime("9:30 AM - 10:00 AM");
            t4.setAssignTo("Aditya Kirat Karve");
            t4.setAssignees(List.of("Aditya Kirat Karve"));
            t4.setStatus("Completed");
            defaultTasks.add(t4);

            // Task 5 - Yesterday (Overdue)
            Task t5 = new Task();
            t5.setId("cal-5");
            t5.setName("Leads sending Task Daily 5.30 Evening");
            t5.setDescription("End of day leads update and client report");
            t5.setProject("Net Access Internet");
            t5.setProjects(List.of("Net Access Internet"));
            t5.setPriority("High");
            t5.setDueDate(yesterday);
            t5.setTime("5:30 PM - 6:00 PM");
            t5.setAssignTo("Ajinkya Kakade");
            t5.setAssignees(List.of("Ajinkya Kakade"));
            t5.setStatus("Pending");
            defaultTasks.add(t5);

            // Task 6 - Day After
            Task t6 = new Task();
            t6.setId("cal-6");
            t6.setName("Client Presentation Deck");
            t6.setDescription("Prepare and review client presentation slides");
            t6.setProject("Om Associates");
            t6.setProjects(List.of("Om Associates"));
            t6.setPriority("Critical");
            t6.setDueDate(dayAfter);
            t6.setTime("10:00 AM - 12:00 PM");
            t6.setAssignTo("Ajinkya Kakade");
            t6.setAssignees(List.of("Ajinkya Kakade", "Krishna Lokhande"));
            t6.setStatus("In Progress");
            defaultTasks.add(t6);

            taskRepository.saveAll(defaultTasks);
            System.out.println("Database successfully seeded with 6 default tasks!");
        }
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        Optional<Task> task = taskRepository.findById(id);
        return task.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        if (task.getId() == null || task.getId().isEmpty()) {
            task.setId("task-" + System.currentTimeMillis());
        }
        return taskRepository.save(task);
    }

    @PostMapping("/bulk")
    public List<Task> createBulkTasks(@RequestBody List<Task> tasks) {
        if (tasks == null) {
            return List.of();
        }

        List<Task> prepared = new ArrayList<>();
        for (Task task : tasks) {
            if (task == null) continue;

            if (task.getId() == null || task.getId().isEmpty()) {
                task.setId("task-" + System.currentTimeMillis() + "-" + prepared.size());
            }
            prepared.add(task);
        }

        return taskRepository.saveAll(prepared);
    }

    // Documents mandatory toggle (admin-configurable)
    private static volatile boolean documentsMandatory = false;

    @GetMapping("/admin/documents-mandatory")
    public ResponseEntity<Map<String, Object>> getDocumentsMandatory() {
        return ResponseEntity.ok(Map.of("mandatory", documentsMandatory));
    }

    @PutMapping("/admin/documents-mandatory")
    public ResponseEntity<?> setDocumentsMandatory(@RequestBody Map<String, Object> payload) {
        Object v = payload == null ? null : payload.get("mandatory");
        boolean next = v instanceof Boolean ? (Boolean) v : (v != null && Boolean.parseBoolean(String.valueOf(v)));
        documentsMandatory = next;
        return ResponseEntity.ok(Map.of("mandatory", documentsMandatory));
    }


    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task taskDetails) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isPresent()) {
            Task task = optionalTask.get();

            // ── Mandatory documents enforcement (only when submitting / not draft) ──
            Boolean incomingIsDraft = taskDetails.getIsDraft();
            boolean submitting = incomingIsDraft == null ? false : !incomingIsDraft;

            List<String> incomingDocs = taskDetails.getDocuments();
            boolean hasDocs = incomingDocs != null && !incomingDocs.isEmpty();

            if (submitting && documentsMandatory && !hasDocs) {
                return ResponseEntity.badRequest().body(null);
            }

            task.setName(taskDetails.getName());
            task.setDescription(taskDetails.getDescription());
            task.setProject(taskDetails.getProject());
            task.setProjects(taskDetails.getProjects());
            task.setPriority(taskDetails.getPriority());
            task.setDueDate(taskDetails.getDueDate());
            task.setTime(taskDetails.getTime());
            task.setAssignTo(taskDetails.getAssignTo());
            task.setAssignees(taskDetails.getAssignees());

            // Persist subtasks first, then recompute status from workflow rules
            task.setDocuments(taskDetails.getDocuments());
            task.setSubTasks(taskDetails.getSubTasks());
            // keep status consistent with workflow rule

            task.setChecklist(taskDetails.getChecklist());
            task.setComments(taskDetails.getComments());
            task.setTimeLogs(taskDetails.getTimeLogs());
            task.setIsDraft(taskDetails.getIsDraft());
            task.setIsRecurring(taskDetails.getIsRecurring());
            task.setRecurrence(taskDetails.getRecurrence());
            task.setStartTime(taskDetails.getStartTime());
            task.setEndTime(taskDetails.getEndTime());
            task.setReminderBefore(taskDetails.getReminderBefore());

            task.setClient(taskDetails.getClient());
            task.setService(taskDetails.getService());
            task.setFollower(taskDetails.getFollower());

            // Persist the status updated from frontend
            String oldStatus = task.getStatus();
            task.setStatus(taskDetails.getStatus());

            recomputeTaskStatusFromSubTasks(task);

            Task updatedTask = taskRepository.save(task);


            // ── Create real notifications in DB on workflow transitions ──
            try {
                String newStatus = updatedTask.getStatus();
                if (newStatus != null && !newStatus.equalsIgnoreCase(oldStatus)) {

                    // When user submits: Pending -> Under Review (admin needs notification)
                    if ("Under Review".equalsIgnoreCase(newStatus)) {
                        String adminEmail = "admin@edigitalknowledge.com";
                        Notification nt = new Notification();
                        nt.setUserEmail(adminEmail);
                        nt.setType("UNDER_REVIEW");
                        nt.setTitle("🔔 Task submitted for review");
                        nt.setMessage("Task \"" + updatedTask.getName() + "\" is awaiting admin approval.");
                        nt.setRead(false);
                        notificationRepository.save(nt);
                    }

                    // When documents are attached by admin during Pending/Under Review -> notify user
                    // (Frontend stores attachments in task.documents; we compare to old state.)
                    List<String> oldDocs = task.getDocuments();
                    List<String> nowDocs = updatedTask.getDocuments();
                    boolean docsChanged = (nowDocs != null && !nowDocs.equals(oldDocs));
                    if (docsChanged && nowDocs != null && !nowDocs.isEmpty()) {
                        // Notify assignees/assignTo if present
                        List<String> recipients = new ArrayList<>();
                        if (updatedTask.getAssignTo() != null && !updatedTask.getAssignTo().isBlank()) {
                            recipients.add(updatedTask.getAssignTo());
                        }
                        if (updatedTask.getAssignees() != null) {
                            for (String a : updatedTask.getAssignees()) {
                                if (a != null && !a.isBlank()) recipients.add(a);
                            }
                        }
                        for (String r : recipients) {
                            if (r != null && r.contains("@")) {
                                Notification nt = new Notification();
                                nt.setUserEmail(r);
                                nt.setType("DOCUMENTS_ATTACHED");
                                nt.setTitle("📎 Documents attached by admin");
                                nt.setMessage("Admin attached documents for \"" + updatedTask.getName() + "\".");
                                nt.setRead(false);
                                notificationRepository.save(nt);
                            }
                        }
                    }

                    // When admin approves: Under Review -> Completed
                    if ("Completed".equalsIgnoreCase(newStatus)) {
                        // Notify assignees/assignTo
                        List<String> recipients = new ArrayList<>();
                        if (updatedTask.getAssignTo() != null && !updatedTask.getAssignTo().isBlank()) {
                            recipients.add(updatedTask.getAssignTo());
                        }
                        if (updatedTask.getAssignees() != null) {
                            for (String a : updatedTask.getAssignees()) {
                                if (a != null && !a.isBlank()) recipients.add(a);
                            }
                        }

                        // This app stores names in task; map them to emails is not implemented.
                        // Fallback: store notification under userEmail if assignTo matches email; else skip.
                        // (Later we can enhance with UserRepository name->email mapping.)
                        for (String r : recipients) {
                            String maybeEmail = r;
                            if (maybeEmail.contains("@")) {
                                Notification nt = new Notification();
                                nt.setUserEmail(maybeEmail);
                                nt.setType("COMPLETED");
                                nt.setTitle("✅ Task approved");
                                nt.setMessage("Admin marked \"" + updatedTask.getName() + "\" as Completed.");
                                nt.setRead(false);
                                notificationRepository.save(nt);
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
                // don't break task update if notification fails
            }

            return ResponseEntity.ok(updatedTask);

        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private void recomputeTaskStatusFromSubTasks(Task task) {
        List<com.edigital.taskpad.model.SubTask> st = task.getSubTasks();
        if (st == null || st.isEmpty()) {
            // Keep existing status if no subtasks exist
            return;
        }

        boolean allCompleted = true;
        boolean allApproved = true;
        boolean anyRejected = false;

        for (com.edigital.taskpad.model.SubTask s : st) {
            if (s.isRejectedByAdmin()) anyRejected = true;
            if (!s.isCompleted()) allCompleted = false;
            if (!s.isApprovedByAdmin()) allApproved = false;
        }

        if (anyRejected) {
            // If any subtask is rejected, move away from Completed
            if ("Completed".equalsIgnoreCase(task.getStatus())) {
                task.setStatus("Pending");
            }
        } else if (allCompleted && allApproved) {
            task.setStatus("Completed");
        } else {
            // Do not auto-complete; move away from Completed if workflow not satisfied
            if ("Completed".equalsIgnoreCase(task.getStatus())) {
                task.setStatus("Pending");
            }
        }
    }


    @PostMapping("/approve-bulk")
    public ResponseEntity<List<Task>> approveBulkTasks(@RequestBody Map<String, Object> payload) {
        if (payload == null || !payload.containsKey("taskIds")) {
            return ResponseEntity.badRequest().build();
        }

        @SuppressWarnings("unchecked")
        List<String> taskIds = (List<String>) payload.get("taskIds");
        String action = payload.getOrDefault("action", "approve").toString();

        if (taskIds == null || taskIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<Task> updatedTasks = new ArrayList<>();

        for (String taskId : taskIds) {
            Optional<Task> optionalTask = taskRepository.findById(taskId);
            if (optionalTask.isEmpty()) {
                continue;
            }

            Task task = optionalTask.get();
            String oldStatus = task.getStatus();

            if ("approve".equalsIgnoreCase(action)) {
                task.setStatus("Completed");
            } else if ("reject".equalsIgnoreCase(action)) {
                task.setStatus("Rejected");
            } else {
                continue;
            }

            recomputeTaskStatusFromSubTasks(task);
            Task saved = taskRepository.save(task);
            updatedTasks.add(saved);

            // ── Create notifications ──
            try {
                String newStatus = saved.getStatus();
                if (newStatus != null && !newStatus.equalsIgnoreCase(oldStatus)) {
                    if ("Completed".equalsIgnoreCase(newStatus)) {
                        List<String> recipients = new ArrayList<>();
                        if (saved.getAssignTo() != null && !saved.getAssignTo().isBlank()) {
                            recipients.add(saved.getAssignTo());
                        }
                        if (saved.getAssignees() != null) {
                            for (String a : saved.getAssignees()) {
                                if (a != null && !a.isBlank()) recipients.add(a);
                            }
                        }
                        for (String r : recipients) {
                            if (r != null && r.contains("@")) {
                                Notification nt = new Notification();
                                nt.setUserEmail(r);
                                nt.setType("COMPLETED");
                                nt.setTitle("✅ Task approved");
                                nt.setMessage("Admin marked \"" + saved.getName() + "\" as Completed (bulk).");
                                nt.setRead(false);
                                notificationRepository.save(nt);
                            }
                        }
                    } else if ("Rejected".equalsIgnoreCase(newStatus)) {
                        List<String> recipients = new ArrayList<>();
                        if (saved.getAssignTo() != null && !saved.getAssignTo().isBlank()) {
                            recipients.add(saved.getAssignTo());
                        }
                        if (saved.getAssignees() != null) {
                            for (String a : saved.getAssignees()) {
                                if (a != null && !a.isBlank()) recipients.add(a);
                            }
                        }
                        for (String r : recipients) {
                            if (r != null && r.contains("@")) {
                                Notification nt = new Notification();
                                nt.setUserEmail(r);
                                nt.setType("REJECTED");
                                nt.setTitle("❌ Task rejected");
                                nt.setMessage("Admin rejected \"" + saved.getName() + "\" (bulk).");
                                nt.setRead(false);
                                notificationRepository.save(nt);
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
                // don't break bulk update if notification fails
            }
        }

        return ResponseEntity.ok(updatedTasks);
    }

    @PostMapping("/{taskId}/subtasks/{subtaskId}/approve")
    public ResponseEntity<Task> approveSubTask(
            @PathVariable String taskId,
            @PathVariable String subtaskId
    ) {
        Optional<Task> optionalTask = taskRepository.findById(taskId);
        if (optionalTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = optionalTask.get();
        List<com.edigital.taskpad.model.SubTask> subtasks = task.getSubTasks();
        if (subtasks == null || subtasks.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boolean updated = false;
        for (com.edigital.taskpad.model.SubTask s : subtasks) {
            if (s.getId() != null && s.getId().equals(subtaskId)) {
                s.setApprovedByAdmin(true);
                s.setApprovedByAdminAt(String.valueOf(System.currentTimeMillis()));
                updated = true;
                break;
            }
        }

        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        task.setSubTasks(subtasks);
        recomputeTaskStatusFromSubTasks(task);
        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{taskId}/subtasks/approve-all")
    public ResponseEntity<Task> approveAllSubTasks(@PathVariable String taskId) {
        Optional<Task> optionalTask = taskRepository.findById(taskId);
        if (optionalTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = optionalTask.get();
        List<com.edigital.taskpad.model.SubTask> subtasks = task.getSubTasks();
        if (subtasks == null || subtasks.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String timestamp = String.valueOf(System.currentTimeMillis());
        for (com.edigital.taskpad.model.SubTask s : subtasks) {
            s.setApprovedByAdmin(true);
            s.setApprovedByAdminAt(timestamp);
        }

        task.setSubTasks(subtasks);
        recomputeTaskStatusFromSubTasks(task);
        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{taskId}/subtasks/approve-bulk")
    public ResponseEntity<Task> approveBulkSubTasks(
            @PathVariable String taskId,
            @RequestBody List<String> subtaskIds
    ) {
        Optional<Task> optionalTask = taskRepository.findById(taskId);
        if (optionalTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = optionalTask.get();
        List<com.edigital.taskpad.model.SubTask> subtasks = task.getSubTasks();
        if (subtasks == null || subtasks.isEmpty() || subtaskIds == null || subtaskIds.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String timestamp = String.valueOf(System.currentTimeMillis());
        boolean updated = false;
        for (com.edigital.taskpad.model.SubTask s : subtasks) {
            if (s.getId() != null && subtaskIds.contains(s.getId())) {
                s.setApprovedByAdmin(true);
                s.setApprovedByAdminAt(timestamp);
                // Clear any previous rejection when approving
                s.setRejectedByAdmin(false);
                s.setRejectedByAdminAt(null);
                updated = true;
            }
        }

        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        task.setSubTasks(subtasks);
        recomputeTaskStatusFromSubTasks(task);
        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    // ── Subtask Reject Endpoints ──────────────────────────────────────────────

    @PostMapping("/{taskId}/subtasks/{subtaskId}/reject")
    public ResponseEntity<Task> rejectSubTask(
            @PathVariable String taskId,
            @PathVariable String subtaskId
    ) {
        Optional<Task> optionalTask = taskRepository.findById(taskId);
        if (optionalTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = optionalTask.get();
        List<com.edigital.taskpad.model.SubTask> subtasks = task.getSubTasks();
        if (subtasks == null || subtasks.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boolean updated = false;
        String timestamp = String.valueOf(System.currentTimeMillis());
        for (com.edigital.taskpad.model.SubTask s : subtasks) {
            if (s.getId() != null && s.getId().equals(subtaskId)) {
                s.setRejectedByAdmin(true);
                s.setRejectedByAdminAt(timestamp);
                s.setCompleted(false); // Reset completed so user must redo
                s.setApprovedByAdmin(false); // Clear any prior approval
                s.setApprovedByAdminAt(null);
                updated = true;
                break;
            }
        }

        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        task.setSubTasks(subtasks);
        recomputeTaskStatusFromSubTasks(task);
        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{taskId}/subtasks/reject-all")
    public ResponseEntity<Task> rejectAllSubTasks(@PathVariable String taskId) {
        Optional<Task> optionalTask = taskRepository.findById(taskId);
        if (optionalTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = optionalTask.get();
        List<com.edigital.taskpad.model.SubTask> subtasks = task.getSubTasks();
        if (subtasks == null || subtasks.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String timestamp = String.valueOf(System.currentTimeMillis());
        for (com.edigital.taskpad.model.SubTask s : subtasks) {
            if (!s.isApprovedByAdmin() && !s.isRejectedByAdmin()) {
                s.setRejectedByAdmin(true);
                s.setRejectedByAdminAt(timestamp);
                s.setCompleted(false); // Reset completed so user must redo
            }
        }

        task.setSubTasks(subtasks);
        recomputeTaskStatusFromSubTasks(task);
        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{taskId}/subtasks/reject-bulk")
    public ResponseEntity<Task> rejectBulkSubTasks(
            @PathVariable String taskId,
            @RequestBody List<String> subtaskIds
    ) {
        Optional<Task> optionalTask = taskRepository.findById(taskId);
        if (optionalTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = optionalTask.get();
        List<com.edigital.taskpad.model.SubTask> subtasks = task.getSubTasks();
        if (subtasks == null || subtasks.isEmpty() || subtaskIds == null || subtaskIds.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String timestamp = String.valueOf(System.currentTimeMillis());
        boolean updated = false;
        for (com.edigital.taskpad.model.SubTask s : subtasks) {
            if (s.getId() != null && subtaskIds.contains(s.getId())) {
                s.setRejectedByAdmin(true);
                s.setRejectedByAdminAt(timestamp);
                s.setCompleted(false); // Reset completed so user must redo
                s.setApprovedByAdmin(false);
                s.setApprovedByAdminAt(null);
                updated = true;
            }
        }

        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        task.setSubTasks(subtasks);
        recomputeTaskStatusFromSubTasks(task);
        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{taskId}/duplicate")
    public ResponseEntity<Task> duplicateTask(@PathVariable String taskId) {
        Optional<Task> optionalTask = taskRepository.findById(taskId);
        if (optionalTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task src = optionalTask.get();
        Task duplicated = new Task();

        // Generate new top-level id
        duplicated.setId("task-" + System.currentTimeMillis() + "-dup");

        // Copy simple fields
        duplicated.setName(src.getName());
        duplicated.setDescription(src.getDescription());
        duplicated.setProject(src.getProject());
        duplicated.setProjects(src.getProjects());
        duplicated.setPriority(src.getPriority());
        duplicated.setDueDate(src.getDueDate()); // keep same
        duplicated.setTime(src.getTime());
        duplicated.setAssignTo(src.getAssignTo());
        duplicated.setAssignees(src.getAssignees());

        // Override status
        duplicated.setStatus("Pending");

        duplicated.setClient(src.getClient());
        duplicated.setService(src.getService());
        duplicated.setFollower(src.getFollower());
        duplicated.setDocuments(src.getDocuments());

        // Deep copy nested lists (regenerate nested ids where applicable)
        if (src.getSubTasks() != null) {
            List<com.edigital.taskpad.model.SubTask> copied = new ArrayList<>();
            int i = 0;
            for (com.edigital.taskpad.model.SubTask st : src.getSubTasks()) {
                if (st == null) continue;
                com.edigital.taskpad.model.SubTask next = new com.edigital.taskpad.model.SubTask();
                next.setId((st.getId() == null || st.getId().isEmpty())
                        ? null
                        : st.getId() + "-dup-" + System.currentTimeMillis() + "-" + i);
                next.setName(st.getName());
                next.setCompleted(st.isCompleted());

                // Copy existing subtask comments (so admins/users can still see history)
                next.setComments(st.getComments() != null ? new ArrayList<>(st.getComments()) : null);

                // reset workflow approval gates for duplicate so it can go through review again
                next.setApprovedByAdmin(false);
                next.setApprovedByAdminAt(null);
                copied.add(next);
                i++;
            }
            duplicated.setSubTasks(copied);
        }


        duplicated.setChecklist(src.getChecklist() != null ? new ArrayList<>(src.getChecklist()) : null);
        duplicated.setComments(src.getComments() != null ? new ArrayList<>(src.getComments()) : null);
        duplicated.setTimeLogs(src.getTimeLogs() != null ? new ArrayList<>(src.getTimeLogs()) : null);

        // Copy flags + recurrence/time fields
        duplicated.setIsDraft(src.getIsDraft());
        duplicated.setIsRecurring(src.getIsRecurring());
        duplicated.setRecurrence(src.getRecurrence());
        duplicated.setStartTime(src.getStartTime());
        duplicated.setEndTime(src.getEndTime());
        duplicated.setReminderBefore(src.getReminderBefore());

        Task saved = taskRepository.save(duplicated);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<Map<String, Object>> deleteBulkTasks(@RequestBody Map<String, Object> payload) {
        if (payload == null || !payload.containsKey("taskIds")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing taskIds", "deletedCount", 0));
        }

        @SuppressWarnings("unchecked")
        List<String> taskIds = (List<String>) payload.get("taskIds");
        if (taskIds == null || taskIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Empty taskIds", "deletedCount", 0));
        }

        int deletedCount = 0;
        for (String taskId : taskIds) {
            if (taskRepository.existsById(taskId)) {
                taskRepository.deleteById(taskId);
                deletedCount++;
            }
        }

        return ResponseEntity.ok(Map.of(
            "message", deletedCount + " task(s) deleted successfully",
            "deletedCount", deletedCount
        ));
    }


    @PostMapping("/seed")
    public ResponseEntity<String> forceSeed() {
        taskRepository.deleteAll();
        seedDatabase();
        return ResponseEntity.ok("Database re-seeded successfully!");
    }
}
