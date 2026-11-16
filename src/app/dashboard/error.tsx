"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";

// Error boundary for every dashboard page: the sidebar stays, only the page area shows the error.
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={TriangleAlert}
      title="This page could not be loaded"
      description="Something went wrong while loading this page."
      action={
        <button type="button" className="btn btn-primary btn-sm" onClick={reset}>
          Try again
        </button>
      }
    />
  );
}
