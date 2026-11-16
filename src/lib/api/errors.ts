import type { ApiQueryError } from "./baseQuery";

function isApiQueryError(value: unknown): value is ApiQueryError {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    "code" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}

/** Safe text for a toast / error state, whatever RTK Query or fetch threw. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isApiQueryError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function getErrorStatus(error: unknown): number | "NETWORK" | undefined {
  return isApiQueryError(error) ? error.status : undefined;
}
