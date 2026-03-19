"use client";

import { useEffect, useState } from "react";

export default function Navbar(){

  const [user,setUser] = useState(null);

  useEffect(()=>{
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    setUser(currentUser);
  },[]);

  return(

    <div className="flex justify-between items-center px-8 py-4 border-b border-gray-800">

      <h2 className="text-lg font-semibold">
        Provision Flow
      </h2>

      {user?.role === "admin" && (

        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 rounded">
          Create Workflow
        </button>

      )}

    </div>

  );
}