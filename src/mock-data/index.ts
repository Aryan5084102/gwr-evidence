import type {
  AIAlert,
  ActivityRow,
  AttemptMeta,
  Comment,
  Evidence,
  Reviewer,
  RestRow,
  Submission,
  TimelineNode,
  Witness,
} from "@/types";

/* ============ Reviewers / Adjudicators (internal tool users) ============ */

export const reviewers: Reviewer[] = [
  { id: "r1", name: "Eleanor Whitfield", role: "Lead Organiser", avatar: "EW", active: true },
  { id: "r2", name: "Marcus Chen", role: "Evidence Coordinator", avatar: "MC", active: true },
  { id: "r3", name: "Priya Raghavan", role: "Submission Officer", avatar: "PR" },
  { id: "r4", name: "Hiroshi Tanaka", role: "Logistics Lead", avatar: "HT", active: true },
  { id: "r5", name: "Sofia Almeida", role: "Media Lead", avatar: "SA" },
];

/* ============ The attempt itself ============ */

export const attemptMeta: AttemptMeta = {
  recordTitle: "Longest AI platform development hackathon",
  applicationRef: "GWR-APP-2026-AI-0912",
  organisation: "Glimmora International",
  teamName: "Glimmora GWR Squad",
  venue: "Glimmora HQ — Innovation Hall",
  city: "Chennai",
  country: "India",
  startISO: "2026-05-12T09:00:00+05:30",
  endISO:   "2026-05-15T09:00:00+05:30",
  participantCount: 42,
  attemptDescription:
    "A continuous 72-hour AI platform development hackathon during which 42 vetted participants " +
    "designed, built and shipped production-grade AI platforms — including a Guinness submission " +
    "automation OS, an LLM-orchestrated evidence indexer, and a retrieval-augmented witness assistant. " +
    "All work was streamed, witnessed by independent AI specialists, and timekept by two independent " +
    "GWR-approved timekeepers in line with the Specific Guidelines Pack dated 12 May 2026.",
  measurementMethod:
    "Two independent timekeepers maintained a synchronised NTP-locked official log to ±0.01s. " +
    "Activity and rest sequences were captured using the GWR Activity Log Book template and " +
    "auto-validated against the 5-min-per-uninterrupted-hour rest accrual rule.",
  contactFirstName: "Aryan",
  contactLastName: "Glimmora",
  contactNationality: "Indian",
  contactGender: "Male",
};

/* ============ Witnesses ============ */

