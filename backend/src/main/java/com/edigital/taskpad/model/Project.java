package com.edigital.taskpad.model;

import jakarta.persistence.*;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    private String id;

    @Column(unique = true)
    private String name;

    private String creator;

    private boolean hasEndDate;

    private String endDate;

    // UI counters (computed/maintained by backend when responding)
    @Transient
    private int completedTasks;

    @Transient
    private int totalTasks;

    private String color;

    public Project() {}

    public Project(String id, String name, String creator, boolean hasEndDate, String endDate, int completedTasks, int totalTasks, String color) {
        this.id = id;
        this.name = name;
        this.creator = creator;
        this.hasEndDate = hasEndDate;
        this.endDate = endDate;
        this.completedTasks = completedTasks;
        this.totalTasks = totalTasks;
        this.color = color;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCreator() { return creator; }
    public void setCreator(String creator) { this.creator = creator; }

    public boolean isHasEndDate() { return hasEndDate; }
    public void setHasEndDate(boolean hasEndDate) { this.hasEndDate = hasEndDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public int getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }

    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}

