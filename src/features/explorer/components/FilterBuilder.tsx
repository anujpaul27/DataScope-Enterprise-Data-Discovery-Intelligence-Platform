"use client";

import { Filter, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DatasetField } from "@/features/datasets/types";
import type { SearchCondition } from "@/store/slices/searchConfigSlice";
import {
  MAX_FILTERS,
  OPERATOR_LABELS,
  OPS_BY_TYPE,
  defaultOperator,
  emptyCondition,
  needsValueTo,
  sanitizeFilters,
  serializeFilters,
  valuePlaceholder,
} from "../lib/filters";

interface Props {
  fields: DatasetField[];
  /** Applied filters from the URL (source of truth). */
  applied: SearchCondition[];
  onApply: (conditions: SearchCondition[]) => void;
  /** When true the panel starts open (Advanced Search). */
  defaultOpen?: boolean;
}

function newId(): string {
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ValueInput({
  field,
  condition,
  onChange,
}: {
  field: DatasetField | undefined;
  condition: SearchCondition;
  onChange: (patch: Partial<SearchCondition>) => void;
}) {
  if (!field) {
    return (
      <input
        className="input input-bordered input-sm w-full"
        value={condition.value}
        onChange={(e) => onChange({ value: e.target.value })}
        placeholder="Value"
      />
    );
  }

  if (condition.operator === "last_days") {
    return (
      <input
        type="number"
        min={1}
        max={3650}
        className="input input-bordered input-sm w-full"
        value={condition.value}
        onChange={(e) => onChange({ value: e.target.value })}
        placeholder={valuePlaceholder(condition.operator, field.type)}
        aria-label="Days"
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <select
        className="select select-bordered select-sm w-full"
        value={condition.value || "true"}
        onChange={(e) => onChange({ value: e.target.value })}
        aria-label="Boolean value"
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  if (field.type === "select" && field.options?.length && condition.operator !== "in") {
    return (
      <select
        className="select select-bordered select-sm w-full"
        value={condition.value}
        onChange={(e) => onChange({ value: e.target.value })}
        aria-label="Select value"
      >
        <option value="">Select…</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (needsValueTo(condition.operator)) {
    return (
      <div className="flex items-center gap-1">
        <input
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          className="input input-bordered input-sm w-full"
          value={condition.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="From"
          aria-label="From value"
        />
        <span className="text-xs text-base-content/50">–</span>
        <input
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          className="input input-bordered input-sm w-full"
          value={condition.valueTo ?? ""}
          onChange={(e) => onChange({ valueTo: e.target.value })}
          placeholder="To"
          aria-label="To value"
        />
      </div>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      className="input input-bordered input-sm w-full"
      value={condition.value}
      onChange={(e) => onChange({ value: e.target.value })}
      placeholder={valuePlaceholder(condition.operator, field.type)}
      aria-label="Filter value"
    />
  );
}

export default function FilterBuilder({ fields, applied, onApply, defaultOpen = false }: Props) {
  const filterable = useMemo(() => fields.filter((f) => f.isFilterable), [fields]);
  const byKey = useMemo(() => new Map(filterable.map((f) => [f.key, f])), [filterable]);

  const [open, setOpen] = useState(defaultOpen || applied.length > 0);
  const [draft, setDraft] = useState<SearchCondition[]>(() => sanitizeFilters(applied, fields));

  // Keep the draft in sync when the URL changes (back/forward, shared link).
  const appliedKey = serializeFilters(applied);
  useEffect(() => {
    setDraft(sanitizeFilters(applied, fields));
    if (applied.length > 0) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedKey, fields]);

  const dirty = serializeFilters(draft) !== appliedKey;

  function updateRow(id: string, patch: Partial<SearchCondition>) {
    setDraft((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...patch };
        if (patch.field && patch.field !== row.field) {
          const field = byKey.get(patch.field);
          next.operator = field ? defaultOperator(field.type) : "eq";
          next.value = field?.type === "boolean" ? "true" : "";
          next.valueTo = "";
        }
        if (patch.operator && !needsValueTo(patch.operator)) next.valueTo = undefined;
        return next;
      }),
    );
  }

  function addRow() {
    if (draft.length >= MAX_FILTERS || filterable.length === 0) return;
    const base = emptyCondition(filterable);
    setDraft((rows) => [...rows, { ...base, id: newId() }]);
    setOpen(true);
  }

  function removeRow(id: string) {
    setDraft((rows) => rows.filter((r) => r.id !== id));
  }

  function apply() {
    onApply(sanitizeFilters(draft, fields));
  }

  function clear() {
    setDraft([]);
    onApply([]);
  }

  if (filterable.length === 0) return null;

  return (
    <div className="rounded-box border border-base-300 bg-base-100">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Filter className="size-4" />
          Filters
          {applied.length > 0 && <span className="badge badge-primary badge-sm">{applied.length}</span>}
        </button>
        <span className="text-xs text-base-content/50">All conditions are AND-ed on the server</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {applied.length > 0 && (
            <button type="button" className="btn btn-ghost btn-xs" onClick={clear}>
              Clear filters
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={addRow}
            disabled={draft.length >= MAX_FILTERS}
          >
            <Plus className="size-3.5" /> Add condition
          </button>
          <button type="button" className="btn btn-primary btn-xs" onClick={apply} disabled={!dirty}>
            Apply
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-2 border-t border-base-300 p-3">
          {draft.length === 0 ? (
            <p className="text-sm text-base-content/60">
              No conditions yet. Add one — e.g. Status equals Active, Country equals Germany, Revenue greater than
              10000.
            </p>
          ) : (
            <ul className="space-y-2">
              {draft.map((row, index) => {
                const field = byKey.get(row.field);
                const ops = field ? OPS_BY_TYPE[field.type] : OPS_BY_TYPE.text;
                return (
                  <li key={row.id} className="grid gap-2 sm:grid-cols-[auto_1fr_1fr_1.4fr_auto] sm:items-center">
                    <span className="text-xs font-medium text-base-content/50 tabular">
                      {index === 0 ? "Where" : "AND"}
                    </span>
                    <select
                      className="select select-bordered select-sm"
                      value={row.field}
                      onChange={(e) => updateRow(row.id, { field: e.target.value })}
                      aria-label="Field"
                    >
                      {filterable.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className="select select-bordered select-sm"
                      value={row.operator}
                      onChange={(e) =>
                        updateRow(row.id, { operator: e.target.value as SearchCondition["operator"] })
                      }
                      aria-label="Operator"
                    >
                      {ops.map((op) => (
                        <option key={op} value={op}>
                          {OPERATOR_LABELS[op]}
                        </option>
                      ))}
                    </select>
                    <ValueInput
                      field={field}
                      condition={row}
                      onChange={(patch) => updateRow(row.id, patch)}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove condition"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {draft.length >= MAX_FILTERS && (
            <p className="text-xs text-warning">Maximum of {MAX_FILTERS} conditions.</p>
          )}
        </div>
      )}
    </div>
  );
}
