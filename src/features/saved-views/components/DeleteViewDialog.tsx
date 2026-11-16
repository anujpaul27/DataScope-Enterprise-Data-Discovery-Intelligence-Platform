"use client";

import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/api/errors";
import { useDeleteSavedViewMutation } from "../savedViewsApi";
import type { SavedView } from "./types";

export default function DeleteViewDialog({
  view,
  onClose,
  onDeleted,
}: {
  view: SavedView;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const [deleteView, { isLoading }] = useDeleteSavedViewMutation();

  async function onDelete() {
    try {
      await deleteView(view.id).unwrap();
      toast.success(`"${view.name}" was deleted`);
      onDeleted?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the view."));
    }
  }

  return (
    <Modal open title="Delete view" onClose={onClose}>
      <p className="text-sm">
        Delete <strong>{view.name}</strong>?
        {view.sharedWithCount > 0 && (
          <>
            {" "}
            It is shared with {view.sharedWithCount} {view.sharedWithCount === 1 ? "person" : "people"}, who will lose it too.
          </>
        )}{" "}
        The data itself is not affected. This cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
        <button type="button" className="btn btn-error btn-sm" onClick={() => void onDelete()} disabled={isLoading}>
          {isLoading ? "Deleting..." : "Delete view"}
        </button>
      </div>
    </Modal>
  );
}
