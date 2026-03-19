"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import api from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function SignupPage(){

  const router = useRouter();
  const cardRef = useRef(null);

  const [form,setForm] = useState({
    name:"",
    email:"",
    password:"",
    role:"user"
  });

  const [error,setError] = useState("");

  useEffect(()=>{

    const ctx = gsap.context(() => {

      gsap.from(cardRef.current,{
        y:60,
        opacity:0,
        duration:1,
        ease:"power3.out"
      });

    });

    return () => ctx.revert();

  },[]);

  async function handleSubmit(e) {
    e.preventDefault();

    if(!form.name || !form.email || !form.password){
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await api.post("/auth/signup", form);

      if (res.data.token) {
        saveToken(res.data.token);
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        alert("Account created successfully");
        router.push("/login");
      } else {
        setError(res.data.message || "Failed to sign up");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    }
  }

  return(

    <div className="flex items-center justify-center min-h-screen bg-black text-white relative overflow-hidden">

      {/* subtle glow background */}

      <div className="absolute w-[500px] h-[500px] bg-purple-600 blur-[180px] opacity-20"></div>

      <form
        ref={cardRef}
        onSubmit={handleSubmit}
        className="relative bg-gray-900 border border-gray-800 p-10 rounded-xl w-96 shadow-xl"
      >

        <h1 className="text-3xl font-bold mb-8 text-center">
          Create Account
        </h1>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <input
          value={form.name}
          placeholder="Name"
          autoComplete="off"
          className="border border-gray-700 bg-black p-3 w-full mb-4 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          onChange={(e)=>setForm({...form,name:e.target.value})}
        />

        <input
          value={form.email}
          placeholder="Email"
          autoComplete="off"
          className="border border-gray-700 bg-black p-3 w-full mb-4 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          onChange={(e)=>setForm({...form,email:e.target.value})}
        />

        <input
          value={form.password}
          type="password"
          placeholder="Password"
          autoComplete="off"
          className="border border-gray-700 bg-black p-3 w-full mb-4 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          onChange={(e)=>setForm({...form,password:e.target.value})}
        />

        <button
          type="submit"
          disabled={!form.name || !form.email || !form.password}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          Create Account
        </button>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Already have an account?{" "}
          <span
            className="text-purple-400 cursor-pointer hover:underline"
            onClick={()=>router.push("/login")}
          >
            Login
          </span>
        </p>

      </form>

    </div>

  );
}