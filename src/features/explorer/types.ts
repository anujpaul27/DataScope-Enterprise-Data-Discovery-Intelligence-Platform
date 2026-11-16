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
  /** "name,country,revenue": only these columns are sent back */
  columns?: string;
}
