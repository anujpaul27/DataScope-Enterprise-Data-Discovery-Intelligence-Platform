import { baseApi } from "@/store/api/baseApi";
import { toQueryString } from "@/lib/api/query-string";
import type { AppUser, ManagedUser, Paginated, Role } from "@/types";

export interface ListUsersArgs {
  page: number;
  pageSize: number;
  q?: string;
  role?: Role;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Who am I, according to the Express API (proves JWT verification works).
    getMe: build.query<AppUser, void>({
      query: () => "/api/me",
      transformResponse: (res: { user: AppUser }) => res.user,
      providesTags: ["Me"],
    }),

    listUsers: build.query<Paginated<ManagedUser>, ListUsersArgs>({
      query: (args) => `/api/users${toQueryString({ ...args })}`,
      providesTags: (result) => [
        { type: "Users", id: "LIST" },
        ...(result?.data ?? []).map((u) => ({ type: "Users" as const, id: u.id })),
      ],
    }),

    updateUserRole: build.mutation<ManagedUser, { id: string; role: Role }>({
      query: ({ id, role }) => ({ url: `/api/users/${id}/role`, method: "PATCH", body: { role } }),
      transformResponse: (res: { user: ManagedUser }) => res.user,
      // After a change, every cached user list is marked stale and active ones refetch.
      invalidatesTags: [{ type: "Users", id: "LIST" }, "Permissions"],
      extraOptions: { maxRetries: 0 }, // never auto-repeat a write
    }),

    updateUserStatus: build.mutation<ManagedUser, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/api/users/${id}/status`, method: "PATCH", body: { isActive } }),
      transformResponse: (res: { user: ManagedUser }) => res.user,
      invalidatesTags: [{ type: "Users", id: "LIST" }],
      extraOptions: { maxRetries: 0 },
    }),
  }),
});

export const {
  useGetMeQuery,
  useListUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} = usersApi;
