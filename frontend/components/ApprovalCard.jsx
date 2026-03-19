"use client";

import api from "@/lib/api";

export default function ApprovalCard({req}){

  async function approve(){
    await api.post(`/approvals/${req.id}/approve`);
  }

  async function reject(){
    await api.post(`/approvals/${req.id}/reject`);
  }

  return(
    <div className="border p-4 mb-3">

      <p>{req.title}</p>

      <button
        onClick={approve}
        className="bg-green-600 text-white px-3 py-1 mr-2"
      >
        Approve
      </button>

      <button
        onClick={reject}
        className="bg-red-600 text-white px-3 py-1"
      >
        Reject
      </button>

    </div>
  );
}