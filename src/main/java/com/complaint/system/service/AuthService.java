package com.complaint.system.service;

import com.complaint.system.dto.AuthRequest;
import com.complaint.system.dto.AuthResponse;
import com.complaint.system.dto.RegisterRequest;
import com.complaint.system.exception.UnauthorizedActionException;
import com.complaint.system.model.Role;
import com.complaint.system.model.User;
import com.complaint.system.repository.UserRepository;
import com.complaint.system.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service encapsulating Authentication, Registration, BCrypt Password Hashing, and JJWT Tokens.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("User with email " + request.email() + " already exists");
        }

        // Public self-registration is strictly restricted to USER role to prevent privilege escalation
        Role role = Role.USER;

        String userId = "usr_" + UUID.randomUUID().toString().substring(0, 8);
        String hashedPassword = passwordEncoder.encode(request.password());
        User newUser = new User(userId, request.name(), request.email(), hashedPassword, role);
        User saved = userRepository.save(newUser);

        String token = jwtUtil.generateToken(saved);
        return new AuthResponse(token, saved);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedActionException("Invalid email or password credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedActionException("Invalid email or password credentials");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user);
    }

    public User resolveUser(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (jwtUtil.validateToken(token)) {
                String userId = jwtUtil.extractUserId(token);
                if (userId != null) {
                    return userRepository.findById(userId)
                            .orElseThrow(() -> new UnauthorizedActionException("User account not found for JWT"));
                }
            }
        }

        throw new UnauthorizedActionException("Missing or invalid Bearer authentication token");
    }

    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedActionException("User session invalid or user not found"));
    }
}
