package com.complaint.system.repository;

import com.complaint.system.model.Category;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Status;

import java.util.List;
import java.util.Optional;

/**
 * Data Access Repository interface for Complaint entities.
 */
public interface ComplaintRepository {
    Complaint save(Complaint complaint);
    Optional<Complaint> findById(String id);
    List<Complaint> findAll();
    List<Complaint> findByUserId(String userId);
    List<Complaint> findByStatus(Status status);
    List<Complaint> search(Status status, Category category, Priority priority, String keyword);
    void deleteById(String id);
    void clearAll();
}
