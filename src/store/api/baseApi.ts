import { createApi, retry } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery, isRetryable, type ApiQueryError } from "@/lib/api/baseQuery";

// Slow network / flaky API: GET requests are retried up to 2 more times (with growing
// pauses) but ONLY for network errors and 5xx. Mutations switch retry off per endpoint
// (extraOptions: { maxRetries: 0 }) because repeating a POST could create things twice.
const baseQueryWithRetry = retry(apiBaseQuery, {
  maxRetries: 2,
  retryCondition: (error) => isRetryable(error as ApiQueryError),
});

// Every endpoint file adds its endpoints to THIS one api with injectEndpoints(),
// so there is one cache, one middleware and one reducer in the whole store.
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    "Me",
    "Users",
    "Datasets",
    "Dataset",
    "DatasetSummary",
    "DatasetCategories",
    "Permissions",
    "Records",
    "Record",
    "SavedViews",
    "SavedView",
    "ViewShares",
  ],

  // ---- stale data policy (explained in PHASE-4-GUIDE.md) ----
  keepUnusedDataFor: 120, // seconds a cache entry survives after its last component unmounts
  refetchOnMountOrArgChange: 60, // opening a page again: refresh in the background if data is older than 60 s
  refetchOnFocus: true, // coming back to the tab refreshes active queries
  refetchOnReconnect: true, // so does getting the internet back

  endpoints: () => ({}),
});
