import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userApi } from "./api/userApi"; 

export const authApi = createApi({
  reducerPath: "authApi",
  
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
    credentials: "include",
  }),

  tagTypes: ["User"],

  endpoints: (builder) => ({
    // 1. ລົງທະບຽນ
    register: builder.mutation({
      query(body) {
        return {
          url: "/register",
          method: "POST",
          body,
        };
      },
    }),

    // 2. ເຂົ້າສູ່ລະບົບດ້ວຍ Email/Password
    login: builder.mutation({
      query(body) {
        return {
          url: "/login",
          method: "POST",
          body,
        };
      },
      // ✅ ເມື່ອ Login ສຳເລັດ, ໃຫ້ໄປດຶງຂໍ້ມູນ User (getMe) ມາທັນທີ
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(userApi.endpoints.getMe.initiate());
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    // 3. ອອກຈາກລະບົບ
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "GET",
      }),
      // 🚀 ເຮັດໃຫ້ຂໍ້ມູນ User ໃນ Cache ກາຍເປັນຄ່າເກົ່າ (Invalidate)
      invalidatesTags: ["User"],
    }),

    // 4. ເຂົ້າສູ່ລະບົບດ້ວຍ Google
    googleLogin: builder.mutation({
      query: (body) => ({
        url: "/google/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(userApi.endpoints.getMe.initiate());
        } catch (error) {
          console.error("Google Login failed:", error);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGoogleLoginMutation,
} = authApi;