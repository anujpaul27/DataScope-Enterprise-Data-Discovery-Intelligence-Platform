import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-1 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-base-content/60">The page you are looking for does not exist.</p>
      <Link href="/dashboard" className="btn btn-primary mt-6">
        Go to dashboard
      </Link>
    </div>
  );
}
