"use client";

import { Database } from "lucide-react";
import Link from "next/link";
import { formatCompact, formatNumber } from "@/lib/format";
import { useGetDatasetSummaryQuery } from "../api/datasetsApi";

// Real numbers on the Overview page. Uses the SAME cached request as the Dataset Library
// header, so opening the library right after costs no extra network call.
export default function OverviewStats() {
  const { data, isLoading, isError } = useGetDatasetSummaryQuery();

  return (
    <div className="rounded-box border border-base-300 p-5">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Database className="size-4" /> Your data
      </p>
      {isLoading ? (
        <div className="skeleton mt-3 h-12 w-full" />
      ) : isError || !data ? (
        <p className="mt-3 text-sm text-base-content/60">Statistics are not available right now.</p>
      ) : (
        <div className="mt-3 flex gap-8">
          <div>
            <p className="tabular text-2xl font-semibold">{formatNumber(data.datasets)}</p>
            <p className="text-xs text-base-content/60">datasets</p>
          </div>
          <div>
            <p className="tabular text-2xl font-semibold" title={formatNumber(data.totalRecords)}>
              {formatCompact(data.totalRecords)}
            </p>
            <p className="text-xs text-base-content/60">records</p>
          </div>
        </div>
      )}
      <Link href="/dashboard/datasets" className="btn btn-sm mt-4">
        Open Dataset Library
      </Link>
    </div>
  );
}
