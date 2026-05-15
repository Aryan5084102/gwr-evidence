/* GWR Witness & Adjudicator Portal — mock data */

export type WitnessStatus =
  | "Invited"
  | "Profile Submitted"
  | "Pending Approval"
  | "Approved"
  | "Clarification Requested"
  | "Rejected";

export interface Attempt {
  id: string;
  title: string;
  category: string;
  organizer: string;
  organizerInitials: string;
  venue: string;
  city: string;
  country: string;
  startISO: string;
  endISO: string;
  status: "Upcoming" | "Live" | "Submitted" | "Under Review" | "Approved" | "Rejected";
  participantCount: number;
  description: string;
  guidelinesRef: string;
  witnessIds: string[];
  evidenceCount: number;
  coveragePct: number;
}

export interface Witness {
  id: string;
  name: string;
  email: string;
  organization: string;
  expertise: string;
  country: string;
  status: WitnessStatus;
  attemptId: string;
  invitedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  riskScore: number;
  duration: { coveredHours: number; requiredHours: number };
  initials: string;
}

export interface AIInsight {
  id: string;
  label: string;
  detail: string;
  status: "pass" | "warn" | "fail";
  confidence: number;
}

export interface ActivityEvent {
  id: string;
  ts: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  tone?: "info" | "success" | "warning" | "danger";
}

export interface Clarification {
  id: string;
  attemptId: string;
  witnessId?: string;
  subject: string;
  from: string;
  to: string;
  status: "Open" | "Responded" | "Closed";
  openedAt: string;
  preview: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  ts: string;
  unread: boolean;
  tone: "info" | "success" | "warning";
  role: "witness" | "adjudicator" | "organizer" | "all";
}

export interface EvidenceItem {
  id: string;
  attemptId: string;
  name: string;
  kind: "Video" | "Photo" | "Document" | "Audio" | "Log";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  duration?: string;
  aiScore?: number;
  status: "Indexed" | "Processing" | "Flagged" | "Approved";
}

/* ---------------- Attempts ---------------- */
export const attempts: Attempt[] = [
  {
    id: "GWR-2026-0411",
    title: "Longest continuous violin performance by an ensemble",
    category: "Music & Performing Arts",
    organizer: "Priya Sharma — Aurora Events International",
    organizerInitials: "PS",
    venue: "Royal Albert Hall · Main Stage",
    city: "London",
    country: "United Kingdom",
    startISO: "2026-05-12T09:00:00Z",
    endISO: "2026-05-15T09:00:00Z",
    status: "Under Review",
    participantCount: 24,
    description:
      "A 72-hour continuous violin performance by a 24-member ensemble, observed by independent " +
      "musicologists and timekeepers. Performance subject to a strict 5-minute-per-hour rest accrual " +
      "policy and continuous audio capture.",
    guidelinesRef: "GWR-GL-2026-MUS-117",
    witnessIds: ["w1", "w2", "w3"],
    evidenceCount: 184,
    coveragePct: 87,
  },
  {
    id: "GWR-2026-0418",
    title: "Largest simultaneous origami crane folding",
    category: "Mass Participation",
    organizer: "Origami Tokyo Foundation",
    organizerInitials: "OT",
    venue: "Tokyo Big Sight · Hall A",
    city: "Tokyo",
    country: "Japan",
    startISO: "2026-04-22T01:00:00Z",
    endISO: "2026-04-22T04:00:00Z",
    status: "Submitted",
    participantCount: 4280,
    description:
      "Coordinated mass attempt requiring simultaneous folding of a verified crane within 30 minutes " +
      "by all participants, with steward sign-off per zone.",
    guidelinesRef: "GWR-GL-2026-MASS-042",
    witnessIds: ["w2", "w4"],
    evidenceCount: 62,
    coveragePct: 100,
  },
  {
    id: "GWR-2026-0501",
    title: "Fastest marathon in a full firefighter uniform",
    category: "Athletics",
    organizer: "Berlin Fire & Rescue Athletics",
    organizerInitials: "BF",
    venue: "Berlin Marathon Route",
    city: "Berlin",
    country: "Germany",
    startISO: "2026-05-03T08:00:00Z",
    endISO: "2026-05-03T13:30:00Z",
    status: "Live",
    participantCount: 1,
    description:
      "Solo marathon attempt in full structural firefighter PPE including SCBA. Continuous GPS " +
      "tracking, two course witnesses, and on-bike camera coverage.",
    guidelinesRef: "GWR-GL-2026-ATH-009",
    witnessIds: ["w1", "w5"],
    evidenceCount: 41,
    coveragePct: 64,
  },
  {
    id: "GWR-2026-0509",
    title: "Most consecutive chess games played simultaneously",
    category: "Mind Sports",
    organizer: "Reykjavík Chess Federation",
    organizerInitials: "RC",
    venue: "Harpa Concert Hall",
    city: "Reykjavík",
    country: "Iceland",
    startISO: "2026-05-09T09:00:00Z",
    endISO: "2026-05-10T03:00:00Z",
    status: "Upcoming",
    participantCount: 312,
    description:
      "A FIDE-rated grandmaster plays 312 consecutive simultaneous games against pre-vetted " +
      "opponents, with a minimum 60% win rate required for ratification.",
    guidelinesRef: "GWR-GL-2026-MIND-014",
    witnessIds: ["w3", "w4"],
    evidenceCount: 0,
    coveragePct: 0,
  },
];

