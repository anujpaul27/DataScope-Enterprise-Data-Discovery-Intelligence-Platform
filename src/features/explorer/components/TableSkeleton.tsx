// Loading skeleton with the same shape as the table, so the page does not jump when data arrives.
export default function TableSkeleton({ columns = 6, rows = 10 }: { columns?: number; rows?: number }) {
  return (
    <div className="space-y-2 rounded-box border border-base-300 p-3" aria-busy="true" aria-label="Loading records">
      <div className="skeleton h-8 w-full" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="skeleton h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
