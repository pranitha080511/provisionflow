"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import WorkflowBuilder from "@/components/WorkflowBuilder";

export default function EditWorkflow() {

  const params = useParams();
  const router = useRouter();

  const [workflow, setWorkflow] = useState(null);

  useEffect(() => {
    async function fetchWorkflow() {
      if (!params.id) return;
      try {
        const res = await api.get(`/workflows/${params.id}`);
        const wf = res.data.workflow;
        if (wf) {
          wf.inputs = wf.input_schema || [];
                    wf.steps = (res.data.steps || []).map(s => ({
            ...s,
            id: s.id,
            type: s.step_type,
            rules: (res.data.rules || [])
              .filter(r => r.step_id === s.id)
              .map(r => {
                const nextStepIdx = (res.data.steps || []).findIndex(st => st.id === r.next_step_id);
                return {
                  condition: r.condition,
                  next_step_index: r.next_step_id === null ? "end" : (nextStepIdx !== -1 ? nextStepIdx : "")
                };
              }),
            collectEmail: s.metadata?.collectEmail || false,
            email: s.metadata?.email || "",
            notificationEmail: s.metadata?.notificationEmail || "",
            emailSubject: s.metadata?.emailSubject || "",
            emailBody: s.metadata?.emailBody || ""
          }));
          setWorkflow(wf);
        }
      } catch (err) {
        console.error("Failed to fetch workflow for editing", err);
      }
    }
    fetchWorkflow();
  }, [params.id]);

  const updateWorkflow = async (data) => {
    try {
            await api.put(`/workflows/${params.id}`, {
        name: data.name,
        input_schema: data.inputs,
        steps: data.steps.map(s => ({
          ...s,
          metadata: {
            collectEmail: s.collectEmail,
            email: s.email,
            notificationEmail: s.notificationEmail,
            emailSubject: s.emailSubject,
            emailBody: s.emailBody
          }
        }))
      });
      alert("Workflow Updated Successfully");
      router.push("/admin");
    } catch (err) {
      console.error("Failed to update workflow", err);
      alert("Failed to update workflow");
    }
  };

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
        Edit Workflow
      </h1>

      <WorkflowBuilder
        initialData={workflow}
        onSubmit={updateWorkflow}
      />

    </div>

  );

}