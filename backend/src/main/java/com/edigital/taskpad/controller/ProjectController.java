package com.edigital.taskpad.controller;

import com.edigital.taskpad.model.Project;
import com.edigital.taskpad.model.Task;

import com.edigital.taskpad.repository.ProjectRepository;
import com.edigital.taskpad.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Autowired
    public ProjectController(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        for (Project p : projects) {
            enrichWithTaskCounts(p);
        }
        return ResponseEntity.ok(projects);
    }


    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> payload) {
        String name = getString(payload, "name");
        String creator = getString(payload, "creator");
        String color = getString(payload, "color");
        Boolean hasEndDate = getBoolean(payload, "hasEndDate");
        String endDate = getString(payload, "endDate");
        String id = getString(payload, "id");

        if (name == null || name.isBlank()) {
            return badRequest("Project name is required");
        }
        if (creator == null || creator.isBlank()) {
            creator = "Admin";
        }
        if (color == null || color.isBlank()) {
            color = "cyan";
        }
        if (hasEndDate == null) {
            hasEndDate = false;
        }
        if (hasEndDate && (endDate == null || endDate.isBlank())) {
            return badRequest("endDate is required when hasEndDate is true");
        }

        if (id == null || id.isBlank()) {
            id = "proj-" + System.currentTimeMillis();
        }

        if (projectRepository.existsByNameIgnoreCase(name)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Project with this name already exists"));
        }

        Project project = new Project();
        project.setId(id);
        project.setName(name);
        project.setCreator(creator);
        project.setColor(color);
        project.setHasEndDate(hasEndDate);
        project.setEndDate(endDate);

        Project saved = projectRepository.save(project);
        enrichWithTaskCounts(saved);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        Optional<Project> optional = projectRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = optional.get();

        String name = getString(payload, "name");
        String creator = getString(payload, "creator");
        String color = getString(payload, "color");
        Boolean hasEndDate = getBoolean(payload, "hasEndDate");
        String endDate = getString(payload, "endDate");

        if (name != null && !name.isBlank() && !name.equalsIgnoreCase(project.getName())) {
            if (projectRepository.existsByNameIgnoreCase(name)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Project with this name already exists"));
            }
            project.setName(name);
        }
        if (creator != null && !creator.isBlank()) project.setCreator(creator);
        if (color != null && !color.isBlank()) project.setColor(color);
        if (hasEndDate != null) {
            project.setHasEndDate(hasEndDate);
            if (!hasEndDate) {
                project.setEndDate(null);
            } else {
                if (endDate == null || endDate.isBlank()) {
                    return badRequest("endDate is required when hasEndDate is true");
                }
                project.setEndDate(endDate);
            }
        }

        Project saved = projectRepository.save(project);
        enrichWithTaskCounts(saved);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        Optional<Project> optional = projectRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = optional.get();
        String projectName = project.getName();

        // Safety check: prevent deletion if tasks reference this project
        List<Task> tasks = taskRepository.findAll();
        boolean referenced = false;
        for (Task t : tasks) {
            if (t.getProject() != null && t.getProject().equalsIgnoreCase(projectName)) {
                referenced = true;
                break;
            }
            if (t.getProjects() != null) {
                for (String p : t.getProjects()) {
                    if (p != null && p.equalsIgnoreCase(projectName)) {
                        referenced = true;
                        break;
                    }
                }
            }
            if (referenced) break;
        }

        if (referenced) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Cannot delete project; tasks are referencing it"));
        }

        projectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private void enrichWithTaskCounts(Project project) {
        String projectName = project.getName();
        int total = 0;
        int completed = 0;

        List<Task> tasks = taskRepository.findAll();
        for (Task t : tasks) {
            boolean matches = false;
            if (t.getProject() != null && t.getProject().equalsIgnoreCase(projectName)) {
                matches = true;
            }
            if (!matches && t.getProjects() != null) {
                for (String p : t.getProjects()) {
                    if (p != null && p.equalsIgnoreCase(projectName)) {
                        matches = true;
                        break;
                    }
                }
            }

            if (matches) {
                total++;
                if ("Completed".equalsIgnoreCase(t.getStatus())) {
                    completed++;
                }
            }
        }

        project.setTotalTasks(total);
        project.setCompletedTasks(completed);
    }

    private ResponseEntity<?> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    private String getString(Map<String, Object> payload, String key) {
        Object v = payload.get(key);
        if (v == null) return null;
        return String.valueOf(v);
    }

    private Boolean getBoolean(Map<String, Object> payload, String key) {
        Object v = payload.get(key);
        if (v == null) return null;
        if (v instanceof Boolean b) return b;
        return Boolean.parseBoolean(String.valueOf(v));
    }
}

