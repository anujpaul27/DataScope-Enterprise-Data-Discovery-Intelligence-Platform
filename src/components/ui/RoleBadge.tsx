import { ROLE_LABELS, type Role } from "@/types";

const STYLES: Record<Role, string> = {
  admin: "badge-primary",
  analyst: "badge-info",
  viewer: "badge-ghost",
};

export default function RoleBadge({ role }: { role: Role }) {
  return <span className={`badge badge-sm ${STYLES[role]}`}>{ROLE_LABELS[role]}</span>;
}
