package com.edigital.taskpad.model;

import java.util.List;

public class SubTask {
    private String id;
    private String name;
    private boolean completed;
    private String date; // Date associated with the subtask (YYYY-MM-DD)

    // Admin approval gate (workflow): only approved + completed subtasks allow main task completion
    private boolean approvedByAdmin;
    private String approvedByAdminAt;

    // Subtask-level comments (admin + user)
    private List<Comment> comments;

    // Constructors
    public SubTask() {}

    public SubTask(String id, String name, boolean completed) {
        this.id = id;
        this.name = name;
        this.completed = completed;
        this.approvedByAdmin = false;
        this.approvedByAdminAt = null;
        this.comments = null;
    }

    public SubTask(String id, String name, boolean completed, boolean approvedByAdmin, String approvedByAdminAt) {
        this.id = id;
        this.name = name;
        this.completed = completed;
        this.approvedByAdmin = approvedByAdmin;
        this.approvedByAdminAt = approvedByAdminAt;
        this.comments = null;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public boolean isApprovedByAdmin() { return approvedByAdmin; }
    public void setApprovedByAdmin(boolean approvedByAdmin) { this.approvedByAdmin = approvedByAdmin; }

    public String getApprovedByAdminAt() { return approvedByAdminAt; }
    public void setApprovedByAdminAt(String approvedByAdminAt) { this.approvedByAdminAt = approvedByAdminAt; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }
}


