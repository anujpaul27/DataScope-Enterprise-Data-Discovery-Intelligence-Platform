import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// GLOBAL CLIENT STATE: which dataset the user is working on right now.
// Only IDs live here. The dataset objects themselves are SERVER STATE and are
// cached by RTK Query (never copy them into a slice: two copies = out of sync).
interface DatasetState {
  activeDatasetId: string | null;
  recentDatasetIds: string[];
}

const initialState: DatasetState = { activeDatasetId: null, recentDatasetIds: [] };
const MAX_RECENT = 5;

const datasetSlice = createSlice({
  name: "dataset",
  initialState,
  reducers: {
    datasetOpened(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.activeDatasetId = id;
      state.recentDatasetIds = [id, ...state.recentDatasetIds.filter((x) => x !== id)].slice(
        0,
        MAX_RECENT,
      );
    },
    datasetClosed(state) {
      state.activeDatasetId = null;
    },
    datasetForgotten(state, action: PayloadAction<string>) {
      // e.g. after an admin deletes it
      if (state.activeDatasetId === action.payload) state.activeDatasetId = null;
      state.recentDatasetIds = state.recentDatasetIds.filter((x) => x !== action.payload);
    },
  },
  selectors: {
    selectActiveDatasetId: (s) => s.activeDatasetId,
    selectRecentDatasetIds: (s) => s.recentDatasetIds,
  },
});

export const { datasetOpened, datasetClosed, datasetForgotten } = datasetSlice.actions;
export const { selectActiveDatasetId, selectRecentDatasetIds } = datasetSlice.selectors;
export default datasetSlice.reducer;
