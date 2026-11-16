"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { clearApiToken } from "@/lib/api/token";
import { signOut } from "@/lib/auth-client";

export default function LogoutButton({ className = "btn btn-ghost btn-sm w-full justify-start" }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await signOut();
      clearApiToken();
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button type="button" className={className} onClick={handleLogout} disabled={busy}>
      <LogOut className="size-4" />
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}
