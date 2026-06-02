import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import cartReducer from "./features/cartSlice";
import shippingReducer from "./features/shippingSlice";
import compareReducer from "./features/compareSlice";

import { productApi } from "./api/productsApi";
import { authApi } from "./authApi";
import { userApi } from "./api/userApi";
import { orderApi } from "./api/OrderApi";
import { blogApi } from "./api/blogApi";
import { couponApi } from "./api/couponApi";
import { pushApi } from "./api/pushApi";
import { flashDealApi } from "./api/flashDealApi";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    cart: cartReducer,
    shipping: shippingReducer,
    compare: compareReducer,

    // API Reducers
    [productApi.reducerPath]: productApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,

    [blogApi.reducerPath]: blogApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
    [pushApi.reducerPath]: pushApi.reducer,
    [flashDealApi.reducerPath]: flashDealApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      productApi.middleware,
      authApi.middleware,
      userApi.middleware,
      orderApi.middleware,
      blogApi.middleware,
      couponApi.middleware,
      pushApi.middleware,
      flashDealApi.middleware,
    ]),
});