package com.complaint.system.exception;

/**
 * Thrown when an illegal lifecycle state transition is attempted
 * (e.g. attempting to move backward to OPEN, or modifying a CLOSED ticket).
 */
public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(String message) {
        super(message);
    }
}
