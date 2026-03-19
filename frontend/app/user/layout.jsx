import Sidebar from "@/components/Sidebar";

export default function UserLayout({ children }) {
  return (
    <div className="flex bg-black text-white min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <div className="flex justify-between items-center border-b border-gray-800 px-4 lg:px-8 py-4">
          <h1 className="text-lg font-semibold ml-12 lg:ml-0">
            Client Portal
          </h1>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-4 lg:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
