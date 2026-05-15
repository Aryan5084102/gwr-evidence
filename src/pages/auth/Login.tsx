import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Fingerprint, ShieldCheck, UserCheck, Gavel, Megaphone, ShieldHalf } from "lucide-react";
import { useAppDispatch, login, MOCK_CREDENTIALS, type Role } from "@/redux/store";

const ROLES: { key: Role; label: string; email: string; password: string; Icon: any; tag: string }[] = [
  { key: "witness", label: "Witness", email: "witness@gwr.com", password: "Witness@123", Icon: UserCheck, tag: "Independent verification" },
  { key: "adjudicator", label: "Adjudicator", email: "adjudicator@gwr.com", password: "Adjudicator@123", Icon: Gavel, tag: "Official GWR review" },
  { key: "organizer", label: "Organizer", email: "organizer@gwr.com", password: "Organizer@123", Icon: Megaphone, tag: "Event submission" },
  { key: "admin", label: "Admin", email: "admin@gwr.com", password: "Admin@123", Icon: ShieldHalf, tag: "GWR Operations" },
];

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [role, setRole] = useState<Role>("adjudicator");
  const [email, setEmail] = useState("adjudicator@gwr.com");
  const [password, setPassword] = useState("Adjudicator@123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function pickRole(r: Role) {
    setRole(r);
    const m = ROLES.find((x) => x.key === r)!;
    setEmail(m.email);
    setPassword(m.password);
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const record = MOCK_CREDENTIALS[email.toLowerCase().trim()];
      if (!record || record.password !== password) {
        setLoading(false);
        setError("Invalid email or password. Use one of the sample credentials below.");
        return;
      }
      dispatch(login(record.user));
      if (record.user.role === "organizer") navigate("/dashboard");
      else if (record.user.role === "witness") navigate("/witness");
      else navigate(`/${record.user.role}/dashboard`);
    }, 450);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md panel p-8 ring-gold animate-fadeIn">
      <div className="text-[10px] uppercase tracking-[0.2em] text-royal font-bold mb-2">Secure Sign In</div>
      <h2 className="text-2xl font-bold tracking-tight text-soft">Witness &amp; Adjudicator Portal</h2>
      <p className="text-sm text-muted mt-1">Sign in to your authorized GWR verification workspace.</p>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {ROLES.map((r) => {
          const active = role === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => pickRole(r.key)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                active ? "border-royal bg-royal/[0.06]" : "border-line bg-white hover:border-royal/40"
              }`}
            >
              <r.Icon className={`h-4 w-4 ${active ? "text-royal" : "text-muted"}`} />
              <div className={`mt-2 text-[12px] font-semibold ${active ? "text-royal" : "text-soft"}`}>{r.label}</div>
              <div className="text-[10px] text-muted leading-tight">{r.tag}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-muted">Work email</span>
          <div className="mt-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              className="input pl-9"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-muted">Password</span>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              className="input pl-9"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </label>
        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <label className="inline-flex items-center gap-2 text-muted">
            <input type="checkbox" defaultChecked className="accent-royal" /> Trusted device
          </label>
          <span className="text-royal/70">SSO &middot; SAML available</span>
        </div>
      </div>

      <button disabled={loading} className="btn-primary w-full mt-6">
        {loading ? "Verifying credentials…" : <>Sign in securely <Fingerprint className="h-4 w-4" /></>}
      </button>

      <div className="mt-5 rounded-lg bg-canvas border border-line p-3 text-[11px] text-muted leading-relaxed">
        <div className="font-semibold text-soft mb-1.5">Sample credentials</div>
        <div className="grid grid-cols-1 gap-1">
          <div><span className="text-royal font-medium">Witness</span> &middot; witness@gwr.com / Witness@123</div>
          <div><span className="text-royal font-medium">Adjudicator</span> &middot; adjudicator@gwr.com / Adjudicator@123</div>
          <div><span className="text-royal font-medium">Organizer</span> &middot; organizer@gwr.com / Organizer@123</div>
          <div><span className="text-royal font-medium">Admin</span> &middot; admin@gwr.com / Admin@123</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-royal" /> Protected by multi-factor authentication &amp; SOC 2 Type II controls
      </div>
    </form>
  );
}
