"use client";

import { useEffect,useState } from "react";

export default function Requests(){

  const [requests,setRequests] = useState([]);

  useEffect(()=>{

    const data =
      JSON.parse(localStorage.getItem("requests")) || [];

    setRequests(data);

  },[]);

  return(

    <div className="p-10 text-white bg-black min-h-screen">

      <h1 className="text-2xl mb-6">
        My Requests
      </h1>

      {requests.map(req=>(
        <div
          key={req.id}
          className="border border-gray-800 bg-gray-900 p-4 mb-4 rounded"
        >

          <p className="font-bold">{req.workflowName}</p>

          <p>Status:
            <span className={
              req.status==="approved"
                ? "text-green-400 ml-2"
                : req.status==="waiting"
                ? "text-yellow-400 ml-2"
                : "text-red-400 ml-2"
            }>
              {req.status==="waiting"
                ? "Waiting for Approval"
                : req.status}
            </span>
          </p>

        </div>
      ))}

    </div>

  );

}