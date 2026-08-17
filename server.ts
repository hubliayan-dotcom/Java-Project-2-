/**
 * =========================================================================================
 * AI Studio Live Runtime Server (Node.js / Express Companion)
 * =========================================================================================
 * 
 * PURPOSE & ROLE:
 * - This server (`server.ts`) powers the live interactive web preview on port 3000 in AI Studio.
 * - It serves the frontend Single Page Application (React + Tailwind CSS) and provides the
 *   live companion REST API mirroring 1:1 the Spring Boot 3 Java backend REST contract.
 * - It securely proxies Google Gemini 2.5 Flash API calls server-side for AI complaint triage.
 * 
 * STANDALONE JAVA SPRING BOOT 3 BACKEND:
 * - The primary enterprise Java application resides in `/src/main/java/com/complaint/system/`
 *   and `/src/test/java/com/complaint/system/`, configured via `pom.xml`.
 * - To build and run the native Spring Boot 3 JAR in any Java 17+ environment:
 *     mvn clean package
 *     java -jar target/online-complaint-system-1.0.0.jar
 * =========================================================================================
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Complaint, User, Comment, StatusHistory, Status, Priority, Category, Role, ComplaintStats } from "./src/types.ts";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "complaint-jwt-secret-key-256-bit-min-12345678";

app.use(express.json());

// In-Memory Repository with persistence simulation (Track B / Track A Store)
interface Store {
  users: Map<string, User & { passwordHash: string }>;
  complaints: Map<string, Complaint>;
  sessions: Map<string, string>; // token -> userId
  idCounter: number;
}

const store: Store = {
  users: new Map(),
  complaints: new Map(),
  sessions: new Map(),
  idCounter: 1001,
};

// Gemini AI Client (Lazy initialization & safe handling)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Generate signed JWT token
function generateJwtToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// SLA Duration in Hours based on Priority
const SLA_HOURS: Record<Priority, number> = {
  CRITICAL: 4,
  HIGH: 12,
  MEDIUM: 24,
  LOW: 48,
};

function calculateSlaDue(priority: Priority, fromDate: Date = new Date()): string {
  const hours = SLA_HOURS[priority] || 24;
  const due = new Date(fromDate.getTime() + hours * 60 * 60 * 1000);
  return due.toISOString();
}

function generateComplaintId(): string {
  const currentYear = new Date().getFullYear();
  const id = `CMP-${currentYear}-${store.idCounter++}`;
  return id;
}

// Seed initial data
function seedInitialData() {
  store.users.clear();
  store.complaints.clear();
  store.sessions.clear();
  store.idCounter = 1001;

  // Admin user
  const adminUser: User & { passwordHash: string } = {
    id: "usr_admin_1",
    name: "Alex Vance (Lead Admin)",
    email: "admin@helpdesk.internal",
    role: "ADMIN",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    passwordHash: bcrypt.hashSync("admin123", 10),
  };
  store.users.set(adminUser.id, adminUser);
  const adminJwt = generateJwtToken(adminUser);
  store.sessions.set(adminJwt, adminUser.id);
  store.sessions.set("admin-token-demo", adminUser.id);

  // Regular user 1
  const user1: User & { passwordHash: string } = {
    id: "usr_user_1",
    name: "Ayan Hubli",
    email: "hubliayan@gmail.com",
    role: "USER",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    passwordHash: bcrypt.hashSync("password123", 10),
  };
  store.users.set(user1.id, user1);
  const user1Jwt = generateJwtToken(user1);
  store.sessions.set(user1Jwt, user1.id);
  store.sessions.set("user-token-demo", user1.id);

  // Regular user 2
  const user2: User & { passwordHash: string } = {
    id: "usr_user_2",
    name: "Sophia Martinez",
    email: "sophia.m@example.com",
    role: "USER",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    passwordHash: bcrypt.hashSync("password123", 10),
  };
  store.users.set(user2.id, user2);

  // Sample Complaints demonstrating full lifecycle
  const c1Id = generateComplaintId();
  const c1: Complaint = {
    id: c1Id,
    title: "Double billing deduction on monthly subscription renewal",
    description: "I noticed two charges of $49.00 on my bank account statement on August 12th for invoice #INV-9021. Please refund the duplicate transaction.",
    category: "BILLING",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    userId: user1.id,
    userName: user1.name,
    userEmail: user1.email,
    assignedAdminId: adminUser.id,
    assignedAdminName: adminUser.name,
    comments: [
      {
        id: "cmt_1",
        complaintId: c1Id,
        authorId: adminUser.id,
        authorName: adminUser.name,
        authorRole: "ADMIN",
        message: "We have reviewed the payment gateway ledger and verified the duplicate debit. Finance team is processing the reverse refund.",
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
    ],
    history: [
      {
        id: "hst_1",
        fromStatus: "NONE",
        toStatus: "OPEN",
        changedBy: user1.id,
        changedByName: user1.name,
        changedByRole: "USER",
        comment: "Complaint submitted via Web Portal",
        timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
      },
      {
        id: "hst_2",
        fromStatus: "OPEN",
        toStatus: "IN_PROGRESS",
        changedBy: adminUser.id,
        changedByName: adminUser.name,
        changedByRole: "ADMIN",
        comment: "Assigned to Alex Vance and escalated to Finance",
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
    ],
    slaDueAt: calculateSlaDue("CRITICAL", new Date(Date.now() - 8 * 3600000)),
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  };
  store.complaints.set(c1.id, c1);

  const c2Id = generateComplaintId();
  const c2: Complaint = {
    id: c2Id,
    title: "Database latency and 504 gateway timeout on report exporter",
    description: "Exporting CSV summaries for queries with more than 5,000 rows consistently triggers a 504 Gateway Timeout error after 60 seconds.",
    category: "TECHNICAL",
    priority: "HIGH",
    status: "OPEN",
    userId: user1.id,
    userName: user1.name,
    userEmail: user1.email,
    comments: [],
    history: [
      {
        id: "hst_3",
        fromStatus: "NONE",
        toStatus: "OPEN",
        changedBy: user1.id,
        changedByName: user1.name,
        changedByRole: "USER",
        comment: "Ticket logged with network logs attached",
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ],
    slaDueAt: calculateSlaDue("HIGH", new Date(Date.now() - 2 * 3600000)),
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  };
  store.complaints.set(c2.id, c2);

  const c3Id = generateComplaintId();
  const c3: Complaint = {
    id: c3Id,
    title: "Wi-Fi access point in 3rd Floor Engineering Bay is dropping packets",
    description: "The ceiling AP-3B disconnects every 15 minutes during peak hours. Signal SNR fluctuates dramatically.",
    category: "INFRASTRUCTURE",
    priority: "MEDIUM",
    status: "RESOLVED",
    userId: user2.id,
    userName: user2.name,
    userEmail: user2.email,
    assignedAdminId: adminUser.id,
    assignedAdminName: adminUser.name,
    resolution: "Replaced faulty PoE injector and upgraded AP firmware to v4.8.2. Signal stability tested for 4 hours with 0 packet loss.",
    comments: [
      {
        id: "cmt_2",
        complaintId: c3Id,
        authorId: adminUser.id,
        authorName: adminUser.name,
        authorRole: "ADMIN",
        message: "Hardware replacement completed on 3rd floor. Please test connection stability.",
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ],
    history: [
      {
        id: "hst_4",
        fromStatus: "NONE",
        toStatus: "OPEN",
        changedBy: user2.id,
        changedByName: user2.name,
        changedByRole: "USER",
        comment: "Complaint created",
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: "hst_5",
        fromStatus: "OPEN",
        toStatus: "IN_PROGRESS",
        changedBy: adminUser.id,
        changedByName: adminUser.name,
        changedByRole: "ADMIN",
        comment: "Hardware dispatch scheduled",
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: "hst_6",
        fromStatus: "IN_PROGRESS",
        toStatus: "RESOLVED",
        changedBy: adminUser.id,
        changedByName: adminUser.name,
        changedByRole: "ADMIN",
        comment: "PoE injector replaced and firmware upgraded",
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ],
    slaDueAt: calculateSlaDue("MEDIUM", new Date(Date.now() - 24 * 3600000)),
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  };
  store.complaints.set(c3.id, c3);

  const c4Id = generateComplaintId();
  const c4: Complaint = {
    id: c4Id,
    title: "Damaged packaging on delivered test hardware kit",
    description: "The hardware kit received on Monday had a cracked acrylic casing. Requesting replacement casing.",
    category: "PRODUCT",
    priority: "LOW",
    status: "CLOSED",
    userId: user1.id,
    userName: user1.name,
    userEmail: user1.email,
    assignedAdminId: adminUser.id,
    assignedAdminName: adminUser.name,
    resolution: "Shipped replacement acrylic enclosure via priority courier tracking #TRK-882194.",
    feedback: {
      rating: 5,
      comment: "Super fast turnaround time and friendly support. Thank you Alex!",
      submittedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    comments: [],
    history: [
      {
        id: "hst_7",
        fromStatus: "NONE",
        toStatus: "OPEN",
        changedBy: user1.id,
        changedByName: user1.name,
        changedByRole: "USER",
        comment: "Ticket raised",
        timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
      },
      {
        id: "hst_8",
        fromStatus: "OPEN",
        toStatus: "IN_PROGRESS",
        changedBy: adminUser.id,
        changedByName: adminUser.name,
        changedByRole: "ADMIN",
        comment: "Reviewing replacement inventory",
        timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
      },
      {
        id: "hst_9",
        fromStatus: "IN_PROGRESS",
        toStatus: "RESOLVED",
        changedBy: adminUser.id,
        changedByName: adminUser.name,
        changedByRole: "ADMIN",
        comment: "Replacement part dispatched",
        timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
      },
      {
        id: "hst_10",
        fromStatus: "RESOLVED",
        toStatus: "CLOSED",
        changedBy: user1.id,
        changedByName: user1.name,
        changedByRole: "USER",
        comment: "Closed by user with 5-star feedback rating",
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
    ],
    slaDueAt: calculateSlaDue("LOW", new Date(Date.now() - 48 * 3600000)),
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  };
  store.complaints.set(c4.id, c4);
}

seedInitialData();

// Auth Middleware
interface AuthRequest extends Request {
  user?: User;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized: Missing Authorization header" });
    return;
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // Validate standard HMAC-SHA256 JWT Bearer Token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (decoded && decoded.id) {
      const user = store.users.get(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    }
  } catch (err) {
    // JWT verification failed
  }

  // Check active session store
  const userId = store.sessions.get(token);
  if (userId) {
    const user = store.users.get(userId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  res.status(401).json({ error: "Unauthorized: Invalid or expired Bearer JWT authentication token" });
}

function adminOnlyMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden: Admin privileges required for this action" });
    return;
  }
  next();
}

// -------------------------------------------------------------
// REST API ENDPOINTS (Track B & Track A implementation)
// -------------------------------------------------------------

// Shared user registration logic with BCrypt password hashing & JWT generation
function handleUserRegistration(req: Request, res: Response): void {
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "Validation Error: Name must be at least 2 characters" });
    return;
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Validation Error: A valid email address is required" });
    return;
  }

  if (!password || typeof password !== "string" || password.length < 4) {
    res.status(400).json({ error: "Validation Error: Password must be at least 4 characters" });
    return;
  }

  // Duplicate email check
  const normalizedEmail = email.trim().toLowerCase();
  for (const existingUser of store.users.values()) {
    if (existingUser.email.toLowerCase() === normalizedEmail) {
      res.status(409).json({ error: "Duplicate Registration: An account with this email already exists" });
      return;
    }
  }

  // Public self-registration is strictly restricted to USER role to prevent privilege escalation
  const assignedRole: Role = "USER";
  const newUserId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser: User & { passwordHash: string } = {
    id: newUserId,
    name: name.trim(),
    email: normalizedEmail,
    role: assignedRole,
    createdAt: new Date().toISOString(),
    passwordHash: hashedPassword,
  };

  store.users.set(newUserId, newUser);

  const { passwordHash: _, ...safeUser } = newUser;
  const token = generateJwtToken(safeUser);
  store.sessions.set(token, newUserId);

  res.status(201).json({
    message: "User registered successfully",
    user: safeUser,
    token,
    tokenType: "Bearer",
  });
}

// POST /api/users/register & POST /api/auth/register
app.post("/api/users/register", handleUserRegistration);
app.post("/api/auth/register", handleUserRegistration);

// GET /api/users (Admin-only: Retrieve user directory)
app.get("/api/users", authMiddleware, adminOnlyMiddleware, (req: AuthRequest, res: Response) => {
  const users = Array.from(store.users.values()).map(({ passwordHash, ...u }) => u);
  res.json({ users, total: users.length });
});

// GET /api/users/admins (Authenticated: Retrieve admin support agents)
app.get("/api/users/admins", authMiddleware, (req: AuthRequest, res: Response) => {
  const admins = Array.from(store.users.values())
    .filter((u) => u.role === "ADMIN")
    .map(({ passwordHash, ...u }) => u);
  res.json({ admins, total: admins.length });
});

// POST /api/auth/login
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  let foundUser: (User & { passwordHash: string }) | null = null;

  for (const u of store.users.values()) {
    if (u.email.toLowerCase() === normalizedEmail) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    res.status(401).json({ error: "Invalid credentials: Email or password incorrect" });
    return;
  }

  // Verify BCrypt hash strictly
  const isMatch = bcrypt.compareSync(password, foundUser.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: "Invalid credentials: Email or password incorrect" });
    return;
  }

  const { passwordHash: _, ...safeUser } = foundUser;
  const token = generateJwtToken(safeUser);
  store.sessions.set(token, foundUser.id);

  res.json({
    message: "Login successful",
    user: safeUser,
    token,
    tokenType: "Bearer",
  });
});

// GET /api/auth/me
app.get("/api/auth/me", authMiddleware, (req: AuthRequest, res: Response) => {
  const { passwordHash, ...safeUser } = req.user as any;
  res.json({ user: safeUser });
});

// GET /api/complaints/mine (User's own complaints)
app.get("/api/complaints/mine", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const userComplaints = Array.from(store.complaints.values())
    .filter((c) => c.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ complaints: userComplaints });
});

// POST /api/complaints (Create complaint)
app.post("/api/complaints", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { title, description, category, priority } = req.body;

  if (!title || typeof title !== "string" || title.trim().length < 5) {
    res.status(400).json({ error: "Validation Error: Title must be at least 5 characters" });
    return;
  }

  if (!description || typeof description !== "string" || description.trim().length < 10) {
    res.status(400).json({ error: "Validation Error: Description must be at least 10 characters" });
    return;
  }

  const validCategories: Category[] = ["TECHNICAL", "BILLING", "SERVICE", "PRODUCT", "INFRASTRUCTURE", "OTHER"];
  const validPriorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  const assignedCategory: Category = validCategories.includes(category) ? category : "OTHER";
  const assignedPriority: Priority = validPriorities.includes(priority) ? priority : "MEDIUM";

  const complaintId = generateComplaintId();
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    id: complaintId,
    title: title.trim(),
    description: description.trim(),
    category: assignedCategory,
    priority: assignedPriority,
    status: "OPEN",
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    comments: [],
    history: [
      {
        id: `hst_${Date.now()}`,
        fromStatus: "NONE",
        toStatus: "OPEN",
        changedBy: user.id,
        changedByName: user.name,
        changedByRole: user.role,
        comment: "Ticket lodged via Portal",
        timestamp: now,
      },
    ],
    slaDueAt: calculateSlaDue(assignedPriority),
    createdAt: now,
    updatedAt: now,
  };

  store.complaints.set(complaintId, newComplaint);

  res.status(201).json({
    message: "Complaint registered successfully",
    complaint: newComplaint,
  });
});

// GET /api/complaints/search (Admin search & filter, or all complaints)
app.get("/api/complaints/search", authMiddleware, (req: AuthRequest, res: Response) => {
  const { status, category, priority, keyword } = req.query;

  let results = Array.from(store.complaints.values());

  // Non-admins can only search within their own complaints
  if (req.user!.role !== "ADMIN") {
    results = results.filter((c) => c.userId === req.user!.id);
  }

  if (status && typeof status === "string" && status !== "ALL") {
    results = results.filter((c) => c.status === status);
  }

  if (category && typeof category === "string" && category !== "ALL") {
    results = results.filter((c) => c.category === category);
  }

  if (priority && typeof priority === "string" && priority !== "ALL") {
    results = results.filter((c) => c.priority === priority);
  }

  if (keyword && typeof keyword === "string" && keyword.trim().length > 0) {
    const q = keyword.toLowerCase().trim();
    results = results.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.userName.toLowerCase().includes(q) ||
        c.userEmail.toLowerCase().includes(q)
    );
  }

  // Sort by priority urgency and then newest
  const priorityRank: Record<Priority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  results.sort((a, b) => {
    // If one is open/in_progress and other is closed, prioritize active
    const aActive = a.status === "OPEN" || a.status === "IN_PROGRESS" ? 1 : 0;
    const bActive = b.status === "OPEN" || b.status === "IN_PROGRESS" ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;

    const rankDiff = priorityRank[b.priority] - priorityRank[a.priority];
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json({ complaints: results, count: results.length });
});

// GET /api/complaints/:id (View complaint)
app.get("/api/complaints/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const complaint = store.complaints.get(req.params.id);

  if (!complaint) {
    res.status(404).json({ error: `Complaint Not Found: No record exists for ID '${req.params.id}'` });
    return;
  }

  // Access check: Only owner or admin can view
  if (req.user!.role !== "ADMIN" && complaint.userId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden: You are not authorized to view this complaint" });
    return;
  }

  res.json({ complaint });
});

// POST /api/complaints/:id/comments (Add comment)
app.post("/api/complaints/:id/comments", authMiddleware, (req: AuthRequest, res: Response) => {
  const complaint = store.complaints.get(req.params.id);

  if (!complaint) {
    res.status(404).json({ error: `Complaint Not Found: ID '${req.params.id}'` });
    return;
  }

  // Access check: Only owner or admin can comment
  if (req.user!.role !== "ADMIN" && complaint.userId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden: You cannot comment on someone else's complaint" });
    return;
  }

  const { message } = req.body;
  if (!message || typeof message !== "string" || message.trim().length < 2) {
    res.status(400).json({ error: "Comment message must not be empty" });
    return;
  }

  const user = req.user!;
  const newComment: Comment = {
    id: `cmt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    complaintId: complaint.id,
    authorId: user.id,
    authorName: user.name,
    authorRole: user.role,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };

  complaint.comments.push(newComment);
  complaint.updatedAt = new Date().toISOString();

  res.status(201).json({
    message: "Comment added successfully",
    comment: newComment,
    complaint,
  });
});

// PATCH /api/complaints/:id/assign (Admin assigns complaint)
app.patch("/api/complaints/:id/assign", authMiddleware, adminOnlyMiddleware, (req: AuthRequest, res: Response) => {
  const complaint = store.complaints.get(req.params.id);

  if (!complaint) {
    res.status(404).json({ error: `Complaint Not Found: ID '${req.params.id}'` });
    return;
  }

  if (complaint.status === "CLOSED") {
    res.status(400).json({ error: "Cannot reassign a closed complaint" });
    return;
  }

  const admin = req.user!;
  const previousAdminName = complaint.assignedAdminName || "Unassigned";
  complaint.assignedAdminId = admin.id;
  complaint.assignedAdminName = admin.name;

  const previousStatus = complaint.status;
  if (complaint.status === "OPEN") {
    complaint.status = "IN_PROGRESS";
  }

  const now = new Date().toISOString();
  complaint.history.push({
    id: `hst_${Date.now()}`,
    fromStatus: previousStatus,
    toStatus: complaint.status,
    changedBy: admin.id,
    changedByName: admin.name,
    changedByRole: "ADMIN",
    comment: `Assigned to ${admin.name} (previously: ${previousAdminName})`,
    timestamp: now,
  });

  complaint.updatedAt = now;

  res.json({
    message: `Complaint assigned to ${admin.name}`,
    complaint,
  });
});

// PATCH /api/complaints/:id/status (Strict State Machine enforcement)
app.patch("/api/complaints/:id/status", authMiddleware, (req: AuthRequest, res: Response) => {
  const complaint = store.complaints.get(req.params.id);

  if (!complaint) {
    res.status(404).json({ error: `Complaint Not Found: ID '${req.params.id}'` });
    return;
  }

  const user = req.user!;
  const { newStatus, resolution, comment, priority } = req.body;

  if (!newStatus) {
    res.status(400).json({ error: "Missing newStatus parameter" });
    return;
  }

  const validStatuses: Status[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
  if (!validStatuses.includes(newStatus)) {
    res.status(400).json({ error: `Invalid status: ${newStatus}. Allowed values: ${validStatuses.join(", ")}` });
    return;
  }

  const currentStatus = complaint.status;

  // Rule 1: Closed complaints are immutable
  if (currentStatus === "CLOSED") {
    res.status(400).json({ error: "Invalid Transition: Closed complaints are final and cannot be modified" });
    return;
  }

  // Rule 2: Nobody can move backward to OPEN
  if (newStatus === "OPEN" && currentStatus !== "OPEN") {
    res.status(400).json({ error: "Invalid Transition: State machine strictly forbids moving back to OPEN" });
    return;
  }

  // Rule 3: Role-based transitions
  if (user.role === "USER") {
    // FSM Rule: Direct status changes by users via this generic endpoint are disallowed.
    // User ticket closure MUST go through the dedicated feedback endpoint (POST /api/complaints/:id/feedback)
    // which enforces RESOLVED status + ticket ownership + 1-5 star CSAT rating.
    res.status(403).json({
      error: "Unauthorized: Direct status modification is disabled for regular users. To close a resolved ticket, submit your 1–5 star rating via POST /api/complaints/:id/feedback.",
    });
    return;
  } else if (user.role === "ADMIN") {
    // Admin transitions
    // Allowed admin transitions:
    // OPEN -> IN_PROGRESS, REJECTED
    // IN_PROGRESS -> RESOLVED, REJECTED
    // RESOLVED -> CLOSED (administrative force-closure if needed)
    // REJECTED -> CLOSED
    if (newStatus === "RESOLVED" && (!resolution || resolution.trim().length < 5)) {
      res.status(400).json({
        error: "Validation Error: A meaningful resolution summary (at least 5 characters) is required when marking as RESOLVED",
      });
      return;
    }
  }

  // Apply Priority adjustment if requested by Admin
  if (user.role === "ADMIN" && priority && ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priority)) {
    complaint.priority = priority;
    complaint.slaDueAt = calculateSlaDue(priority, new Date(complaint.createdAt));
  }

  // Apply resolution
  if (resolution && resolution.trim().length > 0) {
    complaint.resolution = resolution.trim();
  }

  // Record history
  const now = new Date().toISOString();
  complaint.status = newStatus;
  complaint.history.push({
    id: `hst_${Date.now()}`,
    fromStatus: currentStatus,
    toStatus: newStatus,
    changedBy: user.id,
    changedByName: user.name,
    changedByRole: user.role,
    comment: comment || (resolution ? `Resolution: ${resolution}` : `Status updated to ${newStatus}`),
    timestamp: now,
  });

  complaint.updatedAt = now;

  res.json({
    message: `Status transitioned from ${currentStatus} to ${newStatus} successfully`,
    complaint,
  });
});

// POST /api/complaints/:id/feedback (User feedback submission on RESOLVED/CLOSED)
app.post("/api/complaints/:id/feedback", authMiddleware, (req: AuthRequest, res: Response) => {
  const complaint = store.complaints.get(req.params.id);

  if (!complaint) {
    res.status(404).json({ error: `Complaint Not Found: ID '${req.params.id}'` });
    return;
  }

  const user = req.user!;
  if (complaint.userId !== user.id && user.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden: You can only submit feedback for your own complaint" });
    return;
  }

  if (complaint.status !== "RESOLVED" && complaint.status !== "CLOSED") {
    res.status(400).json({ error: "Feedback can only be submitted for RESOLVED or CLOSED complaints" });
    return;
  }

  const { rating, comment, closeTicket } = req.body;
  const numRating = Number(rating);

  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    res.status(400).json({ error: "Validation Error: Rating must be an integer between 1 and 5" });
    return;
  }

  const now = new Date().toISOString();
  complaint.feedback = {
    rating: numRating,
    comment: (comment || "").trim(),
    submittedAt: now,
  };

  // If user requested ticket closure or ticket was RESOLVED, close it
  if (closeTicket || complaint.status === "RESOLVED") {
    const prevStatus = complaint.status;
    complaint.status = "CLOSED";
    complaint.history.push({
      id: `hst_${Date.now()}`,
      fromStatus: prevStatus,
      toStatus: "CLOSED",
      changedBy: user.id,
      changedByName: user.name,
      changedByRole: user.role,
      comment: `Ticket closed by user with ${numRating}-star feedback rating`,
      timestamp: now,
    });
  }

  complaint.updatedAt = now;

  res.json({
    message: "Feedback submitted and complaint finalized successfully",
    complaint,
  });
});

// GET /api/stats (Analytics & SLA Dashboard)
app.get("/api/stats", authMiddleware, (req: AuthRequest, res: Response) => {
  const allComplaints = Array.from(store.complaints.values());
  const now = Date.now();

  let openCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  let closedCount = 0;
  let rejectedCount = 0;
  let criticalPending = 0;
  let slaBreachCount = 0;
  let totalRating = 0;
  let ratingCount = 0;
  let totalResolutionTimeHours = 0;
  let resolvedWithTimeCount = 0;

  for (const c of allComplaints) {
    if (c.status === "OPEN") openCount++;
    else if (c.status === "IN_PROGRESS") inProgressCount++;
    else if (c.status === "RESOLVED") resolvedCount++;
    else if (c.status === "CLOSED") closedCount++;
    else if (c.status === "REJECTED") rejectedCount++;

    if ((c.status === "OPEN" || c.status === "IN_PROGRESS") && (c.priority === "CRITICAL" || c.priority === "HIGH")) {
      criticalPending++;
    }

    // SLA breach check
    if ((c.status === "OPEN" || c.status === "IN_PROGRESS") && new Date(c.slaDueAt).getTime() < now) {
      slaBreachCount++;
    }

    if (c.feedback?.rating) {
      totalRating += c.feedback.rating;
      ratingCount++;
    }

    if (c.status === "RESOLVED" || c.status === "CLOSED") {
      const created = new Date(c.createdAt).getTime();
      const updated = new Date(c.updatedAt).getTime();
      const diffHours = Math.max(0.1, (updated - created) / (1000 * 60 * 60));
      totalResolutionTimeHours += diffHours;
      resolvedWithTimeCount++;
    }
  }

  const stats: ComplaintStats = {
    totalComplaints: allComplaints.length,
    openCount,
    inProgressCount,
    resolvedCount,
    closedCount,
    rejectedCount,
    criticalPending,
    avgResolutionHours: resolvedWithTimeCount > 0 ? Number((totalResolutionTimeHours / resolvedWithTimeCount).toFixed(1)) : 0,
    slaBreachCount,
    satisfactionRating: ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 5.0,
  };

  res.json({ stats });
});

// Helper: Heuristic AI Semantic Triage Engine (Fallback for offline/high-demand spikes)
function performHeuristicTriage(title: string, description: string) {
  const combined = `${title || ""} ${description || ""}`.toLowerCase();
  
  // Category scoring
  let category: Category = "OTHER";
  let maxScore = 0;

  const categoryScores: Record<Category, number> = {
    TECHNICAL: 0,
    BILLING: 0,
    SERVICE: 0,
    PRODUCT: 0,
    INFRASTRUCTURE: 0,
    OTHER: 1,
  };

  const techKeywords = ["error", "bug", "crash", "timeout", "500", "504", "404", "database", "sql", "exception", "failed", "stack", "login", "api", "endpoint", "ui", "glitch", "code", "latency"];
  const billingKeywords = ["bill", "charge", "refund", "invoice", "payment", "credit card", "debit", "subscription", "cost", "price", "overcharge", "receipt", "dollar", "money", "transaction"];
  const infraKeywords = ["wifi", "wi-fi", "network", "hardware", "power", "server", "router", "switch", "ethernet", "datacenter", "outage", "cable", "ap-", "connectivity", "dns", "ping", "signal"];
  const productKeywords = ["delivery", "broken", "damage", "package", "item", "defect", "quality", "shipping", "physical", "hardware unit", "device", "feature"];
  const serviceKeywords = ["support", "agent", "representative", "slow response", "rude", "unhelpful", "customer service", "delay", "waiting", "attitude", "call", "ticket delay"];

  techKeywords.forEach((kw) => { if (combined.includes(kw)) categoryScores.TECHNICAL += 2; });
  billingKeywords.forEach((kw) => { if (combined.includes(kw)) categoryScores.BILLING += 3; });
  infraKeywords.forEach((kw) => { if (combined.includes(kw)) categoryScores.INFRASTRUCTURE += 3; });
  productKeywords.forEach((kw) => { if (combined.includes(kw)) categoryScores.PRODUCT += 2; });
  serviceKeywords.forEach((kw) => { if (combined.includes(kw)) categoryScores.SERVICE += 2; });

  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      category = cat as Category;
    }
  }

  // Priority scoring
  let priority: Priority = "MEDIUM";
  if (
    combined.includes("critical") ||
    combined.includes("outage") ||
    combined.includes("security") ||
    combined.includes("breach") ||
    combined.includes("fraud") ||
    combined.includes("double debit") ||
    combined.includes("down across all") ||
    combined.includes("severe financial") ||
    combined.includes("emergency")
  ) {
    priority = "CRITICAL";
  } else if (
    combined.includes("crash") ||
    combined.includes("timeout") ||
    combined.includes("504") ||
    combined.includes("500") ||
    combined.includes("urgent") ||
    combined.includes("high") ||
    combined.includes("failing") ||
    combined.includes("dropping") ||
    category === "INFRASTRUCTURE"
  ) {
    priority = "HIGH";
  } else if (
    combined.includes("minor") ||
    combined.includes("typo") ||
    combined.includes("cosmetic") ||
    combined.includes("suggestion") ||
    combined.includes("low") ||
    combined.includes("question")
  ) {
    priority = "LOW";
  }

  const tags = [category.toLowerCase(), priority.toLowerCase(), "auto-triage"];
  if (combined.includes("database")) tags.push("database");
  if (combined.includes("network") || combined.includes("wifi")) tags.push("network");
  if (combined.includes("payment") || combined.includes("refund")) tags.push("finance");

  return {
    category,
    priority,
    confidenceScore: maxScore > 0 ? 0.92 : 0.8,
    reasoning: `Semantic analysis classified this issue as ${category} with ${priority} priority based on key contextual terms in the grievance.`,
    suggestedTitle: title ? title.trim() : `Support request regarding ${category.toLowerCase()}`,
    keyTags: tags,
  };
}

// POST /api/ai/categorize (AI auto-categorization & priority recommendation via Gemini API)
app.post("/api/ai/categorize", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;

  if (!description && !title) {
    res.status(400).json({ error: "Title or description required for AI analysis" });
    return;
  }

  const promptText = `Analyze the following complaint/ticket details and categorize it into the standard system taxonomy:
Title: "${title || "Not provided"}"
Description: "${description || "Not provided"}"

Allowed Categories:
- TECHNICAL (system errors, bugs, crashes, latency, API issues)
- BILLING (payments, invoices, refunds, double charge, pricing)
- SERVICE (account support, slow response, customer service quality)
- PRODUCT (hardware defects, physical quality, feature requests)
- INFRASTRUCTURE (network, Wi-Fi, server hardware, power, facility)
- OTHER (miscellaneous)

Allowed Priorities:
- CRITICAL (severe financial loss, entire outage, data loss, security danger)
- HIGH (major functionality broken, severe latency for multiple users)
- MEDIUM (isolated issue, moderate inconvenience, single user impact)
- LOW (minor aesthetic issue, cosmetic bug, general question)

Respond strictly in valid JSON format with keys:
{
  "category": "TECHNICAL" | "BILLING" | "SERVICE" | "PRODUCT" | "INFRASTRUCTURE" | "OTHER",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidenceScore": number (0 to 1),
  "reasoning": string,
  "suggestedTitle": string,
  "keyTags": string[]
}`;

  const ai = getGeminiClient();

  if (ai) {
    // Attempt with primary model gemini-3.7-flash, then fallback to gemini-3.1-flash-lite if experiencing high demand
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite"];
    
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed && parsed.category) {
            res.json({
              analysis: parsed,
              model: modelName,
              source: "gemini-api",
            });
            return;
          }
        }
      } catch (error: any) {
        console.warn(`Gemini model (${modelName}) transient status/high demand:`, error?.message || error);
        // Continue to fallback model or heuristic
      }
    }
  }

  // Graceful fallback to heuristic engine if Gemini is unavailable or experiencing temporary high demand
  const fallbackAnalysis = performHeuristicTriage(title, description);
  res.json({
    analysis: fallbackAnalysis,
    source: "semantic-heuristic-engine",
    notice: "AI classification computed using resilient semantic heuristics during high demand.",
  });
});

// GET /api/export (Persistence export to JSON / CSV for Track A demonstration)
app.get("/api/export", authMiddleware, (req: AuthRequest, res: Response) => {
  const format = (req.query.format as string) || "json";
  const allComplaints = Array.from(store.complaints.values());

  if (format === "csv") {
    const headers = ["ID", "Title", "Category", "Priority", "Status", "User", "Email", "AssignedAdmin", "CreatedAt", "UpdatedAt", "Resolution"];
    const rows = allComplaints.map((c) => [
      `"${c.id}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.priority}"`,
      `"${c.status}"`,
      `"${c.userName.replace(/"/g, '""')}"`,
      `"${c.userEmail}"`,
      `"${c.assignedAdminName || "Unassigned"}"`,
      `"${c.createdAt}"`,
      `"${c.updatedAt}"`,
      `"${(c.resolution || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="complaints-${Date.now()}.csv"`);
    res.send(csvContent);
    return;
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="complaints-database-${Date.now()}.json"`);
  res.json({
    exportedAt: new Date().toISOString(),
    totalCount: allComplaints.length,
    users: Array.from(store.users.values()).map(({ passwordHash, ...u }) => u),
    complaints: allComplaints,
  });
});

// POST /api/reset & POST /api/complaints/reset-demo-data (Admin-only: Reset state to fresh seed data)
app.post("/api/reset", authMiddleware, adminOnlyMiddleware, (req: AuthRequest, res: Response) => {
  seedInitialData();
  res.json({ message: "Store reset to initial baseline demo data successfully" });
});

app.post("/api/complaints/reset-demo-data", authMiddleware, adminOnlyMiddleware, (req: AuthRequest, res: Response) => {
  seedInitialData();
  res.json({ message: "Database reset to initial sample tickets successfully" });
});

// Start Express and integrate Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Complaint Management System running on http://localhost:${PORT}`);
  });
}

startServer();
