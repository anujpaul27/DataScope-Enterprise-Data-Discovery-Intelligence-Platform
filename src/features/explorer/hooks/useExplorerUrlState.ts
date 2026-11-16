"use client";

import { useCallback, useMemo } from "react";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useAppSelector } from "@/store/hooks";
import { PAGE_SIZE_OPTIONS } from "@/store/slices/uiPreferenceSlice";
import { parseSort, serializeSort } from "../lib/sort";
import type { SortRule } from "@/store/slices/searchConfigSlice";

/**
 * URL STATE of the Data Explorer:  ?dataset=<uuid>&q=anna&sort=revenue:desc&page=3&pageSize=50
 * The URL is the single source of truth for "what is the user looking at", so a link can be
 * shared, the back button walks through pages, and a reload keeps the same view.
 * (Redux holds only things that are NOT part of the link: column visibility, density.)
 */
export function useExplorerUrlState() {
  const { params, setParams } = useUrlParams();
  const defaultPageSize = useAppSelector((s) => s.uiPreference.defaultPageSize);

  const datasetId = params.get("dataset") ?? "";
  const q = params.get("q") ?? "";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const rawSize = Number.parseInt(params.get("pageSize") ?? "", 10);
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(rawSize) ? rawSize : defaultPageSize;

  const sortParam = params.get("sort") ?? "";
  const sort = useMemo(() => parseSort(sortParam), [sortParam]);

  const setDataset = useCallback(
    (id: string) =>
      setParams(
        { dataset: id || undefined, q: undefined, page: undefined, sort: undefined },
        { history: "push" },
      ),
    [setParams],
  );
  const setQuery = useCallback(
    (text: string) => setParams({ q: text || undefined, page: undefined }),
    [setParams],
  );
  const setPage = useCallback(
    (next: number) => setParams({ page: next > 1 ? String(next) : undefined }, { history: "push" }),
    [setParams],
  );
  const setPageSize = useCallback(
    (size: number) => setParams({ pageSize: String(size), page: undefined }),
    [setParams],
  );
  const setSort = useCallback(
    (rules: SortRule[]) => setParams({ sort: serializeSort(rules) || undefined, page: undefined }),
    [setParams],
  );
  const clearAll = useCallback(
    () => setParams({ q: undefined, sort: undefined, page: undefined }),
    [setParams],
  );

  return { datasetId, q, page, pageSize, sort, setDataset, setQuery, setPage, setPageSize, setSort, clearAll };
}
