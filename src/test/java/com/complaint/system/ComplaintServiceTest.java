package com.complaint.system;

import com.complaint.system.dto.ComplaintRequest;
import com.complaint.system.dto.FeedbackRequest;
import com.complaint.system.dto.StatusUpdateRequest;
import com.complaint.system.exception.InvalidStateTransitionException;
import com.complaint.system.exception.UnauthorizedActionException;
import com.complaint.system.model.Category;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Role;
import com.complaint.system.model.Status;
import com.complaint.system.model.User;
import com.complaint.system.repository.InMemoryComplaintRepository;
import com.complaint.system.service.ComplaintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JUnit 5 Unit Tests verifying Finite State Machine logic and Role-Based Access Control.
 */
class ComplaintServiceTest {

    private InMemoryComplaintRepository repository;
    private ComplaintService complaintService;

    private User regularUser;
    private User otherUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        repository = new InMemoryComplaintRepository();
        complaintService = new ComplaintService(repository);

        regularUser = new User("usr_user_1", "Ayan Hubli", "hubliayan@gmail.com", "pass", Role.USER);
        otherUser = new User("usr_user_2", "Sarah Jenkins", "sarah@test.com", "pass", Role.USER);
        adminUser = new User("usr_admin_1", "Alex Vance", "admin@internal.com", "pass", Role.ADMIN);
    }

    @Test
    @DisplayName("Should create complaint with OPEN status and calculated SLA")
    void testCreateComplaint() {
        ComplaintRequest req = new ComplaintRequest(
                "Billing issue with credit card charge",
                "Double charge on credit card for invoice #991",
                "BILLING",
                "HIGH"
        );

        Complaint created = complaintService.createComplaint(req, regularUser);

        assertNotNull(created.getId());
        assertEquals(Status.OPEN, created.getStatus());
        assertEquals(Category.BILLING, created.getCategory());
        assertEquals(Priority.HIGH, created.getPriority());
        assertEquals("usr_user_1", created.getUserId());
        assertNotNull(created.getSlaDueAt());
    }

    @Test
    @DisplayName("Admin should successfully transition OPEN ticket to IN_PROGRESS")
    void testAdminTransitionToInProgress() {
        ComplaintRequest req = new ComplaintRequest("Network latency issue", "High packet loss over US-East VPN tunnel", "TECHNICAL", "MEDIUM");
        Complaint created = complaintService.createComplaint(req, regularUser);

        StatusUpdateRequest update = new StatusUpdateRequest(Status.IN_PROGRESS, null, "Investigating network gateway");
        Complaint updated = complaintService.updateStatus(created.getId(), update, adminUser);

        assertEquals(Status.IN_PROGRESS, updated.getStatus());
        assertEquals(adminUser.getId(), updated.getAssignedAdminId());
    }

    @Test
    @DisplayName("User should be denied when attempting to transition to IN_PROGRESS (RBAC enforcement)")
    void testUserCannotTransitionToInProgress() {
        ComplaintRequest req = new ComplaintRequest("Network latency issue", "High packet loss over US-East VPN tunnel", "TECHNICAL", "MEDIUM");
        Complaint created = complaintService.createComplaint(req, regularUser);

        StatusUpdateRequest update = new StatusUpdateRequest(Status.IN_PROGRESS, null, "User attempting transition");
        assertThrows(UnauthorizedActionException.class, () -> {
            complaintService.updateStatus(created.getId(), update, regularUser);
        });
    }

    @Test
    @DisplayName("Admin should resolve ticket with resolution remarks")
    void testAdminResolveTicket() {
        ComplaintRequest req = new ComplaintRequest("Network latency issue", "High packet loss over US-East VPN tunnel", "TECHNICAL", "MEDIUM");
        Complaint created = complaintService.createComplaint(req, regularUser);

        // Admin moves to IN_PROGRESS first
        complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.IN_PROGRESS, null, "Assigning"), adminUser);

        // Admin resolves
        StatusUpdateRequest resolveReq = new StatusUpdateRequest(Status.RESOLVED, "Re-routed traffic to alternate BGP link", "Fixed");
        Complaint resolved = complaintService.updateStatus(created.getId(), resolveReq, adminUser);

        assertEquals(Status.RESOLVED, resolved.getStatus());
        assertEquals("Re-routed traffic to alternate BGP link", resolved.getResolution());
    }

    @Test
    @DisplayName("User should submit feedback and close resolved ticket")
    void testUserCloseWithFeedback() {
        ComplaintRequest req = new ComplaintRequest("Hardware issue in conference room", "Projector light bulb failure in 3B", "INFRASTRUCTURE", "LOW");
        Complaint created = complaintService.createComplaint(req, regularUser);

        complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.IN_PROGRESS, null, "Assigning"), adminUser);
        complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.RESOLVED, "Replaced lamp bulb with OEM unit", "Fixed"), adminUser);

        FeedbackRequest feedback = new FeedbackRequest(5, "Great speedy turnaround!", true);
        Complaint closed = complaintService.submitFeedback(created.getId(), feedback, regularUser);

        assertEquals(Status.CLOSED, closed.getStatus());
        assertNotNull(closed.getFeedback());
        assertEquals(5, closed.getFeedback().rating());
    }

    @Test
    @DisplayName("Closed ticket must be immutable against any subsequent transitions")
    void testClosedTicketIsImmutable() {
        ComplaintRequest req = new ComplaintRequest("Simple query ticket", "Inquiry regarding vacation schedule", "OTHER", "LOW");
        Complaint created = complaintService.createComplaint(req, regularUser);

        complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.RESOLVED, "Provided schedule document", "Fixed"), adminUser);
        complaintService.submitFeedback(created.getId(), new FeedbackRequest(5, "Thanks", true), regularUser);

        // Attempting to reopen or change status
        assertThrows(InvalidStateTransitionException.class, () -> {
            complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.IN_PROGRESS, null, "Try modify"), adminUser);
        });
    }

    @Test
    @DisplayName("Backward transition from RESOLVED to OPEN must be forbidden")
    void testBackwardTransitionForbidden() {
        ComplaintRequest req = new ComplaintRequest("Email delivery delayed", "Exchange queue delay on outbound queue", "SERVICE", "MEDIUM");
        Complaint created = complaintService.createComplaint(req, regularUser);

        complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.RESOLVED, "Flushed queue", "Fixed"), adminUser);

        assertThrows(InvalidStateTransitionException.class, () -> {
            complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.OPEN, null, "Reopen to open"), adminUser);
        });
    }
}
