"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FaPlay,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaUser,
  FaProjectDiagram,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";

export default function ExecutionsPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [expandedData, setExpandedData] = useState({});

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      const res = await api.get("/executions");
      setExecutions(res.data);
    } catch (err) {
      console.error("Failed to fetch executions", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (!expandedData[id]) {
      try {
        const res = await api.get(`/executions/${id}`);
        setExpandedData((prev) => ({ ...prev, [id]: res.data }));
      } catch (err) {
        console.error("Failed to fetch execution details", err);
      }
    }
  };



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
      case "canceled":
        return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
      default:
        return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-emerald-400" size={14} />;
      case "failed":
        return <FaTimesCircle className="text-red-400" size={14} />;
      case "waiting":
      case "in_progress":
        return <FaClock className="text-amber-400" size={14} />;
      default:
        return <FaClock className="text-gray-400" size={14} />;
    }
  };

  const filtered = executions.filter((ex) => {
    const matchesSearch =
      (ex.requester_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (ex.requester_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (ex.workflow_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ex.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: executions.length,
    completed: executions.filter((e) => e.status === "completed").length,
    failed: executions.filter((e) => e.status === "failed").length,
    waiting: executions.filter(
      (e) => e.status === "waiting" || e.status === "in_progress"
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading executions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Executions
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Monitor and manage all workflow executions
        </p>
      </div>

      {/* STATUS TABS */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All", color: "purple" },
          { key: "completed", label: "Completed", color: "emerald" },
          { key: "failed", label: "Failed", color: "red" },
          { key: "waiting", label: "Pending", color: "amber" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === tab.key
                ? `bg-${tab.color}-600/20 text-${tab.color}-400 border border-${tab.color}-500/30`
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
          placeholder="Search by client name, email, or workflow..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {/* EXECUTIONS LIST */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
          <FaPlay className="text-gray-700 mx-auto mb-4" size={40} />
          <p className="text-gray-400 text-lg mb-2">No executions found</p>
          <p className="text-gray-600 text-sm">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filter"
              : "Executions will appear here when clients submit workflows"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ex) => {
            const isExpanded = expandedId === ex.id;
            const details = expandedData[ex.id] || ex;
            const logs = Array.isArray(details.logs) ? details.logs : [];

            return (
              <div
                key={ex.id}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-700"
              >
                {/* MAIN ROW */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800/20 transition-colors"
                  onClick={() => toggleExpand(ex.id)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
                    {(ex.requester_name || "U").charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {ex.requester_name || "Unknown Client"}
                      </span>
                      <span className="text-[11px] text-gray-600 hidden sm:inline">
                        {ex.requester_email || ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <FaProjectDiagram className="text-gray-600" size={10} />
                      <span className="text-xs text-gray-500">
                        {ex.workflow_name || "Unknown Workflow"}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${statusColor(ex.status)}`}
                  >
                    {statusIcon(ex.status)}
                    {ex.status}
                  </span>

                  {/* Date */}
                  <span className="text-xs text-gray-500 hidden md:block shrink-0 w-24 text-right">
                    {ex.started_at
                      ? new Date(ex.started_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>

                  {/* Expand Icon */}
                  <div className="shrink-0 text-gray-600">
                    {isExpanded ? (
                      <FaChevronUp size={12} />
                    ) : (
                      <FaChevronDown size={12} />
                    )}
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div className="border-t border-gray-800 bg-gray-950/50 p-5 space-y-5 animate-in">
                    {/* DETAIL CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <FaUser size={11} />
                          <span className="text-[11px] uppercase tracking-wider font-semibold">
                            Client
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          {ex.requester_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ex.requester_email || "No email"}
                        </p>
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <FaProjectDiagram size={11} />
                          <span className="text-[11px] uppercase tracking-wider font-semibold">
                            Workflow
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          {ex.workflow_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Version: {details.workflow_version || "—"}
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
                          {ex.started_at
                            ? new Date(ex.started_at).toLocaleString()
                            : "—"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Ended:{" "}
                          {details.ended_at
                            ? new Date(details.ended_at).toLocaleString()
                            : "In progress"}
                        </p>
                      </div>
                    </div>

                    {/* INPUT DATA */}
                    {details.data &&
                      Object.keys(details.data).length > 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center gap-2">
                            <FaInfoCircle size={11} /> Submitted Data
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(details.data).map(([key, val]) => (
                              <div key={key} className="bg-gray-800/50 rounded-lg p-3">
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
                                <span className="text-[11px] text-gray-500 flex items-center gap-1">
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
