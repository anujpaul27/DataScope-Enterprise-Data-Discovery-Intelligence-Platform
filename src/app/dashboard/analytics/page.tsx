import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
  return <ComingSoon title="Analytics" description="Charts built from backend aggregate queries." icon={BarChart3} phase="Phase 8 (Analytics)" />;
}
