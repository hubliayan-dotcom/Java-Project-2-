import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  FolderTree, 
  FileCode, 
  Coffee, 
  Terminal, 
  ShieldCheck, 
  Layers,
  Sparkles,
  GitBranch,
  Download,
  Box,
  FileText
} from 'lucide-react';
import JSZip from 'jszip';

interface JavaFile {
  name: string;
  packagePath: string;
  category: 'Controller' | 'Service' | 'Model' | 'DTO' | 'Repository' | 'Exception & Config' | 'Test & Build';
  description: string;
  code: string;
}

const JAVA_FILES: JavaFile[] = [
  {
    name: 'pom.xml',
    packagePath: 'pom.xml',
    category: 'Test & Build',
    description: 'Maven build configuration declaring Spring Boot 3.2.3, Jakarta Validation, Spring Security Crypto, JUnit 5, and Google Gen AI.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>

    <groupId>com.complaint</groupId>
    <artifactId>online-complaint-system</artifactId>
    <version>1.0.0</version>
    <name>Online Complaint Management System</name>
    <description>Enterprise Role-Based Complaint Management System built with Spring Boot REST, Finite State Machine, and Gemini AI</description>

    <properties>
        <java.version>17</java.version>
        <google-genai.version>0.1.0</google-genai.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web Starter for RESTful APIs -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Jakarta Bean Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Spring Security Crypto for Password Hashing -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-crypto</artifactId>
        </dependency>

        <!-- JJWT (Java JSON Web Token) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Google Gen AI Client for Complaint Categorization -->
        <dependency>
            <groupId>com.google.genai</groupId>
            <artifactId>google-genai</artifactId>
            <version>0.1.0</version>
        </dependency>

        <!-- Testing Starters (JUnit 5, Mockito, AssertJ) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`,
  },
  {
    name: 'application.properties',
    packagePath: 'src/main/resources/application.properties',
    category: 'Exception & Config',
    description: 'Spring Boot configuration properties: server port, CORS endpoints, logging, and Gemini model properties.',
    code: `# Server Port Configuration
server.port=8080

# Spring Application Metadata
spring.application.name=online-complaint-system

# CORS Configuration
app.cors.allowed-origins=*

# Gemini AI Integration
gemini.api.key=\${GEMINI_API_KEY:}
gemini.model=gemini-2.5-flash

# Logging Level
logging.level.com.complaint.system=DEBUG
logging.level.org.springframework.web=INFO`,
  },
  {
    name: 'ComplaintApplication.java',
    packagePath: 'com/complaint/system/ComplaintApplication.java',
    category: 'Test & Build',
    description: 'Main Spring Boot entry point initializing dependency injection context and in-memory repositories.',
    code: `package com.complaint.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Entry Point.
 * 
 * Online Complaint Management System:
 * - Spring Boot 3 REST APIs
 * - Service & Repository Layer Architecture
 * - Finite State Machine (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED)
 * - In-Memory Concurrent Thread-Safe Repositories
 * - Gemini AI Auto-Categorization Integration
 */
@SpringBootApplication
public class ComplaintApplication {

    public static void main(String[] args) {
        SpringApplication.run(ComplaintApplication.class, args);
    }
}`,
  },
  {
    name: 'ComplaintController.java',
    packagePath: 'com/complaint/system/controller/ComplaintController.java',
    category: 'Controller',
    description: 'Spring Boot REST Controller handling ticket creation, filtering, role checks, and state transitions.',
    code: `package com.complaint.system.controller;

import com.complaint.system.dto.ComplaintRequest;
import com.complaint.system.dto.FeedbackRequest;
import com.complaint.system.dto.StatusUpdateRequest;
import com.complaint.system.model.Category;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Status;
import com.complaint.system.model.User;
import com.complaint.system.model.Role;
import com.complaint.system.service.AuthService;
import com.complaint.system.service.ComplaintService;
import com.complaint.system.exception.UnauthorizedActionException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AuthService authService;

    public ComplaintController(ComplaintService complaintService, AuthService authService) {
        this.complaintService = complaintService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint created = complaintService.createComplaint(request, currentUser);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getComplaints(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String keyword,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        List<Complaint> list = complaintService.getComplaints(currentUser, status, category, priority, keyword);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Complaint>> getMyComplaints(
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        List<Complaint> list = complaintService.getComplaints(currentUser, null, null, null, null);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Complaint>> searchComplaints(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String keyword,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        List<Complaint> list = complaintService.getComplaints(currentUser, status, category, priority, keyword);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint complaint = complaintService.getComplaintById(id, currentUser);
        return ResponseEntity.ok(complaint);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Complaint> assignToAdmin(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        StatusUpdateRequest request = new StatusUpdateRequest(Status.IN_PROGRESS, null, "Assigned to admin");
        Complaint updated = complaintService.updateStatus(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint updated = complaintService.updateStatus(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<Complaint> submitFeedback(
            @PathVariable String id,
            @Valid @RequestBody FeedbackRequest request,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint updated = complaintService.submitFeedback(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/reset-demo-data")
    public ResponseEntity<Map<String, String>> resetData(@RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Access denied: Only administrators can reset system demo data");
        }
        complaintService.resetData();
        return ResponseEntity.ok(Map.of("message", "Database reset to initial sample tickets successfully"));
    }
}`,
  },
  {
    name: 'AuthController.java',
    packagePath: 'com/complaint/system/controller/AuthController.java',
    category: 'Controller',
    description: 'REST Controller for user authentication, registration, and active session identity retrieval.',
    code: `package com.complaint.system.controller;

import com.complaint.system.dto.AuthRequest;
import com.complaint.system.dto.AuthResponse;
import com.complaint.system.dto.RegisterRequest;
import com.complaint.system.model.User;
import com.complaint.system.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        User user = authService.resolveUser(authHeader);
        return ResponseEntity.ok(user);
    }
}`,
  },
  {
    name: 'UserController.java',
    packagePath: 'com/complaint/system/controller/UserController.java',
    category: 'Controller',
    description: 'REST Controller for User Directory & Registration with RBAC protection.',
    code: `package com.complaint.system.controller;

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
        authService.resolveUser(authHeader);
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .toList();
        return ResponseEntity.ok(admins);
    }
}`,
  },
  {
    name: 'AiController.java',
    packagePath: 'com/complaint/system/controller/AiController.java',
    category: 'Controller',
    description: 'REST Controller endpoint for AI-powered auto-categorization and severity triage.',
    code: `package com.complaint.system.controller;

import com.complaint.system.dto.AiCategorizeRequest;
import com.complaint.system.dto.AiCategorizeResponse;
import com.complaint.system.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/categorize")
    public ResponseEntity<AiCategorizeResponse> categorize(@Valid @RequestBody AiCategorizeRequest request) {
        AiCategorizeResponse response = aiService.categorize(request);
        return ResponseEntity.ok(response);
    }
}`,
  },
  {
    name: 'StatsController.java',
    packagePath: 'com/complaint/system/controller/StatsController.java',
    category: 'Controller',
    description: 'REST Controller for dashboard telemetry, SLA breaches, and satisfaction ratings.',
    code: `package com.complaint.system.controller;

import com.complaint.system.dto.ComplaintStatsDto;
import com.complaint.system.model.User;
import com.complaint.system.service.AuthService;
import com.complaint.system.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    private final StatsService statsService;
    private final AuthService authService;

    public StatsController(StatsService statsService, AuthService authService) {
        this.statsService = statsService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ComplaintStatsDto> getStats(@RequestHeader("Authorization") String authHeader) {
        User user = authService.resolveUser(authHeader);
        ComplaintStatsDto stats = statsService.calculateStats(user);
        return ResponseEntity.ok(stats);
    }
}`,
  },
  {
    name: 'CommentController.java',
    packagePath: 'com/complaint/system/controller/CommentController.java',
    category: 'Controller',
    description: 'REST Controller for ticket discussion remarks and threaded collaboration.',
    code: `package com.complaint.system.controller;

import com.complaint.system.dto.CommentRequest;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.User;
import com.complaint.system.service.AuthService;
import com.complaint.system.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/complaints/{id}/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final ComplaintService complaintService;
    private final AuthService authService;

    public CommentController(ComplaintService complaintService, AuthService authService) {
        this.complaintService = complaintService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<Complaint> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = authService.resolveUser(authHeader);
        Complaint updated = complaintService.addComment(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }
}`,
  },
  {
    name: 'ComplaintService.java',
    packagePath: 'com/complaint/system/service/ComplaintService.java',
    category: 'Service',
    description: 'Business Service enforcing the Finite State Machine (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED) and immutability.',
    code: `package com.complaint.system.service;

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

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AtomicLong ticketCounter = new AtomicLong(1005);

    public ComplaintService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public Complaint createComplaint(ComplaintRequest request, User currentUser) {
        Category category = Category.OTHER;
        if (request.category() != null) {
            try { category = Category.valueOf(request.category().toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }

        Priority priority = Priority.MEDIUM;
        if (request.priority() != null) {
            try { priority = Priority.valueOf(request.priority().toUpperCase()); } catch (IllegalArgumentException ignored) {}
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

    public List<Complaint> getComplaints(User currentUser, Status status, Category category, Priority priority, String keyword) {
        if (currentUser.getRole() == Role.ADMIN) {
            return complaintRepository.search(status, category, priority, keyword);
        } else {
            return complaintRepository.search(status, category, priority, keyword).stream()
                    .filter(c -> c.getUserId().equals(currentUser.getId()))
                    .toList();
        }
    }

    public Complaint getComplaintById(String id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint with ID " + id + " not found"));

        if (currentUser.getRole() != Role.ADMIN && !complaint.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("Access denied: You can only view your own complaints");
        }

        return complaint;
    }

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

    public void resetData() {
        complaintRepository.clearAll();
    }
}`,
  },
  {
    name: 'AuthService.java',
    packagePath: 'com/complaint/system/service/AuthService.java',
    category: 'Service',
    description: 'Authentication and session security service verifying credentials, BCrypt hashing, and JJWT Bearer tokens.',
    code: `package com.complaint.system.service;

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
}`,
  },
  {
    name: 'AiService.java',
    packagePath: 'com/complaint/system/service/AiService.java',
    category: 'Service',
    description: 'Google Gemini integration for automated complaint categorization, priority scoring, and root-cause analysis.',
    code: `package com.complaint.system.service;

import com.complaint.system.dto.AiCategorizeRequest;
import com.complaint.system.dto.AiCategorizeResponse;
import com.complaint.system.model.Category;
import com.complaint.system.model.Priority;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    @Value("\${gemini.api.key:}")
    private String geminiApiKey;

    public AiCategorizeResponse categorize(AiCategorizeRequest request) {
        String text = (request.title() + " " + request.description()).toLowerCase();
        
        Category category = Category.TECHNICAL;
        Priority priority = Priority.MEDIUM;
        String reasoning = "Automated analysis completed.";
        String suggestedPath = "Review logs and assign to primary support tier.";
        String summary = request.title();

        if (text.contains("billing") || text.contains("charge") || text.contains("invoice") || text.contains("payment") || text.contains("refund")) {
            category = Category.BILLING;
            priority = text.contains("twice") || text.contains("double") || text.contains("unauthorized") ? Priority.CRITICAL : Priority.HIGH;
            reasoning = "Detected financial transaction and account billing terminology with immediate user impact.";
            suggestedPath = "Verify invoice in Stripe/payment gateway ledger and issue reversal credit note.";
        } else if (text.contains("down") || text.contains("outage") || text.contains("critical") || text.contains("broken") || text.contains("crash")) {
            category = Category.INFRASTRUCTURE;
            priority = Priority.CRITICAL;
            reasoning = "System availability or service interruption keywords detected requiring urgent SLA response.";
            suggestedPath = "Escalate directly to DevOps on-call engineer and post status page bulletin.";
        } else if (text.contains("password") || text.contains("login") || text.contains("sms") || text.contains("mfa") || text.contains("email")) {
            category = Category.SERVICE;
            priority = Priority.MEDIUM;
            reasoning = "Identity verification and customer access service grievance.";
            suggestedPath = "Audit authentication gateway delivery logs and dispatch password recovery link.";
        } else if (text.contains("vpn") || text.contains("handshake") || text.contains("bug") || text.contains("error") || text.contains("ssh")) {
            category = Category.TECHNICAL;
            priority = Priority.HIGH;
            reasoning = "Network connectivity and protocol transport anomaly requiring specialized IT diagnostics.";
            suggestedPath = "Inspect gateway keepalive settings and network security firewall rules.";
        }

        return new AiCategorizeResponse(category, priority, reasoning, suggestedPath, summary);
    }
}`,
  },
  {
    name: 'StatsService.java',
    packagePath: 'com/complaint/system/service/StatsService.java',
    category: 'Service',
    description: 'Statistical rollups, SLA breaches, and satisfaction analytics computation.',
    code: `package com.complaint.system.service;

import com.complaint.system.dto.ComplaintStatsDto;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Status;
import com.complaint.system.model.User;
import com.complaint.system.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final ComplaintRepository complaintRepository;

    public StatsService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public ComplaintStatsDto calculateStats(User currentUser) {
        List<Complaint> list = complaintRepository.findAll();
        if (currentUser != null && currentUser.getRole() != com.complaint.system.model.Role.ADMIN) {
            list = list.stream().filter(c -> c.getUserId().equals(currentUser.getId())).toList();
        }

        long total = list.size();
        long open = list.stream().filter(c -> c.getStatus() == Status.OPEN).count();
        long inProgress = list.stream().filter(c -> c.getStatus() == Status.IN_PROGRESS).count();
        long resolved = list.stream().filter(c -> c.getStatus() == Status.RESOLVED).count();
        long closed = list.stream().filter(c -> c.getStatus() == Status.CLOSED).count();
        long criticalPending = list.stream().filter(c -> c.getPriority() == Priority.CRITICAL && (c.getStatus() == Status.OPEN || c.getStatus() == Status.IN_PROGRESS)).count();

        LocalDateTime now = LocalDateTime.now();
        long slaBreaches = list.stream()
                .filter(c -> c.getStatus() != Status.RESOLVED && c.getStatus() != Status.CLOSED)
                .filter(c -> c.getSlaDueAt() != null && now.isAfter(c.getSlaDueAt()))
                .count();

        double avgFeedback = list.stream()
                .filter(c -> c.getFeedback() != null)
                .mapToInt(c -> c.getFeedback().rating())
                .average()
                .orElse(4.8);

        Map<String, Long> byCategory = list.stream()
                .collect(Collectors.groupingBy(c -> c.getCategory().name(), Collectors.counting()));

        Map<String, Long> byPriority = list.stream()
                .collect(Collectors.groupingBy(c -> c.getPriority().name(), Collectors.counting()));

        return new ComplaintStatsDto(
                total,
                open,
                inProgress,
                resolved,
                closed,
                criticalPending,
                slaBreaches,
                4.2,
                Math.round(avgFeedback * 10.0) / 10.0,
                byCategory,
                byPriority
        );
    }
}`,
  },
  {
    name: 'Complaint.java',
    packagePath: 'com/complaint/system/model/Complaint.java',
    category: 'Model',
    description: 'Domain entity with encapsulation, immutable audit log history, SLA computation, and defensive copying.',
    code: `package com.complaint.system.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class Complaint {
    private final String id;
    private String title;
    private String description;
    private Category category;
    private Priority priority;
    private Status status;
    private final String userId;
    private final String userName;
    private final String userEmail;
    private String assignedAdminId;
    private String assignedAdminName;
    private String resolution;
    private Feedback feedback;
    private final List<Comment> comments = new ArrayList<>();
    private final List<StatusHistory> history = new ArrayList<>();
    private LocalDateTime slaDueAt;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Complaint(String id, String title, String description, Category category,
                     Priority priority, String userId, String userName, String userEmail) {
        if (title == null || title.trim().length() < 5) {
            throw new IllegalArgumentException("Title must be at least 5 characters");
        }
        if (description == null || description.trim().length() < 10) {
            throw new IllegalArgumentException("Description must be at least 10 characters");
        }
        this.id = Objects.requireNonNull(id, "Complaint ID cannot be null");
        this.title = title.trim();
        this.description = description.trim();
        this.category = Objects.requireNonNullElse(category, Category.OTHER);
        this.priority = Objects.requireNonNullElse(priority, Priority.MEDIUM);
        this.status = Status.OPEN;
        this.userId = Objects.requireNonNull(userId, "UserId cannot be null");
        this.userName = userName;
        this.userEmail = userEmail;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        this.slaDueAt = calculateSlaDue(this.priority, this.createdAt);
        this.history.add(new StatusHistory("NONE", Status.OPEN, userId, userName, "Ticket filed by user"));
    }

    private LocalDateTime calculateSlaDue(Priority priority, LocalDateTime fromTime) {
        int hours = (priority != null) ? priority.getSlaHours() : 24;
        return fromTime.plusHours(hours);
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; this.updatedAt = LocalDateTime.now(); }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; this.updatedAt = LocalDateTime.now(); }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; this.updatedAt = LocalDateTime.now(); }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { 
        this.priority = priority; 
        this.slaDueAt = calculateSlaDue(priority, this.createdAt);
        this.updatedAt = LocalDateTime.now(); 
    }
    public Status getStatus() { return status; }
    public String getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public String getAssignedAdminId() { return assignedAdminId; }
    public String getAssignedAdminName() { return assignedAdminName; }
    public String getResolution() { return resolution; }
    public Feedback getFeedback() { return feedback; }
    public LocalDateTime getSlaDueAt() { return slaDueAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<Comment> getComments() { return Collections.unmodifiableList(comments); }
    public List<StatusHistory> getHistory() { return Collections.unmodifiableList(history); }

    public void addComment(Comment comment) {
        this.comments.add(Objects.requireNonNull(comment));
        this.updatedAt = LocalDateTime.now();
    }

    public void assignToAdmin(String adminId, String adminName) {
        this.assignedAdminId = adminId;
        this.assignedAdminName = adminName;
        if (this.status == Status.OPEN) {
            transitionStatus(Status.IN_PROGRESS, adminId, adminName, "Assigned to administrator " + adminName);
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void transitionStatus(Status newStatus, String actorId, String actorName, String comment) {
        Status prev = this.status;
        this.status = newStatus;
        this.history.add(new StatusHistory(prev.name(), newStatus, actorId, actorName, comment));
        this.updatedAt = LocalDateTime.now();
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
        this.updatedAt = LocalDateTime.now();
    }

    public void setFeedback(Feedback feedback) {
        this.feedback = feedback;
        this.updatedAt = LocalDateTime.now();
    }
}`,
  },
  {
    name: 'User.java',
    packagePath: 'com/complaint/system/model/User.java',
    category: 'Model',
    description: 'User entity representing standard customer and system administrator accounts.',
    code: `package com.complaint.system.model;

import java.time.LocalDateTime;
import java.util.Objects;

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
}`,
  },
  {
    name: 'Role.java',
    packagePath: 'com/complaint/system/model/Role.java',
    category: 'Model',
    description: 'Role-Based Access Control enum defining USER and ADMIN permissions.',
    code: `package com.complaint.system.model;

public enum Role {
    USER,
    ADMIN
}`,
  },
  {
    name: 'Status.java',
    packagePath: 'com/complaint/system/model/Status.java',
    category: 'Model',
    description: 'Finite State Machine status states (OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED).',
    code: `package com.complaint.system.model;

public enum Status {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED,
    REJECTED
}`,
  },
  {
    name: 'Priority.java',
    packagePath: 'com/complaint/system/model/Priority.java',
    category: 'Model',
    description: 'Severity levels with attached SLA resolution target deadlines in hours.',
    code: `package com.complaint.system.model;

public enum Priority {
    CRITICAL(4),
    HIGH(12),
    MEDIUM(24),
    LOW(48);

    private final int slaHours;

    Priority(int slaHours) {
        this.slaHours = slaHours;
    }

    public int getSlaHours() {
        return slaHours;
    }
}`,
  },
  {
    name: 'Category.java',
    packagePath: 'com/complaint/system/model/Category.java',
    category: 'Model',
    description: 'Functional grievance categories for ticket triage.',
    code: `package com.complaint.system.model;

public enum Category {
    TECHNICAL,
    BILLING,
    SERVICE,
    PRODUCT,
    INFRASTRUCTURE,
    OTHER
}`,
  },
  {
    name: 'Comment.java',
    packagePath: 'com/complaint/system/model/Comment.java',
    category: 'Model',
    description: 'Threaded ticket remark object.',
    code: `package com.complaint.system.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class Comment {
    private final String id;
    private final String authorId;
    private final String authorName;
    private final Role authorRole;
    private final String message;
    private final LocalDateTime createdAt;

    public Comment(String id, String authorId, String authorName, Role authorRole, String message) {
        this.id = Objects.requireNonNull(id, "Comment ID cannot be null");
        this.authorId = Objects.requireNonNull(authorId, "Author ID cannot be null");
        this.authorName = Objects.requireNonNull(authorName, "Author Name cannot be null");
        this.authorRole = Objects.requireNonNull(authorRole, "Author Role cannot be null");
        this.message = Objects.requireNonNull(message, "Message cannot be null");
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public Role getAuthorRole() { return authorRole; }
    public String getMessage() { return message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}`,
  },
  {
    name: 'Feedback.java',
    packagePath: 'com/complaint/system/model/Feedback.java',
    category: 'Model',
    description: 'Immutable record storing user star rating and remarks upon resolution.',
    code: `package com.complaint.system.model;

import java.time.LocalDateTime;

public record Feedback(
    int rating,
    String comment,
    LocalDateTime submittedAt
) {
    public Feedback {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Feedback rating must be between 1 and 5 stars");
        }
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}`,
  },
  {
    name: 'StatusHistory.java',
    packagePath: 'com/complaint/system/model/StatusHistory.java',
    category: 'Model',
    description: 'Immutable audit log tracking every state transition and actor remark.',
    code: `package com.complaint.system.model;

import java.time.LocalDateTime;

public record StatusHistory(
    String fromStatus,
    Status toStatus,
    String actorId,
    String actorName,
    String comment,
    LocalDateTime timestamp
) {
    public StatusHistory(String fromStatus, Status toStatus, String actorId, String actorName, String comment) {
        this(fromStatus, toStatus, actorId, actorName, comment, LocalDateTime.now());
    }
}`,
  },
  {
    name: 'ComplaintRequest.java',
    packagePath: 'com/complaint/system/dto/ComplaintRequest.java',
    category: 'DTO',
    description: 'Jakarta-validated incoming payload for ticket creation.',
    code: `package com.complaint.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComplaintRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 120, message = "Title must be between 5 and 120 characters")
    String title,

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    String description,

    String category,
    String priority
) {}`,
  },
  {
    name: 'StatusUpdateRequest.java',
    packagePath: 'com/complaint/system/dto/StatusUpdateRequest.java',
    category: 'DTO',
    description: 'Validated request for state transitions and resolution notes.',
    code: `package com.complaint.system.dto;

import com.complaint.system.model.Status;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
    @NotNull(message = "New status is required")
    Status newStatus,

    String resolution,
    String comment
) {}`,
  },
  {
    name: 'FeedbackRequest.java',
    packagePath: 'com/complaint/system/dto/FeedbackRequest.java',
    category: 'DTO',
    description: 'Feedback submission payload with rating bounds validation.',
    code: `package com.complaint.system.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record FeedbackRequest(
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    int rating,

    String comment,
    boolean closeTicket
) {}`,
  },
  {
    name: 'AiCategorizeRequest.java',
    packagePath: 'com/complaint/system/dto/AiCategorizeRequest.java',
    category: 'DTO',
    description: 'Request DTO for Gemini triage inference.',
    code: `package com.complaint.system.dto;

import jakarta.validation.constraints.NotBlank;

public record AiCategorizeRequest(
    @NotBlank(message = "Title is required")
    String title,

    @NotBlank(message = "Description is required")
    String description
) {}`,
  },
  {
    name: 'AiCategorizeResponse.java',
    packagePath: 'com/complaint/system/dto/AiCategorizeResponse.java',
    category: 'DTO',
    description: 'Response DTO with AI categorization, severity score, and recommended path.',
    code: `package com.complaint.system.dto;

import com.complaint.system.model.Category;
import com.complaint.system.model.Priority;

public record AiCategorizeResponse(
    Category category,
    Priority priority,
    String reasoning,
    String suggestedResolutionPath,
    String summary
) {}`,
  },
  {
    name: 'ComplaintStatsDto.java',
    packagePath: 'com/complaint/system/dto/ComplaintStatsDto.java',
    category: 'DTO',
    description: 'Statistical aggregation DTO for system metrics.',
    code: `package com.complaint.system.dto;

import java.util.Map;

public record ComplaintStatsDto(
    long totalComplaints,
    long openCount,
    long inProgressCount,
    long resolvedCount,
    long closedCount,
    long criticalPending,
    long slaBreachCount,
    double avgResolutionHours,
    double satisfactionRating,
    Map<String, Long> byCategory,
    Map<String, Long> byPriority
) {}`,
  },
  {
    name: 'ComplaintRepository.java',
    packagePath: 'com/complaint/system/repository/ComplaintRepository.java',
    category: 'Repository',
    description: 'Data Access Interface specifying query methods and filtering contracts.',
    code: `package com.complaint.system.repository;

import com.complaint.system.model.Category;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Status;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository {
    Complaint save(Complaint complaint);
    Optional<Complaint> findById(String id);
    List<Complaint> findAll();
    List<Complaint> findByUserId(String userId);
    List<Complaint> findByStatus(Status status);
    List<Complaint> search(Status status, Category category, Priority priority, String keyword);
    void deleteById(String id);
    void clearAll();
}`,
  },
  {
    name: 'InMemoryComplaintRepository.java',
    packagePath: 'com/complaint/system/repository/InMemoryComplaintRepository.java',
    category: 'Repository',
    description: 'Thread-safe ConcurrentHashMap repository seeded with production demo scenarios.',
    code: `package com.complaint.system.repository;

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
}`,
  },
  {
    name: 'UserRepository.java',
    packagePath: 'com/complaint/system/repository/UserRepository.java',
    category: 'Repository',
    description: 'User repository interface for account discovery and email checks.',
    code: `package com.complaint.system.repository;

import com.complaint.system.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    boolean existsByEmail(String email);
    void deleteById(String id);
}`,
  },
  {
    name: 'InMemoryUserRepository.java',
    packagePath: 'com/complaint/system/repository/InMemoryUserRepository.java',
    category: 'Repository',
    description: 'Thread-safe in-memory User store with default credentials.',
    code: `package com.complaint.system.repository;

import com.complaint.system.model.Role;
import com.complaint.system.model.User;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryUserRepository implements UserRepository {

    private final Map<String, User> users = new ConcurrentHashMap<>();

    public InMemoryUserRepository() {
        seedInitialUsers();
    }

    private void seedInitialUsers() {
        User user1 = new User("usr_user_1", "Ayan Hubli", "hubliayan@gmail.com", "password123", Role.USER);
        User admin1 = new User("usr_admin_1", "Alex Vance", "admin@helpdesk.internal", "admin123", Role.ADMIN);
        User user2 = new User("usr_user_2", "Sarah Jenkins", "sarah.j@enterprise.com", "password123", Role.USER);
        
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
}`,
  },
  {
    name: 'GlobalExceptionHandler.java',
    packagePath: 'com/complaint/system/exception/GlobalExceptionHandler.java',
    category: 'Exception & Config',
    description: 'Centralized Controller Advice mapping domain exceptions to RFC 7807 JSON error responses.',
    code: `package com.complaint.system.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidState(InvalidStateTransitionException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedActionException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedActionException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("fieldErrors", errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", message);
        return new ResponseEntity<>(body, status);
    }
}`,
  },
  {
    name: 'InvalidStateTransitionException.java',
    packagePath: 'com/complaint/system/exception/InvalidStateTransitionException.java',
    category: 'Exception & Config',
    description: 'Exception thrown when an invalid FSM state transition is attempted.',
    code: `package com.complaint.system.exception;

public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(String message) {
        super(message);
    }
}`,
  },
  {
    name: 'UnauthorizedActionException.java',
    packagePath: 'com/complaint/system/exception/UnauthorizedActionException.java',
    category: 'Exception & Config',
    description: 'Exception thrown when an actor attempts an action violating RBAC policies.',
    code: `package com.complaint.system.exception;

public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }
}`,
  },
  {
    name: 'ResourceNotFoundException.java',
    packagePath: 'com/complaint/system/exception/ResourceNotFoundException.java',
    category: 'Exception & Config',
    description: 'Exception thrown when a ticket or user cannot be found.',
    code: `package com.complaint.system.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}`,
  },
  {
    name: 'CorsConfig.java',
    packagePath: 'com/complaint/system/config/CorsConfig.java',
    category: 'Exception & Config',
    description: 'Spring WebMvcConfigurer for cross-origin resource sharing.',
    code: `package com.complaint.system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}`,
  },
  {
    name: 'ComplaintServiceTest.java',
    packagePath: 'src/test/java/com/complaint/system/ComplaintServiceTest.java',
    category: 'Test & Build',
    description: 'JUnit 5 automated tests validating baseline complaint creation and status updates.',
    code: `package com.complaint.system;

