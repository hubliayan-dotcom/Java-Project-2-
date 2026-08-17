package com.complaint.system;

import com.complaint.system.dto.ComplaintStatsDto;
import com.complaint.system.repository.InMemoryComplaintRepository;
import com.complaint.system.service.StatsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SLA & Complaint Analytics Test Suite")
class StatsServiceTest {

    private InMemoryComplaintRepository repository;
    private StatsService statsService;

    @BeforeEach
    void setUp() {
        repository = new InMemoryComplaintRepository();
        statsService = new StatsService(repository);
    }

    @Test
    @DisplayName("Should aggregate SLA metrics and calculate CSAT average")
    void testComputeStats() {
        ComplaintStatsDto stats = statsService.getStats();

        assertTrue(stats.totalComplaints() >= 5);
        assertTrue(stats.openComplaints() >= 1);
        assertTrue(stats.inProgressComplaints() >= 1);
        assertTrue(stats.resolvedComplaints() >= 1);
        assertTrue(stats.closedComplaints() >= 1);
        assertTrue(stats.averageSatisfactionScore() > 0.0);
        assertNotNull(stats.byCategory());
        assertNotNull(stats.byPriority());
    }
}
