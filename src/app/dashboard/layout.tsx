import type { ReactNode } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { requireUser } from "@/lib/session";

// SERVER component. Every page under /dashboard passes through this check,
// so a missing / expired / deactivated session never reaches the page.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
