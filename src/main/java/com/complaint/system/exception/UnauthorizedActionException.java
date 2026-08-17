package com.complaint.system.exception;

/**
 * Thrown when an actor attempts an action violating Role-Based Access Control (RBAC).
 */
public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }
}
