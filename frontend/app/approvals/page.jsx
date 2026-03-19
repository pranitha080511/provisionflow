"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Approvals(){

    const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({}); // { executionId: 'approved' | 'rejected' }

  useEffect(() => {
    async function fetchApprovals() {
      try {
        const res = await api.get("/executions");
        const waiting = res.data.filter(ex => ex.status === "waiting");
        setRequests(waiting);
      } catch (err) {
        console.error("Failed to fetch approvals", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApprovals();
  }, []);

  async function updateStatus(id, decision) {
    try {
      setResults(prev => ({ ...prev, [id]: 'processing' }));
      await api.post(`/executions/${id}/respond`, { decision });
      setResults(prev => ({ ...prev, [id]: decision }));
      
      // Auto-remove from list after 2 seconds
      setTimeout(() => {
        setRequests(prev => prev.filter(r => r.id !== id));
      }, 2000);
    } catch (err) {
      console.error("Failed to update status", err);
      setResults(prev => ({ ...prev, [id]: null }));
      alert("Failed to update status");
    }
  }

  return(

    <div className="p-10 text-white bg-black min-h-screen">

      <h1 className="text-2xl mb-6">
        Approval Requests
      </h1>

            {loading ? (
        <p className="text-gray-400">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-400">No pending approval requests found.</p>
      ) : requests.map(req => {
        const lastLog = Array.isArray(req.logs) ? req.logs[req.logs.length - 1] : null;
        return (
          <div
            key={req.id}
            className="bg-gray-900 border border-gray-800 p-6 mb-4 rounded-xl shadow-lg hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-xl text-purple-400">{req.workflow_name || 'Workflow Execution'}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {req.id}</p>
                <p className="text-xs text-gray-500">Date: {new Date(req.started_at).toLocaleString()}</p>
              </div>
              <span className="bg-yellow-600/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                Pending Approval
              </span>
            </div>

            <div className="bg-black/50 p-4 rounded-lg mb-6 border border-gray-800">
              <p className="text-sm text-gray-400 mb-2">Execution Data:</p>
              <pre className="text-xs text-gray-300 overflow-x-auto">{JSON.stringify(req.data || {}, null, 2)}</pre>
            </div>

            {lastLog?.email_sent_to && (
              <div className="mb-6 bg-purple-900/10 border border-purple-800/30 p-3 rounded-lg flex items-center gap-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                   </svg>
                </div>
                <div>
                   <p className="text-xs text-gray-400">Request sent to:</p>
                   <p className="text-sm font-medium text-gray-200 underline">{lastLog.email_sent_to}</p>
                </div>
              </div>
            )}

            <div className="relative">
              {results[req.id] ? (
                <div className={`p-4 rounded-lg text-center animate-pulse flex items-center justify-center gap-3 font-bold text-lg
                  ${results[req.id] === 'approved' ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 
                    results[req.id] === 'rejected' ? 'bg-red-600/20 text-red-400 border border-red-500/50' : 
                    'bg-purple-600/20 text-purple-400 border border-purple-500/50'}`}
                >
                  {results[req.id] === 'processing' && (
                    <>
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      Processing Decision...
                    </>
                  )}
                  {results[req.id] === 'approved' && (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Workflow Approved!
                    </>
                  )}
                  {results[req.id] === 'rejected' && (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      Request Declined
                    </>
                  )}
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => updateStatus(req.id, "approved")}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(req.id, "rejected")}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

    </div>

  );

}