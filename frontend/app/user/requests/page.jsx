"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  FaClipboardList,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaProjectDiagram,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await api.get("/executions");
        setRequests(res.data);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

  const filtered = requests.filter((req) => {
    const matchesSearch = (req.workflow_name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      req.status === statusFilter ||
      (statusFilter === "pending" &&
        (req.status === "waiting" || req.status === "in_progress"));
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: requests.length,
    completed: requests.filter((r) => r.status === "completed").length,
    failed: requests.filter((r) => r.status === "failed").length,
    pending: requests.filter(
      (r) => r.status === "waiting" || r.status === "in_progress"
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          My Requests
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Track all your workflow submissions and their status
        </p>
      </div>

      {/* STATUS TABS */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All", color: "purple" },
          { key: "completed", label: "Completed", color: "emerald" },
          { key: "failed", label: "Failed", color: "red" },
          { key: "pending", label: "Pending", color: "amber" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === tab.key
                ? "border"
                : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700"
            }`}
            style={
              statusFilter === tab.key
                ? {
                    backgroundColor:
                      tab.color === "purple"
                        ? "rgba(147,51,234,0.15)"
                        : tab.color === "emerald"
                          ? "rgba(16,185,129,0.15)"
                          : tab.color === "red"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(245,158,11,0.15)",
                    color:
                      tab.color === "purple"
                        ? "#c084fc"
                        : tab.color === "emerald"
                          ? "#6ee7b7"
                          : tab.color === "red"
                            ? "#fca5a5"
                            : "#fcd34d",
                    borderColor:
                      tab.color === "purple"
                        ? "rgba(147,51,234,0.3)"
                        : tab.color === "emerald"
                          ? "rgba(16,185,129,0.3)"
                          : tab.color === "red"
                            ? "rgba(239,68,68,0.3)"
                            : "rgba(245,158,11,0.3)",
                  }
                : {}
            }
          >
            {tab.label}
            <span className="bg-black/20 px-1.5 py-0.5 rounded-md text-[11px]">
              {statusCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <FaSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          size={14}
        />
        <input
          type="text"
          placeholder="Search by workflow name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {/* REQUESTS LIST */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
          <FaClipboardList className="text-gray-700 mx-auto mb-4" size={40} />
          <p className="text-gray-400 text-lg mb-2">No requests found</p>
          <p className="text-gray-600 text-sm">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filter"
              : "Your workflow submissions will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const isExpanded = expandedId === req.id;
            const logs = Array.isArray(req.logs) ? req.logs : [];

            return (
              <div
                key={req.id}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-700"
              >
                {/* MAIN ROW */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800/20 transition-colors"
                  onClick={() => toggleExpand(req.id)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <FaProjectDiagram
                      className="text-purple-400"
                      size={14}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {req.workflow_name || "Unknown Workflow"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {req.started_at
                        ? new Date(req.started_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "—"}
                    </p>
                  </div>

                  <span
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${statusColor(req.status)}`}
                  >
                    {statusIcon(req.status)}
                    {req.status}
                  </span>

                  <div className="shrink-0 text-gray-600">
                    {isExpanded ? (
                      <FaChevronUp size={12} />
                    ) : (
                      <FaChevronDown size={12} />
                    )}
                  </div>
                </div>

                {/* EXPANDED */}
                {isExpanded && (
                  <div className="border-t border-gray-800 bg-gray-950/50 p-5 space-y-4">
                    {/* INFO CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <FaProjectDiagram size={11} />
                          <span className="text-[11px] uppercase tracking-wider font-semibold">
                            Workflow
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          {req.workflow_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Version: {req.workflow_version || "—"}
                        </p>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <FaCalendarAlt size={11} />
                          <span className="text-[11px] uppercase tracking-wider font-semibold">
                            Timeline
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Started:{" "}
                          {req.started_at
                            ? new Date(req.started_at).toLocaleString()
                            : "—"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Ended:{" "}
                          {req.ended_at
                            ? new Date(req.ended_at).toLocaleString()
                            : "In progress"}
                        </p>
                      </div>
                    </div>

                    {/* SUBMITTED DATA */}
                    {req.data && Object.keys(req.data).length > 0 && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center gap-2">
                          <FaInfoCircle size={11} /> Submitted Data
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(req.data).map(([key, val]) => (
                            <div
                              key={key}
                              className="bg-gray-800/50 rounded-lg p-3"
                            >
                              <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                                {key}
                              </p>
                              <p className="text-sm font-medium mt-1 text-gray-200">
                                {String(val)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP LOGS */}
                    {logs.length > 0 && (
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                          Execution Steps
                        </h4>
                        <div className="space-y-2">
                          {logs.map((log, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-gray-800/40 rounded-lg px-4 py-2.5"
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  log.status === "completed"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : log.status === "failed" ||
                                        log.status === "rejected"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium">
                                  {log.step_name || `Step ${i + 1}`}
                                </span>
                                <span className="text-xs text-gray-600 ml-2">
                                  ({log.step_type || "task"})
                                </span>
                              </div>
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                  log.status === "completed"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : log.status === "failed" ||
                                        log.status === "rejected"
                                      ? "bg-red-500/15 text-red-400"
                                      : "bg-amber-500/15 text-amber-400"
                                }`}
                              >
                                {log.status}
                              </span>
                              {log.email_sent_to && (
                                <span className="text-[11px] text-gray-500 flex items-center gap-1 hidden sm:flex">
                                  <FaEnvelope size={9} /> {log.email_sent_to}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
