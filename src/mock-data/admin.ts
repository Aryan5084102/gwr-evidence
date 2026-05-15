/* GWR Admin Console — mock data
 * Events, adjudicator roster, assignments, and live-tracking telemetry.
 */

export type TravelStatus =
  | "Available"
  | "Assigned"
  | "Travelling"
  | "On-site"
  | "Completed"
  | "Off-duty";

export interface AdminEvent {
  id: string;
  title: string;
  category: string;
  organizer: string;
  venue: string;
  city: string;
  country: string;
  /** IANA timezone, e.g. "Europe/London" */
  timezone: string;
  lat: number;
  lon: number;
  startISO: string;
  endISO: string;
  status: "Draft" | "Scheduled" | "Live" | "Completed" | "Cancelled";
  priority: "Low" | "Standard" | "High" | "Flagship";
  participantCount: number;
  requiredAdjudicators: number;
  description: string;
  /** Geo-fence radius in metres around (lat, lon) for auto check-in. */
  geofenceRadiusM: number;
}

export interface AdminNotification {
  id: string;
  ts: string;
  title: string;
  detail: string;
  tone: "info" | "success" | "warning" | "danger";
  unread: boolean;
  kind: "assignment" | "tracking" | "system" | "event";
  linkTo?: string;
}

export interface AdminAdjudicator {
  id: string;
  name: string;
  email: string;
  initials: string;
  homeCity: string;
  homeCountry: string;
  region: "Europe" | "Americas" | "Asia-Pacific" | "MEA";
  specialties: string[];
  languages: string[];
  rating: number; // 0-5
  yearsExperience: number;
  status: "Active" | "On leave" | "Suspended";
  certifications: string[];
}

export interface AdminAssignment {
  id: string;
  eventId: string;
  adjudicatorId: string;
  role: "Lead Adjudicator" | "Adjudicator" | "Observer";
  status: "Assigned" | "Travelling" | "On-site" | "Completed" | "Cancelled";
  assignedAt: string;
  note?: string;
}

export interface AdjudicatorLocation {
  adjudicatorId: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  travelStatus: TravelStatus;
  lastPingISO: string;
  accuracyM: number;
  consent: boolean;
  batteryPct: number;
}

export interface AdjudicatorCheckIn {
  id: string;
  adjudicatorId: string;
  ts: string;
  city: string;
  country: string;
  travelStatus: TravelStatus;
  note?: string;
}

export interface AdminAuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  tone: "info" | "success" | "warning" | "danger";
}

