package com.complaint.system.controller;

import com.complaint.system.dto.ComplaintStatsDto;
import com.complaint.system.model.User;
import com.complaint.system.service.AuthService;
import com.complaint.system.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Dashboard Telemetry and SLA Analytics with JWT Bearer Authentication.
 */
@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    private final StatsService statsService;
    private final AuthService authService;

    public StatsController(StatsService statsService, AuthService authService) {
        this.statsService = statsService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ComplaintStatsDto> getStats(@RequestHeader("Authorization") String authHeader) {
        User user = authService.resolveUser(authHeader);
        ComplaintStatsDto stats = statsService.calculateStats(user);
        return ResponseEntity.ok(stats);
    }
}