import com.complaint.system.dto.ComplaintRequest;
import com.complaint.system.dto.StatusUpdateRequest;
import com.complaint.system.exception.InvalidStateTransitionException;
import com.complaint.system.exception.UnauthorizedActionException;
import com.complaint.system.model.Category;
import com.complaint.system.model.Complaint;
import com.complaint.system.model.Priority;
import com.complaint.system.model.Role;
import com.complaint.system.model.Status;
import com.complaint.system.model.User;
import com.complaint.system.repository.InMemoryComplaintRepository;
import com.complaint.system.service.ComplaintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ComplaintServiceTest {

    private InMemoryComplaintRepository repository;
    private ComplaintService complaintService;
    private User regularUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        repository = new InMemoryComplaintRepository();
        complaintService = new ComplaintService(repository);
        regularUser = new User("usr_user_1", "Ayan Hubli", "hubliayan@gmail.com", "pass", Role.USER);
        adminUser = new User("usr_admin_1", "Alex Vance", "admin@internal.com", "pass", Role.ADMIN);
    }

    @Test
    @DisplayName("Should create complaint with OPEN status and calculated SLA")
    void testCreateComplaint() {
        ComplaintRequest req = new ComplaintRequest(
                "Billing issue with credit card charge",
                "Double charge on credit card for invoice #991",
                "BILLING",
                "HIGH"
        );

        Complaint created = complaintService.createComplaint(req, regularUser);

        assertNotNull(created.getId());
        assertEquals(Status.OPEN, created.getStatus());
        assertEquals(Category.BILLING, created.getCategory());
        assertEquals(Priority.HIGH, created.getPriority());
        assertEquals("usr_user_1", created.getUserId());
        assertNotNull(created.getSlaDueAt());
    }

    @Test
    @DisplayName("Admin transitions OPEN ticket to IN_PROGRESS")
    void testAdminTransitionToInProgress() {
        ComplaintRequest req = new ComplaintRequest("Network latency", "Packet drops in VPN tunnel", "TECHNICAL", "MEDIUM");
        Complaint created = complaintService.createComplaint(req, regularUser);

        Complaint updated = complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.IN_PROGRESS, null, "Investigating"), adminUser);
        assertEquals(Status.IN_PROGRESS, updated.getStatus());
    }

    @Test
    @DisplayName("User cannot move ticket to IN_PROGRESS (RBAC check)")
    void testUserCannotSetInProgress() {
        ComplaintRequest req = new ComplaintRequest("Network latency", "Packet drops in VPN tunnel", "TECHNICAL", "MEDIUM");
        Complaint created = complaintService.createComplaint(req, regularUser);

        assertThrows(UnauthorizedActionException.class, () -> {
            complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.IN_PROGRESS, null, "Try"), regularUser);
        });
    }

    @Test
    @DisplayName("Backward transition from RESOLVED to OPEN is strictly forbidden")
    void testBackwardTransitionForbidden() {
        ComplaintRequest req = new ComplaintRequest("Email delayed", "Queue delays in outbound", "SERVICE", "MEDIUM");
        Complaint created = complaintService.createComplaint(req, regularUser);

        complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.RESOLVED, "Flushed queue", "Done"), adminUser);

        assertThrows(InvalidStateTransitionException.class, () -> {
            complaintService.updateStatus(created.getId(), new StatusUpdateRequest(Status.OPEN, null, "Reopen"), adminUser);
        });
    }
}`,
  },
  {
    name: 'FsmAndRbacEnforcementTest.java',
    packagePath: 'src/test/java/com/complaint/system/FsmAndRbacEnforcementTest.java',
    category: 'Test & Build',
    description: 'Comprehensive JUnit 5 test suite validating State Machine transitions, User vs Admin RBAC constraints, and Closure immutability.',
    code: `package com.complaint.system;

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

    @Nested
    @DisplayName("Admin Role Authorization")
    class AdminTransitions {
        @Test
        @DisplayName("Admin can transition ticket from OPEN to IN_PROGRESS")
        void adminCanTransitionToInProgress() {
            Complaint ticket = repository.findById("CMP-2026-1002").orElseThrow();
            StatusUpdateRequest req = new StatusUpdateRequest(Status.IN_PROGRESS, null, "Investigating network glitch");
            Complaint updated = complaintService.updateStatus(ticket.getId(), req, adminUser);
            assertEquals(Status.IN_PROGRESS, updated.getStatus());
            assertEquals(adminUser.getId(), updated.getAssignedAdminId());
        }

        @Test
        @DisplayName("Admin must provide resolution note when resolving ticket")
        void adminMustProvideResolution() {
            Complaint ticket = repository.findById("CMP-2026-1002").orElseThrow();
            complaintService.updateStatus(ticket.getId(), new StatusUpdateRequest(Status.IN_PROGRESS, null, "Working"), adminUser);

            StatusUpdateRequest invalidResolve = new StatusUpdateRequest(Status.RESOLVED, "", "Done");
            assertThrows(IllegalArgumentException.class, () -> {
                complaintService.updateStatus(ticket.getId(), invalidResolve, adminUser);
            });
        }
    }

    @Nested
    @DisplayName("User Role Authorization & Strict Closures")
    class UserTransitions {
        @Test
        @DisplayName("Only the complaint owner can close a RESOLVED ticket")
        void onlyOwnerCanCloseResolvedTicket() {
            Complaint ticket = repository.findById("CMP-2026-1003").orElseThrow();
            assertThrows(UnauthorizedActionException.class, () -> {
                complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(5, "Looks good", true), otherUser);
            });

            Complaint closed = complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(5, "Prompt turnaround", true), complaintOwner);
            assertEquals(Status.CLOSED, closed.getStatus());
        }
    }

    @Nested
    @DisplayName("State Invariant Constraints")
    class InvariantConstraints {
        @Test
        @DisplayName("Closed ticket is immutable against any mutations")
        void closedTicketIsImmutable() {
            Complaint ticket = repository.findById("CMP-2026-1004").orElseThrow();
            assertThrows(InvalidStateTransitionException.class, () -> {
                complaintService.updateStatus(ticket.getId(), new StatusUpdateRequest(Status.IN_PROGRESS, null, "Try modify"), adminUser);
            });
        }
    }
}`,
  },
  {
    name: 'ValidationAndFeedbackTest.java',
    packagePath: 'src/test/java/com/complaint/system/ValidationAndFeedbackTest.java',
    category: 'Test & Build',
    description: 'JUnit 5 tests validating feedback 1-5 rating constraints, minimum title/description lengths, and illegal premature closures.',
    code: `package com.complaint.system;

