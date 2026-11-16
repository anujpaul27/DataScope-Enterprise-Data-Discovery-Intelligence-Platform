import { Menu } from "lucide-react";
import type { AppUser } from "@/types";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default function Topbar({ user, onMenuClick }: { user: AppUser; onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-base-300 bg-base-100/90 px-4 backdrop-blur">
      <button type="button" className="btn btn-ghost btn-sm btn-square md:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="size-5" />
      </button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
