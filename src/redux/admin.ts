import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  initialAssignments,
  initialLocations,
  initialCheckIns,
  initialNotifications,
  adminEvents as seedEvents,
  adminAdjudicators as seedAdjudicators,
  type AdminAssignment,
  type AdjudicatorLocation,
  type AdjudicatorCheckIn,
  type AdminEvent,
  type AdminAdjudicator,
  type AdminNotification,
  type TravelStatus,
} from "@/mock-data/admin";

export interface AdminSettings {
  /** Default geo-fence radius in metres for newly-created events. */
  defaultGeofenceM: number;
  /** Hours without a ping that count as “overdue”. */
  overdueCheckinHours: number;
  /** Battery percentage that triggers a warning. */
  lowBatteryPct: number;
  /** SLA: days before event start that Lead must be assigned. */
  leadAssignmentSlaDays: number;
  /** Audit log retention in days. */
  auditRetentionDays: number;
  /** Push email briefing on assignment. */
  emailOnAssign: boolean;
  /** Require admin approval when consent is re-granted. */
  consentRequiresApproval: boolean;
}

interface AdminState {
  events: AdminEvent[];
  adjudicators: AdminAdjudicator[];
  assignments: AdminAssignment[];
  locations: AdjudicatorLocation[];
  checkIns: AdjudicatorCheckIn[];
  notifications: AdminNotification[];
  settings: AdminSettings;
}

const initialState: AdminState = {
  events: seedEvents,
  adjudicators: seedAdjudicators,
  assignments: initialAssignments,
  locations: initialLocations,
  checkIns: initialCheckIns,
  notifications: initialNotifications,
  settings: {
    defaultGeofenceM: 250,
    overdueCheckinHours: 4,
    lowBatteryPct: 25,
    leadAssignmentSlaDays: 14,
    auditRetentionDays: 365,
    emailOnAssign: true,
    consentRequiresApproval: false,
  },
};

function nowISO() { return new Date().toISOString(); }
function shortId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

