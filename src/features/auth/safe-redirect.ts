// callbackUrl comes from the address bar, so anyone can put anything there.
// Only allow paths INSIDE this app ("/dashboard/..."), never "https://evil.com" or "//evil.com".
export function safeCallbackUrl(value: string | undefined | null, fallback = "/dashboard"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
