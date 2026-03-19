"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FaTasks,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaCodeBranch,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

export default function AllWorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, inactive

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const res = await api.get("/workflows");
        setWorkflows(res.data);
      } catch (err) {
        console.error("Failed to fetch workflows", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflows();
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

  const filtered = workflows.filter((wf) => {
    const matchesSearch = wf.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && wf.is_active) ||
      (filter === "inactive" && !wf.is_active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            All Workflows
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {workflows.length} workflow{workflows.length !== 1 ? "s" : ""}{" "}
            created
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/workflow")}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]"
        >
          <FaPlus size={12} /> Create Workflow
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3">
          <FaFilter className="text-gray-500" size={12} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-sm py-2.5 pr-2 focus:outline-none text-gray-300 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* WORKFLOWS LIST */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
          <FaTasks className="text-gray-700 mx-auto mb-4" size={40} />
          <p className="text-gray-400 text-lg mb-2">
            {search || filter !== "all"
              ? "No workflows match your filters"
              : "No workflows created yet"}
          </p>
          <p className="text-gray-600 text-sm mb-6">
            {search || filter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first workflow"}
          </p>
          {!search && filter === "all" && (
            <button
              onClick={() => router.push("/admin/workflow")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              Create Your First Workflow
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Workflow Name
                  </th>
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Version
                  </th>
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Status
                  </th>
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Created
                  </th>
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((wf) => (
                  <tr
                    key={wf.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center shrink-0">
                          <FaTasks className="text-purple-400" size={14} />
                        </div>
                        <span className="font-semibold text-sm">
                          {wf.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-purple-600/15 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg text-xs font-medium">
                        v{wf.version}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          wf.is_active
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : "bg-gray-500/15 text-gray-400 border border-gray-500/20"
                        }`}
                      >
                        {wf.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {wf.created_at
                        ? new Date(wf.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/workflow/view/${wf.id}`)
                          }
                          className="flex items-center gap-1.5 bg-blue-600/15 text-blue-400 border border-blue-500/20 hover:bg-blue-600/25 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          title="View"
                        >
                          <FaEye size={11} /> View
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/admin/workflow/edit/${wf.id}`)
                          }
                          className="flex items-center gap-1.5 bg-purple-600/15 text-purple-400 border border-purple-500/20 hover:bg-purple-600/25 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          title="Edit"
                        >
                          <FaEdit size={11} /> Edit
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/admin/workflow/versions/${wf.id}`)
                          }
                          className="flex items-center gap-1.5 bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/25 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          title="Versions"
                        >
                          <FaCodeBranch size={11} /> Versions
                        </button>
                        <button
                          onClick={() => deleteWorkflow(wf.id)}
                          className="flex items-center gap-1.5 bg-red-600/15 text-red-400 border border-red-500/20 hover:bg-red-600/25 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          title="Delete"
                        >
                          <FaTrash size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
