package com.complaint.system;

import com.complaint.system.dto.FeedbackRequest;
import com.complaint.system.dto.StatusUpdateRequest;
import com.complaint.system.exception.InvalidStateTransitionException;
import com.complaint.system.exception.UnauthorizedActionException;
import com.complaint.system.model.*;
import com.complaint.system.repository.InMemoryComplaintRepository;
import com.complaint.system.service.ComplaintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Finite State Machine & Role-Based Access Control Test Suite")
class FsmAndRbacEnforcementTest {

    private InMemoryComplaintRepository repository;
    private ComplaintService complaintService;

    private User complaintOwner;
    private User otherUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        repository = new InMemoryComplaintRepository();
        complaintService = new ComplaintService(repository);

        complaintOwner = new User("usr_user_1", "Ayan Hubli", "hubliayan@gmail.com", "pass123", Role.USER);
        otherUser = new User("usr_user_2", "Sarah Jenkins", "sarah@enterprise.com", "pass456", Role.USER);
        adminUser = new User("usr_admin_1", "Alex Vance", "admin@internal.com", "adminpass", Role.ADMIN);
    }

    private Complaint createTestTicket() {
        return repository.findById("CMP-2026-1002")
                .orElseGet(() -> repository.findAll().get(0));
    }

    @Nested
    @DisplayName("Admin Role Authorization")
    class AdminTransitions {

        @Test
        @DisplayName("Admin can transition ticket from OPEN to IN_PROGRESS")
        void adminCanTransitionToInProgress() {
            Complaint ticket = createTestTicket(); // CMP-2026-1002 is OPEN
            assertEquals(Status.OPEN, ticket.getStatus());

            StatusUpdateRequest req = new StatusUpdateRequest(Status.IN_PROGRESS, null, "Investigating network glitch");
            Complaint updated = complaintService.updateStatus(ticket.getId(), req, adminUser);

            assertEquals(Status.IN_PROGRESS, updated.getStatus());
            assertEquals(adminUser.getId(), updated.getAssignedAdminId());
            assertEquals(adminUser.getName(), updated.getAssignedAdminName());
            assertEquals(2, updated.getHistory().size());
        }

        @Test
        @DisplayName("Admin must provide resolution note when resolving ticket")
        void adminMustProvideResolution() {
            Complaint ticket = createTestTicket();
            complaintService.updateStatus(ticket.getId(), new StatusUpdateRequest(Status.IN_PROGRESS, null, "Working"), adminUser);

            // Blank resolution should throw IllegalArgumentException
            StatusUpdateRequest invalidResolve = new StatusUpdateRequest(Status.RESOLVED, "", "Done");
            assertThrows(IllegalArgumentException.class, () -> {
                complaintService.updateStatus(ticket.getId(), invalidResolve, adminUser);
            });

            // Valid resolution succeeds
            StatusUpdateRequest validResolve = new StatusUpdateRequest(Status.RESOLVED, "Re-routed traffic to fallback BGP link", "Fixed");
            Complaint resolved = complaintService.updateStatus(ticket.getId(), validResolve, adminUser);

            assertEquals(Status.RESOLVED, resolved.getStatus());
            assertEquals("Re-routed traffic to fallback BGP link", resolved.getResolution());
        }

        @Test
        @DisplayName("Admin can reject OPEN or IN_PROGRESS ticket with comment")
        void adminCanRejectTicket() {
            Complaint ticket = createTestTicket();

            StatusUpdateRequest rejectReq = new StatusUpdateRequest(Status.REJECTED, null, "Duplicate ticket filed");
            Complaint rejected = complaintService.updateStatus(ticket.getId(), rejectReq, adminUser);

            assertEquals(Status.REJECTED, rejected.getStatus());
        }
    }

    @Nested
    @DisplayName("User Role Authorization & Strict Closures")
    class UserTransitions {

        @Test
        @DisplayName("Regular user cannot transition ticket to IN_PROGRESS")
        void userCannotMoveToInProgress() {
            Complaint ticket = createTestTicket();

            StatusUpdateRequest req = new StatusUpdateRequest(Status.IN_PROGRESS, null, "User attempt");
            assertThrows(UnauthorizedActionException.class, () -> {
                complaintService.updateStatus(ticket.getId(), req, complaintOwner);
            });
        }

        @Test
        @DisplayName("Regular user cannot resolve ticket directly")
        void userCannotResolveTicket() {
            Complaint ticket = createTestTicket();

            StatusUpdateRequest req = new StatusUpdateRequest(Status.RESOLVED, "User marked fixed", "Self fix");
            assertThrows(UnauthorizedActionException.class, () -> {
                complaintService.updateStatus(ticket.getId(), req, complaintOwner);
            });
        }

        @Test
        @DisplayName("Only the complaint owner can close a RESOLVED ticket")
        void onlyOwnerCanCloseResolvedTicket() {
            Complaint ticket = repository.findById("CMP-2026-1003").orElseThrow(); // Owned by usr_user_1, status RESOLVED
            assertEquals(Status.RESOLVED, ticket.getStatus());

            // Non-owner attempt should fail
            assertThrows(UnauthorizedActionException.class, () -> {
                complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(5, "Looks good", true), otherUser);
            });

            // Owner attempt succeeds
            Complaint closed = complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(5, "Hardware fixed promptly", true), complaintOwner);
            assertEquals(Status.CLOSED, closed.getStatus());
            assertNotNull(closed.getFeedback());
            assertEquals(5, closed.getFeedback().rating());
        }
    }

    @Nested
    @DisplayName("State Invariant Constraints")
    class InvariantConstraints {

        @Test
        @DisplayName("Backward transition from RESOLVED to OPEN is strictly forbidden")
        void backwardTransitionToOpenForbidden() {
            Complaint ticket = repository.findById("CMP-2026-1003").orElseThrow(); // Status RESOLVED

            StatusUpdateRequest req = new StatusUpdateRequest(Status.OPEN, null, "Reopening");
            assertThrows(InvalidStateTransitionException.class, () -> {
                complaintService.updateStatus(ticket.getId(), req, adminUser);
            });
        }

        @Test
        @DisplayName("Closed ticket is immutable against any mutations")
        void closedTicketIsImmutable() {
            Complaint ticket = repository.findById("CMP-2026-1004").orElseThrow(); // Status CLOSED
            assertEquals(Status.CLOSED, ticket.getStatus());

            StatusUpdateRequest updateReq = new StatusUpdateRequest(Status.IN_PROGRESS, null, "Try modify");
            assertThrows(InvalidStateTransitionException.class, () -> {
                complaintService.updateStatus(ticket.getId(), updateReq, adminUser);
            });

            assertThrows(InvalidStateTransitionException.class, () -> {
                complaintService.addComment(ticket.getId(), new com.complaint.system.dto.CommentRequest("New reply"), complaintOwner);
            });
        }
    }
}
