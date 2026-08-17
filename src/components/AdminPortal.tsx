import React, { useState } from 'react';
import { Complaint, ComplaintStats, Status, Priority, Category, User } from '../types.ts';
import { StatusBadge, PriorityBadge, CategoryBadge, SlaBadge } from './Badges.tsx';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Star, 
  Users, 
  ArrowUpDown,
  UserCheck,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface AdminPortalProps {
  complaints: Complaint[];
  stats: ComplaintStats | null;
  currentUser: User;
  onOpenComplaint: (c: Complaint) => void;
  onRefresh: () => void;
}

export function AdminPortal({
  complaints,
  stats,
  currentUser,
  onOpenComplaint,
  onRefresh,
}: AdminPortalProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'CRITICAL' | 'BREACHED' | 'UNASSIGNED'>('ALL');

  const now = Date.now();

  // Apply filters
  const filtered = complaints.filter((c) => {
    // Quick filter shortcuts
    if (quickFilter === 'CRITICAL' && c.priority !== 'CRITICAL') return false;
    if (quickFilter === 'BREACHED') {
      const isBreached = (c.status === 'OPEN' || c.status === 'IN_PROGRESS') && new Date(c.slaDueAt).getTime() < now;
      if (!isBreached) return false;
    }
    if (quickFilter === 'UNASSIGNED' && c.assignedAdminId) return false;

    // Dropdown filters
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;

    // Search keyword
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.userName.toLowerCase().includes(q) ||
        c.userEmail.toLowerCase().includes(q) ||
        (c.assignedAdminName && c.assignedAdminName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Admin KPI Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Grievances */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Queue</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalComplaints ?? complaints.length}
          </div>
          <span className="text-[10px] text-slate-400">All registered tickets</span>
        </div>

        {/* Open Backlog */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Open Backlog</span>
          <div className="mt-1 text-2xl font-black text-amber-900 dark:text-amber-200">
            {stats?.openCount ?? complaints.filter(c => c.status === 'OPEN').length}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400">Awaiting triage</span>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">In Progress</span>
          <div className="mt-1 text-2xl font-black text-blue-900 dark:text-blue-200">
            {stats?.inProgressCount ?? complaints.filter(c => c.status === 'IN_PROGRESS').length}
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400">Active investigation</span>
        </div>

        {/* Critical Issues */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Critical Pending</span>
          <div className="mt-1 text-2xl font-black text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-rose-600 animate-pulse" />
            {stats?.criticalPending ?? 0}
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400">4-Hour SLA Target</span>
        </div>

        {/* SLA Breaches */}
        <div className="p-4 rounded-2xl bg-red-100/70 dark:bg-red-950/60 border border-red-300 dark:border-red-800 shadow-2xs">
          <span className="text-[11px] font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">SLA Breaches</span>
          <div className="mt-1 text-2xl font-black text-red-900 dark:text-red-100 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {stats?.slaBreachCount ?? 0}
          </div>
          <span className="text-[10px] text-red-700 dark:text-red-400">Exceeded deadline</span>
        </div>

        {/* Customer Satisfaction */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">CSAT Score</span>
          <div className="mt-1 text-2xl font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            {stats?.satisfactionRating ?? 5.0}
            <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">/ 5</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">User feedback rating</span>
        </div>

      </div>

      {/* Quick Filter Pill Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Quick Views:
          </span>
          <button
            onClick={() => setQuickFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              quickFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Queues ({complaints.length})
          </button>
          <button
            onClick={() => setQuickFilter('CRITICAL')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              quickFilter === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Critical Only
          </button>
          <button
            onClick={() => setQuickFilter('BREACHED')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              quickFilter === 'BREACHED'
                ? 'bg-red-700 text-white shadow-2xs'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            SLA Breaching
          </button>
          <button
            onClick={() => setQuickFilter('UNASSIGNED')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              quickFilter === 'UNASSIGNED'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Unassigned
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Table
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Keyword Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search ID, title, user..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="TECHNICAL">Technical</option>
            <option value="BILLING">Billing</option>
            <option value="SERVICE">Service</option>
            <option value="PRODUCT">Product</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

      </div>

      {/* Admin Triage Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Title & Subject</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4">SLA Deadline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 italic">
                    No complaints matching current triage filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => onOpenComplaint(c)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {c.id}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {c.title}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CategoryBadge category={c.category} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{c.userName}</div>
                      <div className="text-[10px] text-slate-400">{c.userEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {c.assignedAdminName ? (
                        <span className="font-medium text-purple-700 dark:text-purple-300">
                          {c.assignedAdminName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SlaBadge dueAt={c.slaDueAt} status={c.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenComplaint(c)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Triage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{filtered.length}</strong> of <strong>{complaints.length}</strong> complaints</span>
          <span className="font-mono text-[11px]">Enforcing State Machine: OPEN → IN_PROGRESS → RESOLVED → CLOSED</span>
        </div>
      </div>

    </div>
  );
}
