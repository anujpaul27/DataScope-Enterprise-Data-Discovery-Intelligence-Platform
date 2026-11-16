import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

// GLOBAL CLIENT STATE: the search being BUILT in the Filter Builder (Phase 6).
// Phase 5 will keep the APPLIED search in the URL (shareable); this slice is the
// editable draft, so half-typed conditions do not spam the API or the address bar.
// Defined now so the shape is fixed before the Explorer and the backend search use it.

export type Operator =
  | "eq"
  | "neq"
  | "contains"
  | "starts_with"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"
  | "last_days";

export interface SearchCondition {
  id: string;
  field: string; // dataset_fields.key
  operator: Operator;
  value: string;
  valueTo?: string; // second value for "between"
}

export interface SortRule {
  field: string;
  direction: "asc" | "desc";
}

export interface SearchConfigState {
  datasetId: string | null;
  globalSearch: string;
  conditions: SearchCondition[];
  sort: SortRule[];
  page: number;
  pageSize: number;
}

const initialState: SearchConfigState = {
  datasetId: null,
  globalSearch: "",
  conditions: [],
  sort: [],
  page: 1,
  pageSize: 25,
};

const searchConfigSlice = createSlice({
  name: "searchConfig",
  initialState,
  reducers: {
    // Switching dataset throws the old search away (its fields do not exist in the new one).
    searchDatasetChanged(state, action: PayloadAction<string | null>) {
      if (state.datasetId === action.payload) return;
      return { ...initialState, pageSize: state.pageSize, datasetId: action.payload };
    },
    globalSearchChanged(state, action: PayloadAction<string>) {
      state.globalSearch = action.payload;
      state.page = 1;
    },
    conditionAdded: {
      reducer(state, action: PayloadAction<SearchCondition>) {
        state.conditions.push(action.payload);
        state.page = 1;
      },
      // `prepare` keeps the reducer pure: the random id is made BEFORE the reducer runs.
      prepare(condition: Omit<SearchCondition, "id">) {
        return { payload: { ...condition, id: nanoid() } };
      },
    },
    conditionUpdated(
      state,
      action: PayloadAction<{ id: string; changes: Partial<Omit<SearchCondition, "id">> }>,
    ) {
      const target = state.conditions.find((c) => c.id === action.payload.id);
      if (target) Object.assign(target, action.payload.changes);
      state.page = 1;
    },
    conditionRemoved(state, action: PayloadAction<string>) {
      state.conditions = state.conditions.filter((c) => c.id !== action.payload);
      state.page = 1;
    },
    conditionsCleared(state) {
      state.conditions = [];
      state.page = 1;
    },
    // Click = asc -> desc -> off. With multi (Shift+click) the other columns stay.
    sortToggled(state, action: PayloadAction<{ field: string; multi?: boolean }>) {
      const { field, multi } = action.payload;
      const current = state.sort.find((s) => s.field === field);
      const others = multi ? state.sort.filter((s) => s.field !== field) : [];
      if (!current) state.sort = [...others, { field, direction: "asc" }];
      else if (current.direction === "asc") state.sort = [...others, { field, direction: "desc" }];
      else state.sort = others;
      state.page = 1;
    },
    sortReplaced(state, action: PayloadAction<SortRule[]>) {
      state.sort = action.payload;
      state.page = 1;
    },
    pageChanged(state, action: PayloadAction<number>) {
      state.page = Math.max(1, Math.floor(action.payload));
    },
    pageSizeChanged(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      state.page = 1;
    },
    searchReset() {
      return initialState;
    },
    // Used when a Saved View is opened (Phase 7).
    searchConfigLoaded(_state, action: PayloadAction<SearchConfigState>) {
      return action.payload;
    },
  },
  selectors: {
    selectSearchConfig: (s) => s,
    selectConditionCount: (s) => s.conditions.length,
  },
});

export const {
  searchDatasetChanged,
  globalSearchChanged,
  conditionAdded,
  conditionUpdated,
  conditionRemoved,
  conditionsCleared,
  sortToggled,
  sortReplaced,
  pageChanged,
  pageSizeChanged,
  searchReset,
  searchConfigLoaded,
} = searchConfigSlice.actions;
export const { selectSearchConfig, selectConditionCount } = searchConfigSlice.selectors;
export default searchConfigSlice.reducer;
