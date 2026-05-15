import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatTime = (d: string | Date) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

export type SlaUrgency = "ok" | "watch" | "warn" | "critical" | "past";

export interface SlaResult {
  daysUntil: number;
  urgency: SlaUrgency;
  label: string;
  tone: "green" | "blue" | "gold" | "amber" | "red";
}

/**
 * Compute days-to-event urgency.
 * Tunable via slaDays (e.g. require Lead assigned X days before start).
 */
export function computeSla(eventStartISO: string, slaDays = 14, now: Date = new Date()): SlaResult {
  const start = new Date(eventStartISO).getTime();
  const days = Math.round((start - now.getTime()) / 86_400_000);
  if (days < 0) return { daysUntil: days, urgency: "past", label: `started ${Math.abs(days)}d ago`, tone: "blue" };
  if (days === 0) return { daysUntil: 0, urgency: "critical", label: "starts today", tone: "red" };
  if (days <= 3) return { daysUntil: days, urgency: "critical", label: `${days}d to go`, tone: "red" };
  if (days <= 7) return { daysUntil: days, urgency: "warn", label: `${days}d to go`, tone: "amber" };
  if (days <= slaDays) return { daysUntil: days, urgency: "watch", label: `${days}d to go`, tone: "gold" };
  return { daysUntil: days, urgency: "ok", label: `${days}d to go`, tone: "green" };
}

export function formatInTz(d: string | Date, timezone: string): string {
  try {
    return new Date(d).toLocaleString("en-US", {
      timeZone: timezone,
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return new Date(d).toISOString();
  }
}

export function tzAbbrev(d: string | Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(new Date(d));
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timezone;
  } catch {
    return timezone;
  }
}

export function relativeTime(d: string | Date, now: Date = new Date()): string {
  const ts = new Date(d).getTime();
  const diff = now.getTime() - ts;
  const abs = Math.abs(diff);
  const future = diff < 0;
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  if (abs < 45_000) return future ? "in a few seconds" : "just now";
  if (minutes < 60) return future ? `in ${minutes}m` : `${minutes}m ago`;
  if (hours < 24) return future ? `in ${hours}h` : `${hours}h ago`;
  if (days < 30) return future ? `in ${days}d` : `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return future ? `in ${months}mo` : `${months}mo ago`;
  const years = Math.round(days / 365);
  return future ? `in ${years}y` : `${years}y ago`;
}
