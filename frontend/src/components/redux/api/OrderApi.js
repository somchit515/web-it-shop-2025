import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),

  endpoints: (builder) => ({
    createNewOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders/new",
        method: "POST",
        body: orderData,
      }),
    }),

    // ✅ Endpoint name follows camelCase convention
    getMyOrders: builder.query({
      query: () => ({ url: `me/orders` }),
    }),


    getOrderDetails: builder.query({
      query: (id) => ({
        url: `/orders/${id}`,
      }),
    }),


    // Renaming to follow RTK Query convention (e.g., createSession)
    createCheckoutSession: builder.mutation({
      query: (orderData) => ({
        // The route is correct: /payment/checkout_session
        url: `/payment/checkout_session`,
        method: "POST",
        body: orderData,
      }),
    }),

    // 🚀 Corrected naming (Dashboard) and fixed the URL string syntax
    getDashboardSales: builder.query({
      query: ({ startDate, endDate }) => ({
        // Corrected URL syntax (no comma, no extra spaces)
        url: `/admin/get_sales?startDate=${startDate}&endDate=${endDate}`,
      }),
    }),


  }),

});


// ✅ FIX 3: Corrected export syntax and ADDED THE LAZY QUERY HOOK for manual triggering (like on a button click)
export const {
  useCreateNewOrderMutation,
  useGetOrderDetailsQuery,
  useCreateCheckoutSessionMutation,
  useGetMyOrdersQuery,
  useGetDashboardSalesQuery,     // For initial load or automatic fetching
  useLazyGetDashboardSalesQuery  // 👈 IMPORTANT: For manual/button-triggered fetching
} = orderApi;