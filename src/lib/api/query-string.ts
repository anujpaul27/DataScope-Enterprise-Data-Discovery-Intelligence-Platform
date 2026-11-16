type Value = string | number | boolean | null | undefined;

/** { page: 2, q: "" , role: undefined } -> "?page=2"  (empty values are dropped) */
export function toQueryString(params: Record<string, Value>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    sp.set(key, String(value));
  }
  const text = sp.toString();
  return text ? `?${text}` : "";
}
