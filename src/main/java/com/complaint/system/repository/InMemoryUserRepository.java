package com.complaint.system.repository;

import com.complaint.system.model.Role;
import com.complaint.system.model.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-Safe In-Memory implementation of UserRepository using ConcurrentHashMap.
 * Initialized with default demo seed credentials securely hashed with BCrypt.
 */
@Repository
public class InMemoryUserRepository implements UserRepository {

    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public InMemoryUserRepository() {
        seedInitialUsers();
    }

    private void seedInitialUsers() {
        String userHashedPassword = passwordEncoder.encode("password123");
        String adminHashedPassword = passwordEncoder.encode("admin123");

        User user1 = new User("usr_user_1", "Ayan Hubli", "hubliayan@gmail.com", userHashedPassword, Role.USER);
        User admin1 = new User("usr_admin_1", "Alex Vance", "admin@helpdesk.internal", adminHashedPassword, Role.ADMIN);
        User user2 = new User("usr_user_2", "Sarah Jenkins", "sarah.j@enterprise.com", userHashedPassword, Role.USER);

        users.put(user1.getId(), user1);
        users.put(admin1.getId(), admin1);
        users.put(user2.getId(), user2);
    }

    @Override
    public User save(User user) {
        users.put(user.getId(), user);
        return user;
    }

    @Override
    public Optional<User> findById(String id) {
        return Optional.ofNullable(users.get(id));
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return users.values().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst();
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(users.values());
    }

    @Override
    public boolean existsByEmail(String email) {
        return users.values().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(email));
    }

    @Override
    public void deleteById(String id) {
        users.remove(id);
    }
}
