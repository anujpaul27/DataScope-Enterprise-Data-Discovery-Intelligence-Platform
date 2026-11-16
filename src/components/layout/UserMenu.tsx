import type { AppUser } from "@/types";
import LogoutButton from "@/features/auth/components/LogoutButton";
import RoleBadge from "@/components/ui/RoleBadge";

export default function UserMenu({ user }: { user: AppUser }) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="dropdown dropdown-end">
      <button type="button" tabIndex={0} className="btn btn-ghost btn-sm gap-2 px-2" aria-label="Account menu">
        <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {initials || "?"}
        </span>
        <span className="hidden max-w-32 truncate text-sm sm:block">{user.name}</span>
      </button>
      <div tabIndex={0} className="dropdown-content z-20 mt-2 w-64 rounded-box border border-base-300 bg-base-100 p-3 shadow-lg">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-base-content/60">{user.email}</p>
        <div className="mt-2">
          <RoleBadge role={user.role} />
        </div>
        <div className="my-3 border-t border-base-300" />
        <LogoutButton />
      </div>
    </div>
  );
}
