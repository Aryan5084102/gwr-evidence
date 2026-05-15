import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import SearchOverlay from "@/components/SearchOverlay";
import CommandPalette from "@/components/CommandPalette";
import NotificationPanel from "@/components/NotificationPanel";
import { useAppSelector, type Role } from "@/redux/store";

export default function DashboardLayout({ requireRole }: { requireRole?: Role }) {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const auth = useAppSelector((s) => s.auth);

  if (!auth.isAuthenticated || !auth.user) {
    return <Navigate to="/login" replace />;
  }
  if (requireRole && auth.user.role !== requireRole) {
    return <Navigate to={`/${auth.user.role}/dashboard`} replace />;
  }

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
      <CommandPalette />
      <NotificationPanel />
    </div>
  );
}
