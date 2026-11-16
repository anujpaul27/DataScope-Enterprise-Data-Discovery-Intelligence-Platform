interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  noun: string; // "users", "datasets"
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, noun, onPageChange }: PaginationProps) {
  if (total <= 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-base-content/60">
        {total.toLocaleString("en-US")} {noun}
      </span>
      <div className="join">
        <button type="button" className="btn btn-sm join-item" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </button>
        <span className="btn btn-sm join-item pointer-events-none">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-sm join-item"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
