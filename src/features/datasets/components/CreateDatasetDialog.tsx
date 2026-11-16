"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/api/errors";
import { useCreateDatasetMutation } from "../api/datasetsApi";
import { FIELD_TYPES, type FieldType } from "../types";

interface FieldRow {
  key: string;
  label: string;
  type: FieldType;
  options: string; // "Active, Inactive"
}

const emptyRow = (): FieldRow => ({ key: "", label: "", type: "text", options: "" });
const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;

export default function CreateDatasetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [createDataset, { isLoading }] = useCreateDatasetMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [rows, setRows] = useState<FieldRow[]>([emptyRow()]);

  function updateRow(index: number, patch: Partial<FieldRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  // Same rules as the server's Zod schema, so most mistakes are caught before any request.
  function validate(): string | null {
    if (name.trim().length < 2) return "Name needs at least 2 characters";
    if (category.trim().length < 2) return "Category needs at least 2 characters";
    if (dataSource.trim().length < 2) return "Data source needs at least 2 characters";
    const seen = new Set<string>();
    for (const [i, r] of rows.entries()) {
      const n = i + 1;
      if (!KEY_PATTERN.test(r.key)) return `Field ${n}: key must start with a letter and use only letters, digits or _`;
      if (!r.label.trim()) return `Field ${n}: label is required`;
      if (seen.has(r.key)) return `Field ${n}: duplicate key "${r.key}"`;
      seen.add(r.key);
      if (r.type === "select" && !r.options.split(",").some((o) => o.trim())) {
        return `Field ${n}: a select field needs at least one option`;
      }
    }
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }
    try {
      const created = await createDataset({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
        dataSource: dataSource.trim(),
        fields: rows.map((r) => ({
          key: r.key,
          label: r.label.trim(),
          type: r.type,
          options:
            r.type === "select"
              ? r.options
                  .split(",")
                  .map((o) => o.trim())
                  .filter(Boolean)
              : undefined,
        })),
      }).unwrap();
      toast.success("Dataset created");
      onClose();
      router.push(`/dashboard/datasets/${created.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not create the dataset"));
    }
  }

  return (
    <Modal open={open} title="New dataset" onClose={onClose} wide>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="form-control">
            <span className="mb-1 text-sm">Name</span>
            <input className="input input-bordered input-sm" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </label>
          <label className="form-control">
            <span className="mb-1 text-sm">Category</span>
            <input className="input input-bordered input-sm" value={category} onChange={(e) => setCategory(e.target.value)} maxLength={60} />
          </label>
          <label className="form-control sm:col-span-2">
            <span className="mb-1 text-sm">Data source</span>
            <input className="input input-bordered input-sm" value={dataSource} onChange={(e) => setDataSource(e.target.value)} maxLength={100} placeholder="e.g. CRM export, Generated (seed script)" />
          </label>
          <label className="form-control sm:col-span-2">
            <span className="mb-1 text-sm">Description (optional)</span>
            <textarea className="textarea textarea-bordered" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Fields (the columns of this dataset)</p>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-box border border-base-300 p-2 sm:grid-cols-[1fr_1fr_8rem_auto]">
                <input className="input input-bordered input-xs" placeholder="key (e.g. country)" value={r.key} onChange={(e) => updateRow(i, { key: e.target.value })} aria-label={`Field ${i + 1} key`} />
                <input className="input input-bordered input-xs" placeholder="Label" value={r.label} onChange={(e) => updateRow(i, { label: e.target.value })} aria-label={`Field ${i + 1} label`} />
                <select className="select select-bordered select-xs" value={r.type} onChange={(e) => updateRow(i, { type: e.target.value as FieldType })} aria-label={`Field ${i + 1} type`}>
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-ghost btn-xs btn-square" disabled={rows.length === 1} onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} aria-label={`Remove field ${i + 1}`}>
                  <Trash2 className="size-4" />
                </button>
                {r.type === "select" && (
                  <input className="input input-bordered input-xs col-span-2 sm:col-span-4" placeholder="Options, separated by commas (e.g. Active, Inactive)" value={r.options} onChange={(e) => updateRow(i, { options: e.target.value })} aria-label={`Field ${i + 1} options`} />
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => setRows((prev) => [...prev, emptyRow()])} disabled={rows.length >= 60}>
            <Plus className="size-4" /> Add field
          </button>
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create dataset"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
