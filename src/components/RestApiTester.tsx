import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Key,
  Layers
} from 'lucide-react';

interface EndpointPreset {
  name: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  access: 'Public' | 'User' | 'Admin' | 'Authenticated' | 'Admin/User';
  purpose: string;
  defaultBody?: string;
}

const ENDPOINTS: EndpointPreset[] = [
  {
    name: '1. Register User',
    method: 'POST',
    path: '/api/users/register',
    access: 'Public',
    purpose: 'Register a new grievance user account',
    defaultBody: JSON.stringify({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      password: 'password123',
      role: 'USER'
    }, null, 2),
  },
  {
    name: '2. Login / Obtain Token',
    method: 'POST',
    path: '/api/auth/login',
    access: 'Public',
    purpose: 'Authenticate credentials and obtain session token',
    defaultBody: JSON.stringify({
      email: 'admin@helpdesk.internal',
      password: 'admin123'
    }, null, 2),
  },
  {
    name: '3. List Own Complaints',
    method: 'GET',
    path: '/api/complaints/mine',
    access: 'User',
    purpose: 'Retrieve all complaints submitted by authenticated user',
  },
  {
    name: '4. Create Complaint',
    method: 'POST',
    path: '/api/complaints',
    access: 'User',
    purpose: 'Submit a new complaint with atomic ID generation',
    defaultBody: JSON.stringify({
      title: 'VPN connection repeatedly disconnecting on US-East server',
      description: 'Unable to maintain stable SSH session. Packet trace indicates recurring handshake drop.',
      category: 'TECHNICAL',
      priority: 'HIGH'
    }, null, 2),
  },
  {
    name: '5. View Complaint Details',
    method: 'GET',
    path: '/api/complaints/CMP-2026-1001',
    access: 'Authenticated',
    purpose: 'View full details, status history, and comment thread of ticket',
  },
  {
    name: '6. Add Follow-Up Comment',
    method: 'POST',
    path: '/api/complaints/CMP-2026-1001/comments',
    access: 'Authenticated',
    purpose: 'Add a follow-up remark or status note to a complaint',
    defaultBody: JSON.stringify({
      message: 'Attached network traceroute logs for engineering review.'
    }, null, 2),
  },
  {
    name: '7. Admin Assign Complaint',
    method: 'PATCH',
    path: '/api/complaints/CMP-2026-1002/assign',
    access: 'Admin',
    purpose: 'Assign ticket to lead admin and transition OPEN -> IN_PROGRESS',
  },
  {
    name: '8. Enforce Status Transition',
    method: 'PATCH',
    path: '/api/complaints/CMP-2026-1001/status',
    access: 'Admin/User',
    purpose: 'Transition state machine with validation (requires resolution if RESOLVED)',
    defaultBody: JSON.stringify({
      newStatus: 'RESOLVED',
      resolution: 'Refund transaction #REF-4491 processed via payment gateway.',
      comment: 'Customer informed via email notification'
    }, null, 2),
  },
  {
    name: '9. Admin Search & Filter',
    method: 'GET',
    path: '/api/complaints/search?category=TECHNICAL&priority=HIGH',
    access: 'Admin',
    purpose: 'Filter grievances by status, category, priority, and keyword',
  },
  {
    name: '10. Submit User Feedback & Close',
    method: 'POST',
    path: '/api/complaints/CMP-2026-1003/feedback',
    access: 'User',
    purpose: 'User rates resolution quality (1-5 stars) and closes resolved ticket',
    defaultBody: JSON.stringify({
      rating: 5,
      comment: 'Resolved quickly and professionally. Great job!',
      closeTicket: true
    }, null, 2),
  },
  {
    name: '11. Dashboard Analytics & SLA Stats',
    method: 'GET',
    path: '/api/stats',
    access: 'Authenticated',
    purpose: 'Aggregate metrics for SLA breaches, resolution time, and CSAT',
  },
  {
    name: '12. AI Auto-Categorize (Gemini)',
    method: 'POST',
    path: '/api/ai/categorize',
    access: 'Authenticated',
    purpose: 'Server-side Gemini AI classification of category, priority, and summary',
    defaultBody: JSON.stringify({
      title: 'Server outage',
      description: 'The main PostgreSQL database server crashed with out-of-memory error and customers cannot complete checkouts.'
    }, null, 2),
  },
];

