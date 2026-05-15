import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import invitationsReducer from "./invitations";

export type Role = "witness" | "adjudicator" | "organizer";

export interface AuthUser {
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  organization: string;
  avatarInitials: string;
}

const STORAGE_KEY = "gwr_witness_portal_auth";

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

const storedUser = loadStoredUser();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!storedUser,
    user: storedUser,
  } as AuthState,
  reducers: {
    login: (state, action: PayloadAction<AuthUser>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload)); } catch { /* noop */ }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    },
  },
});

interface UIState {
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  paletteOpen: boolean;
  notificationsOpen: boolean;
}
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarCollapsed: false,
    searchOpen: false,
    paletteOpen: false,
    notificationsOpen: false,
  } as UIState,
  reducers: {
    toggleSidebar: (s) => { s.sidebarCollapsed = !s.sidebarCollapsed; },
    setSearchOpen: (s, a: PayloadAction<boolean>) => { s.searchOpen = a.payload; },
    setPaletteOpen: (s, a: PayloadAction<boolean>) => { s.paletteOpen = a.payload; },
    setNotificationsOpen: (s, a: PayloadAction<boolean>) => { s.notificationsOpen = a.payload; },
  },
});

export const { login, logout } = authSlice.actions;
export const {
  toggleSidebar,
  setSearchOpen,
  setPaletteOpen,
  setNotificationsOpen,
} = uiSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    invitations: invitationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const MOCK_CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  "witness@gwr.com": {
    password: "Witness@123",
    user: {
      name: "Dr. Marcus Hollingsworth",
      email: "witness@gwr.com",
      role: "witness",
      roleLabel: "Independent Witness",
      organization: "Royal Society of Sports Science",
      avatarInitials: "MH",
    },
  },
  "adjudicator@gwr.com": {
    password: "Adjudicator@123",
    user: {
      name: "Eleanor Whitfield",
      email: "adjudicator@gwr.com",
      role: "adjudicator",
      roleLabel: "Senior Adjudicator",
      organization: "Guinness World Records · London",
      avatarInitials: "EW",
    },
  },
  "organizer@gwr.com": {
    password: "Organizer@123",
    user: {
      name: "Priya Sharma",
      email: "organizer@gwr.com",
      role: "organizer",
      roleLabel: "Event Organizer",
      organization: "Aurora Events International",
      avatarInitials: "PS",
    },
  },
};
