"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/api/errors";
import { useUpdateDatasetMutation } from "../api/datasetsApi";
import type { DatasetDetail } from "../types";

interface Props {
  open: boolean;
  dataset: DatasetDetail;
  onClose: () => void;
}

// The inner form is a separate component and only mounted while the dialog is open,
// so it always starts from the current dataset values (no "reset the form" effect needed).
export default function EditDatasetDialog({ open, dataset, onClose }: Props) {
  return (
    <Modal open={open} title="Edit dataset" onClose={onClose}>
      <EditForm dataset={dataset} onClose={onClose} />
    </Modal>
  );
}

function EditForm({ dataset, onClose }: { dataset: DatasetDetail; onClose: () => void }) {
  const [updateDataset, { isLoading }] = useUpdateDatasetMutation();
  const [name, setName] = useState(dataset.name);
  const [description, setDescription] = useState(dataset.description ?? "");
  const [category, setCategory] = useState(dataset.category);
  const [dataSource, setDataSource] = useState(dataset.dataSource);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || category.trim().length < 2 || dataSource.trim().length < 2) {
      toast.error("Name, category and data source need at least 2 characters");
      return;
    }
    try {
      await updateDataset({
        id: dataset.id,
        changes: {
          name: name.trim(),
          description: description.trim() || null,
          category: category.trim(),
          dataSource: dataSource.trim(),
        },
      }).unwrap();
      toast.success("Dataset updated");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the dataset"));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="form-control">
        <span className="mb-1 text-sm">Name</span>
        <input className="input input-bordered input-sm" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
      </label>
      <label className="form-control">
        <span className="mb-1 text-sm">Category</span>
        <input className="input input-bordered input-sm" value={category} onChange={(e) => setCategory(e.target.value)} maxLength={60} />
      </label>
      <label className="form-control">
        <span className="mb-1 text-sm">Data source</span>
        <input className="input input-bordered input-sm" value={dataSource} onChange={(e) => setDataSource(e.target.value)} maxLength={100} />
      </label>
      <label className="form-control">
        <span className="mb-1 text-sm">Description</span>
        <textarea className="textarea textarea-bordered" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
      </label>
      <div className="modal-action">
        <button type="button" className="btn btn-sm" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
