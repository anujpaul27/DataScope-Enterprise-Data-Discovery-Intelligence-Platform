import { BarChart3, BookMarked, Database, Search, ShieldCheck, Table2 } from "lucide-react";

const FEATURES = [
  { icon: Search, title: "Advanced search", text: "Combine exact, partial, date-range and numeric conditions in one query." },
  { icon: Table2, title: "Data Explorer", text: "A fast table with sorting, column control and server-side pagination." },
  { icon: BookMarked, title: "Saved views", text: "Keep your filters, sorting and columns, and share them with teammates." },
  { icon: Database, title: "Dataset library", text: "Browse every dataset you are allowed to see, with record counts at a glance." },
  { icon: BarChart3, title: "Analytics", text: "Charts built from real aggregate queries, never from downloaded rows." },
  { icon: ShieldCheck, title: "Role-based access", text: "Administrators, analysts and viewers, with permissions per dataset." },
];

export default function FeatureGrid() {
  return (
    <section className="border-t border-base-300 bg-base-200/50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Built for large datasets</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-box border border-base-300 bg-base-100 p-5">
              <f.icon className="size-5 text-primary" aria-hidden />
              <h3 className="mt-3 font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-base-content/60">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
