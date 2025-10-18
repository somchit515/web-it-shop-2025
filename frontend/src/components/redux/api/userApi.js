import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// 🛑 FIX: ต้อง Import clearUser และควรลบ setLoading (ถ้าไม่จำเป็นจริงๆ)
import { setIsAuthenticate, setUser, clearUser } from "../features/userSlice";



export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ['User'],

  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => `/me`,
      transformResponse: (result) => result.user,
      providesTags: ['User'],
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
          dispatch(setIsAuthenticate(true));
        } catch (error) {
          // CRITICAL FIX: เมื่อ getMe ล้มเหลว (401 Unauthorized), ต้องล้างสถานะ
          dispatch(clearUser());
          console.log("GetMe failed, user logged out on frontend.");
        }
      }
    }),

    updateProfile: builder.mutation({
      query(body) {
        return {
          url: "/me/update",
          method: "PUT",
          body,
        }
      },
      invalidatesTags: ["User"]
    }), // 👈 ✅ FIX: ต้องมีคอมมา (,) เพื่อแยก Property ใน Object

    uploadAvatar: builder.mutation({
      query(body) {
        return {
          url: "/me/Upload_Avatar",
          method: "PUT",
          body,
        }
      },
      invalidatesTags: ["User"]
    }),
    UpdatePassword: builder.mutation({
      query(body) {
        return {
          url: "/me/password/update",
          method: "PUT",
          body,
        }
      },
      invalidatesTags: ["User"]
    }),
    ForgotPassword: builder.mutation({
      query(body) {
        return {
          url: "/password/forgot",
          method: "POST",
          body,
        }
      },
      invalidatesTags: ["User"]
    }),
    ResetPassword: builder.mutation({
      query({token,body}) {
        return {
          url: `/password/reset/${token}`,
          method: "PUT",
          body,
        }
      },
      invalidatesTags: ["User"]
    })
  }),
});


export const { useGetMeQuery, useUpdateProfileMutation, useUploadAvatarMutation, useUpdatePasswordMutation, useForgotPasswordMutation, useResetPasswordMutation } = userApi;