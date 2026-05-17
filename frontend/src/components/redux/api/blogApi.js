import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const blogApi = createApi({
  reducerPath: 'blogApi',
 
  // 🚀 ປັບໃຫ້ເລືອກ URL ອັດຕະໂນມັດ ແລະ ເນັ້ນການໃຊ້ Cookie (credentials: "include")
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: 'include',
  }),

  tagTypes: ['Blog', 'Comment'],
  
  endpoints: (builder) => ({

    // 1. ດຶງບົດຄວາມທັງໝົດ
    getBlogs: builder.query({
      query: (params) => ({ url: '/blogs', params }),
      transformResponse: (response) => ({
        blogs:      response.data?.blogs      ?? [],
        pagination: response.data?.pagination ?? {},
      }),
      providesTags: (result) =>
        result?.blogs?.length
          ? [
              ...result.blogs.map(({ _id }) => ({ type: 'Blog', id: _id })),
              { type: 'Blog', id: 'LIST' },
            ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),

    // 2. ດຶງລາຍລະອຽດບົດຄວາມດຽວ
    getBlogDetails: builder.query({
      query: (id) => `/blogs/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),

    // 3. ດຶງບົດຄວາມທີ່ກ່ຽວຂ້ອງ
    getRelatedBlogs: builder.query({
      query: (id) => `/blogs/${id}/related`,
      transformResponse: (response) => response.data ?? [],
      providesTags: ['Blog'],
    }),

    // 4. ດຶງ Trending blogs
    getTrendingBlogs: builder.query({
      query: () => '/blogs/trending',
      transformResponse: (response) => response.data ?? [],
      providesTags: ['Blog'],
    }),

    // 5. ສ້າງບົດຄວາມໃໝ່
    createBlog: builder.mutation({
      query: (blogData) => ({
        url: '/blogs',
        method: 'POST',
        body: sanitizeBlogPayload(blogData),
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),

    // 6. ແກ້ໄຂບົດຄວາມ
    updateBlog: builder.mutation({
      query: ({ id, ...blogData }) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body: sanitizeBlogPayload(blogData),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Blog', id },
        { type: 'Blog', id: 'LIST' },
      ],
    }),

    // 7. ລຶບບົດຄວາມ
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),

    // 8. Like / Unlike
    likeBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),

    // 9. ເພີ່ມ Comment
    addComment: builder.mutation({
      query: ({ id, comment }) => ({
        url: `/blogs/${id}/comments`,
        method: 'POST',
        body: { text: comment }, 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }],
    }),

    // 10. ເພີ່ມ View
    incrementView: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}/view`,
        method: 'POST',
      }),
    }),

  }),
});

// HELPER — sanitize payload ກ່ອນສົ່ງ backend
function sanitizeBlogPayload(data) {
  const {
    title, excerpt, content, category, tags,
    isPublished, seoTitle, seoDescription,
    author, slug, readTime, image, images,
  } = data;

  return {
    title,
    excerpt,
    content,
    category,
    tags:           Array.isArray(tags) ? tags : [],
    isPublished:    Boolean(isPublished),
    seoTitle:       seoTitle       || '',
    seoDescription: seoDescription || '',
    author:         author         || '',
    slug:           slug           || '',
    readTime:       readTime       || '',
    image:          image          || '',
    images:         Array.isArray(images) ? images : [],
  };
}

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
  useIncrementViewMutation,
} = blogApi;