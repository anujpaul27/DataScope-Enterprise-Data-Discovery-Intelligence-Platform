import type { Metadata } from "next";
import { History } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Search History" };

export default function Page() {
  return <ComingSoon title="Search History" description="Recently executed searches." icon={History} phase="Phase 7 (Saved Views and History)" />;
}
