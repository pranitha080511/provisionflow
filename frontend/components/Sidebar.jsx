"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaProjectDiagram,
  FaTasks,
  FaPlus,
  FaPlay,
  FaClipboardList,
  FaCheck,
  FaChartBar,
  FaHistory,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser
} from "react-icons/fa";

export default function Sidebar() {

  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const isAdmin = pathname.startsWith("/admin");
  const isUser = pathname.startsWith("/user");

  const linkClass = (path) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
      pathname === path
        ? "bg-purple-600/20 text-purple-400 font-semibold"
        : "text-gray-400 hover:text-white hover:bg-gray-800/60"
    }`;

  const sectionTitle = (title) => (
    <p className="text-xs uppercase tracking-wider text-gray-600 mt-6 mb-2 px-3 font-semibold">{title}</p>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 border border-gray-700 p-2.5 rounded-lg text-white"
      >
        {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 min-h-screen bg-gray-950 border-r border-gray-800
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        <div className="p-6 border-b border-gray-800">
          <Link href={isAdmin ? "/admin" : "/user"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <FaProjectDiagram size={14} />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Provision Flow
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

          {isAdmin && (
            <>
              {sectionTitle("Main")}
              <Link href="/admin" className={linkClass("/admin")} onClick={() => setMobileOpen(false)}>
                <FaChartBar size={16} /> Dashboard
              </Link>

              {sectionTitle("Workflows")}
              <Link href="/admin/workflows" className={linkClass("/admin/workflows")} onClick={() => setMobileOpen(false)}>
                <FaTasks size={16} /> All Workflows
              </Link>
              <Link href="/admin/workflow" className={linkClass("/admin/workflow")} onClick={() => setMobileOpen(false)}>
                <FaPlus size={16} /> Create Workflow
              </Link>

              {sectionTitle("Monitoring")}
              <Link href="/admin/executions" className={linkClass("/admin/executions")} onClick={() => setMobileOpen(false)}>
                <FaPlay size={16} /> Executions
              </Link>
              <Link href="/admin/activity" className={linkClass("/admin/activity")} onClick={() => setMobileOpen(false)}>
                <FaHistory size={16} /> Activity Log
              </Link>
            </>
          )}

          {isUser && (
            <>
              {sectionTitle("Main")}
              <Link href="/user" className={linkClass("/user")} onClick={() => setMobileOpen(false)}>
                <FaChartBar size={16} /> Dashboard
              </Link>

              {sectionTitle("Workflows")}
              <Link href="/user/workflows" className={linkClass("/user/workflows")} onClick={() => setMobileOpen(false)}>
                <FaPlay size={16} /> Available Workflows
              </Link>

              {sectionTitle("Requests")}
              <Link href="/user/requests" className={linkClass("/user/requests")} onClick={() => setMobileOpen(false)}>
                <FaClipboardList size={16} /> My Requests
              </Link>


              {sectionTitle("Account")}
              <Link href="/user/profile" className={linkClass("/user/profile")} onClick={() => setMobileOpen(false)}>
                <FaUser size={16} /> Profile
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-sm font-bold">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (isAdmin ? "A" : "U")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{currentUser?.name || (isAdmin ? "Admin" : "User")}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email || (isAdmin ? "admin@flow.io" : "user@flow.io")}</p>
            </div>
          </div>
          <Link
            href="/"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("currentUser");
            }}
            className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-600/10 transition"
          >
            <FaSignOutAlt size={14} /> Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}