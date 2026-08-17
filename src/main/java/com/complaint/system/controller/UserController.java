package com.complaint.system.controller;

import com.complaint.system.dto.AuthResponse;
import com.complaint.system.dto.RegisterRequest;
import com.complaint.system.exception.UnauthorizedActionException;
import com.complaint.system.model.Role;
import com.complaint.system.model.User;
import com.complaint.system.repository.UserRepository;
import com.complaint.system.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for User Directory & Registration with RBAC protection.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserController(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Access denied: Administrator role required to view complete user directory");
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/admins")
    public ResponseEntity<List<User>> getAdmins(@RequestHeader("Authorization") String authHeader) {
        // Authenticated users and admins can view the list of available admin agents for assignment
        authService.resolveUser(authHeader);
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .toList();
        return ResponseEntity.ok(admins);
    }
}
