import { authClient } from "@/lib/auth-client";

// The Express API wants "Authorization: Bearer <jwt>". better-auth gives us a
// 15-minute JWT. We keep it in memory and only ask for a new one when it is
// about to expire, so we do not make an extra request before every API call.
let cached: { token: string; expiresAt: number } | null = null;
let pending: Promise<string> | null = null;

function readExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + 60_000;
  } catch {
    return Date.now() + 60_000;
  }
}

export function clearApiToken(): void {
  cached = null;
}

export async function getApiToken(): Promise<string> {
  if (cached && cached.expiresAt - Date.now() > 30_000) return cached.token;

  // Many components may ask at the same moment: share ONE request.
  if (!pending) {
    pending = (async () => {
      const { data, error } = await authClient.token();
      if (error || !data?.token) throw new Error("Not signed in");
      cached = { token: data.token, expiresAt: readExpiry(data.token) };
      return data.token;
    })().finally(() => {
      pending = null;
    });
  }
  return pending;
}
