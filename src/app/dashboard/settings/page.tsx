import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import RoleBadge from "@/components/ui/RoleBadge";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Settings" description="Your account details. Preferences are added in a later phase." />
      <div className="max-w-xl rounded-box border border-base-300 p-5">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-base-content/60">Name</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="text-base-content/60">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-base-content/60">Role</dt>
            <dd className="mt-1">
              <RoleBadge role={user.role} />
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
