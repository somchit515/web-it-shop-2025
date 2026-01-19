import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setIsAuthenticate, setUser, clearUser } from "../features/userSlice";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["User", "Users"],

  endpoints: (builder) => ({
    // ============================
    // 🔹 USER ENDPOINTS
    // ============================
    getMe: builder.query({
      query: () => `/me`,
      transformResponse: (result) => result.user,
      providesTags: ["User"],

      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
          dispatch(setIsAuthenticate(true));
        } catch (error) {
          dispatch(clearUser());
        }
      },
    }),

    updateProfile: builder.mutation({
      query(body) {
        return {
          url: "/me/update",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["User"],
    }),

    uploadAvatar: builder.mutation({
      query(body) {
        return {
          url: "/me/Upload_Avatar",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["User"],
    }),

    updatePassword: builder.mutation({
      query(body) {
        return {
          url: "/me/password/update",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["User"],
    }),

    forgotPassword: builder.mutation({
      query(body) {
        return {
          url: "/password/forgot",
          method: "POST",
          body,
        };
      },
    }),

    resetPassword: builder.mutation({
      query({ token, body }) {
        return {
          url: `/password/reset/${token}`,
          method: "PUT",
          body,
        };
      },
    }),

    // ============================
    // 🔹 ADMIN ENDPOINTS
    // ============================

    getAdminUsers: builder.query({
      query: () => `/admin/users`,
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map((u) => ({ type: "Users", id: u._id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUsersDetails: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    updateUser: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/users/${id}`,
          method: "PUT",
          body: body,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // ✅ CREATE USER ENDPOINT (แก้ไข Syntax ให้ถูกต้อง)
    createUser: builder.mutation({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
  }), // ✅ ปิด endpoints: (builder) => ({...}) ตรงนี้
}); // ✅ ปิด createApi({...}) ตรงนี้

// =====================
// EXPORT HOOKS
// =====================

export const {
  // USER HOOKS
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUpdatePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,

  // ADMIN HOOKS
  useGetAdminUsersQuery,
  useGetUsersDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateUserMutation, // ✅ Hook สำหรับสร้างผู้ใช้ใหม่
} = userApi;
