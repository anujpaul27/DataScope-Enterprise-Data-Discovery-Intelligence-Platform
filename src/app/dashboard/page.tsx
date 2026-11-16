import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import RoleBadge from "@/components/ui/RoleBadge";
import OverviewStats from "@/features/datasets/components/OverviewStats";
import ApiStatusCard from "@/features/users/components/ApiStatusCard";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Here is where you stand today." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-box border border-base-300 p-5">
          <p className="text-sm font-medium">Your access</p>
          <div className="mt-3">
            <RoleBadge role={user.role} />
          </div>
          <p className="mt-3 text-sm text-base-content/60">
            {user.role === "admin" && "You can manage users, datasets and permissions."}
            {user.role === "analyst" && "You can explore datasets, build advanced searches and save views."}
            {user.role === "viewer" && "You can browse datasets you have been given access to."}
          </p>
        </div>

        <OverviewStats />

        <ApiStatusCard />

        <div className="rounded-box border border-base-300 p-5">
          <p className="text-sm font-medium">Start exploring</p>
          <p className="mt-3 text-sm text-base-content/60">The Data Explorer arrives in the next phase.</p>
          <Link href="/dashboard/explorer" className="btn btn-primary btn-sm mt-4">
            Open Data Explorer
          </Link>
        </div>
      </div>
    </>
  );
}