export const witnesses: Witness[] = [
  {
    id: "W-001",
    firstName: "Dr. Anika",
    lastName: "Bose",
    email: "a.bose@iitm-ai.in",
    organisation: "IIT Madras — Centre for AI",
    expertise: "Machine learning systems · 14 years",
    role: "specialist",
    status: "completed",
    inviteSentAt: "2026-05-09T10:00:00+05:30",
    completedAt: "2026-05-15T11:24:00+05:30",
    shiftStartISO: "2026-05-12T09:00:00+05:30",
    shiftEndISO:   "2026-05-12T13:00:00+05:30",
    signatureDataUrl: undefined,
    declaration: "I have no association with the record organisers or participants.",
    rulesObserved: ["Rule 1: 24h minimum continuous activity", "Rule 4: participant eligibility", "Rule 6: presence in venue"],
    finalMeasurement: "72h 00m 00.00s",
    telephone: "+91 98400 11122",
    nationality: "Indian",
    willingToBeContacted: true,
    token: "wt_8f3a91",
  },
  {
    id: "W-002",
    firstName: "Prof. Karim",
    lastName: "El-Sayed",
    email: "k.elsayed@aiquarter.ae",
    organisation: "AI Quarter — Dubai",
    expertise: "Generative AI · LLM systems · 11 years",
    role: "specialist",
    status: "completed",
    inviteSentAt: "2026-05-09T10:00:00+05:30",
    completedAt: "2026-05-15T11:30:00+05:30",
    shiftStartISO: "2026-05-12T09:00:00+05:30",
    shiftEndISO:   "2026-05-12T13:00:00+05:30",
    declaration: "I declare independence from the participating teams.",
    rulesObserved: ["Rule 2: AI platform development focus", "Rule 10: specialist witness presence"],
    finalMeasurement: "72h 00m 00.00s",
    nationality: "Emirati",
    willingToBeContacted: true,
    token: "wt_5b21cd",
  },
  {
    id: "W-003",
    firstName: "Lakshmi",
    lastName: "Iyer",
    email: "lakshmi.iyer@notary.in",
    organisation: "Iyer & Co. Notarial Services",
    expertise: "Public notary — record adjudication",
    role: "independent",
    status: "completed",
    inviteSentAt: "2026-05-10T09:00:00+05:30",
    completedAt: "2026-05-14T22:15:00+05:30",
    shiftStartISO: "2026-05-13T13:00:00+05:30",
    shiftEndISO:   "2026-05-13T17:00:00+05:30",
    declaration: "I am unrelated to the organisers and have nothing to gain from the outcome.",
    rulesObserved: ["Endurance rule 3 (timer visible)", "Endurance rule 5 (witness presence)"],
    nationality: "Indian",
    willingToBeContacted: true,
    token: "wt_d419f0",
  },
  {
    id: "W-004",
    firstName: "Rajeev",
    lastName: "Menon",
    email: "rajeev.menon@auditpartners.in",
    organisation: "Audit Partners LLP",
    expertise: "Chartered Accountant · event audit",
    role: "independent",
    status: "in-progress",
    inviteSentAt: "2026-05-11T09:30:00+05:30",
    nationality: "Indian",
    willingToBeContacted: true,
    token: "wt_77ac3e",
  },
  {
    id: "W-005",
    firstName: "Captain (Retd.) Devika",
    lastName: "Rao",
    email: "devika.rao@chrono.in",
    organisation: "Chrono Precision Timekeeping",
    expertise: "Official timekeeping · NTP-synced systems",
    role: "timekeeper",
    status: "completed",
    inviteSentAt: "2026-05-09T08:00:00+05:30",
    completedAt: "2026-05-15T09:30:00+05:30",
    finalMeasurement: "72h 00m 00.00s",
    declaration: "I served as official independent timekeeper for the entire attempt.",
    rulesObserved: ["Rule 9: official timekeeping log maintained"],
    nationality: "Indian",
    willingToBeContacted: true,
    token: "wt_22ef41",
  },
  {
    id: "W-006",
    firstName: "Arjun",
    lastName: "Pillai",
    email: "arjun.pillai@chrono.in",
    organisation: "Chrono Precision Timekeeping",
    expertise: "Official timekeeping · backup",
    role: "timekeeper",
    status: "pending",
    inviteSentAt: "2026-05-11T08:00:00+05:30",
    nationality: "Indian",
    willingToBeContacted: true,
    token: "wt_9c01bb",
  },
];

/* ============ Stewards ============ */

export interface Steward {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  responsibility: string;
  shiftStartISO?: string;
  shiftEndISO?: string;
  status: "pending" | "in-progress" | "completed";
  completedAt?: string;
  declaration?: string;
  observations?: string[];
}

export const stewards: Steward[] = [
  {
    id: "S-001",
    firstName: "Vikram",
    lastName: "Sundaram",
    email: "vikram.s@glimmora.ai",
    organisation: "Glimmora International — Operations",
    responsibility: "Participant verification & ID checks at venue entry",
    shiftStartISO: "2026-05-12T08:00:00+05:30",
    shiftEndISO: "2026-05-12T12:00:00+05:30",
    status: "completed",
    completedAt: "2026-05-15T10:05:00+05:30",
    declaration: "I confirm all 42 participants were verified against the eligibility criteria of GWR Rule 4 prior to commencement.",
    observations: [
      "All 42 participants presented valid ID at entry",
      "Eligibility criteria (Rule 4 a/b/c) verified for every participant",
      "Sign-in ledger maintained continuously with timestamped entries",
    ],
  },
  {
    id: "S-002",
    firstName: "Meera",
    lastName: "Kapoor",
    email: "meera.k@glimmora.ai",
    organisation: "Glimmora International — Floor Management",
    responsibility: "Continuous floor supervision & venue boundary enforcement",
    shiftStartISO: "2026-05-12T12:00:00+05:30",
    shiftEndISO: "2026-05-12T16:00:00+05:30",
    status: "completed",
    completedAt: "2026-05-15T10:12:00+05:30",
    declaration: "I confirm that no participant left the hosting venue during my shift, per GWR Rule 6.",
    observations: [
      "Venue perimeter maintained throughout shift",
      "Rest-break departures logged at exit checkpoint",
      "No unauthorised entries observed",
    ],
  },
  {
    id: "S-003",
    firstName: "Daniel",
    lastName: "Joseph",
    email: "daniel.j@glimmora.ai",
    organisation: "Glimmora International — Welfare",
    responsibility: "Participant welfare & medical liaison",
    status: "in-progress",
    declaration: "Statement in progress — pending shift completion.",
    observations: [],
  },
];

/* ============ Activity / Rest rows (GWR logbook) ============ */

