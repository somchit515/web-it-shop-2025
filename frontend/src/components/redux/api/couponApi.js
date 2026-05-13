// src/redux/api/couponApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const couponApi = createApi({
  reducerPath: "couponApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
    credentials: "include",
  }),
  tagTypes: ["Coupons", "Coupon"],
  endpoints: (builder) => ({
    // 🟢 USER: validate code
    validateCoupon: builder.mutation({
      query: ({ code, itemsPrice }) => ({
        url: "/coupons/validate",
        method: "POST",
        body: { code, itemsPrice },
      }),
    }),

    // 🔴 ADMIN
    getAdminCoupons: builder.query({
      query: (params = {}) => {
        const cleaned = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
        );
        return { url: "/admin/coupons", params: cleaned };
      },
      providesTags: (result) =>
        result
          ? [
              ...(result.coupons || []).map((c) => ({ type: "Coupon", id: c._id })),
              "Coupons",
            ]
          : ["Coupons"],
    }),
    getCouponDetails: builder.query({
      query: (id) => `/admin/coupons/${id}`,
      providesTags: (r, e, id) => [{ type: "Coupon", id }],
    }),
    createCoupon: builder.mutation({
      query: (body) => ({
        url: "/admin/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupons"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/coupons/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: "Coupon", id }, "Coupons"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupons"],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useGetAdminCouponsQuery,
  useGetCouponDetailsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
