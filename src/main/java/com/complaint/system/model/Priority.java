package com.complaint.system.model;

/**
 * Priority levels with associated SLA resolution targets in hours.
 */
public enum Priority {
    CRITICAL(4),
    HIGH(12),
    MEDIUM(24),
    LOW(48);

    private final int slaHours;

    Priority(int slaHours) {
        this.slaHours = slaHours;
    }

    public int getSlaHours() {
        return slaHours;
    }
}
