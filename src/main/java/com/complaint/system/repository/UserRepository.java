package com.complaint.system.repository;

import com.complaint.system.model.User;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Repository interface for User entities.
 */
public interface UserRepository {
    User save(User user);
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    boolean existsByEmail(String email);
    void deleteById(String id);
}
