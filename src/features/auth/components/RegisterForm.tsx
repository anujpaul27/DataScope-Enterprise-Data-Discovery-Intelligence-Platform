"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setBusy(true);
    const { error: authError } = await signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message ?? "Could not create the account.");
      setBusy(false);
      return;
    }
    toast.success("Account created");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <label className="form-control block">
        <span className="mb-1 block text-sm font-medium">Full name</span>
        <input
          type="text"
          autoComplete="name"
          required
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

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
          autoComplete="new-password"
          required
          minLength={8}
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className="mt-1 block text-xs text-base-content/50">At least 8 characters.</span>
      </label>

      <label className="form-control block">
        <span className="mb-1 block text-sm font-medium">Confirm password</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          className="input input-bordered w-full"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </label>

      {error && (
        <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={busy || !name || !email || !password}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        Create account
      </button>
    </form>
  );
}