/* ---------------- Events ---------------- */
export const adminEvents: AdminEvent[] = [
  {
    id: "GWR-2026-0411",
    title: "Longest continuous violin performance by an ensemble",
    category: "Music & Performing Arts",
    organizer: "Aurora Events International",
    venue: "Royal Albert Hall · Main Stage",
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
    lat: 51.5009,
    lon: -0.1773,
    startISO: "2026-05-12T09:00:00Z",
    endISO: "2026-05-15T09:00:00Z",
    status: "Live",
    priority: "Flagship",
    participantCount: 24,
    requiredAdjudicators: 2,
    description:
      "72-hour continuous ensemble violin performance. Requires senior music adjudicator + observer.",
    geofenceRadiusM: 200,
  },
  {
    id: "GWR-2026-0418",
    title: "Largest simultaneous origami crane folding",
    category: "Mass Participation",
    organizer: "Origami Tokyo Foundation",
    venue: "Tokyo Big Sight · Hall A",
    city: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo",
    lat: 35.6298,
    lon: 139.7937,
    startISO: "2026-05-22T01:00:00Z",
    endISO: "2026-05-22T04:00:00Z",
    status: "Scheduled",
    priority: "High",
    participantCount: 4280,
    requiredAdjudicators: 3,
    description: "Coordinated mass attempt with steward sign-off per zone.",
    geofenceRadiusM: 500,
  },
  {
    id: "GWR-2026-0501",
    title: "Fastest marathon in a full firefighter uniform",
    category: "Athletics",
    organizer: "Berlin Fire & Rescue Athletics",
    venue: "Berlin Marathon Route",
    city: "Berlin",
    country: "Germany",
    timezone: "Europe/Berlin",
    lat: 52.52,
    lon: 13.405,
    startISO: "2026-05-31T08:00:00Z",
    endISO: "2026-05-31T13:30:00Z",
    status: "Scheduled",
    priority: "Standard",
    participantCount: 1,
    requiredAdjudicators: 2,
    description: "Solo PPE marathon attempt with continuous GPS tracking.",
    geofenceRadiusM: 1500,
  },
  {
    id: "GWR-2026-0509",
    title: "Most consecutive chess games played simultaneously",
    category: "Mind Sports",
    organizer: "Reykjavík Chess Federation",
    venue: "Harpa Concert Hall",
    city: "Reykjavík",
    country: "Iceland",
    timezone: "Atlantic/Reykjavik",
    lat: 64.1499,
    lon: -21.9326,
    startISO: "2026-06-09T09:00:00Z",
    endISO: "2026-06-10T03:00:00Z",
    status: "Scheduled",
    priority: "Standard",
    participantCount: 312,
    requiredAdjudicators: 1,
    description: "FIDE-rated grandmaster vs. 312 vetted opponents.",
    geofenceRadiusM: 150,
  },
  {
    id: "GWR-2026-0612",
    title: "Largest underwater clean-up by certified divers",
    category: "Environment",
    organizer: "Dubai Reef Initiative",
    venue: "Palm Jumeirah Reef Zone",
    city: "Dubai",
    country: "United Arab Emirates",
    timezone: "Asia/Dubai",
    lat: 25.1124,
    lon: 55.139,
    startISO: "2026-06-12T05:00:00Z",
    endISO: "2026-06-12T13:00:00Z",
    status: "Scheduled",
    priority: "High",
    participantCount: 640,
    requiredAdjudicators: 2,
    description: "Coordinated diving teams across 12 zones; surface stewards required.",
    geofenceRadiusM: 800,
  },
  {
    id: "GWR-2026-0620",
    title: "Tallest human tower of acrobats",
    category: "Acrobatics",
    organizer: "Castellers de Barcelona",
    venue: "Plaça de Sant Jaume",
    city: "Barcelona",
    country: "Spain",
    timezone: "Europe/Madrid",
    lat: 41.3825,
    lon: 2.1769,
    startISO: "2026-06-20T17:00:00Z",
    endISO: "2026-06-20T19:00:00Z",
    status: "Draft",
    priority: "Standard",
    participantCount: 180,
    requiredAdjudicators: 1,
    description: "Outdoor castell attempt. Safety officer pre-approval required.",
    geofenceRadiusM: 100,
  },
  {
    id: "GWR-2026-0704",
    title: "Longest line of robot dancers in unison",
    category: "Technology",
    organizer: "SoCal Robotics Collective",
    venue: "Santa Monica Pier",
    city: "Los Angeles",
    country: "United States",
    timezone: "America/Los_Angeles",
    lat: 34.0089,
    lon: -118.4973,
    startISO: "2026-07-04T18:00:00Z",
    endISO: "2026-07-04T20:00:00Z",
    status: "Scheduled",
    priority: "Standard",
    participantCount: 422,
    requiredAdjudicators: 1,
    description: "Synchronised robot choreography record attempt.",
    geofenceRadiusM: 300,
  },
  {
    id: "GWR-2026-0808",
    title: "Highest-altitude string quartet performance",
    category: "Music & Performing Arts",
    organizer: "Andes Cultural Trust",
    venue: "Quilotoa Crater Rim",
    city: "Quito",
    country: "Ecuador",
    timezone: "America/Guayaquil",
    lat: -0.1807,
    lon: -78.4678,
    startISO: "2026-08-08T15:00:00Z",
    endISO: "2026-08-08T17:00:00Z",
    status: "Draft",
    priority: "High",
    participantCount: 4,
    requiredAdjudicators: 1,
    description: "Live string quartet performance at 3,914m altitude.",
    geofenceRadiusM: 200,
  },
];

/* ---------------- Admin notifications (inbox) ---------------- */
export const initialNotifications: AdminNotification[] = [
  {
    id: "NOTE-1",
    ts: "2026-05-15T09:14:00Z",
    title: "Adjudicator declined assignment",
    detail: "Henrik Lund declined GWR-2026-0509 due to medical leave. Reassign required.",
    tone: "warning",
    unread: true,
    kind: "assignment",
    linkTo: "/admin/assignments",
  },
  {
    id: "NOTE-2",
    ts: "2026-05-15T08:55:00Z",
    title: "Check-in overdue",
    detail: "Daniel O'Connor has not pinged in 4h on GWR-2026-0501.",
    tone: "danger",
    unread: true,
    kind: "tracking",
    linkTo: "/admin/tracking",
  },
  {
    id: "NOTE-3",
    ts: "2026-05-15T08:42:00Z",
    title: "Geo-fence entry",
    detail: "Eleanor Whitfield entered Royal Albert Hall fence (200m).",
    tone: "success",
    unread: false,
    kind: "tracking",
    linkTo: "/admin/tracking",
  },
  {
    id: "NOTE-4",
    ts: "2026-05-14T22:30:00Z",
    title: "Battery low",
    detail: "Henrik Lund · 22% — device may go offline.",
    tone: "warning",
    unread: true,
    kind: "system",
    linkTo: "/admin/tracking",
  },
  {
    id: "NOTE-5",
    ts: "2026-05-14T15:10:00Z",
    title: "Draft event needs review",
    detail: "GWR-2026-0620 (Barcelona castell) sitting in Draft for 7 days.",
    tone: "info",
    unread: false,
    kind: "event",
    linkTo: "/admin/events",
  },
];

