import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userApi } from "./api/userApi"; // ກວດສອບ path ໃຫ້ຖືກຕາມ Folder ຂອງທ່ານ

export const authApi = createApi({
  reducerPath: "authApi",
 main
  // 🛑 FIX: ເພີ່ມ credentials: "include" ເພື່ອໃຫ້ Browser ສົ່ງ Cookie/Token ໄປຫາ Backend ທຸກ Request
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:8000/api/v1",
    credentials: "include", 
  }),

  baseQuery: fetchBaseQuery({ baseUrl: "https://ithub-sy2u.onrender.com/api/v1" }),
  // 💡 แนะนำ: เพิ่ม tagTypes ที่นี่ด้วย เพื่อความเป็นระเบียบ
 master
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
      // 🛑 FIX: ເມື່ອ Login ສຳເລັດ, ໃຫ້ໄປດຶງຂໍ້ມູນ User (getMe) ມາທັນທີ
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
      // 🚀 Invalidates tags ເພື່ອໃຫ້ລະບົບຮູ້ວ່າຂໍ້ມູນ User ເກົ່າໃຊ້ບໍ່ໄດ້ແລ້ວ
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

// Export Hooks ສຳລັບໃຊ້ໃນ Component
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGoogleLoginMutation,
} = authApi;