const slice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    /* ---------- Events ---------- */
    upsertEvent: (s, a: PayloadAction<AdminEvent>) => {
      const idx = s.events.findIndex((e) => e.id === a.payload.id);
      if (idx >= 0) s.events[idx] = a.payload;
      else s.events.unshift(a.payload);
    },
    deleteEvent: (s, a: PayloadAction<{ id: string }>) => {
      s.events = s.events.filter((e) => e.id !== a.payload.id);
      s.assignments = s.assignments.filter((x) => x.eventId !== a.payload.id);
    },
    setEventGeofence: (s, a: PayloadAction<{ id: string; radiusM: number }>) => {
      const ev = s.events.find((e) => e.id === a.payload.id);
      if (ev) ev.geofenceRadiusM = a.payload.radiusM;
    },

    /* ---------- Adjudicators ---------- */
    upsertAdjudicator: (s, a: PayloadAction<AdminAdjudicator>) => {
      const idx = s.adjudicators.findIndex((x) => x.id === a.payload.id);
      if (idx >= 0) s.adjudicators[idx] = a.payload;
      else s.adjudicators.unshift(a.payload);
    },
    deleteAdjudicator: (s, a: PayloadAction<{ id: string }>) => {
      s.adjudicators = s.adjudicators.filter((x) => x.id !== a.payload.id);
      s.assignments = s.assignments.filter((x) => x.adjudicatorId !== a.payload.id);
      s.locations = s.locations.filter((x) => x.adjudicatorId !== a.payload.id);
    },

    /* ---------- Assignments ---------- */
    assignAdjudicator: (
      s,
      a: PayloadAction<{ eventId: string; adjudicatorId: string; role: AdminAssignment["role"]; note?: string }>
    ) => {
      const exists = s.assignments.find(
        (x) => x.eventId === a.payload.eventId && x.adjudicatorId === a.payload.adjudicatorId
      );
      if (exists) return;
      s.assignments.unshift({
        id: shortId("ASN"),
        eventId: a.payload.eventId,
        adjudicatorId: a.payload.adjudicatorId,
        role: a.payload.role,
        status: "Assigned",
        assignedAt: nowISO(),
        note: a.payload.note,
      });
    },
    unassignAdjudicator: (s, a: PayloadAction<{ assignmentId: string }>) => {
      s.assignments = s.assignments.filter((x) => x.id !== a.payload.assignmentId);
    },
    setAssignmentStatus: (
      s,
      a: PayloadAction<{ assignmentId: string; status: AdminAssignment["status"] }>
    ) => {
      const asn = s.assignments.find((x) => x.id === a.payload.assignmentId);
      if (asn) asn.status = a.payload.status;
    },

    /* ---------- Tracking ---------- */
    updateAdjudicatorLocation: (
      s,
      a: PayloadAction<{
        adjudicatorId: string;
        lat: number;
        lon: number;
        city: string;
        country: string;
        travelStatus: TravelStatus;
        accuracyM?: number;
      }>
    ) => {
      const loc = s.locations.find((x) => x.adjudicatorId === a.payload.adjudicatorId);
      const tsISO = nowISO();
      if (loc) {
        loc.lat = a.payload.lat;
        loc.lon = a.payload.lon;
        loc.city = a.payload.city;
        loc.country = a.payload.country;
        loc.travelStatus = a.payload.travelStatus;
        loc.lastPingISO = tsISO;
        loc.accuracyM = a.payload.accuracyM ?? loc.accuracyM;
      } else {
        s.locations.push({
          adjudicatorId: a.payload.adjudicatorId,
          lat: a.payload.lat,
          lon: a.payload.lon,
          city: a.payload.city,
          country: a.payload.country,
          travelStatus: a.payload.travelStatus,
          lastPingISO: tsISO,
          accuracyM: a.payload.accuracyM ?? 50,
          consent: true,
          batteryPct: 90,
        });
      }
      s.checkIns.unshift({
        id: shortId("CHK"),
        adjudicatorId: a.payload.adjudicatorId,
        ts: tsISO,
        city: a.payload.city,
        country: a.payload.country,
        travelStatus: a.payload.travelStatus,
        note: "Manual update from admin console",
      });
    },
    toggleConsent: (s, a: PayloadAction<{ adjudicatorId: string }>) => {
      const loc = s.locations.find((x) => x.adjudicatorId === a.payload.adjudicatorId);
      if (loc) loc.consent = !loc.consent;
    },

    /* ---------- Notifications ---------- */
    pushNotification: (
      s,
      a: PayloadAction<Omit<AdminNotification, "id" | "ts" | "unread"> & { unread?: boolean }>
    ) => {
      s.notifications.unshift({
        id: shortId("NOTE"),
        ts: nowISO(),
        unread: true,
        ...a.payload,
      });
      // cap inbox size
      if (s.notifications.length > 200) s.notifications.length = 200;
    },
    markNotificationRead: (s, a: PayloadAction<{ id: string }>) => {
      const n = s.notifications.find((x) => x.id === a.payload.id);
      if (n) n.unread = false;
    },
    markAllNotificationsRead: (s) => {
      s.notifications.forEach((n) => { n.unread = false; });
    },
    dismissNotification: (s, a: PayloadAction<{ id: string }>) => {
      s.notifications = s.notifications.filter((x) => x.id !== a.payload.id);
    },

    /* ---------- Settings ---------- */
    updateSettings: (s, a: PayloadAction<Partial<AdminSettings>>) => {
      s.settings = { ...s.settings, ...a.payload };
    },
  },
});

export const {
  upsertEvent,
  deleteEvent,
  setEventGeofence,
  upsertAdjudicator,
  deleteAdjudicator,
  assignAdjudicator,
  unassignAdjudicator,
  setAssignmentStatus,
  updateAdjudicatorLocation,
  toggleConsent,
  pushNotification,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
  updateSettings,
} = slice.actions;

export default slice.reducer;
