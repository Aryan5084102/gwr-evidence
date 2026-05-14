import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  UploadCloud,
  Sparkles,
  Search,
  GitBranch,
  MessagesSquare,
  ShieldAlert,
  HelpCircle,
  Package,
  BarChart3,
  Lock,
  Trophy,
  ChevronsLeft,
  FileText,
  Users,
  Activity,
  Send,
  UserCheck,
  Timer,
  ClipboardSignature,
} from "lucide-react";
import { useAppDispatch, useAppSelector, toggleSidebar } from "@/redux/store";
import { cn } from "@/lib/utils";

const NAV = [
  { section: "Overview", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ]},
  { section: "Attempt", items: [
    { to: "/submissions/new", label: "Attempt Setup", icon: FilePlus2 },
    { to: "/cover-letter", label: "Cover Letter", icon: FileText },
    { to: "/logbook", label: "Activity Logbook", icon: Activity },
    { to: "/steward-statement", label: "Steward Statement", icon: UserCheck },
    { to: "/timekeeper-statement", label: "Timekeeper Statement", icon: Timer },
    { to: "/witness-statement", label: "Witness Statement", icon: ClipboardSignature },
  ]},
  { section: "Witnesses", items: [
    { to: "/witnesses", label: "Witness System", icon: Users },
    { to: "/witness/sign/wt_8f3a91", label: "Witness Sign (demo)", icon: Send },
  ]},
  { section: "Evidence", items: [
    { to: "/evidence/upload", label: "Evidence Upload", icon: UploadCloud },
    { to: "/review", label: "Evidence Review", icon: ShieldAlert },
    { to: "/package", label: "Submission Package", icon: Package },
  ]},
  { section: "AI", items: [
    { to: "/ai/processing", label: "AI Processing", icon: Sparkles },
    { to: "/search", label: "Smart Search", icon: Search },
    { to: "/timeline", label: "Smart Timeline", icon: GitBranch },
    { to: "/validation", label: "AI Validation", icon: ShieldAlert },
  ]},
  { section: "Collaborate", items: [
    { to: "/collaboration", label: "Collaboration", icon: MessagesSquare },
    { to: "/clarifications", label: "Clarifications", icon: HelpCircle },
    { to: "/report", label: "Report Generation", icon: FileText },
  ]},
  { section: "Governance", items: [
    { to: "/security", label: "Security & Audit", icon: Lock },
  ]},
];

export default function Sidebar() {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const dispatch = useAppDispatch();
  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 bg-white border-r border-line transition-[width] duration-300"
      style={{ width: collapsed ? 72 : 260 }}
    >
      <div className="h-16 flex items-center px-5 border-b border-line">
        <div className="h-9 w-9 rounded-lg bg-royal flex items-center justify-center shrink-0">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-royal font-bold">Glimmora · GWR</div>
            <div className="text-sm font-bold truncate text-soft">Submission OS</div>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="ml-auto btn-ghost !p-1.5"
          aria-label="Toggle sidebar"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
      <nav className="overflow-y-auto h-[calc(100vh-64px)] py-5 px-3">
        {NAV.map((group) => (
          <div key={group.section} className="mb-5">
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">
                {group.section}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative",
                      isActive
                        ? "bg-royal/[0.08] text-royal font-semibold"
                        : "text-soft hover:bg-canvas"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-royal" />
                      )}
                      <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-royal" : "text-muted")} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
