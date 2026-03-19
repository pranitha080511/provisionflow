"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ExecuteWorkflow() {

  const { workflowId } = useParams();
  const router = useRouter();

  const [workflow, setWorkflow] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    async function fetchWorkflow() {
      try {
        const res = await api.get(`/workflows/${workflowId}`);
        setWorkflow(res.data.workflow);
      } catch (err) {
        console.error("Failed to fetch workflow", err);
      }
    }
    fetchWorkflow();
  }, [workflowId]);

  const submitRequest = async () => {
    try {
      await api.post(`/workflows/${workflowId}/execute`, {
        input_data: formData,
      });

      alert("Request Submitted");
      router.push("/user");
    } catch (err) {
      console.error(err);
      alert("Failed to submit request: " + (err.response?.data?.message || err.message));
    }
  };

  if (!workflow) {
    return (
      <div className="text-white p-10">
        Loading...
      </div>
    );
  }

  return (

    <div className="bg-black text-white min-h-screen flex justify-center items-center p-10">

      <div className="w-full max-w-3xl bg-gray-900 border border-gray-800 p-8 rounded-xl">

        <h1 className="text-2xl font-bold mb-8">
          {workflow.name}
        </h1>

        {(workflow.input_schema || []).map((input, index) => (

          <div key={index} className="mb-6">

            <label className="block text-sm text-gray-300 mb-2">

              {input.label}

              <span className="text-gray-500 ml-2 text-xs">
                ({input.type})
              </span>

            </label>

            <input
              type={input.type || "text"}
              placeholder={`Enter ${input.label}`}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [input.label]: e.target.value
                })
              }
            />

          </div>

        ))}

        <button
          onClick={submitRequest}
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          Submit Request
        </button>

      </div>

    </div>

  );

}