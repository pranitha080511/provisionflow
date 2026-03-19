"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  FaPlay,
  FaChevronLeft,
  FaProjectDiagram,
  FaKeyboard,
  FaRocket,
} from "react-icons/fa";

export default function ExecuteWorkflow() {
  const { workflowId } = useParams();
  const router = useRouter();

  const [workflow, setWorkflow] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchWorkflow() {
      try {
        const res = await api.get(`/workflows/${workflowId}`);
        setWorkflow(res.data.workflow);
      } catch (err) {
        console.error("Failed to fetch workflow", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflow();
  }, [workflowId]);

  const submitRequest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/workflows/${workflowId}/execute`, {
        input_data: formData,
      });
      alert("Workflow Execution Started Successfully!");
      router.push("/user");
    } catch (err) {
      console.error(err);
      alert(
        "Failed to submit request: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center max-w-lg mx-auto mt-20">
        <FaProjectDiagram className="text-gray-700 mx-auto mb-4" size={40} />
        <p className="text-gray-400 text-lg mb-4">Workflow not found</p>
        <button
          onClick={() => router.push("/user/workflows")}
          className="text-purple-400 hover:text-purple-300 flex items-center gap-2 mx-auto"
        >
          <FaChevronLeft size={10} /> Back to Workflows
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      {/* HEADER */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition group"
      >
        <FaChevronLeft
          className="group-hover:-translate-x-1 transition-transform"
          size={12}
        />{" "}
        Back
      </button>

      <div className="flex items-start gap-5">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
          <FaProjectDiagram className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {workflow.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Fill in the details below to start this workflow execution
          </p>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden mt-8 shadow-2xl">
        <div className="p-6 border-b border-gray-800 bg-gray-800/20 flex items-center gap-3">
          <FaKeyboard className="text-purple-400" size={16} />
          <h2 className="text-lg font-semibold">Workflow Inputs</h2>
        </div>

        <div className="p-8 space-y-8">
          {(workflow.input_schema || []).length === 0 ? (
            <div className="text-center py-6 bg-gray-800/10 rounded-xl border border-dashed border-gray-800">
              <p className="text-gray-500 text-sm italic">
                This workflow requires no user input. Click below to start.
              </p>
            </div>
          ) : (
            (workflow.input_schema || []).map((input, index) => (
              <div key={index} className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-gray-300">
                    {input.label}
                    {input.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <span className="text-gray-600 text-[10px] uppercase tracking-widest font-bold bg-gray-800 px-2 py-0.5 rounded">
                    {input.type || "text"}
                  </span>
                </div>

                <input
                  type={input.type || "text"}
                  placeholder={`Enter ${input.label.toLowerCase()}...`}
                  className="w-full bg-black/40 border border-gray-800 text-white px-5 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all outline-none placeholder:text-gray-700"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [input.label]: e.target.value,
                    })
                  }
                />
              </div>
            ))
          )}

          <div className="pt-4">
            <button
              onClick={submitRequest}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Starting Execution...
                </>
              ) : (
                <>
                  <FaRocket size={18} /> Launch Workflow
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-600 mt-4 uppercase tracking-tighter">
              Clicking launch will initiate the workflow engine and start the execution timeline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}