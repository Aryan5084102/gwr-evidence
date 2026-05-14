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
