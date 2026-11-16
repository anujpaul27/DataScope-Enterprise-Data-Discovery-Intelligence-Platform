import { baseApi } from "@/store/api/baseApi";
import { toQueryString } from "@/lib/api/query-string";
import type { Paginated } from "@/types";
import type {
  CategoryCount,
  CreateDatasetInput,
  DatasetDetail,
  DatasetPermission,
  DatasetStats,
  DatasetSummary,
  PermissionLevel,
  UpdateDatasetInput,
} from "../types";

export interface ListDatasetsArgs {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
}

const NO_RETRY = { maxRetries: 0 }; // never auto-repeat a write

export const datasetsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ---------- reads ----------
    listDatasets: build.query<Paginated<DatasetSummary>, ListDatasetsArgs>({
      query: (args) => `/api/datasets${toQueryString({ ...args })}`,
      providesTags: (result) => [
        { type: "Datasets", id: "LIST" },
        ...(result?.data ?? []).map((d) => ({ type: "Dataset" as const, id: d.id })),
      ],
    }),

    getDatasetSummary: build.query<DatasetStats, void>({
      query: () => "/api/datasets/summary",
      providesTags: ["DatasetSummary"],
    }),

    getDatasetCategories: build.query<CategoryCount[], void>({
      query: () => "/api/datasets/categories",
      transformResponse: (res: { data: CategoryCount[] }) => res.data,
      providesTags: ["DatasetCategories"],
    }),

    getDataset: build.query<DatasetDetail, string>({
      query: (id) => `/api/datasets/${id}`,
      transformResponse: (res: { dataset: DatasetDetail }) => res.dataset,
      providesTags: (_result, _error, id) => [{ type: "Dataset", id }],
    }),

    listDatasetPermissions: build.query<DatasetPermission[], string>({
      query: (id) => `/api/datasets/${id}/permissions`,
      transformResponse: (res: { data: DatasetPermission[] }) => res.data,
      providesTags: (_result, _error, id) => [{ type: "Permissions", id }],
    }),

    // ---------- writes (admin) ----------
    createDataset: build.mutation<{ id: string }, CreateDatasetInput>({
      query: (body) => ({ url: "/api/datasets", method: "POST", body }),
      transformResponse: (res: { dataset: { id: string } }) => res.dataset,
      invalidatesTags: [{ type: "Datasets", id: "LIST" }, "DatasetSummary", "DatasetCategories"],
      extraOptions: NO_RETRY,
    }),

    updateDataset: build.mutation<{ id: string }, { id: string; changes: UpdateDatasetInput }>({
      query: ({ id, changes }) => ({ url: `/api/datasets/${id}`, method: "PATCH", body: changes }),
      transformResponse: (res: { dataset: { id: string } }) => res.dataset,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Dataset", id }, // the detail page AND the card in the library both use this tag
        { type: "Datasets", id: "LIST" },
        "DatasetCategories",
      ],
      extraOptions: NO_RETRY,
    }),

    deleteDataset: build.mutation<void, string>({
      query: (id) => ({ url: `/api/datasets/${id}`, method: "DELETE" }),
      // The detail tag is NOT invalidated on purpose: the page is about to navigate away and
      // refetching a deleted dataset would flash a 404.
      invalidatesTags: [{ type: "Datasets", id: "LIST" }, "DatasetSummary", "DatasetCategories"],
      extraOptions: NO_RETRY,
    }),

    setDatasetPermission: build.mutation<
      void,
      { datasetId: string; userId: string; level: PermissionLevel }
    >({
      query: ({ datasetId, userId, level }) => ({
        url: `/api/datasets/${datasetId}/permissions`,
        method: "PUT",
        body: { userId, level },
      }),
      invalidatesTags: (_result, _error, { datasetId }) => [{ type: "Permissions", id: datasetId }],
      extraOptions: NO_RETRY,
    }),

    removeDatasetPermission: build.mutation<void, { datasetId: string; userId: string }>({
      query: ({ datasetId, userId }) => ({
        url: `/api/datasets/${datasetId}/permissions/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { datasetId }) => [{ type: "Permissions", id: datasetId }],
      extraOptions: NO_RETRY,
    }),
  }),
});

export const {
  useListDatasetsQuery,
  useGetDatasetSummaryQuery,
  useGetDatasetCategoriesQuery,
  useGetDatasetQuery,
  useListDatasetPermissionsQuery,
  useCreateDatasetMutation,
  useUpdateDatasetMutation,
  useDeleteDatasetMutation,
  useSetDatasetPermissionMutation,
  useRemoveDatasetPermissionMutation,
} = datasetsApi;