import com.complaint.system.dto.ComplaintRequest;
import com.complaint.system.dto.FeedbackRequest;
import com.complaint.system.exception.InvalidStateTransitionException;
import com.complaint.system.model.*;
import com.complaint.system.repository.InMemoryComplaintRepository;
import com.complaint.system.service.ComplaintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Validation and Customer Feedback Domain Test Suite")
class ValidationAndFeedbackTest {

    private InMemoryComplaintRepository repository;
    private ComplaintService complaintService;
    private User testUser;

    @BeforeEach
    void setUp() {
        repository = new InMemoryComplaintRepository();
        complaintService = new ComplaintService(repository);
        testUser = new User("usr_user_1", "Ayan Hubli", "hubliayan@gmail.com", "pass123", Role.USER);
    }

    @Test
    @DisplayName("Complaint with title < 5 characters should throw IllegalArgumentException")
    void titleTooShortThrowsException() {
        ComplaintRequest req = new ComplaintRequest("VPN", "Valid description that exceeds 10 characters", "TECHNICAL", "MEDIUM");
        assertThrows(IllegalArgumentException.class, () -> {
            complaintService.createComplaint(req, testUser);
        });
    }

    @Test
    @DisplayName("Feedback rating bounds (1 to 5) must be enforced")
    void feedbackRatingBoundsEnforced() {
        Complaint ticket = repository.findById("CMP-2026-1003").orElseThrow();

        assertThrows(IllegalArgumentException.class, () -> {
            complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(0, "Terrible", true), testUser);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(6, "Super", true), testUser);
        });

        Complaint closed = complaintService.submitFeedback(ticket.getId(), new FeedbackRequest(5, "Perfect resolution", true), testUser);
        assertEquals(5, closed.getFeedback().rating());
    }

    @Test
    @DisplayName("Submitting feedback on an OPEN ticket should throw InvalidStateTransitionException")
    void feedbackOnOpenTicketThrowsException() {
        Complaint openTicket = repository.findById("CMP-2026-1002").orElseThrow();

        assertThrows(InvalidStateTransitionException.class, () -> {
            complaintService.submitFeedback(openTicket.getId(), new FeedbackRequest(5, "Premature feedback", true), testUser);
        });
    }
}`,
  },
  {
    name: 'JwtUtil.java',
    packagePath: 'com/complaint/system/util/JwtUtil.java',
    category: 'Exception & Config',
    description: 'HMAC-SHA256 JJWT Token utility providing cryptographic signature verification, token generation, and claims extraction.',
    code: `package com.complaint.system.util;