export const activityRows: ActivityRow[] = [
  { id: "A1", sequence: 1, startHHMM: "09:00", endHHMM: "13:00", witness1Id: "W-001", witness2Id: "W-002" },
  { id: "A2", sequence: 2, startHHMM: "13:15", endHHMM: "17:15", witness1Id: "W-003", witness2Id: "W-004" },
  { id: "A3", sequence: 3, startHHMM: "17:25", endHHMM: "21:25", witness1Id: "W-001", witness2Id: "W-002" },
  { id: "A4", sequence: 4, startHHMM: "21:40", endHHMM: "01:40", witness1Id: "W-003", witness2Id: "W-005" },
  { id: "A5", sequence: 5, startHHMM: "01:55", endHHMM: "05:55", witness1Id: "W-001", witness2Id: "W-002" },
];

export const restRows: RestRow[] = [
  { id: "R1", sequence: 1, startHHMM: "13:00", endHHMM: "13:15", witness1Id: "W-001", witness2Id: "W-002" },
  { id: "R2", sequence: 2, startHHMM: "17:15", endHHMM: "17:25", witness1Id: "W-003", witness2Id: "W-004" },
  { id: "R3", sequence: 3, startHHMM: "21:25", endHHMM: "21:40", witness1Id: "W-001", witness2Id: "W-002" },
  { id: "R4", sequence: 4, startHHMM: "01:40", endHHMM: "01:55", witness1Id: "W-003", witness2Id: "W-005" },
];

/* ============ Submissions (kept for legacy pages) ============ */

export const submissions: Submission[] = [
  {
    id: "GWR-APP-2026-AI-0912",
    recordName: "Longest AI platform development hackathon",
    category: "Computing & Engineering",
    eventDate: "2026-05-12",
    location: "Chennai, India",
    organizer: "Glimmora International",
    status: "review",
    progress: 78,
    evidenceCount: 218,
    reviewers: ["r1", "r2", "r4"],
    createdAt: "2026-04-28T10:12:00+05:30",
  },
  {
    id: "GWR-2025-0398",
    recordName: "Longest Continuous Drone Light Display",
    category: "Technology",
    eventDate: "2026-03-30",
    location: "Dubai, UAE",
    organizer: "Skyline Productions",
    status: "approved",
    progress: 100,
    evidenceCount: 287,
    reviewers: ["r1", "r3"],
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "GWR-2025-0421",
    recordName: "Tallest Sustainable Sandcastle",
    category: "Engineering Feats",
    eventDate: "2026-05-02",
    location: "Lisbon, Portugal",
    organizer: "Atlantic Build Collective",
    status: "processing",
    progress: 34,
    evidenceCount: 98,
    reviewers: ["r2", "r5"],
    createdAt: "2026-05-03T14:25:00Z",
  },
];

/* ============ Evidence (re-themed for hackathon) ============ */

const tags = ["streaming", "venue-cam", "official-timer", "witness", "media", "aerial", "verified", "ntp-log", "screen-capture"];

export const evidence: Evidence[] = Array.from({ length: 18 }).map((_, i) => {
  const types: Evidence["type"][] = ["video", "image", "document", "audio", "link"];
  const statuses: Evidence["status"][] = ["validated", "processing", "flagged", "approved", "uploading"];
  const type = types[i % types.length];
  return {
    id: `EV-${1000 + i}`,
    name:
      type === "video"
        ? `venue_stream_part_${i + 1}.mp4`
        : type === "image"
          ? `hall_panorama_${i + 1}.jpg`
          : type === "document"
            ? `witness_statement_${i + 1}.pdf`
            : type === "audio"
              ? `briefing_${i + 1}.wav`
              : `coverage_${i + 1}.url`,
    type,
    size: Math.round(Math.random() * 1_200_000_000),
    uploadedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    status: statuses[i % statuses.length],
    progress: statuses[i % statuses.length] === "uploading" ? 30 + (i * 7) % 60 : 100,
    aiConfidence: 70 + Math.floor(Math.random() * 30),
    tags: [tags[i % tags.length], tags[(i + 2) % tags.length]],
    duration: type === "video" ? `${10 + (i % 50)}:${(i * 13) % 60}` : undefined,
    category: type === "video" ? "Full Event Recording" : type === "image" ? "Venue Documentation" : "Witness Records",
    uploader: reviewers[i % reviewers.length].name,
  };
});

