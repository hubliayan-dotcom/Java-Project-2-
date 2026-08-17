import React, { useState } from 'react';
import { Category, Priority, Complaint } from '../types.ts';
import { 
  X, 
  Sparkles, 
  Send, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  Laptop,
  CreditCard,
  Headphones,
  Box,
  Server
} from 'lucide-react';

interface CreateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaint: Complaint) => void;
  token: string;
}

export function CreateComplaintModal({
  isOpen,
  onClose,
  onSuccess,
  token,
}: CreateComplaintModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('TECHNICAL');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    reasoning: string;
    confidenceScore: number;
    suggestedTitle?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAiAutoCategorize = async () => {
    if (!description.trim() && !title.trim()) {
      setErrorMessage('Please type at least a rough description or title for AI to analyze.');
      return;
    }

    setIsAiAnalyzing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      if (res.ok && data.analysis) {
        if (data.analysis.category) setCategory(data.analysis.category);
        if (data.analysis.priority) setPriority(data.analysis.priority);
        if (data.analysis.suggestedTitle && !title.trim()) {
          setTitle(data.analysis.suggestedTitle);
        }
        setAiAnalysisResult({
          reasoning: data.analysis.reasoning || 'Categorized based on contextual semantics.',
          confidenceScore: data.analysis.confidenceScore || 0.92,
          suggestedTitle: data.analysis.suggestedTitle,
        });
      } else {
        setErrorMessage(data.error || 'Failed to auto-categorize.');
      }
    } catch (err: any) {
      setErrorMessage('Network error during AI analysis.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (title.trim().length < 5) {
      setErrorMessage('Validation Error: Complaint title must be at least 5 characters.');
      return;
    }

    if (description.trim().length < 10) {
      setErrorMessage('Validation Error: Complaint description must be at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
        }),
      });

      const data = await res.json();
      if (res.ok && data.complaint) {
        onSuccess(data.complaint);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('TECHNICAL');
        setPriority('MEDIUM');
        setAiAnalysisResult(null);
      } else {
        setErrorMessage(data.error || 'Failed to submit complaint.');
      }
    } catch (err) {
      setErrorMessage('Network failure when submitting complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSlaHours = () => {
    switch (priority) {
      case 'CRITICAL': return '4 Hours (Urgent On-Call Escrow)';
      case 'HIGH': return '12 Hours (Same-Day Queue)';
      case 'MEDIUM': return '24 Hours (Standard Queue)';
      case 'LOW': return '48 Hours (General Inquiries)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Lodge New Complaint
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit a formal grievance ticket with automatic SLA tracking and ticket ID generation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Complaint Subject / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Double billing transaction on August subscription"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Grievance Description <span className="text-rose-500">*</span>
              </label>
              
              {/* AI Auto-Categorize Button */}
              <button
                type="button"
                onClick={handleAiAutoCategorize}
                disabled={isAiAnalyzing}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
                {isAiAnalyzing ? 'AI Analyzing...' : 'AI Auto-Detect Category & Priority'}
              </button>
            </div>
            
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Provide specific details: invoice numbers, timestamps, error messages, device model, or affected services..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* AI Feedback Banner */}
          {aiAnalysisResult && (
            <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Gemini AI Assistant: </span>
                <span>{aiAnalysisResult.reasoning}</span>
                <span className="ml-2 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-white/70 dark:bg-slate-900/70 px-1.5 py-0.5 rounded">
                  Confidence: {Math.round(aiAnalysisResult.confidenceScore * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Category & Priority Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TECHNICAL">💻 Technical (Errors, API, latency)</option>
                <option value="BILLING">💳 Billing (Charges, refunds, invoices)</option>
                <option value="SERVICE">🎧 Service (Support quality, delays)</option>
                <option value="PRODUCT">📦 Product (Physical defect, feature)</option>
                <option value="INFRASTRUCTURE">🌐 Infrastructure (Wi-Fi, power, server)</option>
                <option value="OTHER">❓ Other (General queries)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="LOW">🟢 Low (General feedback, 48h SLA)</option>
                <option value="MEDIUM">🔵 Medium (Minor impact, 24h SLA)</option>
                <option value="HIGH">🟠 High (Significant impact, 12h SLA)</option>
                <option value="CRITICAL">🔴 Critical (Total block, 4h SLA)</option>
              </select>
            </div>
          </div>

          {/* SLA target note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Target SLA Turnaround:</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{getSlaHours()}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting Grievance...' : 'Submit Complaint'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
