import React from 'react';
import { Status, Priority, Category } from '../types.ts';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Archive, 
  Flame, 
  AlertTriangle, 
  Info, 
  Laptop, 
  CreditCard, 
  Headphones, 
  Box, 
  Server, 
  HelpCircle 
} from 'lucide-react';

export function StatusBadge({ status, className = '' }: { status: Status; className?: string }) {
  switch (status) {
    case 'OPEN':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          Open
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
          In Progress
        </span>
      );
    case 'RESOLVED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Resolved
        </span>
      );
    case 'CLOSED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${className}`}>
          <Archive className="w-3.5 h-3.5 text-slate-500" />
          Closed
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Rejected
        </span>
      );
    default:
      return <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{status}</span>;
  }
}

export function PriorityBadge({ priority, className = '' }: { priority: Priority; className?: string }) {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 ${className}`}>
          <Flame className="w-3.5 h-3.5 text-red-600" />
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800 ${className}`}>
          <Info className="w-3.5 h-3.5 text-sky-500" />
          Medium
        </span>
      );
    case 'LOW':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 ${className}`}>
          Low
        </span>
      );
  }
}

export function CategoryBadge({ category, className = '' }: { category: Category; className?: string }) {
  const getIcon = () => {
    switch (category) {
      case 'TECHNICAL': return <Laptop className="w-3.5 h-3.5" />;
      case 'BILLING': return <CreditCard className="w-3.5 h-3.5" />;
      case 'SERVICE': return <Headphones className="w-3.5 h-3.5" />;
      case 'PRODUCT': return <Box className="w-3.5 h-3.5" />;
      case 'INFRASTRUCTURE': return <Server className="w-3.5 h-3.5" />;
      default: return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 ${className}`}>
      {getIcon()}
      {category.charAt(0) + category.slice(1).toLowerCase()}
    </span>
  );
}

export function SlaBadge({ dueAt, status }: { dueAt: string; status: Status }) {
  if (status === 'RESOLVED' || status === 'CLOSED' || status === 'REJECTED') {
    return null;
  }

  const now = Date.now();
  const due = new Date(dueAt).getTime();
  const diffMs = due - now;
  const isBreached = diffMs < 0;

  const diffHours = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
  const diffMinutes = Math.abs(Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white animate-pulse">
        <AlertTriangle className="w-3 h-3" />
        SLA Breached ({diffHours}h ago)
      </span>
    );
  }

  const isUrgent = diffHours < 4;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
      isUrgent 
        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold' 
        : 'bg-slate-100 text-slate-600 border border-slate-200'
    }`}>
      <Clock className="w-3 h-3 text-slate-500" />
      SLA: {diffHours > 0 ? `${diffHours}h ` : ''}{diffMinutes}m left
    </span>
  );
}
