"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FaPlay,
  FaProjectDiagram,
  FaSearch,
} from "react-icons/fa";

export default function AvailableWorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = workflows.filter((wf) =>
    wf.name.toLowerCase().includes(search.toLowerCase())
  );

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
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Available Workflows
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Select a workflow to submit a new request
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative">
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

      {/* WORKFLOWS GRID */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
          <FaProjectDiagram
            className="text-gray-700 mx-auto mb-4"
            size={40}
          />
          <p className="text-gray-400 text-lg mb-2">
            {search ? "No workflows match your search" : "No workflows available"}
          </p>
          <p className="text-gray-600 text-sm">
            {search
              ? "Try a different search term"
              : "Workflows will appear here when an admin creates them"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((wf) => (
            <div
              key={wf.id}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group cursor-pointer"
              onClick={() => router.push(`/user/execute/${wf.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaProjectDiagram className="text-purple-400" size={16} />
                </div>
                <span className="bg-purple-600/15 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                  v{wf.version}
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-1 group-hover:text-purple-300 transition-colors">
                {wf.name}
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                {wf.is_active ? "Ready to execute" : "Currently inactive"}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {wf.created_at
                    ? new Date(wf.created_at).toLocaleDateString()
                    : "—"}
                </span>
                <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-purple-500/20 transition-all group-hover:scale-[1.03]">
                  <FaPlay size={10} /> Run
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
