"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/api/errors";

import { SavedView , SavedViewConfig } from "./types";
import { useUpdateSavedViewMutation, useCreateSavedViewMutation } from "../savedViewsApi";

type Props =
  | {
      mode: "create";
      datasetId: string;
      config: SavedViewConfig;
      onClose: () => void;
      onSaved?: (view: SavedView) => void;
    }
  | { mode: "rename"; view: SavedView; onClose: () => void; onSaved?: (view: SavedView) => void };

// "create": saves what the Explorer shows right now under a new name.
// "rename": changes only the name (to change the search itself, open the view, change it,
// and press "Update view").
// The parent mounts this dialog only while it is open, so the form always starts fresh.
export default function SaveViewDialog(props: Props) {
  const [name, setName] = useState(props.mode === "rename" ? props.view.name : "");
  const [create, { isLoading: creating }] = useCreateSavedViewMutation();
  const [update, { isLoading: updating }] = useUpdateSavedViewMutation();
  const busy = creating || updating;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Give the view a name");
      return;
    }
    try {
      const saved =
        props.mode === "create"
          ? await create({ datasetId: props.datasetId, name: trimmed, ...props.config }).unwrap()
          : await update({ id: props.view.id, changes: { name: trimmed } }).unwrap();
      toast.success(props.mode === "create" ? `Saved "${saved.name}"` : "View renamed");
      props.onSaved?.(saved);
      props.onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the view."));
    }
  }

  return (
    <Modal open title={props.mode === "create" ? "Save view" : "Rename view"} onClose={props.onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="form-control block">
          <span className="label-text mb-1 block text-sm font-medium">Name</span>
          <input
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoFocus
            required
            placeholder="e.g. Germany customers, top revenue"
          />
        </label>
        {props.mode === "create" && (
          <p className="text-xs text-base-content/60">
            Saves the current search text, filters, sorting and visible columns for this dataset.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={props.onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}