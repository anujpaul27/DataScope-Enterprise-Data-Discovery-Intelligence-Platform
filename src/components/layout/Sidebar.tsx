"use client";

import { Telescope, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole } from "@/config/navigation";
import type { Role } from "@/types";

interface SidebarProps {
  role: Role;
  /** Mobile drawer: called when a link is tapped or the X is pressed. */
  onNavigate?: () => void;
}

export default function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const sections = navForRole(role);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Main navigation" className="flex h-full flex-col bg-base-200">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={onNavigate}>
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-content">
            <Telescope className="size-4" aria-hidden />
          </span>
          DataScope
        </Link>
        {onNavigate && (
          <button type="button" className="btn btn-ghost btn-sm btn-square md:hidden" onClick={onNavigate} aria-label="Close menu">
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((section) => (
          <div key={section.title} className="mt-4 first:mt-2">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-base-content/50">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-base-content/80 hover:bg-base-300"
                      }`}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
