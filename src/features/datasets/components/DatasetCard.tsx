"use client";

import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { datasetOpened } from "@/store/slices/datasetSlice";
import { formatNumber, formatRelative } from "@/lib/format";
import type { DatasetSummary } from "../types";
import LevelBadge from "./LevelBadge";

export default function DatasetCard({ dataset }: { dataset: DatasetSummary }) {
  const dispatch = useAppDispatch();

  return (
    <article className="flex flex-col rounded-box border border-base-300 p-5 transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between gap-2">
        <span className="badge badge-ghost badge-sm">{dataset.category}</span>
        <LevelBadge level={dataset.level} />
      </div>

      <h2 className="mt-3 text-base font-semibold">
        <Link
          href={`/dashboard/datasets/${dataset.id}`}
          className="hover:underline"
          onClick={() => dispatch(datasetOpened(dataset.id))}
        >
          {dataset.name}
        </Link>
      </h2>
      <p className="mt-1 line-clamp-2 text-sm text-base-content/60">{dataset.description ?? "No description."}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-base-content/60">Records</dt>
          <dd className="tabular font-medium">{formatNumber(dataset.totalRecords)}</dd>
        </div>
        <div>
          <dt className="text-xs text-base-content/60">Fields</dt>
          <dd className="tabular font-medium">{dataset.fieldCount}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-base-content/60">
        <span>Updated {formatRelative(dataset.updatedAt)}</span>
        <Link
          href={`/dashboard/explorer?dataset=${dataset.id}`}
          className="link link-primary"
          onClick={() => dispatch(datasetOpened(dataset.id))}
        >
          Open in Explorer
        </Link>
      </div>
    </article>
  );
}
