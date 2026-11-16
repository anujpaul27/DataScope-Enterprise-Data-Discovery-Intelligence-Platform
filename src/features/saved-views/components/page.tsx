import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { requireUser } from "@/lib/session";
import SavedViewsPage from "./SavedViewsPage";

export const metadata: Metadata = { title: "Saved Views" };

export default async function Page() {
  // Every signed-in user may open the page. WHICH views they see is decided by the API:
  // admins see all, analysts their own + shared with them, viewers only what was shared.
  await requireUser();

  return (
    <>
      <PageHeader title="Saved Views" description="Reusable search configurations: yours and the ones shared with you." />
      <Suspense fallback={<div className="skeleton h-64" />}>
        <SavedViewsPage />
      </Suspense>
    </>
  );
}
