import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";
import datasetReducer from "./slices/datasetSlice";
import savedViewsReducer from "./slices/savedViewsSlice";
import searchConfigReducer from "./slices/searchConfigSlice";
import uiPreferenceReducer from "./slices/uiPreferenceSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  dataset: datasetReducer,
  searchConfig: searchConfigReducer,
  savedViews: savedViewsReducer,
  uiPreference: uiPreferenceReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// A function, not a global: every browser session gets its own store, and the
// store is thrown away when the dashboard unmounts (logout can never leak data
// from one user to the next).
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
