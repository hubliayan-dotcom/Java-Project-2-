import React, { useEffect, useState } from 'react';
import { Complaint, User, Status, Priority, Role } from '../types.ts';
import { StatusBadge, PriorityBadge, CategoryBadge, SlaBadge } from './Badges.tsx';
import { 
  X, 
  Clock, 
  UserCheck, 
  Send, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  History, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Info,
  Check
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  currentUser: User;
  token: string;
  onClose: () => void;
  onComplaintUpdated: (updated: Complaint) => void;
}

export function ComplaintDetailModal({
  complaint,
  currentUser,
  token,
  onClose,
  onComplaintUpdated,
}: ComplaintDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  
  // Feedback state (for User on RESOLVED ticket)
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Admin status update state
  const [adminStatusAction, setAdminStatusAction] = useState<Status>('IN_PROGRESS');
  const [adminResolutionText, setAdminResolutionText] = useState('');
  const [adminCommentText, setAdminCommentText] = useState('');
  const [adminPriorityAdjust, setAdminPriorityAdjust] = useState<Priority>('MEDIUM');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!complaint) return;

    if (complaint.status === 'OPEN') {
      setAdminStatusAction('IN_PROGRESS');
    } else if (complaint.status === 'IN_PROGRESS') {
      setAdminStatusAction('RESOLVED');
    } else if (complaint.status === 'RESOLVED') {
      setAdminStatusAction('CLOSED');
    } else if (complaint.status === 'REJECTED') {
      setAdminStatusAction('CLOSED');
    }
  }, [complaint?.id, complaint?.status]);

  if (!complaint) return null;

  const isAdmin = currentUser.role === 'ADMIN';
  const isOwner = complaint.userId === currentUser.id;

  // Lifecycle steps for the stepper
  const steps: { key: Status; label: string; description: string }[] = [
    { key: 'OPEN', label: '1. Lodged', description: 'Complaint registered' },
    { key: 'IN_PROGRESS', label: '2. In Progress', description: 'Assigned & Triaged' },
    { key: 'RESOLVED', label: '3. Resolved', description: 'Remedy provided' },
    { key: 'CLOSED', label: '4. Closed', description: 'Feedback verified' },
  ];

  const getStepIndex = (st: Status) => {
    switch (st) {
      case 'OPEN': return 0;
      case 'IN_PROGRESS': return 1;
      case 'RESOLVED': return 2;
      case 'CLOSED': return 3;
      case 'REJECTED': return -1;
    }
  };

  const currentStepIdx = getStepIndex(complaint.status);

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSendingComment(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: commentText.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.complaint) {
        onComplaintUpdated(data.complaint);
        setCommentText('');
        setSuccessMessage('Comment added to audit timeline.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to add comment.');
      }
    } catch (err) {
      setErrorMessage('Network error adding comment.');
    } finally {
      setIsSendingComment(false);
    }
  };

  // Handle Assign to Me (Admin)
  const handleAssignToMe = async () => {
    setIsUpdatingStatus(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.complaint) {
        onComplaintUpdated(data.complaint);
        setSuccessMessage(`Ticket assigned to ${currentUser.name}. Status updated to In Progress.`);
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        setErrorMessage(data.error || 'Failed to assign ticket.');
      }
    } catch (err) {
      setErrorMessage('Network error assigning ticket.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Admin Status Transition
  const handleAdminStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setErrorMessage('');

    if (adminStatusAction === 'RESOLVED' && adminResolutionText.trim().length < 5) {
      setErrorMessage('Validation Error: A resolution explanation (>= 5 chars) is mandatory when marking as RESOLVED.');
      setIsUpdatingStatus(false);
      return;
    }

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newStatus: adminStatusAction,
          resolution: adminResolutionText.trim() || undefined,
          comment: adminCommentText.trim() || undefined,
          priority: adminPriorityAdjust,
        }),
      });

      const data = await res.json();
      if (res.ok && data.complaint) {
        onComplaintUpdated(data.complaint);
        setSuccessMessage(`Ticket moved to ${adminStatusAction} successfully.`);
        setTimeout(() => setSuccessMessage(''), 3500);
        setAdminResolutionText('');
        setAdminCommentText('');
      } else {
        setErrorMessage(data.error || 'Failed to update status.');
      }
    } catch (err) {
      setErrorMessage('Network error updating status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle User Feedback & Closure (RESOLVED -> CLOSED)
  const handleUserFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment.trim(),
          closeTicket: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.complaint) {
        onComplaintUpdated(data.complaint);
        setSuccessMessage('Thank you! Complaint verified and closed successfully.');
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        setErrorMessage(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setErrorMessage('Network error submitting feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                {complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <CategoryBadge category={complaint.category} />
              <SlaBadge dueAt={complaint.slaDueAt} status={complaint.status} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {complaint.title}
            </h2>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Submitted by: <strong className="text-slate-700 dark:text-slate-200">{complaint.userName}</strong> ({complaint.userEmail})</span>
              <span>•</span>
              <span>Lodged on: {new Date(complaint.createdAt).toLocaleString()}</span>
              {complaint.assignedAdminName && (
                <>
                  <span>•</span>
                  <span>Assigned to: <strong className="text-indigo-600 dark:text-indigo-400">{complaint.assignedAdminName}</strong></span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Step Progress State Machine Lifecycle Stepper */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Complaint Lifecycle State Machine
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Current: <strong className="text-indigo-600 dark:text-indigo-400">{complaint.status}</strong>
              </span>
            </div>

            {complaint.status === 'REJECTED' ? (
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-lg font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                This complaint was reviewed and REJECTED by administrative staff.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {steps.map((step, idx) => {
                  const isCompleted = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;
                  const isPending = currentStepIdx < idx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-lg border text-xs transition-all relative ${
                        isCurrent
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        )}
                        <span className={isCurrent ? 'text-indigo-700 dark:text-indigo-300' : isCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}>
                          {step.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grievance Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Complaint Statement
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Official Resolution Summary (if resolved or closed) */}
          {complaint.resolution && (
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Administrative Resolution Summary
              </h3>
              <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed font-medium">
                {complaint.resolution}
              </p>
            </div>
          )}

          {/* User Feedback (if provided) */}
          {complaint.feedback && (
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  User Satisfaction Rating
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Submitted on {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= complaint.feedback!.rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
                <span className="ml-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                  {complaint.feedback.rating} / 5 Stars
                </span>
              </div>
              {complaint.feedback.comment && (
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                  "{complaint.feedback.comment}"
                </p>
              )}
            </div>
          )}

          {/* USER ACTION: Close Resolved Ticket with Feedback */}
          {isOwner && complaint.status === 'RESOLVED' && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/60 dark:to-slate-900 border-2 border-indigo-300 dark:border-indigo-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Accept Resolution & Finalize Closure
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                The support team has resolved your ticket. Please rate your experience to close this ticket per the system state machine.
              </p>

              <form onSubmit={handleUserFeedbackSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= feedbackRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                      {feedbackRating} Star{feedbackRating > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Review / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="e.g. Issue was promptly resolved, thank you!"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmittingFeedback ? 'Finalizing Closure...' : 'Submit Feedback & Close Complaint'}
                </button>
              </form>
            </div>
          )}

          {/* ADMIN TRIAGE CONTROLS */}
          {isAdmin && complaint.status !== 'CLOSED' && (
            <div className="p-5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200">
                    Admin Triage Desk & State Transition
                  </h3>
                </div>

                {complaint.assignedAdminId !== currentUser.id && (
                  <button
                    onClick={handleAssignToMe}
                    disabled={isUpdatingStatus}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assign Ticket to Me
                  </button>
                )}
              </div>

              <form onSubmit={handleAdminStatusSubmit} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target State Transition
                    </label>
                    <select
                      value={adminStatusAction}
                      onChange={(e) => setAdminStatusAction(e.target.value as Status)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      {complaint.status === 'OPEN' && (
                        <>
                          <option value="IN_PROGRESS">Transition to: IN PROGRESS</option>
                          <option value="RESOLVED">Transition to: RESOLVED</option>
                          <option value="REJECTED">Transition to: REJECTED</option>
                        </>
                      )}
                      {complaint.status === 'IN_PROGRESS' && (
                        <>
                          <option value="RESOLVED">Transition to: RESOLVED (Add Remedy)</option>
                          <option value="REJECTED">Transition to: REJECTED</option>
                        </>
                      )}
                      {complaint.status === 'RESOLVED' && (
                        <>
                          <option value="CLOSED">Transition to: CLOSED (Admin Finalize)</option>
                          <option value="IN_PROGRESS">Re-open to: IN PROGRESS</option>
                        </>
                      )}
                      {complaint.status === 'REJECTED' && (
                        <option value="CLOSED">Archive to: CLOSED</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Adjust Priority Level & SLA
                    </label>
                    <select
                      value={adminPriorityAdjust}
                      onChange={(e) => setAdminPriorityAdjust(e.target.value as Priority)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="LOW">Low Priority (48h SLA)</option>
                      <option value="MEDIUM">Medium Priority (24h SLA)</option>
                      <option value="HIGH">High Priority (12h SLA)</option>
                      <option value="CRITICAL">Critical Priority (4h SLA)</option>
                    </select>
                  </div>
                </div>

                {adminStatusAction === 'RESOLVED' && (
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                      Resolution Notes <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={adminResolutionText}
                      onChange={(e) => setAdminResolutionText(e.target.value)}
                      rows={2}
                      placeholder="Detail the technical fix, refund transaction ID, or corrective action taken..."
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Audit Log Transition Comment (Optional)
                  </label>
                  <input
                    type="text"
                    value={adminCommentText}
                    onChange={(e) => setAdminCommentText(e.target.value)}
                    placeholder="e.g. Verified with infrastructure engineering team"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    {isUpdatingStatus ? 'Updating State...' : 'Apply Status Transition'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Audit History & Comments Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Timeline / Status Audit History */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
                <History className="w-4 h-4 text-indigo-500" />
                Audit Trail & State History
              </h3>

              <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                {complaint.history.map((h, idx) => (
                  <div key={h.id || idx} className="relative group">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {h.fromStatus === 'NONE' ? 'Created' : `${h.fromStatus} → ${h.toStatus}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        By <strong className="text-slate-700 dark:text-slate-300">{h.changedByName}</strong> ({h.changedByRole})
                      </div>
                      {h.comment && (
                        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                          {h.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussion & Comments */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                Comments & Follow-up ({complaint.comments.length})
              </h3>

              <div className="space-y-2.5 max-h-56 overflow-y-auto mb-3 pr-1">
                {complaint.comments.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 italic">
                    No follow-up messages yet. Add a message below.
                  </div>
                ) : (
                  complaint.comments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl text-xs border ${
                        c.authorRole === 'ADMIN'
                          ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60'
                          : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.authorName}{' '}
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 text-slate-500">
                            {c.authorRole}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-normal">
                        {c.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type an update or note..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSendingComment || !commentText.trim()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <span>Last updated: {new Date(complaint.updatedAt).toLocaleString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
