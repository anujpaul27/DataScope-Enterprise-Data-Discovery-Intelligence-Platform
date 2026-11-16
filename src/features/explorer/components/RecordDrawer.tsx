"use client";

import { TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";
import type { DatasetField } from "@/features/datasets/types";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { useGetRecordQuery } from "../api/recordsApi";
import { formatCell } from "../lib/formatCell";

interface Props {
  datasetId: string;
  recordId: number | null;
  fields: DatasetField[];
  onClose: () => void;
}

// Side panel with the FULL record. The table only holds the visible columns, so the
// complete record is fetched on demand (and cached) when a row is opened.
export default function RecordDrawer({ datasetId, recordId, fields, onClose }: Props) {
  const open = recordId !== null;
  const { data, isFetching, error, refetch } = useGetRecordQuery(
    { datasetId, recordId: recordId ?? 0 },
    { skip: !open },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={`Record ${recordId}`}>
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close details" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full flex-col bg-base-100 shadow-xl sm:w-[28rem]">
        <header className="flex items-center justify-between border-b border-base-300 p-4">
          <h2 className="text-base font-semibold">Record #{recordId}</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {isFetching && !data ? (
            <div className="space-y-3" aria-busy="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-10" />
              ))}
            </div>
          ) : error && !data ? (
            <div className="space-y-3 text-center">
              <TriangleAlert className="mx-auto size-6 text-error" />
              <p className="text-sm">{getErrorMessage(error)}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => void refetch()}>
                Retry
              </button>
            </div>
          ) : data ? (
            <>
              <dl className="divide-y divide-base-300">
                {fields.map((f) => (
                  <div key={f.key} className="grid grid-cols-3 gap-2 py-2.5">
                    <dt className="text-sm text-base-content/60">{f.label}</dt>
                    <dd className="col-span-2 text-sm break-words">{formatCell(data.data[f.key], f.type, "")}</dd>
                  </div>
                ))}
              </dl>
              <dl className="mt-6 grid grid-cols-2 gap-2 rounded-box bg-base-200 p-3 text-sm">
                <dt className="text-base-content/60">Created</dt>
                <dd>{formatDate(data.createdAt)}</dd>
                <dt className="text-base-content/60">Updated</dt>
                <dd>{formatDate(data.updatedAt)}</dd>
              </dl>
              <p className="mt-4 text-xs text-base-content/50">
                Related records and change history are added in the Record Details phase.
              </p>
            </>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
