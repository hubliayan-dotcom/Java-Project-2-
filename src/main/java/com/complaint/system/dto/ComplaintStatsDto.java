package com.complaint.system.dto;

import java.util.Map;

public record ComplaintStatsDto(
    long totalComplaints,
    long openCount,
    long inProgressCount,
    long resolvedCount,
    long closedCount,
    long criticalPending,
    long slaBreachCount,
    double avgResolutionHours,
    double satisfactionRating,
    Map<String, Long> byCategory,
    Map<String, Long> byPriority
) {
    public long openComplaints() {
        return openCount;
    }

    public long inProgressComplaints() {
        return inProgressCount;
    }

    public long resolvedComplaints() {
        return resolvedCount;
    }

    public long closedComplaints() {
        return closedCount;
    }

    public double averageSatisfactionScore() {
        return satisfactionRating;
    }
}
