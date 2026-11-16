import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DatasetLibrary from "@/features/datasets/components/DatasetLibrary";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dataset Library" };

export default async function DatasetsPage() {
  // The server decides WHO may see this page (and gives the client store its user).
  // The datasets themselves are loaded by the client with RTK Query, see the guide, section 6.
  await requireUser();

  return (
    <>
      <PageHeader title="Dataset Library" description="Browse the datasets you are allowed to open." />
      <Suspense fallback={<div className="skeleton h-64" />}>
        <DatasetLibrary />
      </Suspense>
    </>
  );
}