export function RestApiTester({ userToken, adminToken }: { userToken: string; adminToken: string }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointPreset>(ENDPOINTS[0]);
  const [method, setMethod] = useState(selectedEndpoint.method);
  const [pathInput, setPathInput] = useState(selectedEndpoint.path);
  const [bodyInput, setBodyInput] = useState(selectedEndpoint.defaultBody || '');
  const [authRole, setAuthRole] = useState<'ADMIN' | 'USER' | 'NONE'>('ADMIN');
  
  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSelectPreset = (preset: EndpointPreset) => {
    setSelectedEndpoint(preset);
    setMethod(preset.method);
    setPathInput(preset.path);
    setBodyInput(preset.defaultBody || '');
    if (preset.access === 'Admin') setAuthRole('ADMIN');
    else if (preset.access === 'Public') setAuthRole('NONE');
    else setAuthRole('USER');
    setResponseStatus(null);
    setResponseBody(null);
  };

  const getActiveToken = () => {
    if (authRole === 'ADMIN') return adminToken || 'admin-token-demo';
    if (authRole === 'USER') return userToken || 'user-token-demo';
    return null;
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const startTime = performance.now();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = getActiveToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const options: RequestInit = {
        method,
        headers,
      };

      if (method !== 'GET' && bodyInput.trim()) {
        options.body = bodyInput;
      }

      const res = await fetch(pathInput, options);
      const endTime = performance.now();
      setResponseTimeMs(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        setResponseBody(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setResponseBody(text);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseTimeMs(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: 'Request Failed', message: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const generateCurlSnippet = () => {
    const token = getActiveToken();
    let curl = `curl -X ${method} "http://localhost:3000${pathInput}" \\\n  -H "Content-Type: application/json"`;
    if (token) {
      curl += ` \\\n  -H "Authorization: Bearer ${token}"`;
    }
    if (method !== 'GET' && bodyInput.trim()) {
      curl += ` \\\n  -d '${bodyInput.replace(/'/g, "'\\''")}'`;
    }
    return curl;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurlSnippet());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Spring Boot REST API Playground
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive HTTP request runner for the Track B REST Specification (Sections 5 & 9).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Endpoint Presets */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Standard REST Endpoints (Section 9)
          </div>

          <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
            {ENDPOINTS.map((ep, idx) => {
              const isSelected = selectedEndpoint.name === ep.name;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(ep)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      ep.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      ep.method === 'PATCH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {ep.method}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                      {ep.access}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {ep.name}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 truncate mt-0.5">
                    {ep.path}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Live Request Runner & Response Inspector */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Request Config Card */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
            
            {/* Method + URL Input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={pathInput}
                  onChange={(e) => setPathInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-600/20 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isLoading ? 'Executing...' : 'Send Request'}
              </button>
            </div>

            {/* Auth Token Header Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Auth Token Injection:</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAuthRole('ADMIN')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    authRole === 'ADMIN'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Admin Token
                </button>
                <button
                  onClick={() => setAuthRole('USER')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    authRole === 'USER'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  User Token
                </button>
                <button
                  onClick={() => setAuthRole('NONE')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    authRole === 'NONE'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Public (No Auth)
                </button>
              </div>
            </div>

            {/* Request Body Editor (for POST/PATCH) */}
            {method !== 'GET' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Request Payload (JSON Body)
                </label>
                <textarea
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  rows={6}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-emerald-400 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Copy cURL Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCopyCurl}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCurl ? 'Copied cURL Command!' : 'Copy as cURL command'}
              </button>
            </div>

          </div>

          {/* Live Response Card */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Inspector</span>
                {responseStatus && (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    responseStatus >= 200 && responseStatus < 300 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    responseStatus >= 400 && responseStatus < 500 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              {responseTimeMs !== null && (
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {responseTimeMs} ms
                </span>
              )}
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs overflow-x-auto max-h-80 text-slate-200">
              {isLoading ? (
                <div className="text-slate-500 italic py-6 text-center">
                  Executing HTTP request to Spring Boot REST endpoint...
                </div>
              ) : responseBody ? (
                <pre className="whitespace-pre-wrap">{responseBody}</pre>
              ) : (
                <div className="text-slate-500 italic py-6 text-center">
                  Select an endpoint preset above and click "Send Request" to test.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
