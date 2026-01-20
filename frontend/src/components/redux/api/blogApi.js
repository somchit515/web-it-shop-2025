import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://ithub-sy2u.onrender.com/api/v1/blogs',
    prepareHeaders: (headers, { getState }) => {
      // ດຶງ token ຈາກ auth state (ປັບຊື່ໃຫ້ກົງກັບ Store ຂອງທ່ານ)
      const token = getState().auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Blog', 'Comment'],
  endpoints: (builder) => ({
    
    // 1. ດຶງຂໍ້ມູນບົດຄວາມທັງໝົດ (ສຳລັບ Dashboard ແລະ ໜ້າຫຼັກ)
    getBlogs: builder.query({
      query: (params) => ({
        url: '/blogs',
        params, // ສົ່ງ page, limit, category, search
      }),
      // ແກ້ໄຂບັນຫາ Loading: ດຶງເອົາ blogs array ອອກມາຈາກ response.data.blogs
      transformResponse: (response) => ({
        blogs: response.data.blogs,
        pagination: response.data.pagination
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.blogs.map(({ _id }) => ({ type: 'Blog', id: _id })),
              { type: 'Blog', id: 'LIST' },
            ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),

    // 2. ດຶງລາຍລະອຽດບົດຄວາມດຽວ
    getBlogDetails: builder.query({
      query: (id) => `/blogs/${id}`,
      transformResponse: (response) => response.data, // ດຶງ object blog ອອກມາເລີຍ
      providesTags: (result, error, id) => [{ type: 'Blog', id }]
    }),

    // 3. ດຶງບົດຄວາມທີ່ກ່ຽວຂ້ອງ
    getRelatedBlogs: builder.query({
      query: (id) => `/blogs/${id}/related`,
      transformResponse: (response) => response.data, // ໄດ້ເປັນ Array ຂອງ blogs
      providesTags: ['Blog']
    }),

    // 4. ດຶງບົດຄວາມທີ່ກຳລັງມາແຮງ
    getTrendingBlogs: builder.query({
      query: () => `/blogs/trending`,
      transformResponse: (response) => response.data,
      providesTags: ['Blog']
    }),

    // 5. ສ້າງບົດຄວາມໃໝ່
    createBlog: builder.mutation({
      query: (blogData) => ({
        url: '/blogs',
        method: 'POST',
        body: blogData
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }]
    }),

    // 6. ແກ້ໄຂບົດຄວາມ
    updateBlog: builder.mutation({
      query: ({ id, ...blogData }) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body: blogData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Blog', id },
        { type: 'Blog', id: 'LIST' }
      ]
    }),

    // 7. ລຶບບົດຄວາມ
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }]
    }),

    // 8. ກົດໄລ້ບົດຄວາມ
    likeBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}/like`,
        method: 'POST'
      }),
      // ບໍ່ຕ້ອງເຜົາ LIST ໃໝ່, ໃຫ້ເຜົາສະເພາະ ID ທີ່ຖືກກົດໄລ້ເພື່ອຄວາມໄວ
      invalidatesTags: (result, error, id) => [{ type: 'Blog', id }]
    }),

    // 9. ເພີ່ມຄວາມຄິດເຫັນ
    addComment: builder.mutation({
      query: ({ id, text }) => ({
        url: `/blogs/${id}/comments`,
        method: 'POST',
        body: { text }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }]
    }),

    // 10. ເພີ່ມຍອດວິວ
    incrementView: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}/view`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Blog', id }]
    })
  })
});

export const {
  useGetBlogsQuery,
  useGetBlogDetailsQuery,
  useGetRelatedBlogsQuery,
  useGetTrendingBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useLikeBlogMutation,
  useAddCommentMutation,
  useIncrementViewMutation
} = blogApi;
