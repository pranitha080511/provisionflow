"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowRight,
  FaClipboardList,
  FaProjectDiagram,
  FaChartLine,
} from "react-icons/fa";

export default function ClientDashboard() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pending = requests.filter(
    (r) =>
      r?.status === "waiting" ||
      r?.status === "in_progress" ||
      r?.status === "pending"
  ).length;
  const completed = requests.filter(
    (r) => r?.status === "completed" || r?.status === "approved"
  ).length;
  const failed = requests.filter(
    (r) => r?.status === "failed" || r?.status === "declined"
  ).length;

  const recentRequests = requests.slice(0, 5);

  const statusColor = (status) => {
    switch (status) {
      case "completed":
      case "approved":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
      case "failed":
      case "declined":
        return "bg-red-500/15 text-red-400 border border-red-500/20";
      case "waiting":
      case "in_progress":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
      default:
        return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "completed":
      case "approved":
        return <FaCheckCircle className="text-emerald-400" size={12} />;
      case "failed":
      case "declined":
        return <FaTimesCircle className="text-red-400" size={12} />;
      default:
        return <FaClock className="text-amber-400" size={12} />;
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
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Client Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Welcome back! Here&apos;s your workflow overview
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="group bg-gradient-to-br from-purple-600/20 to-purple-900/10 border border-purple-500/20 p-5 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all duration-300"
          onClick={() => router.push("/user/requests")}
        >
          <div className="flex items-center justify-between mb-3">
            <FaClipboardList
              className="text-purple-400 group-hover:scale-110 transition-transform"
              size={18}
            />
            <FaArrowRight
              className="text-purple-500/0 group-hover:text-purple-400/60 transition-all"
              size={12}
            />
          </div>
          <p className="text-3xl font-bold text-white">{requests.length}</p>
          <p className="text-purple-300/60 text-xs mt-1 uppercase tracking-wider">
            My Requests
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <FaCheckCircle className="text-emerald-400" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{completed}</p>
          <p className="text-emerald-300/60 text-xs mt-1 uppercase tracking-wider">
            Completed
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border border-amber-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <FaClock className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{pending}</p>
          <p className="text-amber-300/60 text-xs mt-1 uppercase tracking-wider">
            Pending
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <FaTimesCircle className="text-red-400" size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{failed}</p>
          <p className="text-red-300/60 text-xs mt-1 uppercase tracking-wider">
            Failed / Declined
          </p>
        </div>
      </div>

      {/* TWO-COLUMN: RECENT REQUESTS + AVAILABLE WORKFLOWS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT REQUESTS */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-blue-400" size={14} />
              </div>
              <h2 className="text-lg font-semibold">Recent Requests</h2>
            </div>
            <button
              onClick={() => router.push("/user/requests")}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
            >
              View All <FaArrowRight size={10} />
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-10 text-center">
              <FaClipboardList
                className="text-gray-700 mx-auto mb-3"
                size={32}
              />
              <p className="text-gray-500 text-sm">No requests yet</p>
              <p className="text-gray-600 text-xs mt-1">
                Submit a workflow to see your requests here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => router.push("/user/requests")}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                    <FaProjectDiagram
                      className="text-purple-400"
                      size={12}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {req.workflow_name || "Unknown Workflow"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {req.started_at
                        ? new Date(req.started_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "—"}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColor(req.status)}`}
                  >
                    {statusIcon(req.status)}
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS: AVAILABLE WORKFLOWS */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-gray-800">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <FaPlay className="text-purple-400" size={14} />
            </div>
            <h2 className="text-lg font-semibold">Quick Run</h2>
          </div>

          {workflows.length === 0 ? (
            <div className="p-10 text-center">
              <FaProjectDiagram
                className="text-gray-700 mx-auto mb-3"
                size={32}
              />
              <p className="text-gray-500 text-sm">No workflows available</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {workflows.slice(0, 6).map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/user/execute/${wf.id}`)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center shrink-0">
                    <FaProjectDiagram
                      className="text-indigo-400"
                      size={12}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-purple-300 transition-colors">
                      {wf.name}
                    </p>
                    <p className="text-[11px] text-gray-600">
                      v{wf.version}
                    </p>
                  </div>
                  <FaPlay
                    className="text-gray-700 group-hover:text-purple-400 transition-colors shrink-0"
                    size={10}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => router.push("/user/workflows")}
              className="w-full text-sm text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1 transition py-1"
            >
              View All Workflows <FaArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}