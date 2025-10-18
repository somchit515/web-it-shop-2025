import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import cartReducer from "./features/cartSlice";
// 🛑 FIX 1: Import the new shipping reducer
import shippingReducer from "./features/shippingSlice";
import { productApi } from "./api/productsApi";
import { authApi } from "./authApi";
import { userApi } from "./api/userApi";

import { orderApi } from "./api/OrderApi";  


export const store = configureStore({
  reducer: {
    auth: userReducer,
    cart: cartReducer,
  
    // 🛑 FIX 2: Register the shipping reducer under the 'shipping' key
    shipping: shippingReducer,
    [productApi.reducerPath]: productApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([productApi.middleware, authApi.middleware, userApi.middleware , orderApi.middleware]),
});