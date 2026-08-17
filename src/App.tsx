import React, { useState, useEffect } from 'react';
import { User, Complaint, ComplaintStats, Role } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { UserPortal } from './components/UserPortal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { ComplaintDetailModal } from './components/ComplaintDetailModal.tsx';
import { CreateComplaintModal } from './components/CreateComplaintModal.tsx';
import { RestApiTester } from './components/RestApiTester.tsx';
import { JavaCodeExplorer } from './components/JavaCodeExplorer.tsx';
import { TestRunnerAndInterview } from './components/TestRunnerAndInterview.tsx';
import { AlertCircle } from 'lucide-react';

const DEMO_USERS: Record<Role, User> = {
  USER: {
    id: 'usr_user_1',
    name: 'Ayan Hubli',
    email: 'hubliayan@gmail.com',
    role: 'USER',
    createdAt: new Date().toISOString(),
  },
  ADMIN: {
    id: 'usr_admin_1',
    name: 'Alex Vance (Lead Admin)',
    email: 'admin@helpdesk.internal',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  },
};

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>('USER');
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS.USER);
  const [activeTab, setActiveTab] = useState<'portal' | 'api-tester' | 'java-code' | 'testing-interview'>('portal');

  // Data state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const userToken = 'user-token-demo';
  const adminToken = 'admin-token-demo';
  const currentToken = currentRole === 'ADMIN' ? adminToken : userToken;

  const handleSwitchUser = (newRole: Role) => {
    setCurrentRole(newRole);
    setCurrentUser(DEMO_USERS[newRole]);
  };

  const fetchComplaints = async () => {
    setIsLoading(true);
    setErrorBanner('');
    try {
      const endpoint = currentRole === 'ADMIN' ? '/api/complaints/search' : '/api/complaints/mine';
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.complaints) {
        setComplaints(data.complaints);
      } else {
        setErrorBanner(data.error || 'Failed to fetch complaint records.');
      }
    } catch (err: any) {
      setErrorBanner('Network error loading tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      // stats fail-soft
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, [currentRole]);

  const handleComplaintCreated = (newComplaint: Complaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
    fetchStats();
    setSelectedComplaint(newComplaint);
  };

  const handleComplaintUpdated = (updated: Complaint) => {
    setComplaints(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    setSelectedComplaint(updated);
    fetchStats();
  };

  const handleResetData = async () => {
    if (!confirm('Reset sample seed database to original baseline demo data?')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (res.ok) {
        await fetchComplaints();
        await fetchStats();
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/export?format=${format}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        setErrorBanner(error?.error || 'Failed to export database.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download =
        format === 'csv'
          ? `complaints-${Date.now()}.csv`
          : `complaints-database-${Date.now()}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorBanner('Network error while exporting database.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onResetData={handleResetData}
        onExportData={handleExportData}
        isResetting={isResetting}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {errorBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Tab 1: Portal (User View vs Admin View) */}
        {activeTab === 'portal' && (
          <div>
            {currentRole === 'ADMIN' ? (
              <AdminPortal
                complaints={complaints}
                stats={stats}
                currentUser={currentUser}
                onOpenComplaint={setSelectedComplaint}
                onRefresh={() => {
                  fetchComplaints();
                  fetchStats();
                }}
              />
            ) : (
              <UserPortal
                complaints={complaints}
                onOpenComplaint={setSelectedComplaint}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* Tab 2: REST API Swagger Console */}
        {activeTab === 'api-tester' && (
          <RestApiTester userToken={userToken} adminToken={adminToken} />
        )}

        {/* Tab 3: Java OOP Architecture & Codebase */}
        {activeTab === 'java-code' && (
          <JavaCodeExplorer />
        )}

        {/* Tab 4: 10-Point Automated Test Suite & Interview Prep */}
        {activeTab === 'testing-interview' && (
          <TestRunnerAndInterview userToken={userToken} adminToken={adminToken} />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Online Complaint Management System • Java OOP, Spring Boot REST, Finite State Machine
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Enforced State Lifecycle: OPEN → IN_PROGRESS → RESOLVED → CLOSED</span>
          </div>
        </div>
      </footer>

      {/* Modal: Complaint Details & State Transition Stepper */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        currentUser={currentUser}
        token={currentToken}
        onClose={() => setSelectedComplaint(null)}
        onComplaintUpdated={handleComplaintUpdated}
      />

      {/* Modal: Create Complaint (with Gemini AI Auto-Classification) */}
      <CreateComplaintModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleComplaintCreated}
        token={currentToken}
      />

    </div>
  );
}
