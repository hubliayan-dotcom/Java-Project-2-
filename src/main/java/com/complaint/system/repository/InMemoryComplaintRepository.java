package com.complaint.system.repository;

import com.complaint.system.model.Category;
import com.complaint.system.model.Comment;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Feedback;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Role;
import com.complaint.system.model.Status;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Thread-Safe In-Memory implementation of ComplaintRepository using ConcurrentHashMap.
 * Initialized with baseline seed grievance tickets.
 */
@Repository
public class InMemoryComplaintRepository implements ComplaintRepository {

    private final Map<String, Complaint> store = new ConcurrentHashMap<>();

    public InMemoryComplaintRepository() {
        seedInitialComplaints();
    }

    public void seedInitialComplaints() {
        store.clear();

        // Seed 1: In-Progress Critical Billing Ticket
        Complaint c1 = new Complaint(
            "CMP-2026-1001",
            "Duplicate subscription charge on Corporate Master Account",
            "Our monthly billing cycle debited $499.00 twice on invoice #INV-88219. Please issue a reversal immediately.",
            Category.BILLING,
            Priority.CRITICAL,
            "usr_user_1",
            "Ayan Hubli",
            "hubliayan@gmail.com"
        );
        c1.assignToAdmin("usr_admin_1", "Alex Vance");
        c1.addComment(new Comment("cmt_1", "usr_admin_1", "Alex Vance", Role.ADMIN, "Escalated to Payment Gateway team for transaction trace."));
        store.put(c1.getId(), c1);

        // Seed 2: Open High Technical Ticket
        Complaint c2 = new Complaint(
            "CMP-2026-1002",
            "VPN Gateway repeated handshake drops during SSH sessions",
            "When connected via US-East VPN tunnel, TCP keepalive packets get dropped after exactly 120 seconds.",
            Category.TECHNICAL,
            Priority.HIGH,
            "usr_user_1",
            "Ayan Hubli",
            "hubliayan@gmail.com"
        );
        store.put(c2.getId(), c2);

        // Seed 3: Resolved Infrastructure Ticket ready for User Closure
        Complaint c3 = new Complaint(
            "CMP-2026-1003",
            "Conference room 4B smart monitor flickering",
            "HDMI output drops every 30 seconds during team standup presentations.",
            Category.INFRASTRUCTURE,
            Priority.MEDIUM,
            "usr_user_1",
            "Ayan Hubli",
            "hubliayan@gmail.com"
        );
        c3.assignToAdmin("usr_admin_1", "Alex Vance");
        c3.setResolution("Replaced faulty shielded HDMI 2.1 cable and updated display firmware to v3.12.");
        c3.transitionStatus(Status.RESOLVED, "usr_admin_1", "Alex Vance", "Hardware cable replaced and display tested.");
        store.put(c3.getId(), c3);

        // Seed 4: Closed Ticket with User 5-Star Feedback
        Complaint c4 = new Complaint(
            "CMP-2026-1004",
            "Password reset token expired before SMS delivery",
            "MFA SMS arrived 15 minutes after request, exceeding the 5-minute security validity threshold.",
            Category.SERVICE,
            Priority.LOW,
            "usr_user_2",
            "Sarah Jenkins",
            "sarah.j@enterprise.com"
        );
        c4.assignToAdmin("usr_admin_1", "Alex Vance");
        c4.setResolution("Configured Twilio primary SMS gateway failover to reduce cellular delivery latency.");
        c4.transitionStatus(Status.RESOLVED, "usr_admin_1", "Alex Vance", "SMS gateway optimized.");
        c4.setFeedback(new Feedback(5, "Fast resolution! MFA SMS is arriving within 3 seconds now.", LocalDateTime.now()));
        c4.transitionStatus(Status.CLOSED, "usr_user_2", "Sarah Jenkins", "Closed with 5-star rating.");
        store.put(c4.getId(), c4);
    }

    @Override
    public Complaint save(Complaint complaint) {
        store.put(complaint.getId(), complaint);
        return complaint;
    }

    @Override
    public Optional<Complaint> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Complaint> findAll() {
        return store.values().stream()
                .sorted(Comparator.comparing(Complaint::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<Complaint> findByUserId(String userId) {
        return store.values().stream()
                .filter(c -> c.getUserId().equals(userId))
                .sorted(Comparator.comparing(Complaint::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<Complaint> findByStatus(Status status) {
        return store.values().stream()
                .filter(c -> c.getStatus() == status)
                .sorted(Comparator.comparing(Complaint::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<Complaint> search(Status status, Category category, Priority priority, String keyword) {
        return store.values().stream()
                .filter(c -> status == null || c.getStatus() == status)
                .filter(c -> category == null || c.getCategory() == category)
                .filter(c -> priority == null || c.getPriority() == priority)
                .filter(c -> {
                    if (keyword == null || keyword.trim().isEmpty()) return true;
                    String q = keyword.toLowerCase().trim();
                    return c.getId().toLowerCase().contains(q) ||
                           c.getTitle().toLowerCase().contains(q) ||
                           c.getDescription().toLowerCase().contains(q) ||
                           c.getUserName().toLowerCase().contains(q) ||
                           c.getUserEmail().toLowerCase().contains(q);
                })
                .sorted(Comparator.comparing(Complaint::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }

    @Override
    public void clearAll() {
        seedInitialComplaints();
    }
}
