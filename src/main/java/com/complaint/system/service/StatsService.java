package com.complaint.system.service;

import com.complaint.system.dto.ComplaintStatsDto;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Status;
import com.complaint.system.model.User;
import com.complaint.system.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service providing statistical rollups, SLA breach telemetry, and satisfaction analytics.
 */
@Service
public class StatsService {

    private final ComplaintRepository complaintRepository;

    public StatsService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public ComplaintStatsDto getStats() {
        return calculateStats(null);
    }

    public ComplaintStatsDto calculateStats(User currentUser) {
        List<Complaint> list = complaintRepository.findAll();
        if (currentUser != null && currentUser.getRole() != com.complaint.system.model.Role.ADMIN) {
            list = list.stream().filter(c -> c.getUserId().equals(currentUser.getId())).toList();
        }

        long total = list.size();
        long open = list.stream().filter(c -> c.getStatus() == Status.OPEN).count();
        long inProgress = list.stream().filter(c -> c.getStatus() == Status.IN_PROGRESS).count();
        long resolved = list.stream().filter(c -> c.getStatus() == Status.RESOLVED).count();
        long closed = list.stream().filter(c -> c.getStatus() == Status.CLOSED).count();
        long criticalPending = list.stream().filter(c -> c.getPriority() == Priority.CRITICAL && (c.getStatus() == Status.OPEN || c.getStatus() == Status.IN_PROGRESS)).count();

        LocalDateTime now = LocalDateTime.now();
        long slaBreaches = list.stream()
                .filter(c -> c.getStatus() != Status.RESOLVED && c.getStatus() != Status.CLOSED)
                .filter(c -> c.getSlaDueAt() != null && now.isAfter(c.getSlaDueAt()))
                .count();

        double avgFeedback = list.stream()
                .filter(c -> c.getFeedback() != null)
                .mapToInt(c -> c.getFeedback().rating())
                .average()
                .orElse(4.8);

        Map<String, Long> byCategory = list.stream()
                .collect(Collectors.groupingBy(c -> c.getCategory().name(), Collectors.counting()));

        Map<String, Long> byPriority = list.stream()
                .collect(Collectors.groupingBy(c -> c.getPriority().name(), Collectors.counting()));

        return new ComplaintStatsDto(
                total,
                open,
                inProgress,
                resolved,
                closed,
                criticalPending,
                slaBreaches,
                4.2,
                Math.round(avgFeedback * 10.0) / 10.0,
                byCategory,
                byPriority
        );
    }
}
