// src/redux/api/productApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Example helper to read token from localStorage or from Redux store.
const getTokenFromLocal = () => localStorage.getItem("token") || null;

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://ithub-sy2u.onrender.com/api/v1", // change in dev if needed
    prepareHeaders: (headers, { getState }) => {
      const token = getTokenFromLocal();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Product", "Products", "Reviews", "Reports"],

  endpoints: (builder) => ({
    // Make params default to {} so de-structuring won't fail when undefined
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
        body, // FormData or JSON depending on backend
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
    }), // ============================================ // 📊 REPORTS ENDPOINTS (Super Admin) // ============================================

    getCustomerReport: builder.query({
      query: () => "/admin/reports/customer",
      providesTags: ["Reports"],
    }),

    // ✅ เพิ่ม Sales Report
    getSalesReport: builder.query({
      // สมมติว่ารับ { startDate, endDate } เป็นพารามิเตอร์
      query: ({ startDate, endDate } = {}) => ({
        url: "/admin/reports/sales",
        params: { start: startDate, end: endDate },
      }),
      providesTags: ["Reports"],
    }),

    // ✅ เพิ่ม Returns Report
    getReturnsReport: builder.query({
      query: () => "/admin/reports/returns",
      providesTags: ["Reports"],
    }),

    // ✅ เพิ่ม Income Expense Report
    getIncomeExpenseReport: builder.query({
      query: () => "/admin/reports/income-expense",
      providesTags: ["Reports"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetAdminProductsQuery,
  useGetProductDetailsQuery,

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
  useCanUserReviewQuery, // ✅ Export Hook สำหรับ Reports ทั้งหมด

  useGetCustomerReportQuery,
  useGetSalesReportQuery,
  useGetReturnsReportQuery,
  useGetIncomeExpenseReportQuery, // เพิ่ม Hooks ที่เหลือ
} = productApi;
