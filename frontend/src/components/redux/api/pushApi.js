import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pushApi = createApi({
  reducerPath: "pushApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getVapidPublicKey: builder.query({
      query: () => "/push/vapid-public-key",
    }),
    subscribePush: builder.mutation({
      query: (subscription) => ({
        url: "/push/subscribe",
        method: "POST",
        body: subscription,
      }),
    }),
    unsubscribePush: builder.mutation({
      query: (body) => ({
        url: "/push/unsubscribe",
        method: "DELETE",
        body,
      }),
    }),
  }),
});

export const {
  useGetVapidPublicKeyQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
} = pushApi;
