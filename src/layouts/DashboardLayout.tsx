import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import SearchOverlay from "@/components/SearchOverlay";
import { useAppSelector } from "@/redux/store";

export default function DashboardLayout() {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-w-0 transition-[margin] duration-300 bg-canvas"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        <TopNavbar />
        <main className="flex-1 p-6 lg:p-10 animate-fadeIn max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <SearchOverlay />
    </div>
  );
}
