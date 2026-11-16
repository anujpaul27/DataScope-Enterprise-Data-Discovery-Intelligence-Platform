import type { PermissionLevel } from "../types";

const STYLES: Record<PermissionLevel, string> = {
  read: "badge-ghost",
  write: "badge-info",
  manage: "badge-primary",
};

export default function LevelBadge({ level }: { level: PermissionLevel }) {
  return <span className={`badge badge-sm ${STYLES[level]}`}>{level}</span>;
}
