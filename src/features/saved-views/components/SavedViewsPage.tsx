"use client";

import { BookMarked, Pencil, Share2, SearchX, Trash2, TriangleAlert, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useListDatasetsQuery } from "@/features/datasets/api/datasetsApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate, formatRelative } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAnalystOrAdmin } from "@/store/slices/authSlice";
import { selectActiveViewId, viewDeactivated } from "@/store/slices/savedViewsSlice";
import type { SavedView, ViewScope } from "./types";
import SaveViewDialog from "./SaveViewDialog";
import ShareViewDialog from "./ShareViewDialog";

import { useListSavedViewsQuery } from "../savedViewsApi";
import ViewSummary from "./ViewSummary";
import DeleteViewDialog from "./DeleteViewDialog";

const PAGE_SIZE = 12;

type Action = { kind: "rename" | "share" | "delete"; view: SavedView };

// Filters live in the URL (?scope=mine&q=...&dataset=...&page=2): shareable and reload-safe.
export default function SavedViewsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const canSave = useAppSelector(selectIsAnalystOrAdmin);
  const activeViewId = useAppSelector(selectActiveViewId);
  const { params, setParams } = useUrlParams();

  const rawScope = params.get("scope");
  // viewers have no views of their own, so "Mine" is not offered to them
  const scope: ViewScope = rawScope === "mine" && canSave ? "mine" : rawScope === "shared" ? "shared" : "all";
  const urlQ = params.get("q") ?? "";
  const datasetId = params.get("dataset") ?? "";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const [input, setInput] = useState(urlQ);
  const debounced = useDebouncedValue(input, 350);
  useEffect(() => {
    const next = debounced.trim();
    if (next !== urlQ) setParams({ q: next || undefined, page: undefined });
    // react only to the debounced text; reacting to urlQ too would fight the back button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const [action, setAction] = useState<Action | null>(null);

  const datasets = useListDatasetsQuery({ page: 1, pageSize: 50 });
  const list = useListSavedViewsQuery({
    page,
    pageSize: PAGE_SIZE,
    scope,
    q: urlQ || undefined,
    datasetId: datasetId || undefined,
  });

  const hasFilters = Boolean(urlQ || datasetId);
  const data = list.data;
  const tabs: { id: ViewScope; label: string }[] = canSave
    ? [
        { id: "all", label: "All" },
        { id: "mine", label: "Mine" },
        { id: "shared", label: "Shared with me" },
      ]
    : [{ id: "all", label: "Shared with me" }];

  function open(view: SavedView) {
    router.push(`/dashboard/explorer?dataset=${view.datasetId}&view=${view.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {tabs.length > 1 && (
          <div role="tablist" className="tabs tabs-box tabs-sm">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={scope === t.id}
                className={`tab ${scope === t.id ? "tab-active" : ""}`}
                onClick={() => setParams({ scope: t.id === "all" ? undefined : t.id, page: undefined })}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <input
          type="search"
          className="input input-bordered input-sm w-full sm:w-64"
          placeholder="Search views by name"
          value={input}
          maxLength={100}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Search saved views"
        />
        <select
          className="select select-bordered select-sm"
          value={datasetId}
          onChange={(e) => setParams({ dataset: e.target.value || undefined, page: undefined })}
          aria-label="Filter by dataset"
        >
          <option value="">All datasets</option>
          {(datasets.data?.data ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setInput("");
              setParams({ q: undefined, dataset: undefined, page: undefined });
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {list.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-44" />
          ))}
        </div>
      ) : !data ? (
        <EmptyState
          icon={TriangleAlert}
          title="Could not load saved views"
          description={getErrorMessage(list.error)}
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void list.refetch()}>
              Retry
            </button>
          }
        />
      ) : data.data.length === 0 ? (
        page > 1 ? (
          <EmptyState
            icon={SearchX}
            title="This page does not exist"
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setParams({ page: undefined })}>
                Go to the first page
              </button>
            }
          />
        ) : hasFilters ? (
          <EmptyState icon={SearchX} title="No views match" description="Try another name or dataset." />
        ) : (
          <EmptyState
            icon={BookMarked}
            title={canSave ? "No saved views yet" : "Nothing has been shared with you yet"}
            description={
              canSave
                ? "Open the Data Explorer, set up a search and use the Views menu to save it."
                : "When a colleague shares a saved view with you, it appears here."
            }
          />
        )
      ) : (
        <>
          <ul className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${list.isFetching ? "opacity-70" : ""}`}>
            {data.data.map((v) => (
              <li key={v.id}>
                <ViewCard
                  view={v}
                  isActive={v.id === activeViewId}
                  onOpen={() => open(v)}
                  onRename={() => setAction({ kind: "rename", view: v })}
                  onShare={() => setAction({ kind: "share", view: v })}
                  onDelete={() => setAction({ kind: "delete", view: v })}
                />
              </li>
            ))}
          </ul>
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            noun="views"
            onPageChange={(p) => setParams({ page: p > 1 ? String(p) : undefined }, { history: "push" })}
          />
        </>
      )}

      {action?.kind === "rename" && <SaveViewDialog mode="rename" view={action.view} onClose={() => setAction(null)} />}
      {action?.kind === "share" && <ShareViewDialog view={action.view} onClose={() => setAction(null)} />}
      {action?.kind === "delete" && (
        <DeleteViewDialog
          view={action.view}
          onClose={() => setAction(null)}
          onDeleted={() => {
            if (action.view.id === activeViewId) dispatch(viewDeactivated());
          }}
        />
      )}
    </div>
  );
}

function ViewCard({
  view,
  isActive,
  onOpen,
  onRename,
  onShare,
  onDelete,
}: {
  view: SavedView;
  isActive: boolean;
  onOpen: () => void;
  onRename: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  return (
    <article className={`flex h-full flex-col gap-3 rounded-box border p-5 ${isActive ? "border-primary" : "border-base-300"}`}>
      <div className="min-w-0">
        <h3 className="truncate font-semibold" title={view.name}>
          {view.name}
        </h3>
        <p className="truncate text-xs text-base-content/60">{view.datasetName}</p>
      </div>

      <ViewSummary view={view} />

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
        {view.isOwner ? (
          view.isShared && (
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" aria-hidden /> Shared with {view.sharedWithCount}
            </span>
          )
        ) : (
          <span>Shared by {view.owner.name}</span>
        )}
        <span title={`Updated ${formatRelative(view.updatedAt)}`}>Created {formatDate(view.createdAt)}</span>
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <button type="button" className="btn btn-primary btn-sm" onClick={onOpen}>
          Open in Explorer
        </button>
        {view.canManage && (
          <div className="flex gap-1">
            <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={onRename} aria-label={`Rename ${view.name}`} title="Rename">
              <Pencil className="size-4" />
            </button>
            <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={onShare} aria-label={`Share ${view.name}`} title="Share">
              <Share2 className="size-4" />
            </button>
            <button type="button" className="btn btn-ghost btn-xs btn-square text-error" onClick={onDelete} aria-label={`Delete ${view.name}`} title="Delete">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
