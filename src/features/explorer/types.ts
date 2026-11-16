export interface RecordRow {
  id: number;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/datasets/:id/records */
export interface RecordsPage {
  data: RecordRow[];
  page: number;
  pageSize: number;
  /** Number of matching rows. Capped at 1,000,000 (see totalCapped). */
  total: number;
  totalCapped: boolean;
  /** Time the server spent on the query (ms). Shown in the table footer. */
  tookMs: number;
}

export interface ListRecordsArgs {
  datasetId: string;
  page: number;
  pageSize: number;
  q?: string;
  /** "revenue:desc,name:asc" */
  sort?: string;
  /** JSON array: [{"field":"country","op":"eq","value":"Germany"}] */
  filters?: string;
  /** "name,country,revenue": only these columns are sent back */
  columns?: string;
}

/** GET /api/datasets/:id/records/:recordId/related */
export interface RelatedRecord {
  relationType: string;
  direction: "outgoing" | "incoming";
  recordId: number;
  datasetId: string;
  datasetName: string;
  datasetSlug: string;
  preview: Record<string, unknown>;
}

/** GET /api/datasets/:id/records/:recordId/history */
export interface HistoryChange {
  field: string;
  label: string;
  from: unknown;
  to: unknown;
}

export interface HistoryEntry {
  id: number;
  createdAt: string;
  changedBy: string;
  changes: HistoryChange[];
}
