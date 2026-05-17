import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setIsAuthenticate, setUser, clearUser } from "../features/userSlice";

export const userApi = createApi({
  reducerPath: "userApi",

  // 🚀 ປັບໃຫ້ເລືອກ URL ອັດຕະໂນມັດ ແລະ ເພີ່ມ credentials: "include"
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
    credentials: "include",
  }),

  tagTypes: ["User", "Users"],

  endpoints: (builder) => ({
    // ============================
    // 🔹 USER ENDPOINTS
    // ============================
    
    // ດຶງຂໍ້ມູນສ່ວນຕົວຂອງຂ້ອຍ (Profile)
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
          // ຖ້າດຶງຂໍ້ມູນບໍ່ໄດ້ (ເຊັ່ນ Token ໝົດອາຍຸ) ໃຫ້ Clear ຂໍ້ມູນ User ອອກ
          dispatch(clearUser());
        }
      },
    }),

    // ອັບເດດຂໍ້ມູນສ່ວນຕົວ
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

    // ອັບເດດຮູບ Avatar
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

    // ປ່ຽນລະຫັດຜ່ານ
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

    // ລືມລະຫັດຜ່ານ (ສົ່ງ Email)
    forgotPassword: builder.mutation({
      query(body) {
        return {
          url: "/password/forgot",
          method: "POST",
          body,
        };
      },
    }),

    // ຕັ້ງຄ່າລະຫັດຜ່ານໃໝ່
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

    // ດຶງລາຍຊື່ຜູ້ໃຊ້ທັງໝົດ (ສຳລັບ Admin)
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

    // ດຶງຂໍ້ມູນລາຍລະອຽດຂອງຜູ້ໃຊ້ແຕ່ລະຄົນ
    getUsersDetails: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    // ອັບເດດຂໍ້ມູນຜູ້ໃຊ້ (ໂດຍ Admin)
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

    // ລຶບຜູ້ໃຊ້ (ໂດຍ Admin)
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

    // ສ້າງຜູ້ໃຊ້ໃໝ່ (ໂດຍ Admin)
    createUser: builder.mutation({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

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
  useCreateUserMutation,
} = userApi;