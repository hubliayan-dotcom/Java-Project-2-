export type Role = 'USER' | 'ADMIN';

export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Category = 'TECHNICAL' | 'BILLING' | 'SERVICE' | 'PRODUCT' | 'INFRASTRUCTURE' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Comment {
  id: string;
  complaintId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  message: string;
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  fromStatus: Status | 'NONE';
  toStatus: Status;
  changedBy: string;
  changedByName: string;
  changedByRole: Role;
  comment?: string;
  timestamp: string;
}

export interface Feedback {
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
}

export interface Complaint {
  id: string; // Formatted CMP-2026-XXXX
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  userId: string;
  userName: string;
  userEmail: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
  resolution?: string;
  feedback?: Feedback;
  comments: Comment[];
  history: StatusHistory[];
  slaDueAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintStats {
  totalComplaints: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  rejectedCount: number;
  criticalPending: number;
  avgResolutionHours: number;
  slaBreachCount: number;
  satisfactionRating: number;
}
