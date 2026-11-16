"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { AppUser } from "@/types";

type State =
  | { status: "loading" }
  | { status: "ok"; user: AppUser }
  | { status: "error"; message: string };

// Calls GET /api/me on the Express backend with the user's JWT.
// If this card is green, sign-in -> JWT -> Express verification all work.
export default function ApiStatusCard() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ user: AppUser }>("/api/me")
      .then((res) => !cancelled && setState({ status: "ok", user: res.user }))
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError ? `${err.message} (${err.status})` : "Cannot reach the API. Is the backend running?";
        setState({ status: "error", message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-box border border-base-300 p-5">
      <p className="text-sm font-medium">Backend connection</p>
      <div className="mt-3 flex items-center gap-2 text-sm">
        {state.status === "loading" && (
          <>
            <Loader2 className="size-4 animate-spin" /> Checking...
          </>
        )}
        {state.status === "ok" && (
          <>
            <CheckCircle2 className="size-4 text-success" />
            <span>
              API verified your token as <strong>{state.user.role}</strong>
            </span>
          </>
        )}
        {state.status === "error" && (
          <>
            <XCircle className="size-4 text-error" />
            <span className="text-error">{state.message}</span>
          </>
        )}
      </div>
    </div>
  );
}
