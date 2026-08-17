package com.complaint.system.service;

import com.complaint.system.dto.CommentRequest;
import com.complaint.system.dto.ComplaintRequest;
import com.complaint.system.dto.FeedbackRequest;
import com.complaint.system.dto.StatusUpdateRequest;
import com.complaint.system.exception.InvalidStateTransitionException;
import com.complaint.system.exception.ResourceNotFoundException;
import com.complaint.system.exception.UnauthorizedActionException;
import com.complaint.system.model.Category;
import com.complaint.system.model.Comment;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Feedback;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Role;
import com.complaint.system.model.Status;
import com.complaint.system.model.User;
import com.complaint.system.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service Layer enforcing strict business rules, authorization policies,
 * and the Finite State Machine (FSM) lifecycle.
 */
@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AtomicLong ticketCounter = new AtomicLong(1005);

    public ComplaintService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    /**
     * Creates a new customer complaint ticket.
     */
    public Complaint createComplaint(ComplaintRequest request, User currentUser) {
        if (currentUser.getRole() != Role.USER) {
            // Admins can also log on behalf of users, but usually users submit
        }

        Category category = Category.OTHER;
        if (request.category() != null) {
            try {
                category = Category.valueOf(request.category().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Priority priority = Priority.MEDIUM;
        if (request.priority() != null) {
            try {
                priority = Priority.valueOf(request.priority().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        String ticketId = "CMP-2026-" + ticketCounter.getAndIncrement();
        Complaint complaint = new Complaint(
                ticketId,
                request.title(),
                request.description(),
                category,
                priority,
                currentUser.getId(),
                currentUser.getName(),
                currentUser.getEmail()
        );

        return complaintRepository.save(complaint);
    }

    /**
     * Retrieves all complaints based on user role and optional filters.
     */
    public List<Complaint> getComplaints(User currentUser, Status status, Category category, Priority priority, String keyword) {
        if (currentUser.getRole() == Role.ADMIN) {
            return complaintRepository.search(status, category, priority, keyword);
        } else {
            // Filter by user
            return complaintRepository.search(status, category, priority, keyword).stream()
                    .filter(c -> c.getUserId().equals(currentUser.getId()))
                    .toList();
        }
    }

    /**
     * Retrieves a single complaint by ID with RBAC check.
     */
    public Complaint getComplaintById(String id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint with ID " + id + " not found"));

        if (currentUser.getRole() != Role.ADMIN && !complaint.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("Access denied: You can only view your own complaints");
        }

        return complaint;
    }

    /**
     * Transitions ticket state enforcing the Finite State Machine (FSM) rules.
     */
    public Complaint updateStatus(String id, StatusUpdateRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint with ID " + id + " not found"));

        Status current = complaint.getStatus();
        Status target = request.newStatus();

        if (current == Status.CLOSED) {
            throw new InvalidStateTransitionException("Cannot transition a CLOSED ticket. Closed tickets are immutable.");
        }

        if (current == Status.REJECTED) {
            throw new InvalidStateTransitionException("Cannot transition a REJECTED ticket.");
        }

        // Validate RBAC and FSM Rules
        if (target == Status.IN_PROGRESS) {
            if (currentUser.getRole() != Role.ADMIN) {
                throw new UnauthorizedActionException("Only Admins can move a ticket to IN_PROGRESS");
            }
            if (current != Status.OPEN) {
                throw new InvalidStateTransitionException("Cannot move to IN_PROGRESS from " + current + ". Must be OPEN.");
            }
            complaint.assignToAdmin(currentUser.getId(), currentUser.getName());
        } else if (target == Status.RESOLVED) {
            if (currentUser.getRole() != Role.ADMIN) {
                throw new UnauthorizedActionException("Only Admins can resolve a ticket");
            }
            if (current != Status.IN_PROGRESS && current != Status.OPEN) {
                throw new InvalidStateTransitionException("Cannot resolve a ticket in status " + current);
            }
            if (request.resolution() == null || request.resolution().trim().length() < 5) {
                throw new IllegalArgumentException("A meaningful resolution note (min 5 chars) is required to resolve a ticket");
            }
            complaint.setResolution(request.resolution());
            complaint.transitionStatus(Status.RESOLVED, currentUser.getId(), currentUser.getName(), 
                    request.comment() != null ? request.comment() : "Resolved by admin: " + request.resolution());
        } else if (target == Status.REJECTED) {
            if (currentUser.getRole() != Role.ADMIN) {
                throw new UnauthorizedActionException("Only Admins can reject a ticket");
            }
            if (current == Status.RESOLVED || current == Status.CLOSED) {
                throw new InvalidStateTransitionException("Cannot reject an already resolved/closed ticket");
            }
            complaint.transitionStatus(Status.REJECTED, currentUser.getId(), currentUser.getName(),
                    request.comment() != null ? request.comment() : "Ticket rejected by administrator");
        } else if (target == Status.CLOSED) {
            // Direct transition to CLOSED via generic updateStatus is restricted.
            // User closure MUST happen via submitFeedback() with valid rating (1-5 stars) and ownership check.
            if (currentUser.getRole() == Role.USER) {
                throw new UnauthorizedActionException("Direct status closure is disabled. Please provide satisfaction feedback via the submitFeedback endpoint to close your resolved ticket.");
            } else if (currentUser.getRole() == Role.ADMIN) {
                if (current != Status.RESOLVED && current != Status.REJECTED) {
                    throw new InvalidStateTransitionException("Administrative closure requires the ticket to be in RESOLVED or REJECTED state.");
                }
                complaint.transitionStatus(Status.CLOSED, currentUser.getId(), currentUser.getName(), "Closed by administrator");
            }
        } else if (target == Status.OPEN) {
            throw new InvalidStateTransitionException("Re-opening backward to OPEN is forbidden by policy.");
        }

        return complaintRepository.save(complaint);
    }

    /**
     * Submits user feedback rating and closes the ticket.
     */
    public Complaint submitFeedback(String id, FeedbackRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint with ID " + id + " not found"));

        if (!complaint.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("Only the complaint owner can submit feedback");
        }

        if (complaint.getStatus() != Status.RESOLVED && complaint.getStatus() != Status.CLOSED) {
            throw new InvalidStateTransitionException("Feedback can only be provided after ticket resolution");
        }

        Feedback feedback = new Feedback(request.rating(), request.comment(), LocalDateTime.now());
        complaint.setFeedback(feedback);

        if (request.closeTicket() && complaint.getStatus() == Status.RESOLVED) {
            complaint.transitionStatus(Status.CLOSED, currentUser.getId(), currentUser.getName(), "Ticket closed after feedback submission (" + request.rating() + "/5 stars)");
        }

        return complaintRepository.save(complaint);
    }

    /**
     * Appends a comment to the ticket conversation.
     */
    public Complaint addComment(String id, CommentRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint with ID " + id + " not found"));

        if (currentUser.getRole() != Role.ADMIN && !complaint.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("You are not authorized to comment on this ticket");
        }

        if (complaint.getStatus() == Status.CLOSED) {
            throw new InvalidStateTransitionException("Cannot comment on a CLOSED ticket");
        }

        String commentId = "cmt_" + UUID.randomUUID().toString().substring(0, 8);
        Comment comment = new Comment(commentId, currentUser.getId(), currentUser.getName(), currentUser.getRole(), request.message());
        complaint.addComment(comment);

        return complaintRepository.save(complaint);
    }

    /**
     * Resets database to default demo seeds.
     */
    public void resetData() {
        complaintRepository.clearAll();
    }
}
