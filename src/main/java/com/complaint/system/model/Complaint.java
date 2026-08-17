package com.complaint.system.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Domain entity representing a customer support grievance ticket.
 * Demonstrates OOP encapsulation, type-safe enums, defensive copying,
 * and immutable status audit trails.
 */
public class Complaint {
    private final String id;
    private String title;
    private String description;
    private Category category;
    private Priority priority;
    private Status status;
    private final String userId;
    private final String userName;
    private final String userEmail;
    private String assignedAdminId;
    private String assignedAdminName;
    private String resolution;
    private Feedback feedback;
    private final List<Comment> comments = new ArrayList<>();
    private final List<StatusHistory> history = new ArrayList<>();
    private LocalDateTime slaDueAt;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Complaint(String id, String title, String description, Category category,
                     Priority priority, String userId, String userName, String userEmail) {
        if (title == null || title.trim().length() < 5) {
            throw new IllegalArgumentException("Title must be at least 5 characters");
        }
        if (description == null || description.trim().length() < 10) {
            throw new IllegalArgumentException("Description must be at least 10 characters");
        }
        this.id = Objects.requireNonNull(id, "Complaint ID cannot be null");
        this.title = title.trim();
        this.description = description.trim();
        this.category = Objects.requireNonNullElse(category, Category.OTHER);
        this.priority = Objects.requireNonNullElse(priority, Priority.MEDIUM);
        this.status = Status.OPEN;
        this.userId = Objects.requireNonNull(userId, "UserId cannot be null");
        this.userName = userName;
        this.userEmail = userEmail;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        this.slaDueAt = calculateSlaDue(this.priority, this.createdAt);

        // Initial creation history entry
        this.history.add(new StatusHistory("NONE", Status.OPEN, userId, userName, "Ticket filed by user"));
    }

    private LocalDateTime calculateSlaDue(Priority priority, LocalDateTime fromTime) {
        int hours = (priority != null) ? priority.getSlaHours() : 24;
        return fromTime.plusHours(hours);
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; this.updatedAt = LocalDateTime.now(); }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; this.updatedAt = LocalDateTime.now(); }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; this.updatedAt = LocalDateTime.now(); }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { 
        this.priority = priority; 
        this.slaDueAt = calculateSlaDue(priority, this.createdAt);
        this.updatedAt = LocalDateTime.now(); 
    }
    public Status getStatus() { return status; }
    public String getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public String getAssignedAdminId() { return assignedAdminId; }
    public String getAssignedAdminName() { return assignedAdminName; }
    public String getResolution() { return resolution; }
    public Feedback getFeedback() { return feedback; }
    public LocalDateTime getSlaDueAt() { return slaDueAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<Comment> getComments() {
        return Collections.unmodifiableList(comments);
    }

    public List<StatusHistory> getHistory() {
        return Collections.unmodifiableList(history);
    }

    public void addComment(Comment comment) {
        this.comments.add(Objects.requireNonNull(comment));
        this.updatedAt = LocalDateTime.now();
    }

    public void assignToAdmin(String adminId, String adminName) {
        this.assignedAdminId = adminId;
        this.assignedAdminName = adminName;
        if (this.status == Status.OPEN) {
            transitionStatus(Status.IN_PROGRESS, adminId, adminName, "Assigned to administrator " + adminName);
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void transitionStatus(Status newStatus, String actorId, String actorName, String comment) {
        Status prev = this.status;
        this.status = newStatus;
        this.history.add(new StatusHistory(prev.name(), newStatus, actorId, actorName, comment));
        this.updatedAt = LocalDateTime.now();
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
        this.updatedAt = LocalDateTime.now();
    }

    public void setFeedback(Feedback feedback) {
        this.feedback = feedback;
        this.updatedAt = LocalDateTime.now();
    }
}
