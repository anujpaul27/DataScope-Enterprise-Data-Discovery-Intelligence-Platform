import type { ApiErrorBody } from "@/types";
import { clearApiToken, getApiToken } from "./token";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function send(path: string, init: RequestInit | undefined, token: string): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Calls the Express API with the user's JWT.
 * Phase 4: the RTK Query baseQuery (lib/api/baseQuery.ts) wraps this function,
 * so token handling and the one-time 401 retry still live in exactly one place.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await send(path, init, await getApiToken());

  // Token rejected (e.g. expired while the tab was asleep): get a fresh one, retry ONCE.
  if (res.status === 401) {
    clearApiToken();
    res = await send(path, init, await getApiToken());
  }

  if (!res.ok) {
    let body: Partial<ApiErrorBody> = {};
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      /* body was not JSON */
    }
    throw new ApiError(
      res.status,
      body.error?.code ?? "HTTP_ERROR",
      body.error?.message ?? `Request failed (${res.status})`,
      body.error?.details,
    );
  }

  // 204 No Content (DELETE endpoints) has no body to parse.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
