"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { safeCallbackUrl } from "../safe-redirect";

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { error: authError } = await signIn.email({ email: email.trim(), password });

    if (authError) {
      setError(authError.message ?? "Could not sign in. Check your email and password.");
      setBusy(false);
      return;
    }
    toast.success("Welcome back");
    router.push(safeCallbackUrl(callbackUrl));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <label className="form-control block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </label>

      <label className="form-control block">
        <span className="mb-1 block text-sm font-medium">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {error && (
        <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={busy || !email || !password}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        Sign in
      </button>
    </form>
  );
}
