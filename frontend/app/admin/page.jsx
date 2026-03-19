"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FaProjectDiagram,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowRight,
  FaPlus,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";

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
          api.get("/executions").catch(() => ({ data: [] })),
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

  const totalExecutions = executions.length;
  const completedExecutions = executions.filter(
    (e) => e.status === "completed"
  ).length;
  const failedExecutions = executions.filter(
    (e) => e.status === "failed"
  ).length;
  const pendingExecutions = executions.filter(
    (e) =>
      e.status === "pending" ||
      e.status === "waiting" ||
      e.status === "in_progress"
  ).length;

  const recentExecutions = executions.slice(0, 8);

  // Group executions by unique client
  const uniqueClients = {};
  executions.forEach((ex) => {
    const key = ex.requester_email || "unknown";
    if (!uniqueClients[key]) {
      uniqueClients[key] = {
        name: ex.requester_name || "Unknown",
        email: ex.requester_email || "",
        count: 0,
        lastActive: ex.started_at,
      };
    }
    uniqueClients[key].count++;
  });
  const clientList = Object.values(uniqueClients).sort(
    (a, b) => b.count - a.count
  );

  const statusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
      case "failed":
        return "bg-red-500/15 text-red-400 border border-red-500/20";
      case "waiting":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
      case "in_progress":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
      default:
        return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-emerald-400" size={12} />;
      case "failed":
        return <FaTimesCircle className="text-red-400" size={12} />;
      case "waiting":
      case "in_progress":
        return <FaClock className="text-amber-400" size={12} />;
      default:
        return <FaClock className="text-gray-400" size={12} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Overview of your workflow engine
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/workflow")}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]"
        >
          <FaPlus size={12} /> Create Workflow
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          className="group bg-gradient-to-br from-purple-600/20 to-purple-900/10 border border-purple-500/20 p-5 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all duration-300"
          onClick={() => router.push("/admin/workflows")}
        >
          <div className="flex items-center justify-between mb-3">
            <FaProjectDiagram
              className="text-purple-400 group-hover:scale-110 transition-transform"
              size={18}
            />
            <FaArrowRight
              className="text-purple-500/0 group-hover:text-purple-400/60 transition-all"
              size={12}
            />
          </div>
          <p className="text-3xl font-bold text-white">{workflows.length}</p>
          <p className="text-purple-300/60 text-xs mt-1 uppercase tracking-wider">
            Total Workflows
          </p>
        </div>

        <div
          className="group bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 p-5 rounded-2xl cursor-pointer hover:border-blue-500/40 transition-all duration-300"
          onClick={() => router.push("/admin/executions")}
        >
          <div className="flex items-center justify-between mb-3">
            <FaPlay
              className="text-blue-400 group-hover:scale-110 transition-transform"
              size={18}
            />
            <FaArrowRight
              className="text-blue-500/0 group-hover:text-blue-400/60 transition-all"
              size={12}
            />
          </div>
          <p className="text-3xl font-bold text-white">{totalExecutions}</p>
          <p className="text-blue-300/60 text-xs mt-1 uppercase tracking-wider">
            Total Executions
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <FaCheckCircle className="text-emerald-400" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">
            {completedExecutions}
          </p>
          <p className="text-emerald-300/60 text-xs mt-1 uppercase tracking-wider">
            Completed
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <FaTimesCircle className="text-red-400" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{failedExecutions}</p>
          <p className="text-red-300/60 text-xs mt-1 uppercase tracking-wider">
            Failed
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border border-amber-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <FaClock className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{pendingExecutions}</p>
          <p className="text-amber-300/60 text-xs mt-1 uppercase tracking-wider">
            Pending
          </p>
        </div>
      </div>

      {/* TWO-COLUMN: RECENT EXECUTIONS + ACTIVE CLIENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT EXECUTIONS */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-blue-400" size={14} />
              </div>
              <h2 className="text-lg font-semibold">Recent Executions</h2>
            </div>
            <button
              onClick={() => router.push("/admin/executions")}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
            >
              View All <FaArrowRight size={10} />
            </button>
          </div>

          {recentExecutions.length === 0 ? (
            <div className="p-10 text-center">
              <FaPlay className="text-gray-700 mx-auto mb-3" size={32} />
              <p className="text-gray-500 text-sm">No executions yet</p>
              <p className="text-gray-600 text-xs mt-1">
                Executions will appear here when clients submit workflows
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {recentExecutions.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => router.push("/admin/executions")}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                    {(ex.requester_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {ex.requester_name || "Unknown Client"}
                      </span>
                      <span className="text-[10px] text-gray-600 hidden sm:inline">
                        {ex.requester_email || ""}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {ex.workflow_name || "Unknown Workflow"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColor(ex.status)}`}
                    >
                      {statusIcon(ex.status)}
                      {ex.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 hidden md:block shrink-0">
                    {ex.started_at
                      ? new Date(ex.started_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVE CLIENTS */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-gray-800">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <FaUsers className="text-purple-400" size={14} />
            </div>
            <h2 className="text-lg font-semibold">Active Clients</h2>
          </div>

          {clientList.length === 0 ? (
            <div className="p-10 text-center">
              <FaUsers className="text-gray-700 mx-auto mb-3" size={32} />
              <p className="text-gray-500 text-sm">No clients yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {clientList.slice(0, 8).map((client, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {client.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {client.email}
                    </p>
                  </div>
                  <div className="bg-purple-600/15 text-purple-300 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0">
                    {client.count} run{client.count !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WORKFLOW OVERVIEW */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <FaProjectDiagram className="text-purple-400" size={14} />
            </div>
            <h2 className="text-lg font-semibold">Workflows</h2>
          </div>
          <button
            onClick={() => router.push("/admin/workflows")}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
          >
            View All <FaArrowRight size={10} />
          </button>
        </div>

        {workflows.length === 0 ? (
          <div className="p-10 text-center">
            <FaProjectDiagram
              className="text-gray-700 mx-auto mb-3"
              size={32}
            />
            <p className="text-gray-500 mb-4">No workflows created yet.</p>
            <button
              onClick={() => router.push("/admin/workflow")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/20 px-5 py-2.5 rounded-xl transition-all"
            >
              Create Your First Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {workflows.slice(0, 6).map((wf) => (
              <div
                key={wf.id}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-all cursor-pointer group"
                onClick={() => router.push(`/admin/workflow/view/${wf.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm truncate group-hover:text-purple-300 transition-colors">
                    {wf.name}
                  </h3>
                  <span className="bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-md text-[11px] font-medium">
                    v{wf.version}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      wf.is_active
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-gray-500/15 text-gray-400 border border-gray-500/20"
                    }`}
                  >
                    {wf.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {wf.created_at
                      ? new Date(wf.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}