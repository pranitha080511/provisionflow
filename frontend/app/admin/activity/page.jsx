"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEnvelope,
  FaProjectDiagram,
  FaUser,
} from "react-icons/fa";

export default function ActivityLogPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [expandedData, setExpandedData] = useState({});

  useEffect(() => {
    async function fetchExecutions() {
      try {
        const res = await api.get("/executions");
        setExecutions(res.data);
      } catch (err) {
        console.error("Failed to fetch executions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExecutions();
  }, []);

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

  // Only show completed and failed executions in the activity log
  const finishedExecutions = executions.filter(
    (e) => e.status === "completed" || e.status === "failed"
  );

  const filtered = finishedExecutions.filter((ex) => {
    const matchesSearch =
      (ex.requester_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (ex.requester_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (ex.workflow_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ex.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = finishedExecutions.filter(
    (e) => e.status === "completed"
  ).length;
  const failedCount = finishedExecutions.filter(
    (e) => e.status === "failed"
  ).length;

  // Helper to determine failure reason from logs
  const getFailureReason = (logs) => {
    if (!Array.isArray(logs) || logs.length === 0) return "Unknown reason";
    const failedStep = logs.find(
      (l) => l.status === "failed" || l.status === "rejected"
    );
    if (!failedStep) return "Unknown reason";

    if (failedStep.status === "rejected") {
      return `Rejected at "${failedStep.step_name}" step — the approver declined the request`;
    }
    return `Failed at "${failedStep.step_name}" step — data validation did not match the required rules`;
  };

  // Helper to determine completion info from logs
  const getCompletionInfo = (logs) => {
    if (!Array.isArray(logs) || logs.length === 0)
      return "Completed successfully";
    const completedSteps = logs.filter((l) => l.status === "completed").length;
    const totalSteps = logs.length;
    const approvalStep = logs.find(
      (l) => l.step_type === "approval" && l.status === "completed"
    );
    const notificationStep = logs.find(
      (l) => l.step_type === "notification" && l.status === "completed"
    );

    let info = `All ${completedSteps}/${totalSteps} steps executed successfully`;
    if (approvalStep && approvalStep.approved_at)
      info += ` • Approved at "${approvalStep.step_name}"`;
    if (notificationStep)
      info += ` • Notification sent at "${notificationStep.step_name}"`;
    return info;
  };

  const statusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
      case "failed":
        return "bg-red-500/15 text-red-400 border border-red-500/20";
      default:
        return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">
            Loading activity log...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Activity Log
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Track completed and failed workflow executions with detailed reasons
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-600/15 rounded-xl flex items-center justify-center">
              <FaHistory className="text-purple-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {finishedExecutions.length}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Total Activities
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-600/15 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-emerald-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Completed
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${finishedExecutions.length > 0 ? (completedCount / finishedExecutions.length) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-600/15 rounded-xl flex items-center justify-center">
              <FaTimesCircle className="text-red-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold">{failedCount}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Failed
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${finishedExecutions.length > 0 ? (failedCount / finishedExecutions.length) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* FILTER TABS + SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {[
            { key: "all", label: "All", icon: FaHistory },
            { key: "completed", label: "Completed", icon: FaCheckCircle },
            { key: "failed", label: "Failed", icon: FaTimesCircle },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === tab.key
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "bg-gray-900 text-gray-500 border border-gray-800 hover:text-gray-300 hover:border-gray-700"
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* ACTIVITY LIST */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
          <FaHistory className="text-gray-700 mx-auto mb-4" size={40} />
          <p className="text-gray-400 text-lg mb-2">No activity found</p>
          <p className="text-gray-600 text-sm">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filter"
              : "Completed and failed executions will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ex) => {
            const isExpanded = expandedId === ex.id;
            const details = expandedData[ex.id] || ex;
            const logs = Array.isArray(details.logs) ? details.logs : [];
            const isCompleted = ex.status === "completed";
            const isFailed = ex.status === "failed";

            return (
              <div
                key={ex.id}
                className={`bg-gray-900/50 border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isFailed
                    ? "border-red-500/15 hover:border-red-500/30"
                    : "border-emerald-500/15 hover:border-emerald-500/30"
                }`}
              >
                {/* MAIN ROW */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800/20 transition-colors"
                  onClick={() => toggleExpand(ex.id)}
                >
                  {/* Status indicator line */}
                  <div
                    className={`w-1 h-12 rounded-full shrink-0 ${
                      isCompleted ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  ></div>

                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      isCompleted
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {isCompleted ? (
                      <FaCheckCircle size={16} />
                    ) : (
                      <FaTimesCircle size={16} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {ex.workflow_name || "Unknown Workflow"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(ex.status)}`}
                      >
                        {ex.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FaUser size={9} />
                        {ex.requester_name || "Unknown"} ({ex.requester_email || ""})
                      </span>
                    </div>
                    {/* REASON */}
                    <div className="mt-2">
                      {isFailed && (
                        <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                          <FaExclamationTriangle
                            className="text-red-400 mt-0.5 shrink-0"
                            size={11}
                          />
                          <p className="text-xs text-red-300/80">
                            {getFailureReason(
                              Array.isArray(ex.logs) ? ex.logs : []
                            )}
                          </p>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
                          <FaInfoCircle
                            className="text-emerald-400 mt-0.5 shrink-0"
                            size={11}
                          />
                          <p className="text-xs text-emerald-300/80">
                            {getCompletionInfo(
                              Array.isArray(ex.logs) ? ex.logs : []
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0 hidden md:block">
                    <p className="text-xs text-gray-500">
                      {ex.started_at
                        ? new Date(ex.started_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {ex.started_at
                        ? new Date(ex.started_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>

                  {/* Expand */}
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
                  <div className="border-t border-gray-800 bg-gray-950/50 p-5 space-y-4">
                    {/* STEP-BY-STEP TIMELINE */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">
                        Step-by-Step Execution Log
                      </h4>
                      <div className="space-y-0">
                        {logs.map((log, i) => {
                          const isLastStep = i === logs.length - 1;
                          const stepCompleted = log.status === "completed";
                          const stepFailed =
                            log.status === "failed" ||
                            log.status === "rejected";
                          const stepWaiting = log.status === "waiting";

                          return (
                            <div key={i} className="flex gap-4">
                              {/* Timeline connector */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    stepCompleted
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : stepFailed
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-amber-500/20 text-amber-400"
                                  }`}
                                >
                                  {stepCompleted ? (
                                    <FaCheckCircle size={12} />
                                  ) : stepFailed ? (
                                    <FaTimesCircle size={12} />
                                  ) : (
                                    <FaClock size={12} />
                                  )}
                                </div>
                                {!isLastStep && (
                                  <div
                                    className={`w-0.5 h-8 ${
                                      stepCompleted
                                        ? "bg-emerald-500/30"
                                        : "bg-gray-800"
                                    }`}
                                  ></div>
                                )}
                              </div>

                              {/* Step content */}
                              <div className="flex-1 pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">
                                    {log.step_name || `Step ${i + 1}`}
                                  </span>
                                  <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                                    {log.step_type || "task"}
                                  </span>
                                  <span
                                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                      stepCompleted
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : stepFailed
                                          ? "bg-red-500/15 text-red-400"
                                          : "bg-amber-500/15 text-amber-400"
                                    }`}
                                  >
                                    {log.status}
                                  </span>
                                </div>

                                {/* Additional details */}
                                {log.email_sent_to && (
                                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                                    <FaEnvelope size={9} /> Email sent to:{" "}
                                    {log.email_sent_to}
                                  </p>
                                )}
                                {log.approved_at && (
                                  <p className="text-[11px] text-emerald-400/60 mt-1">
                                    ✓ Approved at{" "}
                                    {new Date(
                                      log.approved_at
                                    ).toLocaleString()}
                                  </p>
                                )}
                                {log.rejected_at && (
                                  <p className="text-[11px] text-red-400/60 mt-1">
                                    ✕ Rejected at{" "}
                                    {new Date(
                                      log.rejected_at
                                    ).toLocaleString()}
                                  </p>
                                )}

                                {/* Failed step reason */}
                                {stepFailed && (
                                  <div className="mt-2 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                                    <p className="text-xs text-red-300/70">
                                      {log.status === "rejected"
                                        ? "The request was declined by the approver"
                                        : "The submitted data did not match the validation rules for this step"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SUBMITTED DATA */}
                    {details.data &&
                      Object.keys(details.data).length > 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                            Submitted Data
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(details.data).map(([key, val]) => (
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

                    {/* TIMELINE */}
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>
                        Started:{" "}
                        {details.started_at
                          ? new Date(details.started_at).toLocaleString()
                          : "—"}
                      </span>
                      <span>•</span>
                      <span>
                        Ended:{" "}
                        {details.ended_at
                          ? new Date(details.ended_at).toLocaleString()
                          : "—"}
                      </span>
                      {details.started_at && details.ended_at && (
                        <>
                          <span>•</span>
                          <span>
                            Duration:{" "}
                            {Math.round(
                              (new Date(details.ended_at) -
                                new Date(details.started_at)) /
                                1000
                            )}
                            s
                          </span>
                        </>
                      )}
                    </div>
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
