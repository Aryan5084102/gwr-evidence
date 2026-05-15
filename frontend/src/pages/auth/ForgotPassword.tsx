import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  return (
    <form className="w-full max-w-md panel p-8 ring-gold animate-fadeIn">
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Recovery</div>
      <h2 className="text-2xl font-bold">Reset your access</h2>
      <p className="text-sm text-muted mt-1">
        We&rsquo;ll email a verification link to your registered work address.
      </p>
      <label className="block mt-6">
        <span className="text-[11px] uppercase tracking-wider text-muted">Work email</span>
        <div className="mt-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input className="input pl-9" type="email" placeholder="name@guinnessworldrecords.com" />
        </div>
      </label>
      <button className="btn-gold w-full mt-5">Send recovery link</button>
      <Link to="/login" className="mt-4 text-xs text-muted hover:text-soft inline-flex items-center gap-1">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </Link>
    </form>
  );
}
