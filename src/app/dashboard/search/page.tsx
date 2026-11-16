import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataExplorer from "@/features/explorer/components/DataExplorer";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Advanced Search" };

export default async function AdvancedSearchPage() {
  // Viewers browse via Explorer with basic search; multi-condition builder is for analysts+.
  await requireRole("admin", "analyst");

  return (
    <>
      <PageHeader
        title="Advanced Search"
        description="Build multi-condition queries: exact/partial match, numeric and date ranges, combined filters."
      />
      <Suspense fallback={<div className="skeleton h-64" />}>
        <DataExplorer filtersAlwaysOpen />
      </Suspense>
    </>
  );
}
