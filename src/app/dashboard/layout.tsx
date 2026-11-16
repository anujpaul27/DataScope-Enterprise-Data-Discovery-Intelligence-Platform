import type { ReactNode } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { requireUser } from "@/lib/session";
import StoreProvider from "@/store/StoreProvider";

// SERVER component. Every page under /dashboard passes through this check,
// so a missing / expired / deactivated session never reaches the page.
// Phase 4: the verified user is also handed to the Redux store (auth slice).
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    // key = a different user always gets a brand-new store and an empty cache
    <StoreProvider key={user.id} user={user}>
      <DashboardShell user={user}>{children}</DashboardShell>
    </StoreProvider>
  );
}