export const aiAlerts: AIAlert[] = [
  {
    id: "AL-001",
    severity: "high",
    title: "Witness W-004 invitation pending response",
    description: "Independent witness has not yet opened their signing link (sent 3 days ago).",
    recommendation: "Resend invitation or escalate to backup witness from the standby roster.",
    createdAt: "2026-05-13T08:14:00Z",
  },
  {
    id: "AL-002",
    severity: "medium",
    title: "Rest credit headroom low after Rest #4",
    description: "Carried-forward rest dipped to 5 minutes — within rule but close to the floor.",
    recommendation: "Encourage participants to bank an uninterrupted 2-hour activity block next.",
    createdAt: "2026-05-13T09:02:00Z",
  },
  {
    id: "AL-003",
    severity: "low",
    title: "Layout diagram quality",
    description: "Uploaded venue layout is 1024px — adjudicators prefer ≥2048px line drawings.",
    recommendation: "Re-export the venue layout from CAD at higher resolution.",
    createdAt: "2026-05-12T22:48:00Z",
  },
  {
    id: "AL-004",
    severity: "low",
    title: "Cover letter description short",
    description: "AI-drafted attempt description is under 100 words; richer detail strengthens claim.",
    recommendation: "Use the Expand with AI action on the Cover Letter page.",
    createdAt: "2026-05-12T18:30:00Z",
  },
];

export const comments: Comment[] = [
  {
    id: "C1",
    author: reviewers[0],
    body: "Specialist witnesses W-001 and W-002 cross-confirmed the first 4-hour activity block. Logbook auto-calculation matches their independent ledger to the minute.",
    createdAt: "2026-05-13T10:14:00Z",
    replies: [
      {
        id: "C1.1",
        author: reviewers[3],
        body: "Confirmed. NTP timekeeper feed deviation is <40ms across the window.",
        createdAt: "2026-05-13T10:42:00Z",
      },
    ],
  },
  {
    id: "C2",
    author: reviewers[1],
    body: "Witness W-004 still pending. Auto-reminder dispatched. Falling back to standby roster if no response by EOD.",
    createdAt: "2026-05-13T09:01:00Z",
  },
];

export const timeline: TimelineNode[] = [
  { id: "T1", time: "09:00", title: "Hackathon Commences", description: "Lead organiser opens the attempt with both specialist witnesses present.", evidenceCount: 14, type: "milestone" },
  { id: "T2", time: "13:00", title: "First Rest Sequence", description: "15-minute rest — 20 minutes earned, 15 taken, 5 carried.", evidenceCount: 6, type: "evidence" },
  { id: "T3", time: "17:15", title: "Witness Rotation A→B", description: "Independents Iyer/Menon take over from specialists within the 4-hour cap.", evidenceCount: 9, type: "review" },
  { id: "T4", time: "21:40", title: "Overnight Activity Block", description: "Continuous 4-hour development sprint with multi-camera coverage.", evidenceCount: 22, type: "evidence" },
  { id: "T5", time: "01:55", title: "Timekeeper Sync Check", description: "Both timekeepers re-sync to NTP and counter-sign master log.", evidenceCount: 4, type: "milestone" },
  { id: "T6", time: "09:00", title: "Attempt Conclusion (Day 3)", description: "Final 10-minute non-stop activity confirmed, attempt closed.", evidenceCount: 11, type: "milestone" },
];

export const packageStructure = [
  { name: "01_Cover_Letter", count: 1, size: 240_000 },
  { name: "02_Witness_Statements", count: 6, size: 4_200_000 },
  { name: "03_Activity_Log", count: 2, size: 380_000 },
  { name: "04_Timekeeper_Logs", count: 2, size: 1_100_000 },
  { name: "05_Evidence", count: 312, size: 1_200_000_000 },
  { name: "06_Videos", count: 18, size: 6_400_000_000 },
  { name: "07_Media", count: 7, size: 92_000_000 },
];

export const auditLogs = [
  { id: "A1", actor: "Eleanor Whitfield", action: "Sent invitation to witness W-004", time: "2026-05-13T11:02:00Z", ip: "10.41.2.18" },
  { id: "A2", actor: "Marcus Chen", action: "AI auto-filled cover letter draft", time: "2026-05-13T10:47:00Z", ip: "10.41.2.22" },
  { id: "A3", actor: "AI Engine", action: "Validated logbook against GWR rest rules", time: "2026-05-13T09:55:00Z", ip: "internal" },
  { id: "A4", actor: "Hiroshi Tanaka", action: "Uploaded venue layout v2", time: "2026-05-13T09:12:00Z", ip: "10.41.2.31" },
  { id: "A5", actor: "Priya Raghavan", action: "Generated submission package ZIP", time: "2026-05-13T08:38:00Z", ip: "10.41.2.40" },
];
