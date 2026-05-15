/**
 * Stubbed types + empty arrays.
 *
 * All real data now comes from the backend via `src/lib/api`. This file remains
 * only to keep type imports stable across legacy pages — every `export const`
 * is intentionally empty so unwired pages render their natural empty state.
 *
 * Each consumer should be migrated to a real react-query call; until that
 * happens it shows empty UI rather than fake data.
 */

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

export const attempts: Attempt[] = [];
export const witnesses: Witness[] = [];
export const aiInsights: AIInsight[] = [];
export const activityFeed: ActivityEvent[] = [];
export const clarifications: Clarification[] = [];
export const notifications: NotificationItem[] = [];
export const evidence: EvidenceItem[] = [];

export const witnessWorkflowSteps: { key: WitnessStatus; label: string; description: string }[] = [
  { key: "Invited", label: "Invited", description: "Organizer has sent an invitation." },
  { key: "Profile Submitted", label: "Profile Submitted", description: "Witness profile and credentials reviewed." },
  { key: "Pending Approval", label: "Pending Approval", description: "Statement submitted and AI-validated." },
  { key: "Approved", label: "Approved", description: "Adjudicator has approved your statement." },
];

export const coverageHours: { hour: string; covered: number; flagged: number }[] = [];
