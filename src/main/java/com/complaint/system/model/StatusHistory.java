package com.complaint.system.model;

import java.time.LocalDateTime;

/**
 * Immutable Audit History record for every state transition in the lifecycle.
 */
public record StatusHistory(
    String fromStatus,
    Status toStatus,
    String actorId,
    String actorName,
    String comment,
    LocalDateTime timestamp
) {
    public StatusHistory(String fromStatus, Status toStatus, String actorId, String actorName, String comment) {
        this(fromStatus, toStatus, actorId, actorName, comment, LocalDateTime.now());
    }
}
