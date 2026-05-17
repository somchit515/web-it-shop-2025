import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const flashDealApi = createApi({
  reducerPath: "flashDealApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1", credentials: "include" }),
  tagTypes: ["FlashDeal"],
  endpoints: (builder) => ({
    getFlashDeal: builder.query({
      query: () => "/flash-deal",
      providesTags: ["FlashDeal"],
    }),
    updateFlashDeal: builder.mutation({
      query: (body) => ({ url: "/admin/flash-deal", method: "PUT", body }),
      invalidatesTags: ["FlashDeal"],
    }),
  }),
});

export const { useGetFlashDealQuery, useUpdateFlashDealMutation } = flashDealApi;