/* ---------------- Adjudicators ---------------- */
export const adminAdjudicators: AdminAdjudicator[] = [
  {
    id: "ADJ-001",
    name: "Eleanor Whitfield",
    email: "adjudicator@gwr.com",
    initials: "EW",
    homeCity: "London",
    homeCountry: "United Kingdom",
    region: "Europe",
    specialties: ["Music & Performing Arts", "Athletics"],
    languages: ["English", "French"],
    rating: 4.9,
    yearsExperience: 12,
    status: "Active",
    certifications: ["GWR Senior Adjudicator", "Time-keeping Lvl 3"],
  },
  {
    id: "ADJ-002",
    name: "Kenji Watanabe",
    email: "k.watanabe@gwr.com",
    initials: "KW",
    homeCity: "Tokyo",
    homeCountry: "Japan",
    region: "Asia-Pacific",
    specialties: ["Mass Participation", "Technology"],
    languages: ["Japanese", "English", "Mandarin"],
    rating: 4.8,
    yearsExperience: 9,
    status: "Active",
    certifications: ["GWR Adjudicator", "Mass-event coordination"],
  },
  {
    id: "ADJ-003",
    name: "Sofia Marquez",
    email: "s.marquez@gwr.com",
    initials: "SM",
    homeCity: "Madrid",
    homeCountry: "Spain",
    region: "Europe",
    specialties: ["Acrobatics", "Music & Performing Arts"],
    languages: ["Spanish", "English", "Portuguese"],
    rating: 4.7,
    yearsExperience: 7,
    status: "Active",
    certifications: ["GWR Adjudicator", "Outdoor-safety officer"],
  },
  {
    id: "ADJ-004",
    name: "Daniel O'Connor",
    email: "d.oconnor@gwr.com",
    initials: "DO",
    homeCity: "New York",
    homeCountry: "United States",
    region: "Americas",
    specialties: ["Athletics", "Technology"],
    languages: ["English"],
    rating: 4.6,
    yearsExperience: 11,
    status: "Active",
    certifications: ["GWR Senior Adjudicator"],
  },
  {
    id: "ADJ-005",
    name: "Amal Hassan",
    email: "a.hassan@gwr.com",
    initials: "AH",
    homeCity: "Dubai",
    homeCountry: "United Arab Emirates",
    region: "MEA",
    specialties: ["Environment", "Mass Participation"],
    languages: ["Arabic", "English"],
    rating: 4.85,
    yearsExperience: 8,
    status: "Active",
    certifications: ["GWR Adjudicator", "Marine-event certified"],
  },
  {
    id: "ADJ-006",
    name: "Henrik Lund",
    email: "h.lund@gwr.com",
    initials: "HL",
    homeCity: "Reykjavík",
    homeCountry: "Iceland",
    region: "Europe",
    specialties: ["Mind Sports", "Athletics"],
    languages: ["Icelandic", "English", "Danish"],
    rating: 4.7,
    yearsExperience: 6,
    status: "On leave",
    certifications: ["GWR Adjudicator"],
  },
  {
    id: "ADJ-007",
    name: "Priscilla Okonkwo",
    email: "p.okonkwo@gwr.com",
    initials: "PO",
    homeCity: "Lagos",
    homeCountry: "Nigeria",
    region: "MEA",
    specialties: ["Mass Participation", "Music & Performing Arts"],
    languages: ["English", "Yoruba", "French"],
    rating: 4.8,
    yearsExperience: 10,
    status: "Active",
    certifications: ["GWR Senior Adjudicator"],
  },
  {
    id: "ADJ-008",
    name: "Liang Chen",
    email: "l.chen@gwr.com",
    initials: "LC",
    homeCity: "Singapore",
    homeCountry: "Singapore",
    region: "Asia-Pacific",
    specialties: ["Technology", "Mind Sports"],
    languages: ["English", "Mandarin", "Malay"],
    rating: 4.65,
    yearsExperience: 5,
    status: "Active",
    certifications: ["GWR Adjudicator"],
  },
];

