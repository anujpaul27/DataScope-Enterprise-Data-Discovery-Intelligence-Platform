"use client";

import { Database, SearchX, Table2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { useGetDatasetQuery, useListDatasetsQuery } from "@/features/datasets/api/datasetsApi";
import { getErrorMessage, getErrorStatus } from "@/lib/api/errors";
import { formatNumber } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";
import { datasetOpened } from "@/store/slices/datasetSlice";
import { useExplorerUrlState } from "../hooks/useExplorerUrlState";
import ExplorerWorkspace from "./ExplorerWorkspace";
import TableSkeleton from "./TableSkeleton";

// Dataset picker + workspace. Also used by Advanced Search with filtersAlwaysOpen.
export default function DataExplorer({ filtersAlwaysOpen = false }: { filtersAlwaysOpen?: boolean }) {
  const url = useExplorerUrlState();
  const dispatch = useAppDispatch();

  // only datasets the API says this user may open (permission filtering happens on the server)
  const list = useListDatasetsQuery({ page: 1, pageSize: 50 });
  const detail = useGetDatasetQuery(url.datasetId, { skip: !url.datasetId });
  const datasets = list.data?.data ?? [];

  function choose(id: string) {
    if (id) dispatch(datasetOpened(id));
    url.setDataset(id);
  }

  let body: ReactNode;
  if (!url.datasetId) {
    body = list.isLoading ? (
      <TableSkeleton columns={4} rows={4} />
    ) : list.error && !list.data ? (
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
    ) : datasets.length === 0 ? (
      <EmptyState
        icon={Database}
        title="No datasets available"
        description="You have not been given access to any dataset yet. Ask an administrator."
      />
    ) : (
      <div className="space-y-3">
        <p className="text-sm text-base-content/60">Choose a dataset to explore:</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {datasets.slice(0, 9).map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => choose(d.id)}
              className="rounded-box border border-base-300 p-4 text-left transition hover:border-primary hover:bg-base-200"
            >
              <span className="flex items-center gap-2 font-medium">
                <Table2 className="size-4 text-primary" /> {d.name}
              </span>
              <span className="mt-1 block text-sm text-base-content/60">
                {d.category} · {formatNumber(d.totalRecords)} records
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  } else if (detail.isLoading) {
    body = <TableSkeleton />;
  } else if (!detail.data) {
    const status = getErrorStatus(detail.error);
    const notFound = status === 404 || status === 400;
    body = (
      <EmptyState
        icon={notFound ? SearchX : TriangleAlert}
        title={notFound ? "Dataset not found" : "Could not load this dataset"}
        description={notFound ? "It does not exist, or you do not have access to it." : getErrorMessage(detail.error)}
        action={
          notFound ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => choose("")}>
              Choose another dataset
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void detail.refetch()}>
              Retry
            </button>
          )
        }
      />
    );
  } else {
    body = (
      <ExplorerWorkspace
        key={detail.data.id}
        dataset={detail.data}
        url={url}
        filtersAlwaysOpen={filtersAlwaysOpen}
      />
    );
  }

  return (
    <div className="space-y-4">
      {filtersAlwaysOpen && (
        <p className="rounded-box border border-base-300 bg-base-200/60 px-3 py-2 text-sm text-base-content/70">
          Combine a global search with field conditions (status, country, revenue ranges, last N days). Every
          condition runs on the server and is AND-ed together. Share the URL to keep the same query.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-base-content/60">Dataset</span>
          <select
            className="select select-bordered select-sm min-w-56"
            value={url.datasetId}
            onChange={(e) => choose(e.target.value)}
            aria-label="Dataset"
          >
            <option value="">Select a dataset…</option>
            {/* the current dataset stays selectable even when it is not in the first 50 */}
            {url.datasetId && !datasets.some((d) => d.id === url.datasetId) && detail.data && (
              <option value={detail.data.id}>{detail.data.name}</option>
            )}
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        {detail.data && (
          <span className="text-sm text-base-content/60">
            {formatNumber(detail.data.totalRecords)} records · {detail.data.fields.length} fields ·{" "}
            <Link href={`/dashboard/datasets/${detail.data.id}`} className="link">
              details
            </Link>
          </span>
        )}
      </div>
      {body}
    </div>
  );
}
