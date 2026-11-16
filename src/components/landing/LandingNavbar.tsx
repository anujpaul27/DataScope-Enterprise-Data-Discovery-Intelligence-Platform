import { Telescope } from "lucide-react";
import Link from "next/link";

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-base-300 bg-base-100/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-content">
            <Telescope className="size-4" aria-hidden />
          </span>
          DataScope
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
