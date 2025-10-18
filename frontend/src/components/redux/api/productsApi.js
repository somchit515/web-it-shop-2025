import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),

  // 💡 Tag types are crucial for automatic refetching after a mutation
  tagTypes: ["Product"], 

  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: "/products",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
          ratings: params?.rating,
          "price[gte]": params.min,
          "price[lte]": params.max,
        },
      }),
      providesTags: ["Product"], // 💡 Provides the tag for the list of products
    }),

    getProductDetails: builder.query({
      query: (id) => ({
        url: `/products/${id}`,
      }),
      // 💡 Invalidates the cache for a specific product ID if it changes
      providesTags: (result, error, id) => [{ type: "Product", id }], 
    }),

    canUserReview: builder.query({
      query: (productId) => ({  
        url: `/can_review/?productId=${productId}`,
      }),
    }),
    getAdminProducts: builder.query({
      query: () => ({  
        url: `/admin/products`,
      }),
    }),

    // 🌟 NEW ENDPOINT: Submit Review Mutation 🌟
    submitReview: builder.mutation({
      query: (body) => ({
        url: "/reviews",
        method: "PUT", // Often uses PUT for updating reviews or adding a new one
        body,
      }),
      // 💡 Invalidates the product details query so the ProductDetails component 
      //    automatically refetches the updated ratings/reviews.
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
      ],
    }),
  }),
});

export const { 
    useGetProductsQuery, 
    useGetProductDetailsQuery, 
    // 💡 Export the new mutation hook
    useSubmitReviewMutation ,
    useCanUserReviewQuery,
    useGetAdminProductsQuery
} = productApi;