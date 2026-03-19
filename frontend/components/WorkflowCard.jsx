"use client";

import { useRouter } from "next/navigation";
import { FaHistory } from "react-icons/fa";

export default function WorkflowCard({ workflow, onDelete }) {

  const router = useRouter();

  return (

    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-purple-500 transition">

      <h3 className="text-lg font-bold mb-2">
        {workflow.name}
      </h3>

      <p className="text-gray-400 mb-2">
        Version: v{workflow.version}
      </p>

      <div className="flex flex-wrap gap-3 mt-4">

        <button
          onClick={() => router.push(`/admin/workflow/view/${workflow.workflowId}`)}
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition"
        >
          View
        </button>

        <button
          onClick={() => router.push(`/admin/workflow/edit/${workflow.workflowId}`)}
          className="bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          Edit
        </button>

        <button
          onClick={() => router.push(`/admin/workflow/versions/${workflow.workflowId}`)}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
        >
          <FaHistory />
          Versions
        </button>

        <button
          onClick={() => onDelete(workflow.workflowId)}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition"
        >
          Delete
        </button>

      </div>

    </div>

  );

}