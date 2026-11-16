import type { AppStore } from "./index";
import {
  PAGE_SIZE_OPTIONS,
  initialUiState,
  uiPreferencesHydrated,
  type UiPreferenceState,
} from "./slices/uiPreferenceSlice";

const KEY = "datascope.ui.v1";

// localStorage can be empty, old, hand-edited or blocked (private mode): never trust it.
function readSaved(): Partial<UiPreferenceState> | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<UiPreferenceState>;
    const out: Partial<UiPreferenceState> = {};

    if (data.libraryLayout === "grid" || data.libraryLayout === "list") out.libraryLayout = data.libraryLayout;
    if (data.tableDensity === "comfortable" || data.tableDensity === "compact") out.tableDensity = data.tableDensity;
    if ((PAGE_SIZE_OPTIONS as readonly number[]).includes(data.defaultPageSize as number)) {
      out.defaultPageSize = data.defaultPageSize;
    }
    if (data.columnVisibility && typeof data.columnVisibility === "object") {
      const clean: Record<string, string[]> = {};
      for (const [id, cols] of Object.entries(data.columnVisibility)) {
        if (Array.isArray(cols) && cols.every((c) => typeof c === "string")) clean[id] = cols;
      }
      out.columnVisibility = clean;
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * Called from an effect (browser only). Loads the saved preferences AFTER the first
 * render, so the server HTML and the first client render are identical (no hydration
 * mismatch), then saves every later change. Returns a cleanup function.
 */
export function startUiPersistence(store: AppStore): () => void {
  const saved = readSaved();
  if (saved) store.dispatch(uiPreferencesHydrated(saved));

  let last: UiPreferenceState = store.getState().uiPreference ?? initialUiState;
  return store.subscribe(() => {
    const next = store.getState().uiPreference;
    if (next === last) return; // other slices changed, nothing to save
    last = next;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked: preferences just will not survive a reload */
    }
  });
}
