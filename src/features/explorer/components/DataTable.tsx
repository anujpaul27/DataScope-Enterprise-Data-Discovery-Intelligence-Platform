"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { memo, useCallback, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { FieldType } from "@/features/datasets/types";
import type { SortRule } from "@/store/slices/searchConfigSlice";
import { formatCell } from "../lib/formatCell";
import type { RecordRow } from "../types";

export interface DataTableColumn {
  key: string;
  label: string;
  type: FieldType;
  sortable: boolean;
  /** only searchable text columns get the yellow search highlight */
  highlightable: boolean;
}

interface DataTableProps {
  columns: DataTableColumn[];
  rows: RecordRow[];
  sort: SortRule[];
  /** multi = Shift/Ctrl/Cmd was held (or the Multi-sort button is on) */
  onSort: (field: string, multi: boolean) => void;
  density: "comfortable" | "compact";
  highlight: string;
  selectedIds: ReadonlySet<number>;
  onToggleRow: (id: number) => void;
  onTogglePage: (ids: number[], checked: boolean) => void;
  onOpenRow: (row: RecordRow) => void;
  multiSortMode: boolean;
  /** true while the next page is loading: the old rows stay visible but dimmed */
  dimmed?: boolean;
}

const MIN_WIDTH = 80;
const MAX_WIDTH = 640;
const defaultWidth = (type: FieldType) => (type === "number" || type === "boolean" ? 130 : 190);

// One row. memo(): a row only re-renders when ITS props change, so selecting one row or
// resizing a column does not re-render the other 24-100 rows.
const Row = memo(function Row({
  row,
  columns,
  highlight,
  selected,
  onToggleRow,
  onOpenRow,
}: {
  row: RecordRow;
  columns: DataTableColumn[];
  highlight: string;
  selected: boolean;
  onToggleRow: (id: number) => void;
  onOpenRow: (row: RecordRow) => void;
}) {
  const onKey = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onOpenRow(row);
    }
  };
  return (
    <tr
      className={`hover cursor-pointer ${selected ? "bg-primary/10" : ""}`}
      tabIndex={0}
      aria-selected={selected}
      onClick={() => onOpenRow(row)}
      onKeyDown={onKey}
    >
      <td onClick={(e) => e.stopPropagation()} className="w-10">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={selected}
          onChange={() => onToggleRow(row.id)}
          aria-label={`Select record ${row.id}`}
        />
      </td>
      {columns.map((c) => (
        <td
          key={c.key}
          className={`truncate ${c.type === "number" ? "tabular text-right" : ""}`}
          title={typeof row.data[c.key] === "string" ? (row.data[c.key] as string) : undefined}
        >
          {formatCell(row.data[c.key], c.type, c.highlightable ? highlight : "")}
        </td>
      ))}
    </tr>
  );
});

export default function DataTable({
  columns,
  rows,
  sort,
  onSort,
  density,
  highlight,
  selectedIds,
  onToggleRow,
  onTogglePage,
  onOpenRow,
  multiSortMode,
  dimmed,
}: DataTableProps) {
  // Column widths are TEMPORARY COMPONENT STATE: they are not worth a Redux slice or a URL param.
  const [widths, setWidths] = useState<Record<string, number>>({});
  const widthOf = useCallback(
    (c: DataTableColumn) => widths[c.key] ?? defaultWidth(c.type),
    [widths],
  );
  const totalWidth = useMemo(() => 40 + columns.reduce((sum, c) => sum + widthOf(c), 0), [columns, widthOf]);

  function startResize(e: PointerEvent<HTMLSpanElement>, key: string, startWidth: number) {
    e.preventDefault();
    e.stopPropagation(); // do not trigger the column sort
    const startX = e.clientX;
    const move = (ev: globalThis.PointerEvent) =>
      setWidths((w) => ({
        ...w,
        [key]: Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + ev.clientX - startX)),
      }));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const pageIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;

  return (
    <div
      className={`max-h-[68vh] overflow-auto rounded-box border border-base-300 transition-opacity ${dimmed ? "opacity-60" : ""}`}
    >
      <table
        className={`table table-pin-rows ${density === "compact" ? "table-xs" : "table-sm"}`}
        style={{ tableLayout: "fixed", width: totalWidth, minWidth: "100%" }}
      >
        <colgroup>
          <col style={{ width: 40 }} />
          {columns.map((c) => (
            <col key={c.key} style={{ width: widthOf(c) }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = selectedOnPage > 0 && !allSelected;
                }}
                onChange={(e) => onTogglePage(pageIds, e.target.checked)}
                aria-label="Select all rows on this page"
              />
            </th>
            {columns.map((c) => {
              const idx = sort.findIndex((s) => s.field === c.key);
              const rule = idx >= 0 ? sort[idx] : undefined;
              return (
                <th
                  key={c.key}
                  className="relative select-none"
                  aria-sort={rule ? (rule.direction === "asc" ? "ascending" : "descending") : "none"}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      className={`flex w-full items-center gap-1 font-semibold ${c.type === "number" ? "justify-end" : ""}`}
                      onClick={(e) => onSort(c.key, e.shiftKey || e.ctrlKey || e.metaKey || multiSortMode)}
                      title="Click to sort. Shift+click to sort by several columns."
                    >
                      <span className="truncate">{c.label}</span>
                      {rule ? (
                        <span className="inline-flex items-center text-primary">
                          {rule.direction === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
                          {sort.length > 1 && <sup className="text-[10px] font-bold">{idx + 1}</sup>}
                        </span>
                      ) : (
                        <ChevronsUpDown className="size-3.5 shrink-0 text-base-content/30" />
                      )}
                    </button>
                  ) : (
                    <span className="font-semibold">{c.label}</span>
                  )}
                  {/* resize handle: drag with mouse or finger */}
                  <span
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Resize ${c.label}`}
                    className="absolute top-0 right-0 h-full w-2 cursor-col-resize touch-none hover:bg-primary/40"
                    onPointerDown={(e) => startResize(e, c.key, widthOf(c))}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Row
              key={row.id}
              row={row}
              columns={columns}
              highlight={highlight}
              selected={selectedIds.has(row.id)}
              onToggleRow={onToggleRow}
              onOpenRow={onOpenRow}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
