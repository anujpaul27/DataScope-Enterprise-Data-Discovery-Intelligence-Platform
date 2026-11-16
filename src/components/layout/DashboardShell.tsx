"use client";

import { useState, type ReactNode } from "react";
import type { AppUser } from "@/types";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Layout only: fixed sidebar on desktop, slide-in drawer on mobile.
export default function DashboardShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-base-300 md:block">
        <Sidebar role={user.role} />
      </aside>

      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-base-300 shadow-xl">
            <Sidebar role={user.role} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="md:pl-64">
        <Topbar user={user} onMenuClick={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
