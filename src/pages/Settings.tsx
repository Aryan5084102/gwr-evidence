import { Card, PageHeader, Button } from "@/components/ui";
import { Lock, Bell, ShieldCheck, Mail } from "lucide-react";
import { useAppSelector } from "@/redux/store";

export default function GenericSettings() {
  const user = useAppSelector((s) => s.auth.user);
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" subtitle="Manage your profile, notifications and security preferences." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-soft flex items-center gap-2"><Mail className="h-4 w-4 text-royal" /> Profile</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Field label="Full name" defaultValue={user?.name} />
            <Field label="Email" defaultValue={user?.email} />
            <Field label="Organization" defaultValue={user?.organization} />
            <Field label="Role" defaultValue={user?.roleLabel} disabled />
          </div>
          <div className="mt-5 flex justify-end"><Button>Save changes</Button></div>
        </Card>

        <Card>
          <h3 className="font-semibold text-soft flex items-center gap-2"><Bell className="h-4 w-4 text-royal" /> Notifications</h3>
          <div className="mt-4 space-y-3 text-sm text-soft">
            {[
              "Email me when a witness submits a statement",
              "Email me when AI flags a high-risk witness",
              "Email me when a clarification is responded to",
              "Send weekly digest of portal activity",
            ].map((l, i) => (
              <label key={l} className="flex items-center justify-between">
                <span>{l}</span>
                <input type="checkbox" defaultChecked={i < 3} className="accent-royal" />
              </label>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-soft flex items-center gap-2"><Lock className="h-4 w-4 text-royal" /> Security</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Field label="Current password" type="password" />
            <Field label="New password" type="password" />
          </div>
          <div className="mt-5 flex justify-end"><Button variant="outline">Update password</Button></div>
        </Card>

        <Card>
          <h3 className="font-semibold text-soft flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-royal" /> Sessions</h3>
          <ul className="mt-3 text-sm text-soft divide-y divide-line">
            <li className="py-2 flex items-center justify-between"><span>Chrome &middot; current device</span><span className="text-emerald-700 text-xs">Active now</span></li>
            <li className="py-2 flex items-center justify-between"><span>Mobile &middot; iOS Safari</span><span className="text-muted text-xs">Yesterday</span></li>
          </ul>
        </Card>
      </div>
    </>
  );
}

function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted">{label}</span>
      <input className="input mt-1" {...p} />
    </label>
  );
}
