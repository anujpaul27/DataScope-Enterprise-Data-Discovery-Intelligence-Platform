"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface SetOptions {
  /** "push" adds a browser-history entry (page changes), "replace" does not (typing). */
  history?: "push" | "replace";
}

/**
 * URL = the source of truth for filter/page state (shareable links, back button, reload).
 * Values that are undefined or "" are removed from the URL.
 */
export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParams = useCallback(
    (patch: Record<string, string | undefined>, options: SetOptions = {}) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (options.history === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [params, pathname, router],
  );

  return { params, setParams };
}
