package com.edigital.taskpad.model;

import com.edigital.taskpad.util.converters.*;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    private String id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String project;

    @Convert(converter = ListStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> projects;

    private String priority;

    @Column(name = "due_date")
    private String dueDate;

    private String time;

    @Column(name = "assign_to")
    private String assignTo;

    @Convert(converter = ListStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> assignees;

    private String status;

    private String service;
    private String follower;

    @Convert(converter = ListStringConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    private List<String> documents;

    @Convert(converter = SubTaskListConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    private List<SubTask> subTasks;

    @Convert(converter = ChecklistConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    private List<ChecklistItem> checklist;

    @Convert(converter = CommentListConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    private List<Comment> comments;

    @Convert(converter = TimeLogListConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    private List<TimeLog> timeLogs;

    @Column(name = "documents_mandatory")
    private Boolean documentsMandatory = false;

    @Convert(converter = ListStringConverter.class)
    @Column(columnDefinition = "LONGTEXT", name = "user_documents")
    private List<String> userDocuments;

    @Column(name = "is_draft")
    private Boolean isDraft = false;

    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    @Convert(converter = RecurrenceConverter.class)
    @Column(columnDefinition = "TEXT")
    private Recurrence recurrence;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "reminder_before")
    private String reminderBefore;

    @Column(name = "penalty_amount")
    private Double penaltyAmount = 0.0;

    @Column(name = "is_penalized")
    private Boolean isPenalized = false;

    @Column(name = "custom_penalty")
    private Double customPenalty;

    @Column(name = "completed_at")
    private String completedAt;

    // Constructors
    public Task() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getProject() { return project; }
    public void setProject(String project) { this.project = project; }

    public List<String> getProjects() { return projects; }
    public void setProjects(List<String> projects) { this.projects = projects; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getAssignTo() { return assignTo; }
    public void setAssignTo(String assignTo) { this.assignTo = assignTo; }

    public List<String> getAssignees() { return assignees; }
    public void setAssignees(List<String> assignees) { this.assignees = assignees; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getFollower() { return follower; }
    public void setFollower(String follower) { this.follower = follower; }

    public List<String> getDocuments() { return documents; }
    public void setDocuments(List<String> documents) { this.documents = documents; }

    public Boolean getDocumentsMandatory() { return documentsMandatory; }
    public void setDocumentsMandatory(Boolean documentsMandatory) { this.documentsMandatory = documentsMandatory; }

    public List<String> getUserDocuments() { return userDocuments; }
    public void setUserDocuments(List<String> userDocuments) { this.userDocuments = userDocuments; }

    public List<SubTask> getSubTasks() { return subTasks; }
    public void setSubTasks(List<SubTask> subTasks) { this.subTasks = subTasks; }

    public List<ChecklistItem> getChecklist() { return checklist; }
    public void setChecklist(List<ChecklistItem> checklist) { this.checklist = checklist; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public List<TimeLog> getTimeLogs() { return timeLogs; }
    public void setTimeLogs(List<TimeLog> timeLogs) { this.timeLogs = timeLogs; }

    public Boolean getIsDraft() { return isDraft; }
    public void setIsDraft(Boolean isDraft) { this.isDraft = isDraft; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }

    public Recurrence getRecurrence() { return recurrence; }
    public void setRecurrence(Recurrence recurrence) { this.recurrence = recurrence; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getReminderBefore() { return reminderBefore; }
    public void setReminderBefore(String reminderBefore) { this.reminderBefore = reminderBefore; }

    public Double getPenaltyAmount() { return penaltyAmount; }
    public void setPenaltyAmount(Double penaltyAmount) { this.penaltyAmount = penaltyAmount; }

    public Boolean getIsPenalized() { return isPenalized; }
    public void setIsPenalized(Boolean isPenalized) { this.isPenalized = isPenalized; }

    public Double getCustomPenalty() { return customPenalty; }
    public void setCustomPenalty(Double customPenalty) { this.customPenalty = customPenalty; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
}
