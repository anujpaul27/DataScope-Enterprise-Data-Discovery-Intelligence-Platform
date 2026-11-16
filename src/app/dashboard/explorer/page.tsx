import type { Metadata } from "next";
import { Table2 } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Data Explorer" };

export default function Page() {
  return <ComingSoon title="Data Explorer" description="Search, filter and sort records in a fast table." icon={Table2} phase="Phase 5 (Data Explorer)" />;
}
