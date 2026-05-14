import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string; role: string } | null;
}
const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: true,
    user: {
      name: "Eleanor Whitfield",
      email: "e.whitfield@guinnessworldrecords.com",
      role: "Senior Adjudicator",
    },
  } as AuthState,
  reducers: {
    login: (state, action: PayloadAction<AuthState["user"]>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

interface UIState {
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  activeSubmissionId: string | null;
}
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarCollapsed: false,
    searchOpen: false,
    activeSubmissionId: "GWR-2025-0411",
  } as UIState,
  reducers: {
    toggleSidebar: (s) => { s.sidebarCollapsed = !s.sidebarCollapsed; },
    setSearchOpen: (s, a: PayloadAction<boolean>) => { s.searchOpen = a.payload; },
    setActiveSubmission: (s, a: PayloadAction<string>) => { s.activeSubmissionId = a.payload; },
  },
});

export const { login, logout } = authSlice.actions;
export const { toggleSidebar, setSearchOpen, setActiveSubmission } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
