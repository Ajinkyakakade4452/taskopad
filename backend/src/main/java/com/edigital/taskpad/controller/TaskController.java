package com.edigital.taskpad.controller;

import com.edigital.taskpad.model.Task;
import com.edigital.taskpad.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    @Autowired
    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
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

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task taskDetails) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isPresent()) {
            Task task = optionalTask.get();
            task.setName(taskDetails.getName());
            task.setDescription(taskDetails.getDescription());
            task.setProject(taskDetails.getProject());
            task.setProjects(taskDetails.getProjects());
            task.setPriority(taskDetails.getPriority());
            task.setDueDate(taskDetails.getDueDate());
            task.setTime(taskDetails.getTime());
            task.setAssignTo(taskDetails.getAssignTo());
            task.setAssignees(taskDetails.getAssignees());
            task.setStatus(taskDetails.getStatus());
            task.setClient(taskDetails.getClient());
            task.setService(taskDetails.getService());
            task.setFollower(taskDetails.getFollower());
            task.setDocuments(taskDetails.getDocuments());
            task.setSubTasks(taskDetails.getSubTasks());
            task.setChecklist(taskDetails.getChecklist());
            task.setComments(taskDetails.getComments());
            task.setTimeLogs(taskDetails.getTimeLogs());
            task.setIsDraft(taskDetails.getIsDraft());
            task.setIsRecurring(taskDetails.getIsRecurring());
            task.setRecurrence(taskDetails.getRecurrence());
            task.setStartTime(taskDetails.getStartTime());
            task.setEndTime(taskDetails.getEndTime());
            task.setReminderBefore(taskDetails.getReminderBefore());

            Task updatedTask = taskRepository.save(task);
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
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

    @PostMapping("/seed")
    public ResponseEntity<String> forceSeed() {
        taskRepository.deleteAll();
        seedDatabase();
        return ResponseEntity.ok("Database re-seeded successfully!");
    }
}
