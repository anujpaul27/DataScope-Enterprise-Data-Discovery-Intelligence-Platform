import type { Metadata } from "next";
import DatasetDetail from "@/features/datasets/components/DatasetDetail";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dataset" };

export default async function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  // Access is NOT decided here: the API answers 404 for a dataset the user may not open.
  return <DatasetDetail id={id} />;
}
