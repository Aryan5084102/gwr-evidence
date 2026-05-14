import { Bell, Search, ShieldCheck, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector, setSearchOpen } from "@/redux/store";

export default function TopNavbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-4 px-6 lg:px-8 border-b border-line bg-white/95 backdrop-blur">
      <button
        onClick={() => dispatch(setSearchOpen(true))}
        className="flex-1 max-w-xl flex items-center gap-2 rounded-xl bg-canvas border border-line px-3 py-2 text-sm text-muted hover:border-royal/40 transition-all"
      >
        <Search className="h-4 w-4" />
        <span>Ask the AI · &ldquo;Show all crowd images after midnight&rdquo;</span>
        <kbd className="ml-auto chip !text-[10px]">⌘K</kbd>
      </button>
      <div className="hidden md:flex items-center gap-2 chip">
        <ShieldCheck className="h-3.5 w-3.5 text-royal" />
        Secure session · TLS 1.3
      </div>
      <button className="btn-ghost relative !p-2" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />
      </button>
      <div className="flex items-center gap-3 pl-3 border-l border-line">
        <div className="h-9 w-9 rounded-full bg-royal text-white flex items-center justify-center font-semibold text-sm">
          {user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="hidden lg:block">
          <div className="text-sm font-semibold leading-tight text-soft">{user?.name}</div>
          <div className="text-[11px] text-muted">{user?.role}</div>
        </div>
        <ChevronDown className="hidden lg:block h-4 w-4 text-muted" />
      </div>
    </header>
  );
}
