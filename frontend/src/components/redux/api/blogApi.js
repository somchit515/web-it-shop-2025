import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    // ✅ ใช้ cookie auth อย่างเดียว (ลบ localStorage token ออก)
    credentials: 'include',
  }),
  tagTypes: ['Blog', 'Comment'],
  endpoints: (builder) => ({

    // ─────────────────────────────────────────
    // 1. ດຶງບົດຄວາມທັງໝົດ
    // ─────────────────────────────────────────
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

    // ─────────────────────────────────────────
    // 2. ດຶງລາຍລະອຽດບົດຄວາມດຽວ
    // ─────────────────────────────────────────
    getBlogDetails: builder.query({
      query: (id) => `/blogs/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),

    // ─────────────────────────────────────────
    // 3. ດຶງບົດຄວາມທີ່ກ່ຽວຂ້ອງ
    // ─────────────────────────────────────────
    getRelatedBlogs: builder.query({
      query: (id) => `/blogs/${id}/related`,
      transformResponse: (response) => response.data ?? [],
      providesTags: ['Blog'],
    }),

    // ─────────────────────────────────────────
    // 4. ດຶງ Trending blogs
    // ─────────────────────────────────────────
    getTrendingBlogs: builder.query({
      query: () => '/blogs/trending',
      transformResponse: (response) => response.data ?? [],
      providesTags: ['Blog'],
    }),

    // ─────────────────────────────────────────
    // 5. ສ້າງບົດຄວາມໃໝ່
    // ✅ FIX: ຖ້າສົ່ງ images base64 ໃຫ້ strip ອອກກ່ອນ
    //         ຫຼື backend ຕ້ອງ handle multipart
    //         ຕອນນີ້ສົ່ງ JSON ທຳມະດາ — backend ຮັບ base64 string ໄດ້
    // ─────────────────────────────────────────
    createBlog: builder.mutation({
      query: (blogData) => ({
        url: '/blogs',
        method: 'POST',
        body: sanitizeBlogPayload(blogData),
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),

    // ─────────────────────────────────────────
    // 6. ແກ້ໄຂບົດຄວາມ
    // ─────────────────────────────────────────
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

    // ─────────────────────────────────────────
    // 7. ລຶບບົດຄວາມ
    // ─────────────────────────────────────────
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),

    // ─────────────────────────────────────────
    // 8. Like / Unlike
    // ✅ FIX: route ໃຊ້ POST (/blogs/:id/like)
    // ─────────────────────────────────────────
    likeBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),

    // ─────────────────────────────────────────
    // 9. ເພີ່ມ Comment
    // ✅ FIX: ປ່ຽນ field text → comment (ຕາມ backend)
    // ─────────────────────────────────────────
    addComment: builder.mutation({
      query: ({ id, comment }) => ({
        url: `/blogs/${id}/comments`,
        method: 'POST',
        body: { text: comment }, // ✅ backend: const { comment } = req.body
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }],
    }),

    // ─────────────────────────────────────────
    // 10. ເພີ່ມ View
    // ✅ FIX: route ໃຊ້ POST (/blogs/:id/view)
    // ─────────────────────────────────────────
    incrementView: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}/view`,
        method: 'POST',
      }),
      // ບໍ່ invalidate — ບໍ່ຢາກ refetch ທັງໝົດພຽງເພາະ view +1
    }),

  }),
});

/* ═══════════════════════════════════════════════
   HELPER — sanitize payload ກ່ອນສົ່ງ backend
   - ລຶບ field ທີ່ backend ບໍ່ຕ້ອງການ
   - ກຳຈັດ images[] ທີ່ເປັນ base64 ຂະໜາດໃຫຍ່ (optional)
     ຖ້າ backend ທ່ານ support base64 ກໍ່ comment line ນັ້ນໄດ້
═══════════════════════════════════════════════ */
function sanitizeBlogPayload(data) {
  const {
    title,
    excerpt,
    content,
    category,
    tags,
    isPublished,
    seoTitle,
    seoDescription,
    author,
    slug,
    readTime,
    image,   // cover image (base64 or URL)
    images,  // gallery images array
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