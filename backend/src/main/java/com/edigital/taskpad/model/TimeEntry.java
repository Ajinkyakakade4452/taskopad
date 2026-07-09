package com.edigital.taskpad.model;

import jakarta.persistence.*;

@Entity
@Table(name = "time_entries")
public class TimeEntry {
    @Id
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;
    
    private String user;
    private String date;
    private double hours;
    
    @Column(length = 1000)
    private String description;
    
    private String status; // 'billable' | 'non-billable'
    
    public TimeEntry() {}
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public double getHours() { return hours; }
    public void setHours(double hours) { this.hours = hours; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
