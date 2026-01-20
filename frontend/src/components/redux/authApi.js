// In src/redux/authApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// 🛑 FIX 1: ต้อง Import 'userApi' กลับมาใช้
import { userApi } from "./api/userApi"; // ตรวจสอบ path นี้ให้ถูกต้องตามโครงสร้างไฟล์ของคุณ

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://172.21.1.135/api/v1" }),
  // 💡 แนะนำ: เพิ่ม tagTypes ที่นี่ด้วย เพื่อความเป็นระเบียบ
  tagTypes: ["User"],

  endpoints: (builder) => ({
    register: builder.mutation({
      query(body) {
        return {
          url: "/register",
          method: "POST",
          body,
        };
      },
    }),

    login: builder.mutation({
      query(body) {
        return {
          url: "/login",
          method: "POST",
          body,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // 🛑 FIX 2: เปิดใช้งาน Logic นี้เพื่อเรียก getMe ทันทีหลัง Login สำเร็จ
          dispatch(userApi.endpoints.getMe.initiate());
        } catch (error) {
          console.log(error);
        }
      },
    }),

    // ตัวอย่างใน authApi.js (สมมติฐาน)
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "GET",
      }),
      // 🚀 FIX: การ Invalidates tags ที่เกี่ยวข้องกับการดึงข้อมูลผู้ใช้ (Me)
      invalidatesTags: ["User"],
    }),
    // authApi.js
    googleLogin: builder.mutation({
      query: (body) => ({
        url: "/google/login",
        method: "POST",
        body,
        credentials: "include", // ถ้าใช้ cookie
      }),
    }),
  }),
});

// 💡 Export Hook: useLogoutMutation is correct for builder.mutation
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGoogleLoginMutation,
} = authApi;
