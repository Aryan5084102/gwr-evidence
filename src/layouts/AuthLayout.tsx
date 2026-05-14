import { Outlet } from "react-router-dom";
import { Trophy } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-canvas">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 w-1/2 overflow-hidden bg-gradient-to-br from-royal to-royal-400 text-white">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white text-royal flex items-center justify-center shadow-panel">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/85">Guinness World Records</div>
            <div className="font-bold">Evidence Submission Platform</div>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Where world records are <span className="text-gold-300">verified</span> with precision.
          </h1>
          <p className="mt-4 text-white/90">
            A secure, AI-assisted evidence intelligence workspace used by adjudicators,
            record holders, and verification teams across the globe.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { v: "12.4M", l: "Evidence items" },
              { v: "180+", l: "Countries" },
              { v: "99.98%", l: "Audit integrity" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/15 border border-white/30 p-4 backdrop-blur">
                <div className="text-xl font-bold text-white">{s.v}</div>
                <div className="text-[11px] uppercase tracking-wider text-white/85 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-white/75">
          © {new Date().getFullYear()} Guinness World Records Limited · Confidential adjudication system
        </div>
      </aside>
      <main className="flex-1 flex items-center justify-center p-6 bg-white">
        <Outlet />
      </main>
    </div>
  );
}