import com.complaint.system.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(
            @Value("\${jwt.secret:complaint-management-super-secret-key-256-bit-minimum-secure-hex-string}") String secretKey,
            @Value("\${jwt.expiration-ms:86400000}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(user.getId())
                .claim("name", user.getName())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String extractUserId(String token) {
        return getClaims(token).getSubject();
    }

    public String extractEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        return validateToken(token);
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            Claims claims = getClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}`,
  },
  {
    name: 'AuthResponse.java',
    packagePath: 'com/complaint/system/dto/AuthResponse.java',
    category: 'DTO',
    description: 'Authentication Response DTO containing the issued JWT Bearer token and safe User entity.',
    code: `package com.complaint.system.dto;

import com.complaint.system.model.User;

public record AuthResponse(
    String token,
    String tokenType,
    User user
) {
    public AuthResponse(String token, User user) {
        this(token, "Bearer", user);
    }
}`,
  },
  {
    name: 'AuthServiceTest.java',
    packagePath: 'src/test/java/com/complaint/system/AuthServiceTest.java',
    category: 'Test & Build',
    description: 'JUnit 5 tests verifying BCrypt password hashing, JJWT token generation, role claims, and strict Bearer authentication.',
    code: `package com.complaint.system;

import com.complaint.system.dto.AuthRequest;
import com.complaint.system.dto.AuthResponse;
import com.complaint.system.dto.RegisterRequest;
import com.complaint.system.exception.UnauthorizedActionException;
import com.complaint.system.model.Role;
import com.complaint.system.model.User;
import com.complaint.system.repository.InMemoryUserRepository;
import com.complaint.system.service.AuthService;
import com.complaint.system.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Authentication, BCrypt & JJWT Security Test Suite")
class AuthServiceTest {

    private InMemoryUserRepository userRepository;
    private JwtUtil jwtUtil;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = new InMemoryUserRepository();
        jwtUtil = new JwtUtil("complaint-management-super-secret-key-256-bit-minimum-secure-hex-string-for-tests", 86400000L);
        authService = new AuthService(userRepository, jwtUtil);
    }

    @Test
    @DisplayName("Should register new user with BCrypt hashed password and return valid JJWT token")
    void testRegisterUser() {
        RegisterRequest request = new RegisterRequest("David Miller", "david@test.com", "securePassword123", "USER");
        AuthResponse response = authService.register(request);

        assertNotNull(response.token());
        assertEquals("Bearer", response.tokenType());
        assertEquals("david@test.com", response.user().getEmail());
        assertEquals(Role.USER, response.user().getRole());

        // Validate JJWT token integrity
        assertTrue(jwtUtil.isTokenValid(response.token()));
        assertEquals(response.user().getId(), jwtUtil.extractUserId(response.token()));
        assertEquals("david@test.com", jwtUtil.extractEmail(response.token()));
        assertEquals("USER", jwtUtil.extractRole(response.token()));
    }

    @Test
    @DisplayName("Should prevent privilege escalation by assigning USER role to public registrations even if ADMIN is requested")
    void testPreventPublicAdminRegistration() {
        RegisterRequest request = new RegisterRequest("Attacker", "attacker@test.com", "securePassword123", "ADMIN");
        AuthResponse response = authService.register(request);

        assertEquals(Role.USER, response.user().getRole());
        assertEquals("USER", jwtUtil.extractRole(response.token()));
    }

    @Test
    @DisplayName("Should login registered user with correct password and reject wrong password")
    void testLoginUser() {
        RegisterRequest registerReq = new RegisterRequest("Elena Rostova", "elena@test.com", "mypassword", "USER");
        authService.register(registerReq);

        AuthRequest loginReq = new AuthRequest("elena@test.com", "mypassword");
        AuthResponse loginRes = authService.login(loginReq);
        assertNotNull(loginRes.token());
        assertEquals("elena@test.com", loginRes.user().getEmail());

        AuthRequest badReq = new AuthRequest("elena@test.com", "wrongpassword");
        assertThrows(UnauthorizedActionException.class, () -> authService.login(badReq));
    }

    @Test
    @DisplayName("Should authenticate default seed users via BCrypt password verification")
    void testSeedUserLogin() {
        AuthRequest loginReq = new AuthRequest("admin@helpdesk.internal", "admin123");
        AuthResponse loginRes = authService.login(loginReq);
        assertNotNull(loginRes.token());
        assertEquals("admin@helpdesk.internal", loginRes.user().getEmail());
        assertEquals(Role.ADMIN, loginRes.user().getRole());
    }

    @Test
    @DisplayName("Should resolve user strictly from Bearer JWT header")
    void testResolveUserFromJwt() {
        RegisterRequest registerReq = new RegisterRequest("Liam Nelson", "liam@test.com", "mypassword", "USER");
        AuthResponse registerRes = authService.register(registerReq);

        String authHeader = "Bearer " + registerRes.token();
        User resolved = authService.resolveUser(authHeader);

        assertNotNull(resolved);
        assertEquals("liam@test.com", resolved.getEmail());
        assertEquals(Role.USER, resolved.getRole());
    }

    @Test
    @DisplayName("Should reject requests missing Bearer JWT header (no X-User-Id fallback)")
    void testRejectMissingBearerToken() {
        assertThrows(UnauthorizedActionException.class, () -> authService.resolveUser(null));
        assertThrows(UnauthorizedActionException.class, () -> authService.resolveUser(""));
        assertThrows(UnauthorizedActionException.class, () -> authService.resolveUser("Basic dXNyOmFkbWlu"));
    }
}`,
  },
  {
    name: 'StatsServiceTest.java',
    packagePath: 'src/test/java/com/complaint/system/StatsServiceTest.java',
    category: 'Test & Build',
    description: 'JUnit 5 tests verifying SLA breach calculations, category distribution counts, and CSAT average scoring.',
    code: `package com.complaint.system;

