import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, Fingerprint, ShieldCheck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => navigate("/dashboard"), 600);
      }}
      className="w-full max-w-md panel p-8 ring-gold animate-fadeIn"
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Secure Sign In</div>
      <h2 className="text-2xl font-bold tracking-tight">Welcome back, adjudicator.</h2>
      <p className="text-sm text-muted mt-1">Access your authorized evidence workspace.</p>

      <div className="mt-6 space-y-3">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-muted">Work email</span>
          <div className="mt-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input className="input pl-9" type="email" defaultValue="e.whitfield@guinnessworldrecords.com" required />
          </div>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-muted">Password</span>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input className="input pl-9" type="password" defaultValue="••••••••" required />
          </div>
        </label>
        <div className="flex items-center justify-between text-xs">
          <label className="inline-flex items-center gap-2 text-muted">
            <input type="checkbox" defaultChecked className="accent-gold" /> Trusted device
          </label>
          <Link to="/forgot-password" className="text-royal hover:text-gold">Forgot password?</Link>
        </div>
      </div>

      <button disabled={loading} className="btn-gold w-full mt-6">
        {loading ? "Verifying…" : <>Continue securely <Fingerprint className="h-4 w-4" /></>}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Protected by multi-factor authentication & SOC 2 Type II controls
      </div>
    </form>
  );
}
