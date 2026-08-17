package com.complaint.system;

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
        // Register user
        RegisterRequest registerReq = new RegisterRequest("Elena Rostova", "elena@test.com", "mypassword", "USER");
        authService.register(registerReq);

        // Success login using AuthRequest
        AuthRequest loginReq = new AuthRequest("elena@test.com", "mypassword");
        AuthResponse loginRes = authService.login(loginReq);
        assertNotNull(loginRes.token());
        assertEquals("elena@test.com", loginRes.user().getEmail());

        // Bad password using AuthRequest
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
}
