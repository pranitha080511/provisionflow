"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  FaUserCircle,
  FaEnvelope,
  FaIdBadge,
  FaCalendarAlt,
  FaShieldAlt,
  FaLock,
} from "react-icons/fa";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you might fetch user profile from an endpoint like /auth/me
    // Since we store currentUser in localStorage for now:
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Fallback or handle missing user
        setUser({
          name: "Unknown User",
          email: "No email available",
          role: "user",
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to load user profile", err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your account details and personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* LEFT COLUMN - USER CARD */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-lg shadow-purple-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h2 className="text-xl font-bold">{user?.name || "Client User"}</h2>
            <p className="text-gray-400 text-sm mt-1 mb-4">
              {user?.email || "client@flow.io"}
            </p>
            <span className="bg-purple-600/15 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <FaShieldAlt size={10} /> {user?.role || "User"}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN - DETAILS */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
              <FaIdBadge className="text-purple-400" /> Account Information
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-800/50 rounded-xl flex items-center justify-center shrink-0">
                  <FaUserCircle className="text-gray-400" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Full Name
                  </p>
                  <p className="text-sm font-medium mt-1 text-white">
                    {user?.name || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-800/50 rounded-xl flex items-center justify-center shrink-0">
                  <FaEnvelope className="text-gray-400" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Email Address
                  </p>
                  <p className="text-sm font-medium mt-1 text-white">
                    {user?.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-800/50 rounded-xl flex items-center justify-center shrink-0">
                  <FaShieldAlt className="text-gray-400" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Account Role
                  </p>
                  <p className="text-sm font-medium mt-1 text-white capitalize">
                    {user?.role || "User"} Access
                  </p>
                </div>
              </div>

            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                 <h3 className="text-base font-semibold text-purple-100 flex items-center gap-2 mb-2">
                   <FaLock className="text-purple-400" size={14} /> Password & Security
                 </h3>
                 <p className="text-xs text-purple-300/60 leading-relaxed max-w-sm">
                   Your account is securely managed. To change your password or security settings, please contact an administrator.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
