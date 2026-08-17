package com.complaint.system.model;

import java.time.LocalDateTime;

/**
 * User Satisfaction Feedback submitted upon ticket resolution.
 */
public record Feedback(
    int rating,
    String comment,
    LocalDateTime submittedAt
) {
    public Feedback {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Feedback rating must be between 1 and 5 stars");
        }
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}
