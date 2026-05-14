import type {
  AIAlert,
  Comment,
  Evidence,
  Reviewer,
  Submission,
  TimelineNode,
} from "@/types";

export const reviewers: Reviewer[] = [
  { id: "r1", name: "Eleanor Whitfield", role: "Senior Adjudicator", avatar: "EW", active: true },
  { id: "r2", name: "Marcus Chen", role: "Evidence Specialist", avatar: "MC", active: true },
  { id: "r3", name: "Priya Raghavan", role: "Records Officer", avatar: "PR" },
  { id: "r4", name: "Hiroshi Tanaka", role: "Verification Lead", avatar: "HT", active: true },
  { id: "r5", name: "Sofia Almeida", role: "Media Verifier", avatar: "SA" },
];

export const submissions: Submission[] = [
  {
    id: "GWR-2025-0411",
    recordName: "Largest Simultaneous Yoga Session",
    category: "Mass Participation",
    eventDate: "2026-04-22",
    location: "New Delhi, India",
    organizer: "Vedic Wellness Foundation",
    status: "review",
    progress: 78,
    evidenceCount: 412,
    reviewers: ["r1", "r2", "r4"],
    createdAt: "2026-04-23T10:12:00Z",
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
  {
    id: "GWR-2025-0433",
    recordName: "Most Languages Sung in One Performance",
    category: "Arts & Media",
    eventDate: "2026-05-09",
    location: "Vienna, Austria",
    organizer: "Polyphony Ensemble",
    status: "draft",
    progress: 12,
    evidenceCount: 24,
    reviewers: ["r4"],
    createdAt: "2026-05-10T19:40:00Z",
  },
];

const tags = [
  "crowd",
  "stage",
  "official-timer",
  "witness",
  "media",
  "aerial",
  "verified",
  "drone",
  "GPS-tagged",
];

export const evidence: Evidence[] = Array.from({ length: 18 }).map((_, i) => {
  const types: Evidence["type"][] = ["video", "image", "document", "audio", "link"];
  const statuses: Evidence["status"][] = [
    "validated",
    "processing",
    "flagged",
    "approved",
    "uploading",
  ];
  const type = types[i % types.length];
  return {
    id: `EV-${1000 + i}`,
    name:
      type === "video"
        ? `aerial_full_event_${i + 1}.mp4`
        : type === "image"
          ? `crowd_capture_${i + 1}.jpg`
          : type === "document"
            ? `witness_statement_${i + 1}.pdf`
            : type === "audio"
              ? `announcement_${i + 1}.wav`
              : `media_link_${i + 1}.url`,
    type,
    size: Math.round(Math.random() * 1_200_000_000),
    uploadedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    status: statuses[i % statuses.length],
    progress: statuses[i % statuses.length] === "uploading" ? 30 + (i * 7) % 60 : 100,
    aiConfidence: 70 + Math.floor(Math.random() * 30),
    tags: [tags[i % tags.length], tags[(i + 2) % tags.length]],
    duration: type === "video" ? `${10 + (i % 50)}:${(i * 13) % 60}` : undefined,
    category: type === "video" ? "Full Event Recording" : type === "image" ? "Crowd Documentation" : "Witness Records",
    uploader: reviewers[i % reviewers.length].name,
  };
});

export const aiAlerts: AIAlert[] = [
  {
    id: "AL-001",
    severity: "critical",
    title: "Missing Witness Statements",
    description: "Only 2 of 5 required independent witness statements have been received.",
    recommendation: "Request 3 additional notarized witness statements from event observers.",
    createdAt: "2026-05-13T08:14:00Z",
  },
  {
    id: "AL-002",
    severity: "high",
    title: "Timestamp gap detected (02:14 — 02:46)",
    description: "32-minute discontinuity in primary recording during overnight session.",
    recommendation: "Provide secondary camera footage covering the gap, or notarized timekeeper log.",
    createdAt: "2026-05-13T09:02:00Z",
  },
  {
    id: "AL-003",
    severity: "medium",
    title: "Possible duplicate evidence",
    description: "12 image files appear to be near-duplicates by perceptual hash.",
    recommendation: "Review and consolidate; retain highest-resolution version.",
    createdAt: "2026-05-12T22:48:00Z",
  },
  {
    id: "AL-004",
    severity: "low",
    title: "Low audio clarity on announcement",
    description: "Speech-to-text confidence below 64% on 4 announcement clips.",
    recommendation: "Provide an official transcript or higher-quality audio source.",
    createdAt: "2026-05-12T18:30:00Z",
  },
];

export const comments: Comment[] = [
  {
    id: "C1",
    author: reviewers[0],
    body: "Aerial footage at 22:14 confirms crowd density exceeds the minimum requirement. Marking section A verified.",
    createdAt: "2026-05-13T10:14:00Z",
    replies: [
      {
        id: "C1.1",
        author: reviewers[3],
        body: "Agreed. Cross-referenced with timekeeper log — counts align within 0.4% tolerance.",
        createdAt: "2026-05-13T10:42:00Z",
      },
    ],
  },
  {
    id: "C2",
    author: reviewers[1],
    body: "Witness statement 03 references an event timeline that doesn't match the master log. Requesting clarification from organizer.",
    createdAt: "2026-05-13T09:01:00Z",
  },
];

export const timeline: TimelineNode[] = [
  { id: "T1", time: "09:00", title: "Event Commencement", description: "Official start announced by chief adjudicator.", evidenceCount: 14, type: "milestone" },
  { id: "T2", time: "11:30", title: "Peak Participation Recorded", description: "Aerial verification of 12,418 participants in formation.", evidenceCount: 38, type: "evidence" },
  { id: "T3", time: "16:45", title: "Mid-event Adjudicator Review", description: "Independent observers signed interim verification sheet.", evidenceCount: 9, type: "review" },
  { id: "T4", time: "23:00", title: "Overnight Continuity Session", description: "Continuous recording confirmed via multi-camera redundancy.", evidenceCount: 22, type: "evidence" },
  { id: "T5", time: "02:00", title: "Attendance Re-Verification", description: "Headcount recounted at 02:00 with official timer present.", evidenceCount: 17, type: "milestone" },
  { id: "T6", time: "06:15", title: "Event Conclusion", description: "Official closure with final witness signatures captured.", evidenceCount: 11, type: "milestone" },
];

export const packageStructure = [
  { name: "01_Event_Summary", count: 3, size: 14_000_000 },
  { name: "02_Full_Recordings", count: 18, size: 6_400_000_000 },
  { name: "03_Images", count: 312, size: 1_200_000_000 },
  { name: "04_Witness_Statements", count: 14, size: 18_000_000 },
  { name: "05_Media_Coverage", count: 22, size: 240_000_000 },
  { name: "06_Final_Report", count: 1, size: 8_400_000 },
];

export const auditLogs = [
  { id: "A1", actor: "Eleanor Whitfield", action: "Approved evidence EV-1004", time: "2026-05-13T11:02:00Z", ip: "10.41.2.18" },
  { id: "A2", actor: "Marcus Chen", action: "Flagged duplicate set EV-1009..EV-1012", time: "2026-05-13T10:47:00Z", ip: "10.41.2.22" },
  { id: "A3", actor: "AI Engine", action: "Auto-classified 412 evidence items", time: "2026-05-13T09:55:00Z", ip: "internal" },
  { id: "A4", actor: "Hiroshi Tanaka", action: "Requested clarification CL-019", time: "2026-05-13T09:12:00Z", ip: "10.41.2.31" },
  { id: "A5", actor: "Priya Raghavan", action: "Generated submission package", time: "2026-05-13T08:38:00Z", ip: "10.41.2.40" },
];
