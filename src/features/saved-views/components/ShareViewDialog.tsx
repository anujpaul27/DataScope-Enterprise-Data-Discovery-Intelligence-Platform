"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import RoleBadge from "@/components/ui/RoleBadge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/api/errors";
import { useListShareTargetsQuery, useListViewSharesQuery, useSetViewSharesMutation } from "../savedViewsApi";
import type { SavedView, ShareTarget } from "./types";

// Share a view with team members. Only people who ALREADY have access to the dataset are
// offered (the server checks again): sharing a view never gives access to data.
export default function ShareViewDialog({ view, onClose }: { view: SavedView; onClose: () => void }) {
  const shares = useListViewSharesQuery(view.id);

  return (
    <Modal open title={`Share "${view.name}"`} onClose={onClose} wide>
      {shares.isLoading ? (
        <div className="skeleton h-24 w-full" />
      ) : shares.isError || !shares.data ? (
        <div role="alert" className="alert alert-error alert-soft text-sm">
          <span>{getErrorMessage(shares.error, "Could not load who this view is shared with.")}</span>
          <button type="button" className="btn btn-xs" onClick={() => void shares.refetch()}>
            Retry
          </button>
        </div>
      ) : (
        // mounted after the list arrived, so the editor can start from it (no sync effect)
        <ShareEditor view={view} initial={shares.data} onClose={onClose} />
      )}
    </Modal>
  );
}

function ShareEditor({ view, initial, onClose }: { view: SavedView; initial: ShareTarget[]; onClose: () => void }) {
  const [selected, setSelected] = useState<ReadonlyMap<string, ShareTarget>>(
    () => new Map(initial.map((p) => [p.id, p])),
  );
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 300);

  const targets = useListShareTargetsQuery({ datasetId: view.datasetId, q: debounced.trim() || undefined });
  const [save, { isLoading: saving }] = useSetViewSharesMutation();

  const candidates = (targets.data ?? []).filter((u) => !selected.has(u.id));
  const changed =
    selected.size !== initial.length || initial.some((p) => !selected.has(p.id));

  function add(person: ShareTarget) {
    setSelected((prev) => new Map(prev).set(person.id, person));
  }
  function remove(id: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  async function onSave() {
    try {
      await save({ id: view.id, userIds: [...selected.keys()] }).unwrap();
      toast.success(selected.size === 0 ? "View is private again" : `Shared with ${selected.size} ${selected.size === 1 ? "person" : "people"}`);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update sharing."));
    }
  }

  return (
    <div className="space-y-5">
      <section aria-labelledby="shared-with">
        <h4 id="shared-with" className="mb-2 text-sm font-medium">
          Shared with
        </h4>
        {selected.size === 0 ? (
          <p className="rounded-box border border-dashed border-base-300 p-4 text-sm text-base-content/60">
            Private. Only you (and administrators) can open this view.
          </p>
        ) : (
          <ul className="divide-y divide-base-300 rounded-box border border-base-300">
            {[...selected.values()].map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 p-3">
                <PersonInfo person={p} />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square text-error"
                  aria-label={`Stop sharing with ${p.name}`}
                  onClick={() => remove(p.id)}
                >
                  <UserMinus className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="add-people">
        <h4 id="add-people" className="mb-2 text-sm font-medium">
          Add people
        </h4>
        <input
          type="search"
          className="input input-bordered input-sm w-full"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search people to share with"
        />
        <ul className={`mt-2 divide-y divide-base-300 rounded-box border border-base-300 ${targets.isFetching ? "opacity-60" : ""}`}>
          {targets.isError ? (
            <li className="p-3 text-sm text-error">{getErrorMessage(targets.error, "Could not load people.")}</li>
          ) : candidates.length === 0 ? (
            <li className="p-3 text-sm text-base-content/60">
              {targets.isFetching ? "Searching..." : "Nobody else with access to this dataset matches."}
            </li>
          ) : (
            candidates.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 p-3">
                <PersonInfo person={u} />
                <button type="button" className="btn btn-outline btn-xs" onClick={() => add(u)}>
                  <UserPlus className="size-4" /> Add
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="mt-2 text-xs text-base-content/50">
          Only people who already have access to this dataset are listed (up to 20 matches). People
          who open a shared view can use it but not change it.
        </p>
      </section>

      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => void onSave()} disabled={saving || !changed}>
          {saving ? "Saving..." : "Save sharing"}
        </button>
      </div>
    </div>
  );
}

function PersonInfo({ person }: { person: ShareTarget }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-medium">{person.name}</span>
        <RoleBadge role={person.role} />
      </div>
      <div className="truncate text-xs text-base-content/60">{person.email}</div>
    </div>
  );
}