/* ---------------- Initial assignments ---------------- */
export const initialAssignments: AdminAssignment[] = [
  {
    id: "ASN-001",
    eventId: "GWR-2026-0411",
    adjudicatorId: "ADJ-001",
    role: "Lead Adjudicator",
    status: "On-site",
    assignedAt: "2026-04-20T10:00:00Z",
    note: "Lead — owns ratification call.",
  },
  {
    id: "ASN-002",
    eventId: "GWR-2026-0411",
    adjudicatorId: "ADJ-003",
    role: "Observer",
    status: "On-site",
    assignedAt: "2026-04-22T09:00:00Z",
  },
  {
    id: "ASN-003",
    eventId: "GWR-2026-0418",
    adjudicatorId: "ADJ-002",
    role: "Lead Adjudicator",
    status: "Travelling",
    assignedAt: "2026-04-25T08:00:00Z",
  },
  {
    id: "ASN-004",
    eventId: "GWR-2026-0418",
    adjudicatorId: "ADJ-007",
    role: "Adjudicator",
    status: "Assigned",
    assignedAt: "2026-04-28T08:00:00Z",
  },
  {
    id: "ASN-005",
    eventId: "GWR-2026-0501",
    adjudicatorId: "ADJ-004",
    role: "Lead Adjudicator",
    status: "Assigned",
    assignedAt: "2026-05-01T11:00:00Z",
  },
  {
    id: "ASN-006",
    eventId: "GWR-2026-0612",
    adjudicatorId: "ADJ-005",
    role: "Lead Adjudicator",
    status: "Assigned",
    assignedAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "ASN-007",
    eventId: "GWR-2026-0704",
    adjudicatorId: "ADJ-004",
    role: "Lead Adjudicator",
    status: "Assigned",
    assignedAt: "2026-05-12T15:00:00Z",
  },
];

/* ---------------- Live locations (Phase 2) ---------------- */
export const initialLocations: AdjudicatorLocation[] = [
  {
    adjudicatorId: "ADJ-001",
    lat: 51.5009,
    lon: -0.1773,
    city: "London",
    country: "United Kingdom",
    travelStatus: "On-site",
    lastPingISO: "2026-05-15T08:42:00Z",
    accuracyM: 12,
    consent: true,
    batteryPct: 78,
  },
  {
    adjudicatorId: "ADJ-002",
    lat: 35.5494,
    lon: 139.7798, // Haneda area — in transit
    city: "Tokyo (Haneda Apt)",
    country: "Japan",
    travelStatus: "Travelling",
    lastPingISO: "2026-05-15T07:55:00Z",
    accuracyM: 42,
    consent: true,
    batteryPct: 64,
  },
  {
    adjudicatorId: "ADJ-003",
    lat: 51.4975,
    lon: -0.176,
    city: "London",
    country: "United Kingdom",
    travelStatus: "On-site",
    lastPingISO: "2026-05-15T08:38:00Z",
    accuracyM: 18,
    consent: true,
    batteryPct: 51,
  },
  {
    adjudicatorId: "ADJ-004",
    lat: 40.7128,
    lon: -74.006,
    city: "New York",
    country: "United States",
    travelStatus: "Available",
    lastPingISO: "2026-05-15T06:10:00Z",
    accuracyM: 25,
    consent: true,
    batteryPct: 88,
  },
  {
    adjudicatorId: "ADJ-005",
    lat: 25.2048,
    lon: 55.2708,
    city: "Dubai",
    country: "United Arab Emirates",
    travelStatus: "Assigned",
    lastPingISO: "2026-05-15T05:20:00Z",
    accuracyM: 30,
    consent: true,
    batteryPct: 92,
  },
  {
    adjudicatorId: "ADJ-006",
    lat: 64.1466,
    lon: -21.9426,
    city: "Reykjavík",
    country: "Iceland",
    travelStatus: "Off-duty",
    lastPingISO: "2026-05-14T22:00:00Z",
    accuracyM: 60,
    consent: false,
    batteryPct: 22,
  },
  {
    adjudicatorId: "ADJ-007",
    lat: 6.5244,
    lon: 3.3792,
    city: "Lagos",
    country: "Nigeria",
    travelStatus: "Assigned",
    lastPingISO: "2026-05-15T07:30:00Z",
    accuracyM: 20,
    consent: true,
    batteryPct: 71,
  },
  {
    adjudicatorId: "ADJ-008",
    lat: 1.3521,
    lon: 103.8198,
    city: "Singapore",
    country: "Singapore",
    travelStatus: "Available",
    lastPingISO: "2026-05-15T08:00:00Z",
    accuracyM: 15,
    consent: true,
    batteryPct: 83,
  },
];

