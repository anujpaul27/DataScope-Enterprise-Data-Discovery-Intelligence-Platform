import { format } from "date-fns";
import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import type { FieldType } from "@/features/datasets/types";
import HighlightText from "../components/HighlightText";

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const EMPTY = <span className="text-base-content/30">—</span>;

/** "2026-03-09" -> "9 Mar 2026". Parsed by hand so a timezone can never shift the day. */
export function formatIsoDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  return format(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])), "d MMM yyyy");
}

export function formatCell(value: unknown, type: FieldType, highlight: string): ReactNode {
  if (value === null || value === undefined || value === "") return EMPTY;

  switch (type) {
    case "boolean":
      return value === true || value === "true" ? (
        <Check className="size-4 text-success" aria-label="Yes" />
      ) : (
        <Minus className="size-4 text-base-content/40" aria-label="No" />
      );
    case "number": {
      const n = typeof value === "number" ? value : Number(value);
      return Number.isFinite(n) ? numberFormat.format(n) : String(value);
    }
    case "date":
      return formatIsoDate(String(value));
    default:
      return <HighlightText text={String(value)} term={highlight} />;
  }
}
