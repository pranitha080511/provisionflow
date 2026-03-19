"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkflowForm() {

  const router = useRouter();

  const [name,setName] = useState("");
  const [description,setDescription] = useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    const workflows =
      JSON.parse(localStorage.getItem("workflows")) || [];

    workflows.push({
      id: Date.now(),
      name,
      description
    });

    localStorage.setItem(
      "workflows",
      JSON.stringify(workflows)
    );

    router.push("/admin");

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-lg"
    >

      <div>

        <label className="block mb-2">
          Workflow Name
        </label>

        <input
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
          placeholder="Enter workflow name"
          onChange={(e)=>setName(e.target.value)}
          required
        />

      </div>

      <div>

        <label className="block mb-2">
          Description
        </label>

        <textarea
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
          placeholder="Enter workflow description"
          onChange={(e)=>setDescription(e.target.value)}
          required
        />

      </div>

      <button
        className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 rounded"
      >
        Save Workflow
      </button>

    </form>

  );

}