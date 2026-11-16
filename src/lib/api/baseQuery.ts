import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { ApiError, apiFetch } from "./client";

export interface ApiRequest {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

/** The ONE error shape every RTK Query hook gives to components. */
export interface ApiQueryError {
  /** HTTP status, or "NETWORK" when the server could not be reached at all. */
  status: number | "NETWORK";
  code: string;
  message: string;
  details?: unknown;
}

/**
 * RTK Query baseQuery. It adds nothing new to the network logic: it calls apiFetch()
 * (JWT + one retry on 401) and turns every failure into an ApiQueryError.
 * `api.signal` lets RTK Query CANCEL the request when a component unmounts or its
 * arguments change, which is how stale in-flight requests are dropped.
 */
export const apiBaseQuery: BaseQueryFn<string | ApiRequest, unknown, ApiQueryError> = async (
  arg,
  api,
) => {
  const req: ApiRequest = typeof arg === "string" ? { url: arg } : arg;
  try {
    const data = await apiFetch<unknown>(req.url, {
      method: req.method ?? "GET",
      body: req.body === undefined ? undefined : JSON.stringify(req.body),
      signal: api.signal,
    });
    return { data };
  } catch (err) {
    if (api.signal.aborted) {
      return { error: { status: "NETWORK", code: "ABORTED", message: "Request cancelled" } };
    }
    if (err instanceof ApiError) {
      return {
        error: { status: err.status, code: err.code, message: err.message, details: err.details },
      };
    }
    if (err instanceof Error && err.message === "Not signed in") {
      return {
        error: { status: 401, code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." },
      };
    }
    return {
      error: {
        status: "NETWORK",
        code: "NETWORK_ERROR",
        message: "Cannot reach the API. Check your connection and try again.",
      },
    };
  }
};

/** Only network failures and 5xx are worth retrying. 4xx would fail again the same way. */
export function isRetryable(error: ApiQueryError): boolean {
  // ABORTED: we cancelled it. QUERY_TIMEOUT: the database already spent its full time limit,
  // trying the same heavy query again would only double the load.
  if (error.code === "ABORTED" || error.code === "QUERY_TIMEOUT") return false;
  return error.status === "NETWORK" || (typeof error.status === "number" && error.status >= 500);
}
