// src/redux/api/OrderApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
    credentials: "include",
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

    // My orders (user) — optional: status filter (server-side), q filter (client-side)
    getMyOrders: builder.query({
      query: ({ status } = {}) => ({
        url: `me/orders`,
        params: status && status !== "all" ? { status } : undefined,
      }),
      providesTags: (result) =>
        result ? [...(result.orders || []).map((o) => ({ type: "Orders", id: o._id })), "Orders"] : ["Orders"],
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
    // Get all orders (admin) — ✅ รองรับ filter + pagination
    //   useGetAdminOrdersQuery()                                  → ดึงทั้งหมด (backward compat)
    //   useGetAdminOrdersQuery({ paymentStatus: 'AwaitingProof' }) → ดึงเฉพาะที่ filter
    //   useGetAdminOrdersQuery({ fulfillmentStatus: 'Shipped', page: 1, perPage: 20 })
    getAdminOrders: builder.query({
      query: (params = {}) => {
        // กรอง undefined/null ออก
        const cleaned = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
        );
        return {
          url: "/admin/orders",
          params: cleaned,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...(result.orders || []).map((o) => ({ type: "Orders", id: o._id })),
              "Orders",
            ]
          : ["Orders"],
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
      query: ({ id, fulfillmentStatus, trackingCode }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PATCH",
        body: { fulfillmentStatus, trackingCode },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Orders", id }, "Orders"],
    }),

    // ======= USER ACTIONS =======
    // ✅ Cancel order by user (เจ้าของ + ก่อน Shipped + ยังไม่จ่าย)
    cancelMyOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Orders", id },
        "Orders",
      ],
    }),

    // ======= PAYMENT VERIFICATION (admin) =======
    // ยืนยัน/ปฏิเสธหลักฐานการชำระเงิน
    verifyPayment: builder.mutation({
      query: ({ id, action, note = "" }) => ({
        url: `/orders/${id}/verify`,
        method: "POST",
        body: { action, note },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Orders", id },
        "Orders",
      ],
    }),

    // ส่งการแจ้งเตือนให้ลูกค้า (เช่น หลังจากยืนยัน/ปฏิเสธ)
    notifyOrderCustomer: builder.mutation({
      query: ({ id, action }) => ({
        url: `/orders/${id}/notify`,
        method: "POST",
        body: { action },
      }),
    }),

    // ✅ Admin: add note to order timeline
    addOrderNote: builder.mutation({
      query: ({ id, note }) => ({
        url: `/admin/orders/${id}/note`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Orders", id }],
    }),

    // ✅ Admin: issue refund for a Paid order
    issueRefund: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/orders/${id}/refund`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Orders", id }, "Orders"],
    }),
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
  useUpdateOrderStatusMutation,
  useVerifyPaymentMutation,
  useNotifyOrderCustomerMutation,
  useCancelMyOrderMutation,
  useIssueRefundMutation,
  useAddOrderNoteMutation,
} = orderApi;
