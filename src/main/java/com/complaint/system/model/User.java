package com.complaint.system.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * User Entity representing either a regular User or Administrator.
 */
public class User {
    private final String id;
    private String name;
    private String email;
    private String password;
    private Role role;
    private final LocalDateTime createdAt;

    public User(String id, String name, String email, String password, Role role) {
        this.id = Objects.requireNonNull(id, "User ID cannot be null");
        this.name = Objects.requireNonNull(name, "Name cannot be null");
        this.email = Objects.requireNonNull(email, "Email cannot be null");
        this.password = password;
        this.role = Objects.requireNonNullElse(role, Role.USER);
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
