import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataExplorer from "@/features/explorer/components/DataExplorer";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Data Explorer" };

export default async function ExplorerPage() {
  // The server decides WHO may open the page. WHICH records they get is decided by the API
  // (dataset permission check on every request), never by this page.
  await requireUser();

  return (
    <>
      <PageHeader title="Data Explorer" description="Search, sort and page through large datasets. All work is done by the database." />
      <Suspense fallback={<div className="skeleton h-64" />}>
        <DataExplorer />
      </Suspense>
    </>
  );
}
