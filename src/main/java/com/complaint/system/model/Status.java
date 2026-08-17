package com.complaint.system.model;

/**
 * Finite State Machine Lifecycle Statuses for Complaint Tickets.
 * Permitted transitions:
 *   OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
 *   OPEN / IN_PROGRESS -> REJECTED
 */
public enum Status {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED,
    REJECTED
}
