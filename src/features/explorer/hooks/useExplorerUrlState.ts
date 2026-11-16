"use client";

import { useCallback, useMemo } from "react";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useAppSelector } from "@/store/hooks";
import type { SearchCondition, SortRule } from "@/store/slices/searchConfigSlice";
import { PAGE_SIZE_OPTIONS } from "@/store/slices/uiPreferenceSlice";
import { parseFilters, serializeFilters } from "../lib/filters";
import { parseSort, serializeSort } from "../lib/sort";

/**
 * URL STATE of the Data Explorer / Advanced Search:
 *   ?dataset=<uuid>&q=anna&filters=[…]&sort=revenue:desc&page=3&pageSize=50
 * The URL is the single source of truth for "what is the user looking at".
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

  const filtersParam = params.get("filters") ?? "";
  const filters = useMemo(() => parseFilters(filtersParam), [filtersParam]);

  const setDataset = useCallback(
    (id: string) =>
      setParams(
        {
          dataset: id || undefined,
          q: undefined,
          filters: undefined,
          page: undefined,
          sort: undefined,
        },
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
  const setFilters = useCallback(
    (conditions: SearchCondition[]) =>
      setParams({ filters: serializeFilters(conditions) || undefined, page: undefined }, { history: "push" }),
    [setParams],
  );
  const clearAll = useCallback(
    () => setParams({ q: undefined, filters: undefined, sort: undefined, page: undefined }),
    [setParams],
  );

  return {
    datasetId,
    q,
    page,
    pageSize,
    sort,
    filters,
    setDataset,
    setQuery,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    clearAll,
  };
}
