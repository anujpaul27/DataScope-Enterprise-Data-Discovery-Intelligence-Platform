import type { SortRule } from "@/store/slices/searchConfigSlice";

export const MAX_SORTS = 3; // same limit as the API

/** "revenue:desc,name" -> [{revenue desc}, {name asc}]. Ignores anything malformed. */
export function parseSort(raw: string | null | undefined): SortRule[] {
  if (!raw) return [];
  const rules: SortRule[] = [];
  for (const part of raw.split(",")) {
    const [field, dir = "asc"] = part.split(":");
    if (!field || (dir !== "asc" && dir !== "desc")) continue;
    if (rules.some((r) => r.field === field)) continue;
    rules.push({ field, direction: dir });
  }
  return rules.slice(0, MAX_SORTS);
}

export function serializeSort(rules: SortRule[]): string {
  return rules.map((r) => `${r.field}:${r.direction}`).join(",");
}

/**
 * Click on a column header: none -> asc -> desc -> none.
 * multi = keep the other columns (Shift/Ctrl+click, or the "Multi-sort" button on touch screens).
 */
export function nextSort(current: SortRule[], field: string, multi: boolean): SortRule[] {
  const existing = current.find((r) => r.field === field);
  const others = multi ? current.filter((r) => r.field !== field) : [];
  if (!existing) return [...others, { field, direction: "asc" as const }].slice(-MAX_SORTS);
  if (existing.direction === "asc") {
    // keep the column's position in a multi-sort
    return multi
      ? current.map((r) => (r.field === field ? { ...r, direction: "desc" as const } : r))
      : [{ field, direction: "desc" as const }];
  }
  return others;
}
