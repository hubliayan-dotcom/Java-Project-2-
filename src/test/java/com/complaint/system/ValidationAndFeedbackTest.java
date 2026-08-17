package com.complaint.system;

import com.complaint.system.dto.ComplaintRequest;
import com.complaint.system.dto.FeedbackRequest;
import com.complaint.system.exception.InvalidStateTransitionException;
import com.complaint.system.model.*;
import com.complaint.system.repository.InMemoryComplaintRepository;
import com.complaint.system.service.ComplaintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Validation and Customer Feedback Domain Test Suite")
class ValidationAndFeedbackTest {

    private InMemoryComplaintRepository repository;
    private ComplaintService complaintService;
    private User testUser;

    @BeforeEach
    void setUp() {
        repository = new InMemoryComplaintRepository();
        complaintService = new ComplaintService(repository);
        testUser = new User("usr_user_1", "Ayan Hubli", "hubliayan@gmail.com", "pass123", Role.USER);
    }

    @Test
    @DisplayName("Complaint with title < 5 characters should throw IllegalArgumentException")
    void titleTooShortThrowsException() {
        ComplaintRequest req = new ComplaintRequest("VPN", "Valid description that exceeds 10 characters", "TECHNICAL", "MEDIUM");
        assertThrows(IllegalArgumentException.class, () -> {
            complaintService.createComplaint(req, testUser);
        });
    }

    @Test
    @DisplayName("Complaint with description < 10 characters should throw IllegalArgumentException")
    void descriptionTooShortThrowsException() {
        ComplaintRequest req = new ComplaintRequest("Valid Title Here", "Too short", "TECHNICAL", "MEDIUM");
        assertThrows(IllegalArgumentException.class, () -> {
            complaintService.createComplaint(req, testUser);
        });
    }

    @Test
    @DisplayName("Feedback rating bounds (1 to 5) must be enforced")
    void feedbackRatingBoundsEnforced() {
        Complaint ticket = repository.findById("CMP-2026-1003").orElseThrow(); // Status RESOLVED

        // Rating 0 should fail
        assertThrows(IllegalArgumentException.class, () -> {
            complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(0, "Terrible", true), testUser);
        });

        // Rating 6 should fail
        assertThrows(IllegalArgumentException.class, () -> {
            complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(6, "Super stellar", true), testUser);
        });

        // Rating 5 succeeds
        Complaint closed = complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(5, "Perfect resolution", true), testUser);
        assertEquals(5, closed.getFeedback().rating());
        assertEquals("Perfect resolution", closed.getFeedback().comment());
    }

    @Test
    @DisplayName("Submitting feedback on an OPEN ticket should throw InvalidStateTransitionException")
    void feedbackOnOpenTicketThrowsException() {
        Complaint openTicket = repository.findById("CMP-2026-1002").orElseThrow(); // Status OPEN

        assertThrows(InvalidStateTransitionException.class, () -> {
            complaintService.submitFeedback(openTicket.getId(), new FeedbackRequest(5, "Premature feedback", true), testUser);
        });
    }
}
