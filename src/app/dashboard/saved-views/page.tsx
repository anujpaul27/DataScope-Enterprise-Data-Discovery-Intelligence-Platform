import type { Metadata } from "next";
import { BookMarked } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Saved Views" };

export default function Page() {
  return <ComingSoon title="Saved Views" description="Your saved and shared search configurations." icon={BookMarked} phase="Phase 7 (Saved Views)" />;
}
