import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppUser } from "@/types";

// GLOBAL CLIENT STATE: "who is signed in".
// The server (dashboard/layout.tsx) reads the session and hands the user to
// StoreProvider, which puts it here as the store's initial state. There is no
// loading flash and no extra request. The token itself is NOT stored here
// (lib/api/token.ts keeps it in memory); Redux only holds what the UI needs to render.
interface AuthState {
  user: AppUser | null;
}

const initialState: AuthState = { user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AppUser>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  selectors: {
    selectCurrentUser: (s) => s.user,
    selectRole: (s) => s.user?.role ?? null,
    selectIsAdmin: (s) => s.user?.role === "admin",
    selectIsAnalystOrAdmin: (s) => s.user?.role === "admin" || s.user?.role === "analyst",
  },
});

export const { setUser, clearUser } = authSlice.actions;
export const { selectCurrentUser, selectRole, selectIsAdmin, selectIsAnalystOrAdmin } =
  authSlice.selectors;
export default authSlice.reducer;
