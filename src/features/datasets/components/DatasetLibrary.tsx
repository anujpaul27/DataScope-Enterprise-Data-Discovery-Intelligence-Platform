"use client";

import { Database, LayoutGrid, List, Plus, SearchX, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getErrorMessage } from "@/lib/api/errors";
import { formatCompact, formatNumber, formatRelative } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAdmin } from "@/store/slices/authSlice";
import { datasetOpened } from "@/store/slices/datasetSlice";
import { libraryLayoutChanged } from "@/store/slices/uiPreferenceSlice";
import {
  useGetDatasetCategoriesQuery,
  useGetDatasetSummaryQuery,
  useListDatasetsQuery,
} from "../api/datasetsApi";
import CreateDatasetDialog from "./CreateDatasetDialog";
import DatasetCard from "./DatasetCard";
import LevelBadge from "./LevelBadge";

const PAGE_SIZE = 12;

// Filters live in the URL (?q=...&category=...&page=2), so a link to this page can be
// shared, the back button works and a reload keeps the same view.
export default function DatasetLibrary() {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const layout = useAppSelector((s) => s.uiPreference.libraryLayout);
  const { params, setParams } = useUrlParams();

  const urlQ = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  // The text box is local state (it must react on every key); the URL, and therefore
  // the API request, only changes 350 ms after the user stops typing.
  const [input, setInput] = useState(urlQ);
  const debounced = useDebouncedValue(input, 350);
  useEffect(() => {
    const next = debounced.trim();
    if (next !== urlQ) setParams({ q: next || undefined, page: undefined });
    // Only react to the debounced text. Reacting to urlQ too would fight the back button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const [creating, setCreating] = useState(false);

  const list = useListDatasetsQuery({
    page,
    pageSize: PAGE_SIZE,
    q: urlQ || undefined,
    category: category || undefined,
  });
  const stats = useGetDatasetSummaryQuery();
  const categories = useGetDatasetCategoriesQuery();

  const hasFilters = Boolean(urlQ || category);
  const data = list.data;

  function clearFilters() {
    setInput("");
    setParams({ q: undefined, category: undefined, page: undefined });
  }

  return (
    <div className="space-y-6">
      {/* summary numbers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Datasets" value={stats.data ? formatNumber(stats.data.datasets) : null} />
        <StatCard
          label="Total records"
          value={stats.data ? formatCompact(stats.data.totalRecords) : null}
          title={stats.data ? formatNumber(stats.data.totalRecords) : undefined}
        />
        <StatCard label="Categories" value={stats.data ? formatNumber(stats.data.categories) : null} />
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          className="input input-bordered input-sm w-full sm:w-72"
          placeholder="Search datasets"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Search datasets"
        />
        <select
          className="select select-bordered select-sm"
          value={category}
          onChange={(e) => setParams({ category: e.target.value || undefined, page: undefined })}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.data?.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category} ({c.count})
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <div className="join">
            <button
              type="button"
              className={`btn btn-sm btn-square join-item ${layout === "grid" ? "btn-active" : ""}`}
              onClick={() => dispatch(libraryLayoutChanged("grid"))}
              aria-label="Grid layout"
              aria-pressed={layout === "grid"}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-square join-item ${layout === "list" ? "btn-active" : ""}`}
              onClick={() => dispatch(libraryLayoutChanged("list"))}
              aria-label="List layout"
              aria-pressed={layout === "list"}
            >
              <List className="size-4" />
            </button>
          </div>
          {isAdmin && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New dataset
            </button>
          )}
        </div>
      </div>

      {/* results */}
      {list.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48" />
          ))}
        </div>
      ) : list.error && !data ? (
        <EmptyState
          icon={TriangleAlert}
          title="Could not load datasets"
          description={getErrorMessage(list.error)}
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void list.refetch()}>
              Retry
            </button>
          }
        />
      ) : data && data.data.length === 0 ? (
        page > 1 && data.total > 0 ? (
          <EmptyState
            icon={SearchX}
            title="This page does not exist any more"
            description="The list changed while you were looking at it."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setParams({ page: undefined })}>
                Go to the first page
              </button>
            }
          />
        ) : hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="No datasets match"
            description="Try a different search or clear the filters."
            action={
              <button type="button" className="btn btn-sm" onClick={clearFilters}>
                Clear filters
              </button>
            }
          />
        ) : (
          <EmptyState
            icon={Database}
            title="No datasets yet"
            description={
              isAdmin
                ? "Create the first dataset, or run the seed script."
                : "You have not been given access to any dataset. Ask an administrator."
            }
          />
        )
      ) : data ? (
        <div className={list.isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
          {layout === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.data.map((d) => (
                <DatasetCard key={d.id} dataset={d} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-box border border-base-300">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th className="text-right">Records</th>
                    <th>Access</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <Link
                          href={`/dashboard/datasets/${d.id}`}
                          className="font-medium hover:underline"
                          onClick={() => dispatch(datasetOpened(d.id))}
                        >
                          {d.name}
                        </Link>
                      </td>
                      <td>{d.category}</td>
                      <td className="tabular text-right">{formatNumber(d.totalRecords)}</td>
                      <td>
                        <LevelBadge level={d.level} />
                      </td>
                      <td className="text-sm text-base-content/60">{formatRelative(d.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {data && (
        <Pagination
          page={page}
          pageSize={data.pageSize}
          total={data.total}
          noun="datasets"
          onPageChange={(p) => setParams({ page: p > 1 ? String(p) : undefined }, { history: "push" })}
        />
      )}

      {/* mounted only while open, so the form starts empty every time */}
      {isAdmin && creating && <CreateDatasetDialog open onClose={() => setCreating(false)} />}
    </div>
  );
}

function StatCard({ label, value, title }: { label: string; value: string | null; title?: string }) {
  return (
    <div className="rounded-box border border-base-300 p-4">
      <p className="text-xs text-base-content/60">{label}</p>
      {value === null ? (
        <div className="skeleton mt-2 h-7 w-20" />
      ) : (
        <p className="tabular mt-1 text-2xl font-semibold" title={title}>
          {value}
        </p>
      )}
    </div>
  );
}
