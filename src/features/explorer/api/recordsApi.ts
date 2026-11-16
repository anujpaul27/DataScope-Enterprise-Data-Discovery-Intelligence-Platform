import { baseApi } from "@/store/api/baseApi";
import { toQueryString } from "@/lib/api/query-string";
import type {
  HistoryEntry,
  ListRecordsArgs,
  RecordRow,
  RecordsPage,
  RelatedRecord,
} from "../types";

export const recordsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // One cache entry per (dataset, page, pageSize, search, sort, columns).
    // Going back to a page you already saw is instant; two components asking for the same
    // page share ONE request (RTK Query de-duplicates by the serialized arguments).
    listRecords: build.query<RecordsPage, ListRecordsArgs>({
      query: ({ datasetId, ...params }) => `/api/datasets/${datasetId}/records${toQueryString(params)}`,
      providesTags: (_result, _error, { datasetId }) => [{ type: "Records", id: datasetId }],
      keepUnusedDataFor: 60,
    }),

    getRecord: build.query<RecordRow, { datasetId: string; recordId: number }>({
      query: ({ datasetId, recordId }) => `/api/datasets/${datasetId}/records/${recordId}`,
      transformResponse: (res: { record: RecordRow }) => res.record,
      providesTags: (_result, _error, { datasetId, recordId }) => [
        { type: "Record", id: `${datasetId}:${recordId}` },
      ],
    }),

    getRelatedRecords: build.query<RelatedRecord[], { datasetId: string; recordId: number }>({
      query: ({ datasetId, recordId }) => `/api/datasets/${datasetId}/records/${recordId}/related`,
      transformResponse: (res: { related: RelatedRecord[] }) => res.related,
      providesTags: (_result, _error, { datasetId, recordId }) => [
        { type: "Record", id: `${datasetId}:${recordId}:related` },
      ],
      keepUnusedDataFor: 60,
    }),

    getRecordHistory: build.query<HistoryEntry[], { datasetId: string; recordId: number }>({
      query: ({ datasetId, recordId }) => `/api/datasets/${datasetId}/records/${recordId}/history`,
      transformResponse: (res: { history: HistoryEntry[] }) => res.history,
      providesTags: (_result, _error, { datasetId, recordId }) => [
        { type: "Record", id: `${datasetId}:${recordId}:history` },
      ],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useListRecordsQuery,
  useGetRecordQuery,
  useGetRelatedRecordsQuery,
  useGetRecordHistoryQuery,
} = recordsApi;
export const useRecordsPrefetch = recordsApi.usePrefetch;
