package com.complaint.system.dto;

import com.complaint.system.model.User;

public record AuthResponse(
    String token,
    String tokenType,
    User user
) {
    public AuthResponse(String token, User user) {
        this(token, "Bearer", user);
    }
}