/* ---------------- Witnesses ---------------- */
export const witnesses: Witness[] = [
  {
    id: "w1",
    name: "Dr. Marcus Hollingsworth",
    email: "witness@gwr.com",
    organization: "Royal Society of Sports Science",
    expertise: "Sports physiology, ultra-endurance verification",
    country: "United Kingdom",
    status: "Pending Approval",
    attemptId: "GWR-2026-0411",
    invitedAt: "2026-04-30T10:00:00Z",
    submittedAt: "2026-05-13T16:20:00Z",
    riskScore: 12,
    duration: { coveredHours: 24, requiredHours: 24 },
    initials: "MH",
  },
  {
    id: "w2",
    name: "Prof. Aiko Nakamura",
    email: "a.nakamura@toudai.ac.jp",
    organization: "University of Tokyo · Musicology",
    expertise: "Concert performance, music notation, timing",
    country: "Japan",
    status: "Approved",
    attemptId: "GWR-2026-0411",
    invitedAt: "2026-04-28T09:00:00Z",
    submittedAt: "2026-05-13T11:05:00Z",
    approvedAt: "2026-05-14T08:40:00Z",
    riskScore: 4,
    duration: { coveredHours: 24, requiredHours: 24 },
    initials: "AN",
  },
  {
    id: "w3",
    name: "Étienne Lacroix",
    email: "e.lacroix@conservatoire.fr",
    organization: "Conservatoire de Paris",
    expertise: "Classical performance, ensemble integrity",
    country: "France",
    status: "Clarification Requested",
    attemptId: "GWR-2026-0411",
    invitedAt: "2026-04-29T13:00:00Z",
    submittedAt: "2026-05-13T22:10:00Z",
    riskScore: 38,
    duration: { coveredHours: 18, requiredHours: 24 },
    initials: "ÉL",
  },
  {
    id: "w4",
    name: "Sana Karim",
    email: "s.karim@masslab.org",
    organization: "Mass Participation Lab",
    expertise: "Crowd verification, simultaneous event sampling",
    country: "United Arab Emirates",
    status: "Approved",
    attemptId: "GWR-2026-0418",
    invitedAt: "2026-04-14T10:00:00Z",
    submittedAt: "2026-04-22T05:00:00Z",
    approvedAt: "2026-04-22T11:30:00Z",
    riskScore: 6,
    duration: { coveredHours: 3, requiredHours: 3 },
    initials: "SK",
  },
  {
    id: "w5",
    name: "Lt. Hannah Becker",
    email: "h.becker@berlinfire.de",
    organization: "Berlin Fire Department",
    expertise: "Firefighting PPE compliance",
    country: "Germany",
    status: "Profile Submitted",
    attemptId: "GWR-2026-0501",
    invitedAt: "2026-04-20T10:00:00Z",
    submittedAt: "2026-05-01T18:00:00Z",
    riskScore: 9,
    duration: { coveredHours: 5.5, requiredHours: 5.5 },
    initials: "HB",
  },
  {
    id: "w6",
    name: "Dr. Olu Adeyemi",
    email: "o.adeyemi@lagos.edu.ng",
    organization: "University of Lagos",
    expertise: "Game theory, chess arbitration (FIDE IA)",
    country: "Nigeria",
    status: "Invited",
    attemptId: "GWR-2026-0509",
    invitedAt: "2026-05-02T08:00:00Z",
    riskScore: 0,
    duration: { coveredHours: 0, requiredHours: 18 },
    initials: "OA",
  },
];