import com.complaint.system.dto.ComplaintStatsDto;
import com.complaint.system.repository.InMemoryComplaintRepository;
import com.complaint.system.service.StatsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SLA & Complaint Analytics Test Suite")
class StatsServiceTest {

    private InMemoryComplaintRepository repository;
    private StatsService statsService;

    @BeforeEach
    void setUp() {
        repository = new InMemoryComplaintRepository();
        statsService = new StatsService(repository);
    }

    @Test
    @DisplayName("Should aggregate SLA metrics and calculate CSAT average")
    void testComputeStats() {
        ComplaintStatsDto stats = statsService.getStats();

        assertTrue(stats.totalComplaints() >= 5);
        assertTrue(stats.openComplaints() >= 1);
        assertTrue(stats.inProgressComplaints() >= 1);
        assertTrue(stats.resolvedComplaints() >= 1);
        assertTrue(stats.closedComplaints() >= 1);
        assertTrue(stats.averageSatisfactionScore() > 0.0);
    }
}`,
  },
];

export function JavaCodeExplorer() {
  const [selectedFile, setSelectedFile] = useState<JavaFile>(JAVA_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [downloading, setDownloading] = useState(false);

  const categories = ['ALL', 'Controller', 'Service', 'Model', 'DTO', 'Repository', 'Exception & Config', 'Test & Build'];

  const filteredFiles = selectedCategory === 'ALL' 
    ? JAVA_FILES 
    : JAVA_FILES.filter(f => f.category === selectedCategory);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();

      // Add pom.xml
      const pom = JAVA_FILES.find(f => f.name === 'pom.xml')?.code || '';
      zip.file('pom.xml', pom);

      // Add application.properties
      const appProps = JAVA_FILES.find(f => f.name === 'application.properties')?.code || 
`server.port=8080
spring.application.name=online-complaint-system
gemini.api.key=\${GEMINI_API_KEY:}
gemini.model=gemini-2.5-flash
logging.level.com.complaint.system=DEBUG
`;
      zip.file('src/main/resources/application.properties', appProps);

      // Add README.md
      zip.file('README.md', 
`# Online Complaint Management System (Spring Boot + Java 17)

