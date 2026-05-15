import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type InvitationStatus =
  | "Invited"
  | "Submitted"
  | "Clarification Requested"
  | "Approved"
  | "Rejected";

export interface InvitationStatement {
  recordTitle: string;
  applicationRef: string;
  firstName: string;
  lastName: string;
  organisation: string;
  nationality: string;
  email: string;
  telephone: string;
  witnessDetails: string;
  expertise: string;
  finalMeasurement: string;
  venue: string;
  cityTown: string;
  country: string;
  presentDates: string;
  completedISO: string;
  signatureDataUrl?: string;
}

export interface Invitation {
  id: string;
  token: string;
  attemptId: string;
  witnessName: string;
  witnessEmail: string;
  expertise: string;
  status: InvitationStatus;
  sentAt: string;
  organizerName: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNote?: string;
  statement?: InvitationStatement;
}

const STORAGE_KEY = "gwr_witness_portal_invitations";

function load(): Invitation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Invitation[]) : [];
  } catch {
    return [];
  }
}
function persist(list: Invitation[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* noop */ }
}

interface State { items: Invitation[] }

const slice = createSlice({
  name: "invitations",
  initialState: { items: load() } as State,
  reducers: {
    addInvitations: (s, a: PayloadAction<Invitation[]>) => {
      s.items.push(...a.payload);
      persist(s.items);
    },
    markSubmitted: (s, a: PayloadAction<{ token: string; statement: InvitationStatement }>) => {
      const inv = s.items.find((i) => i.token === a.payload.token);
      if (inv) {
        inv.status = "Submitted";
        inv.submittedAt = new Date().toISOString();
        inv.statement = a.payload.statement;
        persist(s.items);
      }
    },
    setStatus: (s, a: PayloadAction<{ id: string; status: InvitationStatus; note?: string }>) => {
      const inv = s.items.find((i) => i.id === a.payload.id);
      if (inv) {
        inv.status = a.payload.status;
        inv.reviewedAt = new Date().toISOString();
        if (a.payload.note !== undefined) inv.reviewNote = a.payload.note;
        persist(s.items);
      }
    },
    removeInvitation: (s, a: PayloadAction<string>) => {
      s.items = s.items.filter((i) => i.id !== a.payload);
      persist(s.items);
    },
    clearAll: (s) => { s.items = []; persist(s.items); },
  },
});

export const { addInvitations, markSubmitted, setStatus, removeInvitation, clearAll } = slice.actions;
export default slice.reducer;

export function makeToken() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}
