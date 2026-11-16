"use client";

import { ArrowDownUp, Rows3, Search, SearchX, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import type { DatasetDetail } from "@/features/datasets/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/api/errors";
import { formatNumber } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { columnVisibilityChanged, tableDensityChanged } from "@/store/slices/uiPreferenceSlice";
import { useListRecordsQuery, useRecordsPrefetch } from "../api/recordsApi";
import { useDelayedFlag } from "../hooks/useDelayedFlag";
import type { useExplorerUrlState } from "../hooks/useExplorerUrlState";
import { sanitizeFilters, serializeFilters } from "../lib/filters";
import { nextSort, serializeSort } from "../lib/sort";
import type { ListRecordsArgs, RecordRow } from "../types";
import ColumnPicker from "./ColumnPicker";
import DataTable, { type DataTableColumn } from "./DataTable";
import ExplorerPagination from "./ExplorerPagination";
import FilterBuilder from "./FilterBuilder";
import RecordDrawer from "./RecordDrawer";
import TableSkeleton from "./TableSkeleton";

type UrlState = ReturnType<typeof useExplorerUrlState>;

// Everything that depends on ONE dataset. The parent renders it with key={dataset.id},
// so switching dataset gives a fresh component: selection, open record and search box reset
// themselves without any "reset" effect.
export default function ExplorerWorkspace({
  dataset,
  url,
  filtersAlwaysOpen = false,
}: {
  dataset: DatasetDetail;
  url: UrlState;
  /** Advanced Search keeps the filter panel open by default. */
  filtersAlwaysOpen?: boolean;
}) {
  const { page, pageSize, q, sort, filters, setPage, setPageSize, setSort, setQuery, setFilters, clearAll } = url;
  const dispatch = useAppDispatch();
  const density = useAppSelector((s) => s.uiPreference.tableDensity);
  const savedColumns = useAppSelector((s) => s.uiPreference.columnVisibility[dataset.id]);

  // temporary component state (never in Redux, never in the URL)
  const [multiSortMode, setMultiSortMode] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [openId, setOpenId] = useState<number | null>(null);

  // ---- search box: types instantly, the URL (and the API) only changes 350 ms after the last key
  const [input, setInput] = useState(q);
  const debounced = useDebouncedValue(input, 350);
  useEffect(() => {
    // The API needs at least 2 characters (one letter would match almost every row).
    const typed = debounced.trim();
    const next = typed.length >= 2 ? typed : "";
    if (next !== q) setQuery(next);
    // react only to the debounced text; reacting to `q` too would fight the back button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // ---- columns: dataset defaults, or what the user chose (kept in Redux + localStorage)
  const visibleFields = useMemo(() => {
    const chosen = savedColumns ? new Set(savedColumns) : null;
    const list = dataset.fields.filter((f) => (chosen ? chosen.has(f.key) : f.isVisibleByDefault));
    return list.length > 0 ? list : dataset.fields.slice(0, 1);
  }, [dataset.fields, savedColumns]);

  const columns = useMemo<DataTableColumn[]>(
    () =>
      visibleFields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        sortable: f.isSortable,
        highlightable: f.isSearchable && (f.type === "text" || f.type === "select"),
      })),
    [visibleFields],
  );
  const visibleKeys = useMemo(() => visibleFields.map((f) => f.key), [visibleFields]);

  // a stale link (?sort=oldField:asc) must not produce an API error: drop unknown fields
  const validSort = useMemo(
    () => sort.filter((r) => dataset.fields.some((f) => f.key === r.field && f.isSortable)),
    [sort, dataset.fields],
  );
  const validFilters = useMemo(
    () => sanitizeFilters(filters, dataset.fields),
    [filters, dataset.fields],
  );
  const filtersParam = useMemo(() => serializeFilters(validFilters) || undefined, [validFilters]);

  // ---- server state: ONE RTK Query call, arguments = everything the user can change
  const args = useMemo<ListRecordsArgs>(
    () => ({
      datasetId: dataset.id,
      page,
      pageSize,
      q: q || undefined,
      sort: serializeSort(validSort) || undefined,
      filters: filtersParam,
      columns: visibleKeys.join(","),
    }),
    [dataset.id, page, pageSize, q, validSort, filtersParam, visibleKeys],
  );
  const records = useListRecordsQuery(args);

  // `currentData` = answer for THESE arguments. While new arguments load we keep showing the
  // previous page (dimmed) instead of flashing an empty table.
  const shown = records.currentData ?? (records.isFetching ? records.data : undefined);
  const totalPages = shown ? Math.max(1, Math.ceil(shown.total / shown.pageSize)) : 1;
  const slow = useDelayedFlag(records.isFetching, 1500);

  // warm the cache: the next page is requested in the background, so "Next" feels instant
  const prefetch = useRecordsPrefetch("listRecords");
  const hasCurrent = Boolean(records.currentData);
  useEffect(() => {
    if (hasCurrent && page < totalPages) prefetch({ ...args, page: page + 1 }, { ifOlderThan: 60 });
  }, [hasCurrent, page, totalPages, args, prefetch]);

  // ---- stable callbacks (so memoized rows are not re-rendered by the parent)
  const onSort = useCallback(
    (field: string, multi: boolean) => setSort(nextSort(validSort, field, multi)),
    [setSort, validSort],
  );
  const onToggleRow = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);
  const onTogglePage = useCallback((ids: number[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);
  const onOpenRow = useCallback((row: RecordRow) => setOpenId(row.id), []);
  const closeDrawer = useCallback(() => setOpenId(null), []);
  const onOpenRelated = useCallback(
    (related: { datasetId: string; recordId: number }) => {
      if (related.datasetId === dataset.id) setOpenId(related.recordId);
    },
    [dataset.id],
  );

  const labelOf = (key: string) => dataset.fields.find((f) => f.key === key)?.label ?? key;
  const hasActiveQuery = Boolean(q || validSort.length || validFilters.length);

  function clearSearch() {
    setInput("");
    setQuery("");
  }

  return (
    <div className="space-y-3">
      {/* ---------- toolbar ---------- */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="input input-bordered input-sm flex w-full items-center gap-2 sm:w-80">
          <Search className="size-4 text-base-content/50" aria-hidden />
          <input
            type="search"
            className="grow"
            placeholder="Search records"
            value={input}
            maxLength={100}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Search records"
          />
          {input && (
            <button type="button" onClick={clearSearch} aria-label="Clear search">
              <X className="size-4" />
            </button>
          )}
        </label>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`btn btn-sm ${multiSortMode ? "btn-primary" : ""}`}
            aria-pressed={multiSortMode}
            onClick={() => setMultiSortMode((v) => !v)}
            title="When on, clicking a column header ADDS it to the sort (needed on touch screens)"
          >
            <ArrowDownUp className="size-4" /> Multi-sort
          </button>
          <button
            type="button"
            className="btn btn-sm btn-square"
            onClick={() => dispatch(tableDensityChanged(density === "compact" ? "comfortable" : "compact"))}
            aria-label={`Switch to ${density === "compact" ? "comfortable" : "compact"} rows`}
            title="Row density"
          >
            <Rows3 className="size-4" />
          </button>
          <ColumnPicker
            fields={dataset.fields}
            visibleKeys={visibleKeys}
            onChange={(columns) => dispatch(columnVisibilityChanged({ datasetId: dataset.id, columns }))}
          />
        </div>
      </div>

      <FilterBuilder
        fields={dataset.fields}
        applied={validFilters}
        onApply={setFilters}
        defaultOpen={filtersAlwaysOpen}
      />

      {/* active sort + selection summary */}
      {(validSort.length > 0 || selected.size > 0 || hasActiveQuery) && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {validSort.map((r, i) => (
            <span key={r.field} className="badge badge-outline gap-1">
              {validSort.length > 1 && <b>{i + 1}.</b>} {labelOf(r.field)} {r.direction === "asc" ? "↑" : "↓"}
              <button
                type="button"
                aria-label={`Remove sort by ${labelOf(r.field)}`}
                onClick={() => setSort(validSort.filter((x) => x.field !== r.field))}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {hasActiveQuery && (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => {
                setInput("");
                clearAll();
              }}
            >
              Clear search, filters & sort
            </button>
          )}
          {selected.size > 0 && (
            <span className="ml-auto flex items-center gap-2">
              <span className="tabular font-medium">{formatNumber(selected.size)} selected</span>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => setSelected(new Set())}>
                Clear selection
              </button>
            </span>
          )}
        </div>
      )}

      {/* a background refresh failed, but we still have rows to show */}
      {records.isError && records.currentData && (
        <div role="alert" className="alert alert-warning py-2 text-sm">
          <TriangleAlert className="size-4" />
          <span>Could not refresh. Showing the last loaded data.</span>
          <button type="button" className="btn btn-xs" onClick={() => void records.refetch()}>
            Retry
          </button>
        </div>
      )}

      {/* ---------- results ---------- */}
      {!shown && records.isError ? (
        <EmptyState
          icon={TriangleAlert}
          title="Could not load records"
          description={getErrorMessage(records.error)}
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void records.refetch()}>
              Retry
            </button>
          }
        />
      ) : !shown ? (
        <TableSkeleton columns={Math.min(columns.length, 7)} />
      ) : shown.data.length === 0 ? (
        page > 1 && shown.total > 0 ? (
          <EmptyState
            icon={SearchX}
            title="This page does not exist"
            description="The data changed while you were looking at it."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setPage(1)}>
                Go to the first page
              </button>
            }
          />
        ) : q || validFilters.length > 0 ? (
          <EmptyState
            icon={SearchX}
            title={q ? `No records match "${q}"` : "No records match these filters"}
            description="Try fewer conditions, or clear search and filters."
            action={
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setInput("");
                  clearAll();
                }}
              >
                Clear search & filters
              </button>
            }
          />
        ) : (
          <EmptyState icon={SearchX} title="This dataset has no records yet" />
        )
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={shown.data}
            sort={validSort}
            onSort={onSort}
            density={density}
            highlight={q}
            selectedIds={selected}
            onToggleRow={onToggleRow}
            onTogglePage={onTogglePage}
            onOpenRow={onOpenRow}
            multiSortMode={multiSortMode}
            dimmed={records.isFetching}
          />
          <ExplorerPagination
            page={shown.page}
            pageSize={shown.pageSize}
            total={shown.total}
            totalCapped={shown.totalCapped}
            onPage={setPage}
            onPageSize={setPageSize}
          />
          <p className="text-xs text-base-content/50" aria-live="polite">
            {slow
              ? "Still loading… the connection looks slow."
              : `Server query: ${shown.tookMs} ms${shown.cached ? " (cached)" : ""} · Shift+click a header to sort by several columns`}
          </p>
        </>
      )}

      <RecordDrawer
        datasetId={dataset.id}
        recordId={openId}
        fields={dataset.fields}
        onClose={closeDrawer}
        onOpenRelated={onOpenRelated}
      />
    </div>
  );
}
