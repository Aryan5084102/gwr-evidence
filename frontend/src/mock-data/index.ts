/**
 * Empty stubs replacing the legacy mock dataset.
 *
 * Real data now comes from the backend through `src/lib/api`. Pages that still
 * import from here render natural empty states until they are migrated to the
 * appropriate react-query hook.
 *
 * Types live in `@/types`; nothing in this file produces fake content.
 */

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

export const reviewers: Reviewer[] = [];

export const attemptMeta: AttemptMeta = {
  recordTitle: "",
  applicationRef: "",
  organisation: "",
  teamName: "",
  venue: "",
  city: "",
  country: "",
  startISO: new Date().toISOString(),
  endISO: new Date().toISOString(),
  participantCount: 0,
  attemptDescription: "",
  measurementMethod: "",
  contactFirstName: "",
  contactLastName: "",
  contactNationality: "",
  contactGender: "Other",
};

export const witnesses: Witness[] = [];

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

export const stewards: Steward[] = [];

export const activityRows: ActivityRow[] = [];
export const restRows: RestRow[] = [];

export const submissions: Submission[] = [];
export const evidence: Evidence[] = [];
export const aiAlerts: AIAlert[] = [];
export const comments: Comment[] = [];
export const timeline: TimelineNode[] = [];

export const packageStructure: { name: string; count: number; size: number }[] = [];
export const auditLogs: { id: string; actor: string; action: string; time: string; ip: string }[] = [];
