package com.complaint.system.exception;

/**
 * Thrown when an entity (User, Complaint) cannot be found by its identifier.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
