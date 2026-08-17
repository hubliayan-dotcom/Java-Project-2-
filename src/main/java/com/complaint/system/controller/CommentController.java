package com.complaint.system.controller;

import com.complaint.system.dto.CommentRequest;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.User;
import com.complaint.system.service.AuthService;
import com.complaint.system.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Ticket Remarks & Threaded Comments with JWT Bearer Authentication.
 */
@RestController
@RequestMapping("/api/complaints/{id}/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final ComplaintService complaintService;
    private final AuthService authService;

    public CommentController(ComplaintService complaintService, AuthService authService) {
        this.complaintService = complaintService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<Complaint> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint updated = complaintService.addComment(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }
}
