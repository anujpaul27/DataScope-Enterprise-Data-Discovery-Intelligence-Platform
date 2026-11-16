import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-box border border-dashed border-base-300 px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-base-200 p-3">
        <Icon className="size-6 text-base-content/60" aria-hidden />
      </div>
      <h2 className="text-base font-medium">{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-base-content/60">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
