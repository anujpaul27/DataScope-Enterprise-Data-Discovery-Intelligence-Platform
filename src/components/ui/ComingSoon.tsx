import type { LucideIcon } from "lucide-react";
import EmptyState from "./EmptyState";
import PageHeader from "./PageHeader";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
}

// Placeholder for pages that are built in a later phase. The route, the sidebar
// link and the role check already work, so each later phase only fills the page.
export default function ComingSoon({ title, description, icon, phase }: ComingSoonProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title="Coming in the next phase"
        description={`This page is built in ${phase}.`}
      />
    </>
  );
}
