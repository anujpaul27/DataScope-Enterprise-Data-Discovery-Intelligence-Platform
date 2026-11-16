"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { getErrorMessage } from "@/lib/api/errors";
import { useGetMeQuery } from "../api/usersApi";

// Calls GET /api/me on the Express backend with the user's JWT (through RTK Query).
// If this card is green, sign-in -> JWT -> Express verification all work.
export default function ApiStatusCard() {
  const { data, isLoading, error } = useGetMeQuery();

  return (
    <div className="rounded-box border border-base-300 p-5">
      <p className="text-sm font-medium">Backend connection</p>
      <div className="mt-3 flex items-center gap-2 text-sm">
        {isLoading && (
          <>
            <Loader2 className="size-4 animate-spin" /> Checking...
          </>
        )}
        {data && (
          <>
            <CheckCircle2 className="size-4 text-success" />
            <span>
              API verified your token as <strong>{data.role}</strong>
            </span>
          </>
        )}
        {error && (
          <>
            <XCircle className="size-4 text-error" />
            <span className="text-error">{getErrorMessage(error)}</span>
          </>
        )}
      </div>
    </div>
  );
}
