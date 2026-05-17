import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  
  // 🚀 ປັບໃຫ້ເລືອກ URL ອັດຕະໂນມັດ ແລະ ເນັ້ນການໃຊ້ Cookie Auth
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include",
  }),

  tagTypes: ["Product", "Products", "Reviews", "Reports"],

  endpoints: (builder) => ({
    // ດຶງລາຍຊື່ສິນຄ້າທັງໝົດ
    getProducts: builder.query({
      query: (params = {}) => {
        return {
          url: "/products",
          params: {
            page: params.page,
            keyword: params.keyword,
            category: params.category,
            ratings: params.ratings ?? params.rating,
            "price[gte]": params.min,
            "price[lte]": params.max,
          },
        };
      },
      providesTags: ["Products"],
    }),

    getAdminProducts: builder.query({
      query: () => "/admin/products",
      providesTags: ["Products"],
    }),

    getProductDetails: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // ✅ Batch check stock ກ່ອນ checkout
    checkStock: builder.mutation({
      query: (items) => ({
        url: "/products/check-stock",
        method: "POST",
        body: { items },
      }),
    }),

    createProduct: builder.mutation({
      query: (body) => ({
        url: "/admin/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),

    createProductsBatch: builder.mutation({
      query: (items) => ({
        url: "/admin/products/batch",
        method: "POST",
        body: items,
      }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, err, { id }) => [
        { type: "Product", id },
        "Products",
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    uploadProductImages: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/products/${id}/upload_images`,
        method: "PUT",
        body, 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),

    deleteProductImage: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/products/${id}/delete_image`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),

    getProductReviews: builder.query({
      query: (productId) => ({
        url: "/reviews",
        params: { id: productId },
      }),
      providesTags: ["Reviews"],
    }),

    deleteReview: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `/admin/reviews`,
        method: "DELETE",
        params: { productId, id: reviewId },
      }),
      invalidatesTags: ["Reviews"],
    }),

    canUserReview: builder.query({
      query: (productId) => ({
        url: "/can_review",
        params: { productId },
      }),
    }),

    submitReview: builder.mutation({
      query: (body) => ({
        url: "/reviews",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reviews"],
    }),

    // 📊 REPORTS ENDPOINTS (Super Admin)
    getCustomerReport: builder.query({
      query: () => "/admin/reports/customer",
      providesTags: ["Reports"],
    }),

    getSalesReport: builder.query({
      query: ({ startDate, endDate } = {}) => ({
        url: "/admin/reports/sales",
        params: { start: startDate, end: endDate },
      }),
      providesTags: ["Reports"],
    }),

    getReturnsReport: builder.query({
      query: () => "/admin/reports/returns",
      providesTags: ["Reports"],
    }),

    getIncomeExpenseReport: builder.query({
      query: ({ startDate, endDate } = {}) => ({
        url: "/admin/reports/finance",
        params: startDate && endDate ? { startDate, endDate } : undefined,
      }),
      providesTags: ["Reports"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetAdminProductsQuery,
  useGetProductDetailsQuery,
  useCheckStockMutation,
  useCreateProductMutation,
  useCreateProductsBatchMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useGetProductReviewsQuery,
  useLazyGetProductReviewsQuery,
  useDeleteReviewMutation,
  useSubmitReviewMutation,
  useCanUserReviewQuery,
  useGetCustomerReportQuery,
  useGetSalesReportQuery,
  useGetReturnsReportQuery,
  useGetIncomeExpenseReportQuery,
} = productApi;