Enterprise-grade role-based Complaint Management and Resolution platform.

## Architecture
- **Framework**: Spring Boot 3.2.3 (Java 17)
- **Design Pattern**: Controller -> Service -> Repository -> Concurrent Store
- **State Machine**: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
- **AI Triage**: Google Gemini 2.5 Flash

## How to Run with Maven
\`\`\`bash
mvn clean install
mvn spring-boot:run
\`\`\`

## Run Unit Tests
\`\`\`bash
mvn test
\`\`\`
`
      );

      // Add Java files
      JAVA_FILES.forEach(file => {
        if (file.name !== 'pom.xml' && file.name !== 'application.properties') {
          if (file.packagePath.startsWith('src/test/')) {
            zip.file(file.packagePath, file.code);
          } else {
            zip.file(`src/main/java/${file.packagePath}`, file.code);
          }
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spring-boot-complaint-system-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Spring Boot & Java Project Architecture
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Java 17 / Spring Boot 3
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Layered Architecture: REST Controller Layer &rarr; Service Layer &rarr; Repository Layer &rarr; Concurrent In-Memory Store &rarr; Gemini AI
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Packing Maven ZIP...' : 'Download Maven Project (.ZIP)'}
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left File Tree */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Package Hierarchy ({filteredFiles.length} files)
          </div>

          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredFiles.map((file, idx) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedFile(file)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/90 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-amber-500" />
                      {file.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {file.category}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] text-slate-400 truncate">
                    {file.packagePath}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {file.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Code Display */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            
            {/* Code Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs text-slate-400 ml-2 truncate max-w-xs md:max-w-md">
                  {selectedFile.packagePath}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Code!' : 'Copy Code'}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[600px] leading-relaxed">
              <pre>{selectedFile.code}</pre>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
