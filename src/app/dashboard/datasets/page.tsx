import type { Metadata } from "next";
import { Database } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Dataset Library" };

export default function Page() {
  return <ComingSoon title="Dataset Library" description="Browse the datasets you are allowed to open." icon={Database} phase="Phase 4 (Dataset Library)" />;
}
