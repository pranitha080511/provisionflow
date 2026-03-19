"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ClientDashboard(){

  const router = useRouter();

  const [workflows,setWorkflows] = useState([]);
  const [requests,setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const wfRes = await api.get("/workflows");
        setWorkflows(wfRes.data);

        try {
           const exRes = await api.get("/executions");
           setRequests(exRes.data);
        } catch (e) {
           console.warn("Executions endpoint failed");
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    }
    fetchData();
  }, []);

  const pending = requests.filter(r=>r?.status === "waiting" || r?.status === "in_progress" || r?.status === "pending").length;
  const completed = requests.filter(r=>r?.status === "completed" || r?.status === "approved").length;
  const failed = requests.filter(r=>r?.status === "failed" || r?.status === "declined").length;

  return(
    <div className="space-y-8 relative">
      <h1 className="text-3xl font-bold">
        Client Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl">
          <p>My Requests</p>
          <h2 className="text-3xl">{requests.length}</h2>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl">
          <p>Completed</p>
          <h2 className="text-3xl">{completed}</h2>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-xl">
          <p>Pending</p>
          <h2 className="text-3xl">{pending}</h2>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-xl">
          <p>Failed / Declined</p>
          <h2 className="text-3xl">{failed}</h2>
        </div>
      </div>

      {/* AVAILABLE WORKFLOWS */}
      <h2 className="text-xl mb-4">
        Available Workflows
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {workflows.map((wf)=>(
          <div key={wf.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-2">{wf.name}</h3>
            <p className="text-gray-400 mb-4">Execute workflow instantly</p>
            <button
              onClick={()=>router.push(`/user/execute/${wf.id}`)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2 rounded"
            >
              ▶ Run Workflow
            </button>
          </div>
        ))}
      </div>

      {/* MY REQUESTS */}
      <h2 className="text-xl mb-4">
        My Requests
      </h2>

      <div className="overflow-x-auto">
      <table className="w-full bg-gray-900 rounded-xl overflow-hidden">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-800 relative z-10">
            <th className="p-3 text-left">Workflow</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req)=>(
            <tr key={req.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
              <td className="p-3">{req.workflow_name || 'Unknown Workflow'}</td>
              <td className="p-3 capitalize">
                <span className={`px-2 py-1 rounded text-xs ${req.status === 'completed' ? 'bg-green-600' : req.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'}`}>
                  {req.status}
                </span>
              </td>
              <td className="p-3">{new Date(req.started_at).toLocaleString()}</td>
              <td className="p-3">
                <button onClick={() => setSelectedRequest(req)} className="text-purple-400 hover:text-purple-300 text-sm">
                  View Details
                </button>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
             <tr>
               <td colSpan="4" className="p-4 text-center text-gray-400">No requests found.</td>
             </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col pt-6 z-[60]">
            <div className="px-6 pb-4 border-b border-gray-800 flex justify-between items-center">
               <h2 className="text-xl font-bold">{selectedRequest.workflow_name || 'Workflow'} Details</h2>
               <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
               <div className="mb-6">
                 <p className="text-gray-400 text-sm mb-1">Status</p>
                 <p className="capitalize font-semibold text-lg">{selectedRequest.status}</p>
                 <p className="text-gray-400 text-sm mt-4 mb-1">Submitted Data</p>
                 <pre className="bg-black p-3 rounded text-sm text-gray-300 overflow-x-auto">{JSON.stringify(selectedRequest.data, null, 2)}</pre>
               </div>
               
               <div>
                  <h3 className="text-lg font-semibold mb-3">Execution Logs</h3>
                  {selectedRequest.logs && Array.isArray(selectedRequest.logs) ? (
                    <div className="space-y-3">
                      {selectedRequest.logs.map((log, i) => (
                        <div key={i} className={`p-3 rounded border-l-4 bg-black ${log.status === 'failed' ? 'border-red-500' : log.status === 'completed' ? 'border-green-500' : 'border-yellow-500'}`}>
                           <p className="font-semibold">{log.step_name} <span className="text-xs text-gray-400 ml-2">({log.step_type})</span></p>
                                                      <p className="text-sm capitalize mt-1 text-gray-300">Status: {log.status}</p>
                           {log.email_sent_to && (
                             <div className="mt-2 text-xs text-purple-400 bg-purple-900/10 p-2 rounded border border-purple-800/20">
                               Email Sent to: <span className="underline">{log.email_sent_to}</span>
                             </div>
                           )}
                           {log.status === 'failed' && (
                              <p className="text-sm text-red-400 mt-2">Failed (Did not match condition logic)</p>
                           )}
                           {log.status === 'waiting' && (
                              <p className="text-sm text-yellow-400 mt-2">Pending Manual Approval</p>
                           )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No logs available.</p>
                  )}
               </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-800 text-right">
               <button onClick={() => setSelectedRequest(null)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}