/* ---------------- AI Insights ---------------- */
export const aiInsights: AIInsight[] = [
  { id: "ai1", label: "Signature detected", detail: "Digital pen-trace verified against pad sample.", status: "pass", confidence: 0.98 },
  { id: "ai2", label: "Identity verified", detail: "Passport OCR matched declared name.", status: "pass", confidence: 0.95 },
  { id: "ai3", label: "Required duration covered", detail: "Witness reported 24 / 24 hours.", status: "pass", confidence: 0.92 },
  { id: "ai4", label: "Missing timeline section", detail: "No annotation between 02:00–04:00 UTC.", status: "warn", confidence: 0.71 },
  { id: "ai5", label: "Witness overlap conflict", detail: "Overlap with Witness #w3 of 18 minutes.", status: "warn", confidence: 0.66 },
  { id: "ai6", label: "Declaration text intact", detail: "No tampering detected in signed PDF.", status: "pass", confidence: 0.99 },
];

/* ---------------- Activity feed ---------------- */
export const activityFeed: ActivityEvent[] = [
  { id: "a1", ts: "2026-05-15T09:42:00Z", actor: "Eleanor Whitfield", actorRole: "Adjudicator", action: "approved witness statement", target: "Prof. Aiko Nakamura", tone: "success" },
  { id: "a2", ts: "2026-05-15T09:14:00Z", actor: "AI Validator", actorRole: "System", action: "flagged timeline gap", target: "Étienne Lacroix · 02:00–04:00", tone: "warning" },
  { id: "a3", ts: "2026-05-15T08:55:00Z", actor: "Priya Sharma", actorRole: "Organizer", action: "invited witness", target: "Dr. Olu Adeyemi · GWR-2026-0509", tone: "info" },
  { id: "a4", ts: "2026-05-15T08:11:00Z", actor: "Dr. Marcus Hollingsworth", actorRole: "Witness", action: "submitted statement", target: "GWR-2026-0411", tone: "info" },
  { id: "a5", ts: "2026-05-14T22:30:00Z", actor: "Eleanor Whitfield", actorRole: "Adjudicator", action: "requested clarification from", target: "Étienne Lacroix", tone: "warning" },
  { id: "a6", ts: "2026-05-14T18:00:00Z", actor: "AI Validator", actorRole: "System", action: "verified signatures on 14 statements", target: "batch · GWR-2026-0418", tone: "success" },
  { id: "a7", ts: "2026-05-14T15:22:00Z", actor: "Priya Sharma", actorRole: "Organizer", action: "uploaded evidence batch", target: "12 video files · GWR-2026-0411", tone: "info" },
];

/* ---------------- Clarifications ---------------- */
export const clarifications: Clarification[] = [
  {
    id: "c1",
    attemptId: "GWR-2026-0411",
    witnessId: "w3",
    subject: "Timeline gap between 02:00 and 04:00 UTC",
    from: "Eleanor Whitfield",
    to: "Étienne Lacroix",
    status: "Open",
    openedAt: "2026-05-14T22:30:00Z",
    preview: "Could you clarify what your station coverage was during the gap flagged by the AI validator?",
  },
  {
    id: "c2",
    attemptId: "GWR-2026-0411",
    witnessId: "w1",
    subject: "Measurement device calibration timestamp",
    from: "Eleanor Whitfield",
    to: "Dr. Marcus Hollingsworth",
    status: "Responded",
    openedAt: "2026-05-13T19:00:00Z",
    preview: "Calibrated against NIST-traceable reference at 08:55Z; certificate attached as evidence #E-118.",
  },
  {
    id: "c3",
    attemptId: "GWR-2026-0501",
    subject: "Additional GPS waypoint requested between km 28–32",
    from: "Eleanor Whitfield",
    to: "Priya Sharma",
    status: "Open",
    openedAt: "2026-05-03T11:00:00Z",
    preview: "Please provide on-bike camera footage covering km 28–32 to confirm uninterrupted attempt continuity.",
  },
];

