import type { Metadata } from "next";
import { Search } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Advanced Search" };

export default function Page() {
  return <ComingSoon title="Advanced Search" description="Build searches with multiple conditions." icon={Search} phase="Phase 6 (Advanced Search)" />;
}
