import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui";
import type { AdminAdjudicator } from "@/mock-data/admin";

interface Props {
  open: boolean;
  initial?: AdminAdjudicator | null;
  onClose: () => void;
  onSubmit: (a: AdminAdjudicator) => void;
}

const REGIONS: AdminAdjudicator["region"][] = ["Europe", "Americas", "Asia-Pacific", "MEA"];
const STATUSES: AdminAdjudicator["status"][] = ["Active", "On leave", "Suspended"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "AA";
}

function newId() {
  return `ADJ-${String(Math.floor(Math.random() * 900) + 100)}`;
}

export default function AdjudicatorFormModal({ open, initial, onClose, onSubmit }: Props) {
  const isEdit = !!initial;

  const empty: AdminAdjudicator = {
    id: newId(),
    name: "",
    email: "",
    initials: "AA",
    homeCity: "",
    homeCountry: "",
    region: "Europe",
    specialties: [],
    languages: [],
    rating: 4.5,
    yearsExperience: 1,
    status: "Active",
    certifications: [],
  };

  const [form, setForm] = useState<AdminAdjudicator>(initial ?? empty);
  const [specInput, setSpecInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [certInput, setCertInput] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initial ?? { ...empty, id: newId() });
      setSpecInput("");
      setLangInput("");
      setCertInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  function set<K extends keyof AdminAdjudicator>(k: K, v: AdminAdjudicator[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addTo(field: "specialties" | "languages" | "certifications", value: string, clear: () => void) {
    const v = value.trim();
    if (!v) return;
    if (form[field].includes(v)) { clear(); return; }
    set(field, [...form[field], v]);
    clear();
  }

  function removeFrom(field: "specialties" | "languages" | "certifications", value: string) {
    set(field, form[field].filter((x) => x !== value));
  }

  const valid = form.name.trim() && form.email.trim();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit adjudicator · ${form.name}` : "Onboard new adjudicator"}
      subtitle={isEdit ? "Update profile, specialties, and field status." : "Add a new GWR adjudicator to the roster."}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => valid && onSubmit({ ...form, initials: initials(form.name) })} disabled={!valid}>
            {isEdit ? "Save changes" : "Add adjudicator"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full name">
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Dr. Marcus Hollingsworth" />
        </Field>
        <Field label="Work email">
          <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@gwr.com" />
        </Field>

        <Field label="Home city">
          <input className="input" value={form.homeCity} onChange={(e) => set("homeCity", e.target.value)} />
        </Field>
        <Field label="Home country">
          <input className="input" value={form.homeCountry} onChange={(e) => set("homeCountry", e.target.value)} />
        </Field>

        <Field label="Region">
          <select className="input" value={form.region} onChange={(e) => set("region", e.target.value as AdminAdjudicator["region"])}>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" value={form.status} onChange={(e) => set("status", e.target.value as AdminAdjudicator["status"])}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Years experience">
          <input type="number" min={0} className="input" value={form.yearsExperience} onChange={(e) => set("yearsExperience", Number(e.target.value))} />
        </Field>
        <Field label="Rating (0–5)">
          <input type="number" step="0.1" min={0} max={5} className="input" value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} />
        </Field>

        <TagField
          full
          label="Specialties"
          placeholder="Add a specialty (Enter)"
          value={specInput}
          onChange={setSpecInput}
          tags={form.specialties}
          onAdd={() => addTo("specialties", specInput, () => setSpecInput(""))}
          onRemove={(v) => removeFrom("specialties", v)}
        />
        <TagField
          full
          label="Languages"
          placeholder="Add a language (Enter)"
          value={langInput}
          onChange={setLangInput}
          tags={form.languages}
          onAdd={() => addTo("languages", langInput, () => setLangInput(""))}
          onRemove={(v) => removeFrom("languages", v)}
        />
        <TagField
          full
          label="Certifications"
          placeholder="Add a certification (Enter)"
          value={certInput}
          onChange={setCertInput}
          tags={form.certifications}
          onAdd={() => addTo("certifications", certInput, () => setCertInput(""))}
          onRemove={(v) => removeFrom("certifications", v)}
        />
      </div>
    </Modal>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-wider text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function TagField({
  label, placeholder, value, onChange, tags, onAdd, onRemove, full,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  tags: string[];
  onAdd: () => void;
  onRemove: (v: string) => void;
  full?: boolean;
}) {
  return (
    <div className={`${full ? "md:col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <input
          className="input flex-1"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <button type="button" onClick={onAdd} className="btn-ghost">Add</button>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-canvas border border-line text-[11px] px-2 py-0.5 text-soft">
              {t}
              <button type="button" onClick={() => onRemove(t)} className="text-muted hover:text-rose-600 ml-1" aria-label={`Remove ${t}`}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
