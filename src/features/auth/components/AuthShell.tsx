import { Telescope } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-content lg:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Telescope className="size-5" aria-hidden /> DataScope
        </Link>
        <div>
          <p className="max-w-md text-3xl font-semibold leading-tight">
            Search, filter and understand hundreds of thousands of records, without waiting for them to load.
          </p>
          <p className="mt-4 max-w-md text-sm opacity-80">
            Server-side search, saved views and role-based access to every dataset.
          </p>
        </div>
        <p className="text-xs opacity-70">Enterprise data discovery platform</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 font-semibold lg:hidden">
            <Telescope className="size-5 text-primary" aria-hidden /> DataScope
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-base-content/60">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-sm text-base-content/60">{footer}</p>
        </div>
      </div>
    </div>
  );
}
