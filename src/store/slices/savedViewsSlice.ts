import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// GLOBAL CLIENT STATE for Saved Views (Phase 7).
// The views themselves are SERVER STATE (RTK Query). Here we only remember which view
// is open and whether the user changed the search since opening it ("unsaved changes").
interface SavedViewsState {
  activeViewId: string | null;
  isDirty: boolean;
}

const initialState: SavedViewsState = { activeViewId: null, isDirty: false };

const savedViewsSlice = createSlice({
  name: "savedViews",
  initialState,
  reducers: {
    viewActivated(state, action: PayloadAction<string>) {
      state.activeViewId = action.payload;
      state.isDirty = false;
    },
    viewDirtied(state) {
      if (state.activeViewId) state.isDirty = true;
    },
    viewSaved(state) {
      state.isDirty = false;
    },
    viewDeactivated() {
      return initialState;
    },
  },
  selectors: {
    selectActiveViewId: (s) => s.activeViewId,
    selectViewIsDirty: (s) => s.isDirty,
  },
});

export const { viewActivated, viewDirtied, viewSaved, viewDeactivated } = savedViewsSlice.actions;
export const { selectActiveViewId, selectViewIsDirty } = savedViewsSlice.selectors;
export default savedViewsSlice.reducer;