/* ---------------- Notifications ---------------- */
export const notifications: NotificationItem[] = [
  { id: "n1", title: "New witness invitation", detail: "Aurora Events invited you to witness GWR-2026-0411.", ts: "2026-05-13T08:00:00Z", unread: true, tone: "info", role: "witness" },
  { id: "n2", title: "Clarification requested", detail: "Adjudicator requested additional notes on timeline.", ts: "2026-05-14T22:31:00Z", unread: true, tone: "warning", role: "witness" },
  { id: "n3", title: "Statement approved", detail: "Your statement for GWR-2026-0418 was approved.", ts: "2026-04-22T11:30:00Z", unread: false, tone: "success", role: "witness" },
  { id: "n4", title: "Witness submitted statement", detail: "Dr. Marcus Hollingsworth submitted his statement.", ts: "2026-05-13T16:20:00Z", unread: true, tone: "info", role: "adjudicator" },
  { id: "n5", title: "AI flagged 2 conflicts", detail: "Witness overlap and timeline gap flagged on GWR-2026-0411.", ts: "2026-05-15T09:14:00Z", unread: true, tone: "warning", role: "adjudicator" },
  { id: "n6", title: "Submission ready for review", detail: "GWR-2026-0418 evidence bundle is at 100% coverage.", ts: "2026-04-22T05:30:00Z", unread: false, tone: "success", role: "organizer" },
  { id: "n7", title: "Witness declined invitation", detail: "Étienne Lacroix asked for scheduling changes.", ts: "2026-05-01T12:00:00Z", unread: true, tone: "warning", role: "organizer" },
];

/* ---------------- Evidence ---------------- */
export const evidence: EvidenceItem[] = [
  { id: "E-101", attemptId: "GWR-2026-0411", name: "Main_Stage_Cam_A_03.mp4", kind: "Video", size: "8.2 GB", uploadedBy: "Priya Sharma", uploadedAt: "2026-05-13T11:00:00Z", duration: "11:58:14", aiScore: 96, status: "Approved" },
  { id: "E-102", attemptId: "GWR-2026-0411", name: "Wide_Pan_Audience_2.mp4", kind: "Video", size: "5.1 GB", uploadedBy: "Priya Sharma", uploadedAt: "2026-05-13T11:14:00Z", duration: "06:12:00", aiScore: 91, status: "Indexed" },
  { id: "E-103", attemptId: "GWR-2026-0411", name: "Timekeeper_Log_Final.pdf", kind: "Document", size: "2.4 MB", uploadedBy: "Aurora Events", uploadedAt: "2026-05-15T08:00:00Z", aiScore: 99, status: "Approved" },
  { id: "E-104", attemptId: "GWR-2026-0411", name: "Audio_Master_Stage.wav", kind: "Audio", size: "12.0 GB", uploadedBy: "Sound Lead", uploadedAt: "2026-05-15T08:12:00Z", duration: "72:01:08", aiScore: 88, status: "Processing" },
  { id: "E-105", attemptId: "GWR-2026-0411", name: "Witness_Statement_Lacroix.pdf", kind: "Document", size: "412 KB", uploadedBy: "Étienne Lacroix", uploadedAt: "2026-05-13T22:11:00Z", aiScore: 64, status: "Flagged" },
  { id: "E-106", attemptId: "GWR-2026-0418", name: "Hall_A_Drone_4K.mp4", kind: "Video", size: "3.8 GB", uploadedBy: "Origami Tokyo", uploadedAt: "2026-04-22T05:10:00Z", duration: "01:08:00", aiScore: 94, status: "Approved" },
  { id: "E-107", attemptId: "GWR-2026-0501", name: "Garmin_GPX_Berlin.gpx", kind: "Log", size: "1.1 MB", uploadedBy: "Berlin Fire", uploadedAt: "2026-05-03T14:00:00Z", aiScore: 97, status: "Approved" },
];

/* ---------------- Witness statement steps ---------------- */
export const witnessWorkflowSteps: { key: WitnessStatus; label: string; description: string }[] = [
  { key: "Invited", label: "Invited", description: "Organizer has sent an invitation." },
  { key: "Profile Submitted", label: "Profile Submitted", description: "Witness profile and credentials reviewed." },
  { key: "Pending Approval", label: "Pending Approval", description: "Statement submitted and AI-validated." },
  { key: "Approved", label: "Approved", description: "Adjudicator has approved your statement." },
];

/* ---------------- Coverage timeline (hourly) ---------------- */
export const coverageHours = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}:00`,
  covered: Math.round(60 + 35 * Math.sin(h / 3) + (Math.random() * 6 - 3)),
  flagged: h === 2 || h === 3 ? 1 : 0,
}));
