import { ArrowRight } from "lucide-react";
import Link from "next/link";

// A static preview that looks like the Explorer, built with plain HTML (no images to load).
const PREVIEW_ROWS = [
  ["Acme GmbH", "Germany", "Active", "$48,200"],
  ["Northwind Ltd", "United Kingdom", "Active", "$31,950"],
  ["Globex Corp", "United States", "Inactive", "$12,400"],
  ["Initech AG", "Germany", "Active", "$10,870"],
];

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:pt-24">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-primary">Enterprise data discovery</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Find the right record among hundreds of thousands, in milliseconds.
        </h1>
        <p className="mt-4 text-base text-base-content/70">
          DataScope searches, filters and sorts on the server, so your browser only ever loads the page you are
          looking at. Save the views you use every day and share them with your team.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="btn btn-primary">
            Create an account <ArrowRight className="size-4" />
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Sign in
          </Link>
        </div>
      </div>

      <div className="mt-14 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm" aria-hidden>
        <div className="flex flex-wrap gap-2 border-b border-base-300 bg-base-200 px-4 py-3 text-xs">
          <span className="badge badge-primary badge-soft">Status = Active</span>
          <span className="badge badge-primary badge-soft">Country = Germany</span>
          <span className="badge badge-primary badge-soft">Revenue &gt; $10,000</span>
          <span className="badge badge-primary badge-soft">Last 30 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Company</th>
                <th>Country</th>
                <th>Status</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {PREVIEW_ROWS.map((row) => (
                <tr key={row[0]}>
                  <td className="font-medium">{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>
                    <span className={`badge badge-sm ${row[2] === "Active" ? "badge-success badge-soft" : "badge-ghost"}`}>
                      {row[2]}
                    </span>
                  </td>
                  <td className="tabular text-right">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
