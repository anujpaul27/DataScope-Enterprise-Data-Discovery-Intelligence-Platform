import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import UsersTable from "@/features/users/components/UsersTable";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  // Check the role in the PAGE too, not only in admin/layout.tsx. Next.js renders a
  // layout and its page in parallel, so a layout-only check can let page content
  // start streaming before the redirect arrives.
  const me = await requireRole("admin");

  return (
    <>
      <PageHeader title="Users" description="Change roles and deactivate accounts." />
      <UsersTable currentUserId={me.id} />
    </>
  );
}
