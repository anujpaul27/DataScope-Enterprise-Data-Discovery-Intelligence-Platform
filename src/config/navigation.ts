import {
  BarChart3,
  BookMarked,
  Database,
  History,
  LayoutDashboard,
  Search,
  Settings,
  Table2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omit = every signed-in user can see it. */
  roles?: Role[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// One list drives the sidebar for all three roles.
// The sidebar only HIDES links; the real protection is on the server.
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Dataset Library", href: "/dashboard/datasets", icon: Database },
      { label: "Data Explorer", href: "/dashboard/explorer", icon: Table2 },
      { label: "Advanced Search", href: "/dashboard/search", icon: Search, roles: ["admin", "analyst"] },
      { label: "Saved Views", href: "/dashboard/saved-views", icon: BookMarked },
      { label: "Search History", href: "/dashboard/history", icon: History },
    ],
  },
  {
    title: "Insights",
    items: [{ label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 }],
  },
  {
    title: "Administration",
    items: [{ label: "Users", href: "/dashboard/admin/users", icon: Users, roles: ["admin"] }],
  },
  {
    title: "Account",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export function navForRole(role: Role): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);
}
