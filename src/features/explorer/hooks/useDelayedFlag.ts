import { useEffect, useState } from "react";

/** true only after `active` has been true for `delay` ms (e.g. "still loading..." on slow networks). */
export function useDelayedFlag(active: boolean, delay = 1500): boolean {
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => setFlag(true), delay);
    return () => {
      clearTimeout(id);
      setFlag(false);
    };
  }, [active, delay]);
  return active && flag;
}
