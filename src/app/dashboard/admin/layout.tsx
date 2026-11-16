import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";

// Everything under /dashboard/admin is for administrators only.
// A viewer who types the URL by hand is sent back to /dashboard.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("admin");
  return <>{children}</>;
}
