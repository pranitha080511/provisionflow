"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function WorkflowVersions() {

  const params = useParams();
  const router = useRouter();

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    async function fetchWorkflow() {
      if (!params?.id) return;
      try {
        const res = await api.get(`/workflows/${params.id}`);
        const wf = res.data.workflow;
        if (wf) {
          const currentVersion = {
            workflowId: wf.id,
            name: wf.name,
            version: wf.version || 1,
            createdAt: wf.updated_at || wf.created_at,
            isActive: true,
            input_schema: wf.input_schema || [],
            steps: (res.data.steps || []).map(s => ({
              name: s.name,
              type: s.step_type,
              rules: (res.data.rules || [])
                .filter(r => r.step_id === s.id)
                .map(r => r.condition)
            }))
          };

          const historyVersions = (wf.history || [])
            .filter((h) => h.version !== (wf.version || 1))
            .map((h) => ({
              workflowId: wf.id,
              name: h.name || wf.name,
              version: h.version,
              createdAt: h.updated_at,
              isActive: false,
              input_schema: h.input_schema || [],
              steps: h.steps || []
            }));

          const rawVersions = [currentVersion, ...historyVersions];
          
          // Deduplicate by version number to prevent React key errors
          const uniqueVersionsMap = new Map();
          rawVersions.forEach(v => {
            if (!uniqueVersionsMap.has(v.version)) {
              uniqueVersionsMap.set(v.version, v);
            }
          });

          const allVersions = Array.from(uniqueVersionsMap.values())
            .sort((a, b) => b.version - a.version);
            
          setVersions(allVersions);
        }
      } catch (err) {
        console.error("Failed to fetch workflow versions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflow();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="p-10 text-white">Loading...</div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="p-10 text-white">No versions found.</div>
    );
  }

  const workflowName = versions.find(v => v.isActive)?.name || versions[0]?.name;

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{workflowName}</h1>
          <p className="text-gray-400">Workflow Versions</p>
        </div>
        <button
          onClick={() => router.push("/admin")}
          className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      <div className="space-y-4">
        {versions.map((v) => (
          <div
            key={`${v.workflowId}-${v.version}`}
            className="bg-gray-900 border border-gray-800 p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">
                  Version {v.version}
                  {v.isActive && (
                    <span className="ml-3 text-xs bg-green-600 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {v.createdAt ? new Date(v.createdAt).toLocaleString() : "Unknown"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedVersion(selectedVersion?.version === v.version ? null : v)}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-sm transition"
                >
                  {selectedVersion?.version === v.version ? "Hide Details" : "View Details"}
                </button>

                {!v.isActive && (
                  <button
                    className="bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded text-sm transition"
                    onClick={async () => {
                      if (confirm(`Restore Version ${v.version} as the active version?`)) {
                        try {
                          const res = await api.post(`/workflows/${params.id}/restore/${v.version}`);
                          alert(res.data.message || "Version restored!");
                          window.location.reload();
                        } catch (err) {
                          console.error(err);
                          alert("Error: " + (err.response?.data?.message || err.message));
                        }
                      }
                    }}
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Details */}
            {selectedVersion?.version === v.version && (
              <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Input Fields</h4>
                  {v.input_schema && v.input_schema.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {v.input_schema.map((inp, i) => (
                        <span key={i} className="bg-gray-800 px-3 py-1 rounded text-sm">
                          {inp.label} <span className="text-gray-500">({inp.type})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No inputs defined.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Steps</h4>
                  {v.steps && v.steps.length > 0 ? (
                    <div className="space-y-2">
                      {v.steps.map((step, i) => (
                        <div key={i} className="bg-gray-800 p-3 rounded">
                          <p className="font-semibold">{step.name} <span className="text-xs text-gray-400 ml-2">({step.type})</span></p>
                          {step.rules && step.rules.length > 0 && (
                            <ul className="mt-1 ml-4 list-disc text-sm text-gray-300">
                              {step.rules.map((r, j) => (
                                <li key={j}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No steps defined.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}