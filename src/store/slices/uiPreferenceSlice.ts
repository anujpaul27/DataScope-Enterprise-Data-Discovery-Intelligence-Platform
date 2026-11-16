import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// GLOBAL CLIENT STATE: how the user likes the interface. Saved in localStorage
// (store/persist.ts). Phase 8 can also sync it to the user_preferences table.
export type LibraryLayout = "grid" | "list";
export type TableDensity = "comfortable" | "compact";

export interface UiPreferenceState {
  libraryLayout: LibraryLayout;
  tableDensity: TableDensity;
  defaultPageSize: number;
  /** datasetId -> visible column keys */
  columnVisibility: Record<string, string[]>;
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const initialUiState: UiPreferenceState = {
  libraryLayout: "grid",
  tableDensity: "comfortable",
  defaultPageSize: 25,
  columnVisibility: {},
};

const uiPreferenceSlice = createSlice({
  name: "uiPreference",
  initialState: initialUiState,
  reducers: {
    libraryLayoutChanged(state, action: PayloadAction<LibraryLayout>) {
      state.libraryLayout = action.payload;
    },
    tableDensityChanged(state, action: PayloadAction<TableDensity>) {
      state.tableDensity = action.payload;
    },
    defaultPageSizeChanged(state, action: PayloadAction<number>) {
      state.defaultPageSize = action.payload;
    },
    columnVisibilityChanged(state, action: PayloadAction<{ datasetId: string; columns: string[] }>) {
      state.columnVisibility[action.payload.datasetId] = action.payload.columns;
    },
    // Called once on the client with the (validated) localStorage content.
    uiPreferencesHydrated(state, action: PayloadAction<Partial<UiPreferenceState>>) {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  libraryLayoutChanged,
  tableDensityChanged,
  defaultPageSizeChanged,
  columnVisibilityChanged,
  uiPreferencesHydrated,
} = uiPreferenceSlice.actions;
export default uiPreferenceSlice.reducer;