/* ---------------- Check-in history ---------------- */
export const initialCheckIns: AdjudicatorCheckIn[] = [
  { id: "CHK-101", adjudicatorId: "ADJ-002", ts: "2026-05-15T07:55:00Z", city: "Tokyo (Haneda Apt)", country: "Japan", travelStatus: "Travelling", note: "Boarding domestic transfer." },
  { id: "CHK-102", adjudicatorId: "ADJ-001", ts: "2026-05-15T08:42:00Z", city: "London", country: "United Kingdom", travelStatus: "On-site", note: "Arrived at Royal Albert Hall." },
  { id: "CHK-103", adjudicatorId: "ADJ-003", ts: "2026-05-15T08:38:00Z", city: "London", country: "United Kingdom", travelStatus: "On-site" },
  { id: "CHK-104", adjudicatorId: "ADJ-005", ts: "2026-05-15T05:20:00Z", city: "Dubai", country: "United Arab Emirates", travelStatus: "Assigned", note: "Pre-event safety briefing scheduled." },
  { id: "CHK-105", adjudicatorId: "ADJ-007", ts: "2026-05-15T07:30:00Z", city: "Lagos", country: "Nigeria", travelStatus: "Assigned" },
  { id: "CHK-106", adjudicatorId: "ADJ-004", ts: "2026-05-15T06:10:00Z", city: "New York", country: "United States", travelStatus: "Available" },
  { id: "CHK-107", adjudicatorId: "ADJ-002", ts: "2026-05-15T01:20:00Z", city: "Tokyo (Narita Apt)", country: "Japan", travelStatus: "Travelling", note: "Landed; clearing customs." },
  { id: "CHK-108", adjudicatorId: "ADJ-001", ts: "2026-05-14T19:00:00Z", city: "London", country: "United Kingdom", travelStatus: "Travelling", note: "Departing hotel for venue." },
];

/* ---------------- Audit log ---------------- */
export const adminAuditLog: AdminAuditEntry[] = [
  { id: "AUD-1", ts: "2026-05-15T09:14:00Z", actor: "Vaigai Ramesh", action: "assigned Lead Adjudicator", target: "Eleanor Whitfield → GWR-2026-0411", tone: "info" },
  { id: "AUD-2", ts: "2026-05-15T09:00:00Z", actor: "System", action: "geo-fence entry detected", target: "Eleanor Whitfield · Royal Albert Hall", tone: "success" },
  { id: "AUD-3", ts: "2026-05-15T08:42:00Z", actor: "Eleanor Whitfield", action: "checked in (On-site)", target: "GWR-2026-0411", tone: "success" },
  { id: "AUD-4", ts: "2026-05-15T07:55:00Z", actor: "Kenji Watanabe", action: "checked in (Travelling)", target: "GWR-2026-0418", tone: "info" },
  { id: "AUD-5", ts: "2026-05-14T18:30:00Z", actor: "Vaigai Ramesh", action: "raised event priority to Flagship", target: "GWR-2026-0411", tone: "warning" },
  { id: "AUD-6", ts: "2026-05-14T15:11:00Z", actor: "Vaigai Ramesh", action: "approved assignment", target: "Amal Hassan → GWR-2026-0612", tone: "info" },
  { id: "AUD-7", ts: "2026-05-13T11:00:00Z", actor: "System", action: "battery low warning", target: "Henrik Lund · 22%", tone: "warning" },
  { id: "AUD-8", ts: "2026-05-12T09:00:00Z", actor: "System", action: "scheduling conflict avoided", target: "ADJ-004 overlap on 2026-05-31 & 2026-07-04", tone: "danger" },
];

/* ---------------- Helpers ----------------
 * Lookups accept an optional explicit list so callers can read from current
 * Redux state (mutable) instead of the static seed list.
 */
export function getAdjudicator(id: string, list: AdminAdjudicator[] = adminAdjudicators): AdminAdjudicator | undefined {
  return list.find((a) => a.id === id);
}
export function getEvent(id: string, list: AdminEvent[] = adminEvents): AdminEvent | undefined {
  return list.find((e) => e.id === id);
}

export const travelStatusTone: Record<TravelStatus, "green" | "blue" | "gold" | "amber" | "red" | "default"> = {
  Available: "green",
  Assigned: "blue",
  Travelling: "gold",
  "On-site": "green",
  Completed: "default",
  "Off-duty": "default",
};
