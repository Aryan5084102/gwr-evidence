/**
 * Minimal admin slice — frontend-only settings.
 *
 * All persistent admin data (events, adjudicators, assignments, locations,
 * notifications, audit) now lives on the backend and is read with react-query.
 * Only operational dashboard settings (SLA targets, geofence defaults, etc.)
 * are stored client-side as user preferences.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AdminSettings {
  defaultGeofenceM: number;
  overdueCheckinHours: number;
  lowBatteryPct: number;
  leadAssignmentSlaDays: number;
  auditRetentionDays: number;
  emailOnAssign: boolean;
  consentRequiresApproval: boolean;
}

interface AdminState {
  settings: AdminSettings;
}

const STORAGE_KEY = "gwr_admin_settings";

function loadSettings(): AdminSettings {
  const defaults: AdminSettings = {
    defaultGeofenceM: 250,
    overdueCheckinHours: 4,
    lowBatteryPct: 25,
    leadAssignmentSlaDays: 14,
    auditRetentionDays: 365,
    emailOnAssign: true,
    consentRequiresApproval: false,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return defaults;
}

function saveSettings(s: AdminSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

const slice = createSlice({
  name: "admin",
  initialState: { settings: loadSettings() } as AdminState,
  reducers: {
    updateSettings: (s, a: PayloadAction<Partial<AdminSettings>>) => {
      s.settings = { ...s.settings, ...a.payload };
      saveSettings(s.settings);
    },
  },
});

export const { updateSettings } = slice.actions;
export default slice.reducer;
