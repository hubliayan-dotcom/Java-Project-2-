package com.complaint.system.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Threaded Comment / Remark on a Complaint ticket.
 */
public class Comment {
    private final String id;
    private final String authorId;
    private final String authorName;
    private final Role authorRole;
    private final String message;
    private final LocalDateTime createdAt;

    public Comment(String id, String authorId, String authorName, Role authorRole, String message) {
        this.id = Objects.requireNonNull(id, "Comment ID cannot be null");
        this.authorId = Objects.requireNonNull(authorId, "Author ID cannot be null");
        this.authorName = Objects.requireNonNull(authorName, "Author Name cannot be null");
        this.authorRole = Objects.requireNonNull(authorRole, "Author Role cannot be null");
        this.message = Objects.requireNonNull(message, "Message cannot be null");
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public Role getAuthorRole() { return authorRole; }
    public String getMessage() { return message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
