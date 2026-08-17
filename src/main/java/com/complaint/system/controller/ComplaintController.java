package com.complaint.system.controller;

import com.complaint.system.dto.ComplaintRequest;
import com.complaint.system.dto.FeedbackRequest;
import com.complaint.system.dto.StatusUpdateRequest;
import com.complaint.system.model.Category;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Status;
import com.complaint.system.model.User;
import com.complaint.system.service.AuthService;
import com.complaint.system.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Primary REST Controller managing Complaint Lifecycles and Transitions with strict JWT Bearer Authentication.
 */
@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AuthService authService;

    public ComplaintController(ComplaintService complaintService, AuthService authService) {
        this.complaintService = complaintService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint created = complaintService.createComplaint(request, currentUser);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getComplaints(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String keyword,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        List<Complaint> list = complaintService.getComplaints(currentUser, status, category, priority, keyword);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Complaint>> getMyComplaints(
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        List<Complaint> list = complaintService.getComplaints(currentUser, null, null, null, null);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Complaint>> searchComplaints(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String keyword,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        List<Complaint> list = complaintService.getComplaints(currentUser, status, category, priority, keyword);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint complaint = complaintService.getComplaintById(id, currentUser);
        return ResponseEntity.ok(complaint);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Complaint> assignToAdmin(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        StatusUpdateRequest request = new StatusUpdateRequest(Status.IN_PROGRESS, null, "Assigned to admin");
        Complaint updated = complaintService.updateStatus(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint updated = complaintService.updateStatus(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<Complaint> submitFeedback(
            @PathVariable String id,
            @Valid @RequestBody FeedbackRequest request,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint updated = complaintService.submitFeedback(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/reset-demo-data")
    public ResponseEntity<Map<String, String>> resetData(@RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Access denied: Only administrators can reset system demo data");
        }
        complaintService.resetData();
        return ResponseEntity.ok(Map.of("message", "Database reset to initial sample tickets successfully"));
    }
}
