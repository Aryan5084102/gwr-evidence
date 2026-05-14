export type EvidenceType = "video" | "image" | "document" | "audio" | "link";

export type EvidenceStatus =
  | "uploading"
  | "processing"
  | "validated"
  | "flagged"
  | "approved"
  | "rejected";

export interface Evidence {
  id: string;
  name: string;
  type: EvidenceType;
  size: number;
  uploadedAt: string;
  status: EvidenceStatus;
  progress: number;
  aiConfidence: number;
  tags: string[];
  thumbnail?: string;
  duration?: string;
  category?: string;
  uploader?: string;
}

export interface Submission {
  id: string;
  recordName: string;
  category: string;
  eventDate: string;
  location: string;
  organizer: string;
  status: "draft" | "processing" | "review" | "approved" | "rejected";
  progress: number;
  evidenceCount: number;
  reviewers: string[];
  createdAt: string;
}

export interface Reviewer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  active?: boolean;
}

export interface Comment {
  id: string;
  author: Reviewer;
  body: string;
  createdAt: string;
  replies?: Comment[];
}

export interface AIAlert {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommendation: string;
  createdAt: string;
}

export interface TimelineNode {
  id: string;
  time: string;
  title: string;
  description: string;
  evidenceCount: number;
  type: "milestone" | "evidence" | "review";
}

/* ============ GWR Submission Automation ============ */

export interface AttemptMeta {
  recordTitle: string;
  applicationRef: string;
  organisation: string;
  teamName: string;
  venue: string;
  city: string;
  country: string;
  startISO: string; // attempt start
  endISO: string;   // attempt end
  participantCount: number;
  /** description of the AI platforms being developed */
  attemptDescription: string;
  measurementMethod: string;
  contactFirstName: string;
  contactLastName: string;
  contactNationality: string;
  contactGender: "Male" | "Female" | "Other";
}

export type WitnessStatus = "pending" | "in-progress" | "completed" | "rejected";
export type WitnessRole = "specialist" | "independent" | "timekeeper";

export interface Witness {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  expertise: string;
  role: WitnessRole;
  status: WitnessStatus;
  inviteSentAt?: string;
  completedAt?: string;
  shiftStartISO?: string;
  shiftEndISO?: string;
  /** base64 PNG of drawn signature */
  signatureDataUrl?: string;
  declaration?: string;
  rulesObserved?: string[];
  finalMeasurement?: string;
  telephone?: string;
  nationality?: string;
  willingToBeContacted?: boolean;
  /** generated invitation token for shareable link */
  token: string;
}

export interface ActivityRow {
  id: string;
  sequence: number;
  startHHMM: string;   // "HH:MM"
  endHHMM: string;     // "HH:MM"
  witness1Id?: string;
  witness2Id?: string;
  notes?: string;
}

export interface RestRow {
  id: string;
  sequence: number;
  startHHMM: string;
  endHHMM: string;
  witness1Id?: string;
  witness2Id?: string;
  notes?: string;
}

export interface LogbookEntry {
  kind: "activity" | "rest";
  sequence: number;
  startHHMM: string;
  endHHMM: string;
  durationMin: number;        // computed
  accumulatedRestMin?: number; // for activity
  availableRestMin?: number;   // for rest (total earned up to now)
  takenNowMin?: number;        // for rest
  carriedForwardMin?: number;  // for rest
  witness1?: Witness;
  witness2?: Witness;
}

export interface SubmissionHealth {
  score: number; // 0-100
  items: Array<{
    id: string;
    label: string;
    state: "complete" | "partial" | "missing";
    detail?: string;
  }>;
}
