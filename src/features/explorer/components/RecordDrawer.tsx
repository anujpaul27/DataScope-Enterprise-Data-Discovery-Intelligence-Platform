"use client";

import { History, Link2, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { DatasetField } from "@/features/datasets/types";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate, formatRelative } from "@/lib/format";
import {
  useGetRecordHistoryQuery,
  useGetRecordQuery,
  useGetRelatedRecordsQuery,
} from "../api/recordsApi";
import { formatCell } from "../lib/formatCell";
import type { HistoryEntry, RelatedRecord } from "../types";

interface Props {
  datasetId: string;
  recordId: number | null;
  fields: DatasetField[];
  onClose: () => void;
  /** Open another record in this drawer (same or other dataset via parent). */
  onOpenRelated?: (related: RelatedRecord) => void;
}

type Tab = "details" | "related" | "history";

function formatRelation(type: string, direction: RelatedRecord["direction"]): string {
  const label = type.replace(/_/g, " ");
  if (direction === "incoming") return `Incoming · ${label}`;
  return label;
}

function RelatedList({
  items,
  datasetId,
  onOpenRelated,
}: {
  items: RelatedRecord[];
  datasetId: string;
  onOpenRelated?: (related: RelatedRecord) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-base-content/60">No related records for this row.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const sameDataset = item.datasetId === datasetId;
        const previewEntries = Object.entries(item.preview).slice(0, 3);
        const title =
          previewEntries.find(([k]) => k === "name" || k === "email" || k === "sku" || k === "customerId")?.[1] ??
          previewEntries[0]?.[1] ??
          `#${item.recordId}`;

        return (
          <li key={`${item.relationType}-${item.direction}-${item.recordId}`} className="rounded-box border border-base-300 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{String(title)}</p>
                <p className="mt-0.5 text-xs text-base-content/60">
                  {item.datasetName} · {formatRelation(item.relationType, item.direction)}
                </p>
              </div>
              {sameDataset && onOpenRelated ? (
                <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => onOpenRelated(item)}>
                  Open
                </button>
              ) : (
                <Link
                  href={`/dashboard/explorer?dataset=${item.datasetId}`}
                  className="btn btn-ghost btn-xs shrink-0"
                >
                  Explorer
                </Link>
              )}
            </div>
            {previewEntries.length > 0 && (
              <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                {previewEntries.map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="text-base-content/50">{key}</dt>
                    <dd className="truncate">{value === null || value === undefined ? "—" : String(value)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function HistoryList({ items }: { items: HistoryEntry[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-base-content/60">No change history for this record.</p>;
  }

  return (
    <ol className="relative space-y-4 border-l border-base-300 pl-4">
      {items.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute top-1.5 -left-[1.3rem] size-2.5 rounded-full bg-primary" aria-hidden />
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <time className="text-sm font-medium" dateTime={entry.createdAt} title={formatDate(entry.createdAt)}>
              {formatRelative(entry.createdAt)}
            </time>
            <span className="text-xs text-base-content/50">by {entry.changedBy}</span>
          </div>
          <ul className="mt-1.5 space-y-1">
            {entry.changes.map((c) => (
              <li key={`${entry.id}-${c.field}`} className="text-sm">
                <span className="font-medium">{c.label}</span>
                <span className="text-base-content/60">
                  : {c.from === null || c.from === undefined ? "—" : String(c.from)}
                  {" → "}
                  {c.to === null || c.to === undefined ? "—" : String(c.to)}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="space-y-2 text-center">
      <TriangleAlert className="mx-auto size-5 text-error" />
      <p className="text-sm">{message}</p>
      <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

// Side panel with the FULL record. The table only holds the visible columns, so the
// complete record is fetched on demand (and cached) when a row is opened.
export default function RecordDrawer({ datasetId, recordId, fields, onClose, onOpenRelated }: Props) {
  const open = recordId !== null;
  const [tab, setTab] = useState<Tab>("details");

  const detail = useGetRecordQuery({ datasetId, recordId: recordId ?? 0 }, { skip: !open });
  const related = useGetRelatedRecordsQuery({ datasetId, recordId: recordId ?? 0 }, { skip: !open });
  const history = useGetRecordHistoryQuery({ datasetId, recordId: recordId ?? 0 }, { skip: !open });

  useEffect(() => {
    if (open) setTab("details");
  }, [open, recordId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const record = detail.data;
  const relatedCount = related.data?.length;
  const historyCount = history.data?.length;

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

        <div className="border-b border-base-300 px-2" role="tablist" aria-label="Record sections">
          {(
            [
              { id: "details" as const, label: "Details", icon: null },
              {
                id: "related" as const,
                label: "Related",
                icon: Link2,
                count: relatedCount,
              },
              {
                id: "history" as const,
                label: "History",
                icon: History,
                count: historyCount,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`btn btn-ghost btn-sm rounded-none border-b-2 ${
                tab === t.id ? "border-primary" : "border-transparent"
              }`}
              onClick={() => setTab(t.id)}
            >
              {"icon" in t && t.icon ? <t.icon className="size-3.5" /> : null}
              {t.label}
              {"count" in t && typeof t.count === "number" ? (
                <span className="badge badge-sm">{t.count}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4" role="tabpanel">
          {tab === "details" &&
            (detail.isFetching && !record ? (
              <div className="space-y-3" aria-busy="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-10" />
                ))}
              </div>
            ) : detail.error && !record ? (
              <SectionError message={getErrorMessage(detail.error)} onRetry={() => void detail.refetch()} />
            ) : record ? (
              <>
                <dl className="divide-y divide-base-300">
                  {fields.map((f) => (
                    <div key={f.key} className="grid grid-cols-3 gap-2 py-2.5">
                      <dt className="text-sm text-base-content/60">{f.label}</dt>
                      <dd className="col-span-2 text-sm break-words">
                        {formatCell(record.data[f.key], f.type, "")}
                      </dd>
                    </div>
                  ))}
                </dl>
                <dl className="mt-6 grid grid-cols-2 gap-2 rounded-box bg-base-200 p-3 text-sm">
                  <dt className="text-base-content/60">Created</dt>
                  <dd>{formatDate(record.createdAt)}</dd>
                  <dt className="text-base-content/60">Updated</dt>
                  <dd>{formatDate(record.updatedAt)}</dd>
                </dl>
              </>
            ) : null)}

          {tab === "related" &&
            (related.isFetching && !related.data ? (
              <div className="space-y-2" aria-busy="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-20" />
                ))}
              </div>
            ) : related.error && !related.data ? (
              <SectionError message={getErrorMessage(related.error)} onRetry={() => void related.refetch()} />
            ) : related.data ? (
              <RelatedList items={related.data} datasetId={datasetId} onOpenRelated={onOpenRelated} />
            ) : null)}

          {tab === "history" &&
            (history.isFetching && !history.data ? (
              <div className="space-y-3" aria-busy="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-14" />
                ))}
              </div>
            ) : history.error && !history.data ? (
              <SectionError message={getErrorMessage(history.error)} onRetry={() => void history.refetch()} />
            ) : history.data ? (
              <HistoryList items={history.data} />
            ) : null)}
        </div>
      </aside>
    </div>
  );
}
