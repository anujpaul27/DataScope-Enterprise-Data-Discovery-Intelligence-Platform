import type { DatasetField, FieldType } from "@/features/datasets/types";
import type { Operator, SearchCondition } from "@/store/slices/searchConfigSlice";

export const MAX_FILTERS = 10;

/** Operators allowed per field type — must match Backend `records-query.ts`. */
export const OPS_BY_TYPE: Record<FieldType, readonly Operator[]> = {
  text: ["eq", "neq", "contains", "starts_with", "in"],
  select: ["eq", "neq", "in"],
  number: ["eq", "neq", "gt", "gte", "lt", "lte", "between"],
  date: ["eq", "gt", "gte", "lt", "lte", "between", "last_days"],
  boolean: ["eq"],
};

export const OPERATOR_LABELS: Record<Operator, string> = {
  eq: "equals",
  neq: "does not equal",
  contains: "contains",
  starts_with: "starts with",
  in: "is one of",
  gt: "greater than",
  gte: "at least",
  lt: "less than",
  lte: "at most",
  between: "between",
  last_days: "in last N days",
};

export function defaultOperator(type: FieldType): Operator {
  if (type === "text") return "contains";
  if (type === "number" || type === "date") return "gte";
  return "eq";
}

export function needsValueTo(op: Operator): boolean {
  return op === "between";
}

export function valuePlaceholder(op: Operator, type: FieldType): string {
  if (op === "in") return "value1, value2, …";
  if (op === "last_days") return "e.g. 30";
  if (type === "date") return "YYYY-MM-DD";
  if (type === "number") return "0";
  return "Value";
}

/** Drop conditions that no longer match the dataset (stale shared links). */
export function sanitizeFilters(
  conditions: SearchCondition[],
  fields: DatasetField[],
): SearchCondition[] {
  const byKey = new Map(fields.filter((f) => f.isFilterable).map((f) => [f.key, f]));
  const out: SearchCondition[] = [];
  for (const c of conditions) {
    const field = byKey.get(c.field);
    if (!field) continue;
    const allowed = OPS_BY_TYPE[field.type];
    const op = allowed.includes(c.operator) ? c.operator : defaultOperator(field.type);
    out.push({
      ...c,
      operator: op,
      valueTo: needsValueTo(op) ? c.valueTo : undefined,
    });
    if (out.length >= MAX_FILTERS) break;
  }
  return out;
}

/** API / URL payload shape (no client-only `id`). */
export interface FilterPayload {
  field: string;
  op: Operator;
  value: string;
  valueTo?: string;
}

export function toFilterPayload(conditions: SearchCondition[]): FilterPayload[] {
  return conditions
    .filter((c) => c.field && c.value.trim() !== "")
    .filter((c) => !needsValueTo(c.operator) || (c.valueTo !== undefined && c.valueTo.trim() !== ""))
    .slice(0, MAX_FILTERS)
    .map((c) => ({
      field: c.field,
      op: c.operator,
      value: c.value.trim(),
      ...(needsValueTo(c.operator) && c.valueTo !== undefined
        ? { valueTo: c.valueTo.trim() }
        : {}),
    }));
}

export function serializeFilters(conditions: SearchCondition[]): string {
  const payload = toFilterPayload(conditions);
  return payload.length ? JSON.stringify(payload) : "";
}

/** Parse URL `filters` JSON. Malformed input becomes []. */
export function parseFilters(raw: string | null | undefined): SearchCondition[] {
  if (!raw) return [];
  try {
    const json: unknown = JSON.parse(raw);
    if (!Array.isArray(json)) return [];
    const out: SearchCondition[] = [];
    for (const item of json.slice(0, MAX_FILTERS)) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const field = typeof row.field === "string" ? row.field : "";
      const op = typeof row.op === "string" ? (row.op as Operator) : null;
      const value = typeof row.value === "string" ? row.value : "";
      if (!field || !op || !(op in OPERATOR_LABELS)) continue;
      const valueTo = typeof row.valueTo === "string" ? row.valueTo : undefined;
      out.push({
        id: `url-${out.length}-${field}-${op}`,
        field,
        operator: op,
        value,
        valueTo,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function emptyCondition(fields: DatasetField[]): Omit<SearchCondition, "id"> {
  const field = fields.find((f) => f.isFilterable) ?? fields[0];
  const type = field?.type ?? "text";
  return {
    field: field?.key ?? "",
    operator: defaultOperator(type),
    value: type === "boolean" ? "true" : "",
    valueTo: "",
  };
}
