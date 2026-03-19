"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ViewWorkflow() {

  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);

  useEffect(() => {
    async function fetchWorkflow() {
      if (!id) return;
      try {
        const res = await api.get(`/workflows/${id}`);
        const wf = res.data.workflow;
        if (wf) {
          wf.inputs = wf.input_schema || [];
          wf.steps = (res.data.steps || []).map(s => ({
            ...s,
            type: s.step_type,
            rules: (res.data.rules || [])
              .filter(r => r.step_id === s.id)
              .map(r => r.condition)
          }));
          setWorkflow(wf);
        }
      } catch (err) {
        console.error("Failed to fetch workflow", err);
      }
    }
    fetchWorkflow();
  }, [id]);

  if (!workflow) {
    return (
      <div className="text-white p-10 bg-black min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        {workflow.name}
      </h1>

      <p className="text-gray-400 mb-8">
        Version {workflow.version}
      </p>

      {/* Inputs */}

      <div className="mb-10">

        <h2 className="text-xl font-semibold mb-4">
          Inputs
        </h2>

        <div className="space-y-3">

          {workflow.inputs?.map((input, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded border border-gray-800">

              <p>
                <span className="text-gray-400">Field:</span> {input.label}
              </p>

              <p>
                <span className="text-gray-400">Type:</span> {input.type}
              </p>

            </div>
          ))}

        </div>

      </div>

      {/* Steps */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Steps
        </h2>

        <div className="space-y-4">

          {workflow.steps?.map((step, i) => (

            <div key={i} className="bg-gray-900 p-4 rounded border border-gray-800">

              <p className="font-semibold">
                {step.name}
              </p>

                            <p className="text-gray-400 text-sm">
                Type: {step.type}
              </p>

              {step.metadata?.collectEmail && (
                <div className="mt-3 bg-gray-800 p-2 rounded text-xs border border-gray-700">
                  <p className="font-semibold text-purple-400 mb-1">Email Collection Configured</p>
                  <p><span className="text-gray-400">Recipient:</span> {step.metadata.email || "Not specified"}</p>
                  {step.metadata.notificationEmail && (
                    <p><span className="text-gray-400">Notification Email:</span> {step.metadata.notificationEmail}</p>
                  )}
                  <p><span className="text-gray-400">Subject:</span> {step.metadata.emailSubject || "No subject"}</p>
                  <p className="line-clamp-2 mt-1 italic text-gray-500">"{step.metadata.emailBody}"</p>
                </div>
              )}

              {step.type === "notification" && step.metadata?.email && !step.metadata?.collectEmail && (
                <div className="mt-3 bg-gray-800 p-2 rounded text-xs border border-gray-700">
                   <p className="font-semibold text-blue-400 mb-1">Notification Configured</p>
                   <p><span className="text-gray-400">To:</span> {step.metadata.email}</p>
                   <p><span className="text-gray-400">Subject:</span> {step.metadata.emailSubject}</p>
                </div>
              )}

              {step.rules?.length > 0 && (
                <div className="mt-2 text-sm text-gray-300">
                  Rules:
                  <ul className="list-disc ml-5">
                    {step.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}