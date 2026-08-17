package com.complaint.system;

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
}
