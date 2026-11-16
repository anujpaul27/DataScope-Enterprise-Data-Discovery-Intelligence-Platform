"use client";

import { BookMarked, Check, Share2, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { DatasetDetail } from "@/features/datasets/types";
import { getErrorMessage } from "@/lib/api/errors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAnalystOrAdmin } from "@/store/slices/authSlice";
import { selectActiveViewId, viewActivated, viewDeactivated } from "@/store/slices/savedViewsSlice";
import { useGetSavedViewQuery, useListSavedViewsQuery, useUpdateSavedViewMutation } from "../savedViewsApi";
import { isSameConfig } from "./viewConfig";
import type { SavedView, SavedViewConfig } from "./types";
import SaveViewDialog from "./SaveViewDialog";
import ShareViewDialog from "./ShareViewDialog";


interface Props {
  dataset: DatasetDetail;
  /** What the Explorer shows right now (search text, filters, sort, columns). */
  config: SavedViewConfig;
  /** Apply a view: the parent owns the URL and the search box. */
  onApply: (view: SavedView) => void;
}

// "Views" button of the Explorer toolbar: open a saved view, save the current search,
// update / share the open view. The id of the open view lives in Redux (client state);
// the views themselves are server state (RTK Query).
export default function SavedViewsMenu({ dataset, config, onApply }: Props) {
  const dispatch = useAppDispatch();
  const canSave = useAppSelector(selectIsAnalystOrAdmin);
  const activeViewId = useAppSelector(selectActiveViewId);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [dialog, setDialog] = useState<"save" | "share" | null>(null);

  const list = useListSavedViewsQuery({ datasetId: dataset.id, page: 1, pageSize: 50 });
  const activeQuery = useGetSavedViewQuery(activeViewId ?? "", { skip: !activeViewId });
  const [updateView, { isLoading: updating }] = useUpdateSavedViewMutation();

  // a view that belongs to another dataset (or was deleted) is simply "no view"
  const active = activeQuery.data && activeQuery.data.datasetId === dataset.id ? activeQuery.data : null;
  const dirty = active ? !isSameConfig(active, config, dataset.fields) : false;
  const views = list.data?.data ?? [];

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  async function onUpdate() {
    if (!active) return;
    try {
      await updateView({ id: active.id, changes: config }).unwrap();
      toast.success(`Updated "${active.name}"`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the view."));
    }
  }

  return (
    <>
      <details ref={menuRef} className="dropdown dropdown-end">
        <summary className={`btn btn-sm ${active ? "btn-primary btn-soft" : ""}`}>
          <BookMarked className="size-4" />
          <span className="max-w-40 truncate">{active ? active.name : "Views"}</span>
          {active && dirty && <span className="badge badge-warning badge-xs" title="You changed the search after opening this view">edited</span>}
        </summary>

        <div className="dropdown-content z-30 mt-1 w-80 rounded-box border border-base-300 bg-base-100 p-3 shadow-lg">
          {active && (
            <div className="mb-3 space-y-2 rounded-box bg-base-200/60 p-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{active.name}</p>
                  <p className="text-xs text-base-content/60">
                    {active.isOwner ? "Your view" : `Shared by ${active.owner.name}`}
                    {dirty ? " · unsaved changes" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label="Close this view (keep the current search)"
                  onClick={() => dispatch(viewDeactivated())}
                >
                  <X className="size-4" />
                </button>
              </div>
              {active.canManage && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    disabled={!dirty || updating}
                    onClick={() => void onUpdate()}
                  >
                    {updating ? "Updating..." : "Update view"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => {
                      closeMenu();
                      setDialog("share");
                    }}
                  >
                    <Share2 className="size-3.5" /> Share
                  </button>
                </div>
              )}
            </div>
          )}

          {canSave && (
            <button
              type="button"
              className="btn btn-outline btn-sm mb-3 w-full"
              onClick={() => {
                closeMenu();
                setDialog("save");
              }}
            >
              Save current search as new view
            </button>
          )}

          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-base-content/50">Views for {dataset.name}</p>
          {list.isLoading ? (
            <div className="skeleton h-16 w-full" />
          ) : list.isError ? (
            <div role="alert" className="text-sm text-error">
              {getErrorMessage(list.error, "Could not load views.")}{" "}
              <button type="button" className="link" onClick={() => void list.refetch()}>
                Retry
              </button>
            </div>
          ) : views.length === 0 ? (
            <p className="py-2 text-sm text-base-content/60">
              {canSave ? "No saved views for this dataset yet." : "Nobody has shared a view of this dataset with you yet."}
            </p>
          ) : (
            <ul className="max-h-64 space-y-0.5 overflow-y-auto">
              {views.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-base-200"
                    onClick={() => {
                      closeMenu();
                      dispatch(viewActivated(v.id));
                      onApply(v);
                    }}
                  >
                    <Check className={`size-4 shrink-0 ${v.id === active?.id ? "text-primary" : "invisible"}`} aria-hidden />
                    <span className="min-w-0 grow">
                      <span className="block truncate">{v.name}</span>
                      {!v.isOwner && <span className="block truncate text-xs text-base-content/50">by {v.owner.name}</span>}
                    </span>
                    {v.isShared && v.isOwner && <Share2 className="size-3.5 shrink-0 text-base-content/40" aria-label="Shared" />}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link href="/dashboard/saved-views" className="link mt-3 block text-xs">
            Manage all saved views
          </Link>
        </div>
      </details>

      {dialog === "save" && (
        <SaveViewDialog
          mode="create"
          datasetId={dataset.id}
          config={config}
          onClose={() => setDialog(null)}
          onSaved={(v) => dispatch(viewActivated(v.id))}
        />
      )}
      {dialog === "share" && active && <ShareViewDialog view={active} onClose={() => setDialog(null)} />}
    </>
  );
}
