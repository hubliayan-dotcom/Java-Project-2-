# Online Complaint Management System
### Spring Boot 3 • Java 17 • React • TypeScript • Gemini AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online%20Application-0284c7?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ais-pre-glx4vcvjgqmhkutqttnop7-50948685477.asia-southeast1.run.app)

> 🚀 **Live Demo URL:** [https://ais-pre-glx4vcvjgqmhkutqttnop7-50948685477.asia-southeast1.run.app](https://ais-pre-glx4vcvjgqmhkutqttnop7-50948685477.asia-southeast1.run.app)

A full-stack role-based complaint management system built with Java 17, Spring Boot 3, React, and TypeScript. The system provides complaint submission, admin triage, SLA monitoring, enforced status transitions, Gemini AI-assisted categorization, CSAT feedback, REST APIs, and an interactive Java architecture explorer.

---

## 1. Overview & Problem Statement

Manual complaint handling (phone calls, unstructured emails, paper forms) lacks a single source of truth, an immutable audit trail, and measurable SLA timeframes. 

This **Online Complaint Management System** establishes a structured ticketing lifecycle using an in-memory repository for the current demonstration build, with a planned migration to PostgreSQL for persistent production storage. It provides unique sequential complaint IDs (`CMP-YYYY-XXXX`), strict role-based authorization (User vs Admin), real-time SLA countdowns, and formal status transitions with customer satisfaction (CSAT) feedback.

```
User Registration / Login
        ↓
Complaint Submission
        ↓
Gemini AI Auto-Categorization
        ↓
Sequential Ticket Generation (CMP-2026-XXXX)
        ↓
Admin Review & Assignment
        ↓
OPEN → IN_PROGRESS
        ↓
Administrative Resolution
        ↓
RESOLVED
        ↓
User CSAT Feedback
        ↓
CLOSED
```

*Administrative Rejection Paths (for invalid or out-of-scope complaints):*
- `OPEN → REJECTED`
- `IN_PROGRESS → REJECTED`

---

## 2. Key Features

### User Portal
- User registration and login
- Complaint submission
- Gemini AI category and priority detection
- Complaint search and filtering
- SLA countdown
- Follow-up comments
- Complaint status tracking
- 1–5 star CSAT feedback
- Owner-only complaint closure

### Admin Triage Desk
- Complaint queue and analytics
- Category, priority, and status filtering
- SLA monitoring and breach detection
- Ticket assignment
- Resolution notes
- Enforced FSM transitions
- Audit trail and state history

### Developer / Interview Features
- Interactive REST API Playground
- Java OOP Architecture Explorer
- Automated test runner
- Interview preparation flashcards
- JSON and CSV data export

---

## 3. Project Highlights

- 🔐 **BCrypt + JJWT authentication** with role-based access control
- 🔄 **Enforced finite state machine** for complaint lifecycle
- 🤖 **Gemini 2.5 Flash AI-assisted** complaint triage
- ⏱️ **SLA countdown** and breach monitoring
- 📝 **Timestamped audit trail** and follow-up comments
- ⭐ **1–5 star CSAT feedback** and owner-controlled closure
- 🧪 **12 automated validation/integration checks**
- 🔌 **Interactive REST API testing playground**
- ☕ **Java OOP architecture explorer**
- 📊 **Admin analytics** and complaint filtering
- 📁 **JSON and CSV data export**

---

## 4. Enforced State Machine Lifecycle

```
[ OPEN ] ──(Admin Assign)──> [ IN_PROGRESS ] ──(Admin Resolve)──> [ RESOLVED ]
   │                              │                                      │
   └──(Admin Reject)──> [ REJECTED ]                                    │
                                                                         │
                                  (User Feedback + Rating)               ↓
                                                                    [ CLOSED ]
```

### Explicit Allowed Transitions
- **Primary Demonstration Lifecycle:** `OPEN → IN_PROGRESS → RESOLVED → CLOSED`
- `OPEN → IN_PROGRESS` (Admin assignment or triage)
- `OPEN → REJECTED` (Admin invalid/duplicate rejection)
- `IN_PROGRESS → RESOLVED` (Admin resolution with mandatory remarks)
- `IN_PROGRESS → REJECTED` (Admin rejection during investigation)
- `RESOLVED → CLOSED` (Owner satisfaction rating & feedback submission)

### Transition Invariants (Strictly Enforced)
1. **Admin Only**: Only users with the `ADMIN` role can transition tickets to `IN_PROGRESS`, `RESOLVED`, or `REJECTED`.
2. **User Closure Rule**: Only the grievance owner (`USER`) can move a ticket from `RESOLVED` to `CLOSED` upon supplying satisfaction feedback (1 to 5 stars).
3. **No Backward Transitions**: Moving backward to `OPEN` is strictly rejected (`400 Bad Request`).
4. **Immutability**: Once a ticket is marked `CLOSED`, it is final and cannot be modified or commented on.
5. **Resolution Notes**: Moving to `RESOLVED` requires mandatory resolution remarks.

---

## 5. Java OOP Concepts & Architecture

| Concept | Implementation in Codebase |
|---|---|
| **Classes & Records** | `User`, `Complaint`, `Comment`, `StatusHistory`, `Feedback`, DTO Records (`ComplaintRequest`, `AuthRequest`, `RegisterRequest`, `StatusUpdateRequest`, `FeedbackRequest`, `AiCategorizeRequest`) |
| **Encapsulation** | Private member fields, defensive collection copies (`Collections.unmodifiableList`), immutable DTO records |
| **Type-Safe Enums** | `Role` (USER, ADMIN), `Status` (OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED), `Priority` (LOW, MEDIUM, HIGH, CRITICAL), `Category` (TECHNICAL, BILLING, SERVICE, PRODUCT, INFRASTRUCTURE, OTHER) |
| **Authentication & Security** | `BCryptPasswordEncoder` credential hashing, JJWT (`io.jsonwebtoken.Jwts`, `Keys.hmacShaKeyFor`) Bearer tokens, RBAC principal resolution |
| **Storage & Persistence** | **In-Memory Storage**: The current demonstration backend uses in-memory `ConcurrentHashMap` repositories. Data is reset when the application/backend restarts. A relational database such as PostgreSQL is planned as a future persistence upgrade. `AtomicInteger` is used for collision-free sequential ID generation. |
| **Exception Handling** | `InvalidStateTransitionException`, `UnauthorizedActionException`, `ResourceNotFoundException`, `GlobalExceptionHandler` with RFC 7807 problem details |
| **Validation** | Jakarta Bean Validation (`@NotBlank`, `@Size`, `@Email`, `@Min`, `@Max`) on request payloads |
| **Audit Trail History** | Comments and status transitions are recorded in the complaint's audit history for the lifetime of the current in-memory application session with actor ID, role, and comments. |
| **AI Integration** | Google Gemini 2.5 Flash analyzes complaint descriptions and suggests category, priority, confidence/reasoning, and resolution guidance. A deterministic local fallback is available when Gemini is unavailable. |

---

## 6. REST API Reference & Interactive Playground

**Interactive REST API Playground**: Provides an interactive runner for the application's REST endpoints, including authentication, user management, complaint management, status transitions, feedback, statistics, AI categorization, and demo-data reset. 

The core complaint workflow consists of 12 primary API operations, with additional authentication, user-management, statistics, AI, and demo utilities (18 total endpoints).

All protected endpoints strictly require standard `Authorization: Bearer <token>` headers issued upon registration or login.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register user account with BCrypt password hashing & issue JJWT |
| `POST` | `/api/auth/login` | Public | Authenticate credentials (`AuthRequest`) and return JJWT Bearer token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile for currently authenticated user via JWT |
| `POST` | `/api/users/register` | Public | User directory registration alias |
| `GET` | `/api/users` | Authenticated | List all registered users |
| `GET` | `/api/users/admins` | Authenticated | List support team administrator accounts |
| `GET` | `/api/complaints` | Authenticated | Retrieve complaints (scoped to user or all for admin) |
| `GET` | `/api/complaints/mine` | User | Retrieve all complaints lodged by the authenticated user |
| `GET` | `/api/complaints/search` | Authenticated | Filter grievances by status, category, priority, and keyword |
| `POST` | `/api/complaints` | User | Submit a new complaint (calculates SLA due time based on priority) |
| `GET` | `/api/complaints/{id}` | Authenticated | View full ticket details, audit timeline, and comments |
| `POST` | `/api/complaints/{id}/comments` | Authenticated | Append a follow-up remark to a ticket audit history |
| `PATCH` | `/api/complaints/{id}/assign` | Admin | Assign ticket to admin and transition to `IN_PROGRESS` |
| `PATCH` | `/api/complaints/{id}/status` | Admin | Enforce state machine transitions (requires resolution note if RESOLVED) |
| `POST` | `/api/complaints/{id}/feedback` | User | Submit 1–5 star rating and close `RESOLVED` ticket |
| `GET` | `/api/stats` | Authenticated | Aggregate SLA metrics, breach counts, category breakdown, and CSAT rating |
| `POST` | `/api/ai/categorize` | Authenticated | Google Gemini 2.5 Flash classification of category, priority & reasoning |
| `POST` | `/api/complaints/reset-demo-data` | Authenticated | Reset in-memory store to baseline sample seed complaints |

---

## 7. How to Build & Run

### Spring Boot 3 Backend (Java 17 + Maven)
```bash
# 1. Run complete automated test suite (FSM, RBAC, Validation, Stats, JJWT Auth)
mvn clean test

# 2. Start Spring Boot application locally
mvn spring-boot:run

# 3. Or package and execute standalone self-contained JAR
mvn clean package
java -jar target/online-complaint-system-1.0.0.jar
```

### Full-Stack Live Web Application (React UI + Web Proxy)
```bash
# Install dependencies
npm install

# Start development server (binds on port 3000)
npm run dev

# Production build and start
npm run build
npm start
```

---

## 8. Automated Testing Checklist

The project includes 12 validation and integration checks:

- [x] **1. Valid user registration** — Valid registration creates user account, hashes password with BCrypt, and returns HTTP 201 with signed JJWT token.
- [x] **2. Duplicate registration prevention** — Registration with an existing email is rejected with HTTP 409 Conflict.
- [x] **3. Invalid login handling** — Login attempts with wrong credentials return HTTP 401 Unauthorized via BCrypt comparison.
- [x] **4. Complaint title validation** — Submission with title < 5 characters returns HTTP 400 Validation Error.
- [x] **5. Invalid complaint ID handling** — Querying non-existent ticket IDs returns HTTP 404 Resource Not Found.
- [x] **6. Backward FSM transition prevention** — Illegal state rollback moving backward to OPEN is strictly blocked with HTTP 400.
- [x] **7. Unauthorized admin action prevention** — Ticket assignment or status transition attempted by regular user returns HTTP 403 Forbidden.
- [x] **8. Complaint filtering** — Filtering by category, priority, and status returns the exact expected subset.
- [x] **9. Owner-only closure with feedback** — Grievance owner can close a RESOLVED ticket upon submitting mandatory 1–5 star satisfaction feedback.
- [x] **10. Audit history verification** — Comments and status transitions are recorded in the complaint audit history with actor and timestamp.
- [x] **11. Gemini AI triage** — Google Gemini 2.5 Flash accurately classifies grievance category, priority, and resolution guidance.
- [x] **12. JJWT authentication** — HMAC-SHA256 JJWT Bearer token authentication securely verifies caller identity and role.

---

## 9. Limitations & Future Enhancements

### Limitations
- Current demonstration storage uses in-memory repositories.
- Complaint data is reset when the backend restarts.
- The current system is designed for a single demonstration environment.
- PostgreSQL persistence is planned as a future enhancement.
- Email/push notifications are not currently implemented.

### Future Enhancements
- PostgreSQL + Spring Data JPA persistence
- Dockerized deployment
- Email/SMS notifications
- Redis caching
- Role-based production deployment
- Automated CI/CD pipeline
- Advanced analytics dashboard

---

## 10. Architecture & Technical Interview Q&A

1. **Explain your project architecture.** — A role-based complaint management system where users lodge and track complaints with real-time SLA countdowns, and admins triage, assign, and resolve tickets under an enforced finite state machine with BCrypt password hashing, standard JJWT Bearer security, and Gemini 2.5 Flash AI triage.
2. **Why enums for Status/Priority/Category?** — Ensures compile-time type safety, eliminates typos, enables exhaustive pattern matching in modern Java, and encapsulates domain logic such as SLA deadlines.
3. **How is Authentication and RBAC implemented?** — Passwords are encrypted using BCrypt (`BCryptPasswordEncoder`). Upon authentication via `AuthRequest`, signed JJWT tokens (`io.jsonwebtoken.Jwts`) are issued. Downstream endpoints resolve caller identity from `Authorization: Bearer <token>` headers and check roles in the Service layer.
4. **Why separate Service and Controller layers?** — Decouples HTTP protocol concerns from business rules and finite state machine validations, making the domain layer completely testable in isolation.
5. **How would you migrate to persistent storage?** — Replace the current `ConcurrentHashMap` repositories with Spring Data JPA entities and `JpaRepository` interfaces, use PostgreSQL as the database, add database indexes for complaint ID/status/priority/category, and use transactions for state transitions and feedback closure.
6. **How do you generate unique complaint IDs?** — Using `AtomicInteger` to prevent race conditions and ID sequence collisions under concurrent multi-threaded requests.
7. **How do you validate input payloads?** — Jakarta Bean Validation annotations (`@NotBlank`, `@Size`, `@Email`, `@Min`, `@Max`) on DTO records with a `GlobalExceptionHandler` formatting RFC 7807 error responses.
8. **What happens on invalid status transitions?** — The service throws `InvalidStateTransitionException`, which is caught by the exception handler and returns HTTP 400 Bad Request with a clear message.
9. **How does Gemini AI triage work?** — Google Gemini 2.5 Flash analyzes complaint descriptions and suggests category, priority, confidence/reasoning, and resolution guidance. A deterministic local fallback is available when Gemini is unavailable.
10. **How would you scale this for 100k complaints/day?** — Deploy stateless Spring Boot container instances behind an NGINX load balancer, utilize Redis for JWT token blacklist/session cache, PostgreSQL with read replicas for data persistence, and Kafka for asynchronous notifications.
