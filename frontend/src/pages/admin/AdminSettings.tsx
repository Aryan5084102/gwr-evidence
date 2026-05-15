import { useState } from "react";
import { Save, RotateCcw, Mail, Shield, Bell, Clock, Database, MapPin } from "lucide-react";
import { Card, PageHeader, Button } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { updateSettings, type AdminSettings as TSettings } from "@/redux/admin";
/* TSettings now lives in the slim admin slice and is persisted to localStorage. */
import { useToast } from "@/components/Toaster";

export default function AdminSettings() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const saved = useAppSelector((s) => s.admin.settings);
  const [draft, setDraft] = useState<TSettings>(saved);

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);

  function set<K extends keyof TSettings>(k: K, v: TSettings[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  function save() {
    dispatch(updateSettings(draft));
    toast({ title: "Settings saved", description: "Applied to all future events and alerts.", tone: "success" });
  }

  function reset() {
    setDraft(saved);
    toast({ title: "Reverted unsaved changes", tone: "info" });
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Settings"
        title="Operations settings"
        subtitle="Configure default geo-fence radius, alert thresholds, SLA targets, and audit retention. Changes apply globally."
        actions={
          <>
            {dirty && (
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Revert
              </Button>
            )}
            <Button onClick={save} disabled={!dirty}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionHeader icon={<MapPin className="h-4 w-4 text-royal" />} title="Geo-fence defaults" subtitle="Used when creating new events." />
          <NumberRow
            label="Default geo-fence radius (m)"
            help="Radius around the venue that auto-triggers On-site check-ins."
            value={draft.defaultGeofenceM}
            min={50} max={3000} step={50}
            onChange={(v) => set("defaultGeofenceM", v)}
          />
        </Card>

        <Card>
          <SectionHeader icon={<Bell className="h-4 w-4 text-royal" />} title="Tracking alerts" subtitle="Trigger inbox notifications and audit entries." />
          <NumberRow
            label="Overdue check-in threshold (hours)"
            help="If an adjudicator hasn’t pinged in this many hours during an event, raise a warning."
            value={draft.overdueCheckinHours}
            min={1} max={24}
            onChange={(v) => set("overdueCheckinHours", v)}
          />
          <NumberRow
            label="Low-battery warning at (%)"
            help="Threshold below which devices generate a battery-low alert."
            value={draft.lowBatteryPct}
            min={5} max={50} step={5}
            onChange={(v) => set("lowBatteryPct", v)}
          />
        </Card>

        <Card>
          <SectionHeader icon={<Clock className="h-4 w-4 text-royal" />} title="SLA targets" subtitle="Used by dashboards to flag urgency." />
          <NumberRow
            label="Lead-assignment SLA (days before event)"
            help="A Lead Adjudicator must be assigned at least this many days before the event start."
            value={draft.leadAssignmentSlaDays}
            min={1} max={60}
            onChange={(v) => set("leadAssignmentSlaDays", v)}
          />
        </Card>

        <Card>
          <SectionHeader icon={<Database className="h-4 w-4 text-royal" />} title="Audit retention" subtitle="Controls log lifetime and compliance posture." />
          <NumberRow
            label="Audit log retention (days)"
            help="Entries older than this are archived to cold storage."
            value={draft.auditRetentionDays}
            min={30} max={3650} step={30}
            onChange={(v) => set("auditRetentionDays", v)}
          />
        </Card>

        <Card>
          <SectionHeader icon={<Mail className="h-4 w-4 text-royal" />} title="Communications" />
          <ToggleRow
            label="Email briefing on assignment"
            help="Automatically send a briefing pack when an adjudicator is assigned."
            value={draft.emailOnAssign}
            onChange={(v) => set("emailOnAssign", v)}
          />
        </Card>

        <Card>
          <SectionHeader icon={<Shield className="h-4 w-4 text-royal" />} title="Privacy & consent" />
          <ToggleRow
            label="Require admin approval to re-grant consent"
            help="Withdrawn tracking consent can only be re-enabled with an admin confirmation."
            value={draft.consentRequiresApproval}
            onChange={(v) => set("consentRequiresApproval", v)}
          />
        </Card>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-line p-4 text-[11px] text-muted">
        These settings are stored in the admin Redux store for the live session. In production they'd be persisted server-side and audited.
      </div>
    </>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-soft inline-flex items-center gap-2">{icon} {title}</h3>
      {subtitle && <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>}
    </div>
  );
}

function NumberRow({
  label, help, value, min, max, step = 1, onChange,
}: {
  label: string;
  help?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="py-3 border-t border-line first:border-t-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-soft">{label}</div>
          {help && <div className="text-[11px] text-muted mt-0.5 max-w-md">{help}</div>}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="accent-royal w-40"
          />
          <input
            type="number"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="input w-24 py-1 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, help, value, onChange }: { label: string; help?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="py-3 border-t border-line first:border-t-0 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-soft">{label}</div>
        {help && <div className="text-[11px] text-muted mt-0.5 max-w-md">{help}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition shrink-0 ${value ? "bg-royal" : "bg-slate-300"}`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${value ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}
