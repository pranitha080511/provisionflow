"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminDashboard() {

  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [wfRes, exRes] = await Promise.all([
          api.get("/workflows"),
          api.get("/executions").catch(() => ({ data: [] }))
        ]);
        setWorkflows(wfRes.data);
        setExecutions(exRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const deleteWorkflow = async (id) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    try {
      await api.delete(`/workflows/${id}`);
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch (err) {
      alert("Failed to delete workflow");
      console.error(err);
    }
  };

  const totalExecutions = executions.length;
  const completedExecutions = executions.filter(e => e.status === "completed").length;
  const failedExecutions = executions.filter(e => e.status === "failed").length;
  const pendingExecutions = executions.filter(e => e.status === "pending" || e.status === "waiting" || e.status === "in_progress").length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => router.push("/admin/workflow")}
          className="bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition"
        >
          + Create Workflow
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-5 rounded-xl">
          <h3 className="text-white/80 text-sm">Total Workflows</h3>
          <p className="text-3xl font-bold mt-1">{workflows.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-5 rounded-xl">
          <h3 className="text-white/80 text-sm">Total Executions</h3>
          <p className="text-3xl font-bold mt-1">{totalExecutions}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-5 rounded-xl">
          <h3 className="text-white/80 text-sm">Completed</h3>
          <p className="text-3xl font-bold mt-1">{completedExecutions}</p>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-orange-600 p-5 rounded-xl">
          <h3 className="text-white/80 text-sm">Failed</h3>
          <p className="text-3xl font-bold mt-1">{failedExecutions}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-amber-600 p-5 rounded-xl">
          <h3 className="text-white/80 text-sm">Pending</h3>
          <p className="text-3xl font-bold mt-1">{pendingExecutions}</p>
        </div>
      </div>

      {/* WORKFLOWS TABLE */}
      <div>
        <h2 className="text-xl mb-4 font-semibold">Workflows</h2>

        {loading ? (
          <p className="text-gray-400">Loading workflows...</p>
        ) : workflows.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
            <p className="text-gray-400 mb-4">No workflows created yet.</p>
            <button
              onClick={() => router.push("/admin/workflow")}
              className="bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-lg transition"
            >
              Create Your First Workflow
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-800 text-left">
                  <th className="p-4">Name</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((wf) => (
                  <tr key={wf.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="p-4 font-semibold">{wf.name}</td>
                    <td className="p-4">
                      <span className="bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded text-sm">
                        v{wf.version}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${wf.is_active ? 'bg-green-600/30 text-green-300' : 'bg-gray-600/30 text-gray-300'}`}>
                        {wf.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {wf.created_at ? new Date(wf.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => router.push(`/admin/workflow/view/${wf.id}`)}
                          className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-sm transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/admin/workflow/edit/${wf.id}`)}
                          className="bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded text-sm transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => router.push(`/admin/workflow/versions/${wf.id}`)}
                          className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-sm transition"
                        >
                          Versions
                        </button>
                        <button
                          onClick={() => deleteWorkflow(wf.id)}
                          className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-sm transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT EXECUTIONS */}
      {executions.length > 0 && (
        <div>
          <h2 className="text-xl mb-4 font-semibold">Recent Executions</h2>
          <table className="w-full bg-gray-900 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="p-4">User</th>
                <th className="p-4">Workflow</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {executions.slice(0, 10).map((ex) => (
                <tr key={ex.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <div className="font-semibold text-sm">{ex.requester_name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{ex.requester_email || ""}</div>
                  </td>
                  <td className="p-4">{ex.workflow_name || "Unknown"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      ex.status === 'completed' ? 'bg-green-600/30 text-green-300' :
                      ex.status === 'failed' ? 'bg-red-600/30 text-red-300' :
                      'bg-yellow-600/30 text-yellow-300'
                    }`}>
                      {ex.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {ex.started_at ? new Date(ex.started_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}