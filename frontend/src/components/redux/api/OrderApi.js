// src/redux/api/OrderApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://necessary-lian-xxx-1-bf271a33.koyeb.app/api/v1",
    prepareHeaders: (headers, { getState }) => {
      // ถ้าคุณเก็บ token ใน state.auth.token ให้ส่งไปโดยอัตโนมัติ
      const token = getState()?.auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Orders", "Dashboard"],
  endpoints: (builder) => ({
    // Create new order
    createNewOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders/new",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Orders"],
    }),

    // My orders (user)
    getMyOrders: builder.query({
      query: () => ({ url: `me/orders` }),
      providesTags: (result) =>
        result ? [...result.orders.map((o) => ({ type: "Orders", id: o._id })), "Orders"] : ["Orders"],
    }),

    // Order details
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `/orders/${id}`,
      }),
      providesTags: (result, error, id) => (id ? [{ type: "Orders", id }] : []),
    }),

    // Create checkout session
    createCheckoutSession: builder.mutation({
      query: (orderData) => ({
        url: `/payment/checkout_session`,
        method: "POST",
        body: orderData,
      }),
    }),

    // Dashboard sales (optionally with start/end dates)
    getDashboardSales: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const s = startDate ? `startDate=${startDate}&` : "";
        const e = endDate ? `endDate=${endDate}` : "";
        const q = s || e ? `?${s}${e}`.replace(/[&?]+$/,'') : "";
        return { url: `/admin/get_sales${q}` };
      },
      providesTags: ["Dashboard"],
    }),

    // ======= ADMIN endpoints added =======
    // Get all orders (admin)
    getAdminOrders: builder.query({
      query: () => ({ url: "/admin/orders" }), // ปรับ path ให้ตรงกับ backend ของคุณ
      providesTags: (result) =>
        result ? [...(result.orders || []).map((o) => ({ type: "Orders", id: o._id })), "Orders"] : ["Orders"],
    }),

    // Update order (admin) - e.g. change status
    updateOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/order/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Orders", id }, "Orders"],
    }),

    // Delete order (admin)
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/admin/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Orders", id }, "Orders"],
    }),

        updateOrderStatus: builder.mutation({
      query: ({ id, orderStatus, shipmentStatus, trackingCode }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PATCH",
        body: { orderStatus, shipmentStatus, trackingCode },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Orders", id }, "Orders"],
    }), // ← ปิด bracket ให้ครบ
    

    // lazy query example already exported later: useLazyGetDashboardSalesQuery
  }),
});

// src/redux/api/OrderApi.js
export const {
  useCreateNewOrderMutation,
  useGetOrderDetailsQuery,
  useCreateCheckoutSessionMutation,
  useGetMyOrdersQuery,
  useGetDashboardSalesQuery,
  useLazyGetDashboardSalesQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useUpdateOrderStatusMutation, // ✅ พร้อมใช้
} = orderApi;
