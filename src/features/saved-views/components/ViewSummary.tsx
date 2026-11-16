import type { SavedViewConfig } from "./types";

/** Small chips that describe what a view contains (search, filters, sort, columns). */
export default function ViewSummary({
  view,
  labelOf = (key) => key,
}: {
  view: SavedViewConfig;
  labelOf?: (fieldKey: string) => string;
}) {
  const chips: string[] = [];
  if (view.globalSearch) chips.push(`Search: "${view.globalSearch}"`);
  if (view.conditions.length > 0) {
    chips.push(`${view.conditions.length} ${view.conditions.length === 1 ? "filter" : "filters"}`);
  }
  if (view.sort.length > 0) {
    chips.push(`Sort: ${view.sort.map((s) => `${labelOf(s.field)} ${s.direction === "asc" ? "↑" : "↓"}`).join(", ")}`);
  }
  chips.push(view.visibleColumns.length > 0 ? `${view.visibleColumns.length} columns` : "Default columns");

  return (
    <ul className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <li key={c} className="badge badge-outline badge-sm max-w-full truncate">
          {c}
        </li>
      ))}
    </ul>
  );
}
