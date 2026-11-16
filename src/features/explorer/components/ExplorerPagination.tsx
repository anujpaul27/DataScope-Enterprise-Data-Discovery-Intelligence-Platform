"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";
import { formatNumber } from "@/lib/format";
import { PAGE_SIZE_OPTIONS } from "@/store/slices/uiPreferenceSlice";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  totalCapped: boolean;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}

// Jump-to-page box. The parent gives it key={page}, so it starts fresh after every page change.
function PageJump({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const [text, setText] = useState(String(page));
  function commit() {
    const n = Number.parseInt(text, 10);
    if (Number.isFinite(n) && n >= 1 && n <= totalPages && n !== page) onPage(n);
    else setText(String(page));
  }
  return (
    <input
      className="input input-bordered input-xs w-16 text-center"
      inputMode="numeric"
      value={text}
      onChange={(e) => setText(e.target.value.replace(/\D/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
      aria-label="Jump to page"
    />
  );
}

export default function ExplorerPagination({ page, pageSize, total, totalCapped, onPage, onPageSize }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const plus = totalCapped ? "+" : "";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="tabular text-base-content/70">
          {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
          {plus}
        </span>
        <label className="flex items-center gap-1.5 text-base-content/70">
          Rows
          <select
            className="select select-bordered select-xs"
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <button type="button" className="btn btn-xs btn-square" disabled={page <= 1} onClick={() => onPage(1)} aria-label="First page">
          <ChevronsLeft className="size-4" />
        </button>
        <button type="button" className="btn btn-xs btn-square" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </button>
        <span className="mx-1 flex items-center gap-1.5">
          <PageJump key={page} page={page} totalPages={totalPages} onPage={onPage} />
          <span className="tabular text-base-content/60">/ {formatNumber(totalPages)}</span>
        </span>
        <button type="button" className="btn btn-xs btn-square" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="size-4" />
        </button>
        <button type="button" className="btn btn-xs btn-square" disabled={page >= totalPages} onClick={() => onPage(totalPages)} aria-label="Last page">
          <ChevronsRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
