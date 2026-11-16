"use client";

import { ArrowLeft, Check, Minus, Pencil, SearchX, Table2, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { getErrorMessage, getErrorStatus } from "@/lib/api/errors";
import { formatDate, formatNumber } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAdmin } from "@/store/slices/authSlice";
import { datasetForgotten } from "@/store/slices/datasetSlice";
import { useDeleteDatasetMutation, useGetDatasetQuery } from "../api/datasetsApi";
import type { DatasetDetail as DatasetDetailData } from "../types";
import EditDatasetDialog from "./EditDatasetDialog";
import LevelBadge from "./LevelBadge";
import PermissionsPanel from "./PermissionsPanel";

export default function DatasetDetail({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useGetDatasetQuery(id);
  const isAdmin = useAppSelector(selectIsAdmin);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-32" />
        <div className="skeleton h-64" />
      </div>
    );
  }

  if (!data) {
    const notFound = getErrorStatus(error) === 404;
    return (
      <EmptyState
        icon={notFound ? SearchX : TriangleAlert}
        title={notFound ? "Dataset not found" : "Could not load this dataset"}
        description={notFound ? "It does not exist, or you do not have access to it." : getErrorMessage(error)}
        action={
          notFound ? (
            <Link href="/dashboard/datasets" className="btn btn-primary btn-sm">
              Back to the library
            </Link>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void refetch()}>
              Retry
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/datasets" className="btn btn-ghost btn-xs -ml-2">
        <ArrowLeft className="size-3.5" /> Dataset Library
      </Link>

      <PageHeader
        title={data.name}
        description={data.description ?? "No description."}
        actions={
          <>
            <Link href={`/dashboard/explorer?dataset=${data.id}`} className="btn btn-primary btn-sm">
              <Table2 className="size-4" /> Open in Explorer
            </Link>
            {isAdmin && (
              <>
                <button type="button" className="btn btn-sm" onClick={() => setEditing(true)}>
                  <Pencil className="size-4" /> Edit
                </button>
                <button type="button" className="btn btn-sm btn-error btn-outline" onClick={() => setDeleting(true)}>
                  <Trash2 className="size-4" /> Delete
                </button>
              </>
            )}
          </>
        }
      />

      <dl className="grid gap-4 rounded-box border border-base-300 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Meta label="Category">{data.category}</Meta>
        <Meta label="Data source">{data.dataSource}</Meta>
        <Meta label="Total records">
          <span className="tabular">{formatNumber(data.totalRecords)}</span>
        </Meta>
        <Meta label="Created">{formatDate(data.createdAt)}</Meta>
        <Meta label="Last updated">{formatDate(data.updatedAt)}</Meta>
        <Meta label="Your access">
          <LevelBadge level={data.level} />
        </Meta>
      </dl>

      <section>
        <h2 className="mb-2 text-base font-semibold">Fields ({data.fields.length})</h2>
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Label</th>
                <th>Key</th>
                <th>Type</th>
                <th className="text-center">Search</th>
                <th className="text-center">Filter</th>
                <th className="text-center">Sort</th>
                <th className="text-center">Shown</th>
              </tr>
            </thead>
            <tbody>
              {data.fields.map((f) => (
                <tr key={f.id}>
                  <td className="font-medium">{f.label}</td>
                  <td className="font-mono text-xs">{f.key}</td>
                  <td>
                    <span className="badge badge-ghost badge-sm">{f.type}</span>
                    {f.type === "select" && f.options && (
                      <span className="ml-2 text-xs text-base-content/60">{f.options.length} options</span>
                    )}
                  </td>
                  <Flag on={f.isSearchable} />
                  <Flag on={f.isFilterable} />
                  <Flag on={f.isSortable} />
                  <Flag on={f.isVisibleByDefault} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isAdmin && <PermissionsPanel datasetId={data.id} />}

      {isAdmin && editing && <EditDatasetDialog open dataset={data} onClose={() => setEditing(false)} />}
      {isAdmin && deleting && <DeleteDialog dataset={data} onClose={() => setDeleting(false)} />}
    </div>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-base-content/60">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

function Flag({ on }: { on: boolean }) {
  return (
    <td className="text-center">
      {on ? (
        <Check className="mx-auto size-4 text-success" aria-label="yes" />
      ) : (
        <Minus className="mx-auto size-4 text-base-content/30" aria-label="no" />
      )}
    </td>
  );
}

// Deleting removes every record of the dataset, so the admin has to type its name.
function DeleteDialog({ dataset, onClose }: { dataset: DatasetDetailData; onClose: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [deleteDataset, { isLoading }] = useDeleteDatasetMutation();
  const [typed, setTyped] = useState("");

  async function confirm() {
    try {
      await deleteDataset(dataset.id).unwrap();
      dispatch(datasetForgotten(dataset.id));
      toast.success(`"${dataset.name}" deleted`);
      router.replace("/dashboard/datasets");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the dataset"));
    }
  }

  return (
    <Modal open title="Delete dataset" onClose={onClose}>
      <p className="text-sm">
        This permanently deletes <strong>{dataset.name}</strong>, its{" "}
        <strong>{formatNumber(dataset.totalRecords)}</strong> records and all permissions. It cannot be undone.
      </p>
      <label className="form-control mt-4">
        <span className="mb-1 text-sm">Type the dataset name to confirm</span>
        <input className="input input-bordered input-sm" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
      </label>
      <div className="modal-action">
        <button type="button" className="btn btn-sm" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-error btn-sm" disabled={typed !== dataset.name || isLoading} onClick={() => void confirm()}>
          {isLoading ? "Deleting..." : "Delete forever"}
        </button>
      </div>
    </Modal>
  );
}
