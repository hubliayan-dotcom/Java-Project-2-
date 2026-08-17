import React from 'react';
import { User, Role } from '../types.ts';
import { 
  ShieldAlert, 
  UserCheck, 
  Terminal, 
  Code2, 
  CheckSquare, 
  Download, 
  RefreshCw, 
  Plus, 
  Layers,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (role: Role) => void;
  activeTab: 'portal' | 'api-tester' | 'java-code' | 'testing-interview';
  setActiveTab: (tab: 'portal' | 'api-tester' | 'java-code' | 'testing-interview') => void;
  onOpenCreateModal: () => void;
  onResetData: () => void;
  onExportData: (format: 'json' | 'csv') => void;
  isResetting: boolean;
}

export function Navbar({
  currentUser,
  onSwitchUser,
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onResetData,
  onExportData,
  isResetting,
}: NavbarProps) {
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                  ComplaintDesk
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                  Java Spring / Track B
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden md:block">
                Online Complaint Management System • State Machine & REST API
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab('portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'portal'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {isAdmin ? 'Admin Helpdesk Triage' : 'User Complaint Portal'}
            </button>

            <button
              onClick={() => setActiveTab('api-tester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'api-tester'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Interactive REST API Playground
            </button>

            <button
              onClick={() => setActiveTab('java-code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'java-code'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Java OOP & Architecture
            </button>

            <button
              onClick={() => setActiveTab('testing-interview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'testing-interview'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              12-Test Suite & Interview Q&A
            </button>
          </nav>

          {/* Right Action Tools & Persona Switcher */}
          <div className="flex items-center gap-2.5">
            
            {/* New Complaint Button */}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm shadow-indigo-600/30"
              title="File a new ticket"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Complaint</span>
            </button>

            {/* Persona Switcher Badge */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
              <div className="flex items-center gap-2 px-2 py-0.5">
                <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`} />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {currentUser.role}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSwitchUser(isAdmin ? 'USER' : 'ADMIN')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 border border-slate-200 dark:border-slate-600 transition-all shadow-2xs"
                title={`Switch active persona to ${isAdmin ? 'User' : 'Admin'}`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden md:inline">Switch to {isAdmin ? 'User' : 'Admin'}</span>
              </button>
            </div>

            {/* Export & Reset Menu */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onExportData('json')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                title="Export Database as JSON"
              >
                JSON
              </button>

              <button
                onClick={() => onExportData('csv')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                title="Export Database as CSV"
              >
                CSV
              </button>

              <button
                onClick={onResetData}
                disabled={isResetting}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 transition-colors disabled:opacity-50"
                title="Reset sample seed database"
              >
                <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Tab Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-200 dark:border-slate-800 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('portal')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'portal'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isAdmin ? 'Admin Helpdesk' : 'My Complaints'}
          </button>
          <button
            onClick={() => setActiveTab('api-tester')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'api-tester'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            REST API Swagger
          </button>
          <button
            onClick={() => setActiveTab('java-code')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'java-code'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Java Codebase
          </button>
          <button
            onClick={() => setActiveTab('testing-interview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'testing-interview'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            10-Point Tests & Q&A
          </button>
        </div>

      </div>
    </header>
  );
}
