import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import cartReducer from "./features/cartSlice";
import shippingReducer from "./features/shippingSlice";

import { productApi } from "./api/productsApi";
import { authApi } from "./authApi";
import { userApi } from "./api/userApi";
import { orderApi } from "./api/OrderApi";  
import { blogApi } from "./api/blogApi"; // ✅ Import ເຂົ້າມາແລ້ວ

export const store = configureStore({
  reducer: {
    auth: userReducer,
    cart: cartReducer,
    shipping: shippingReducer,
    
    // API Reducers
    [productApi.reducerPath]: productApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    
    // 🛑 FIX: ເພີ່ມ Reducer ຂອງ blogApi ເຂົ້າໄປບ່ອນນີ້
    [blogApi.reducerPath]: blogApi.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      productApi.middleware, 
      authApi.middleware, 
      userApi.middleware, 
      orderApi.middleware, 
      blogApi.middleware // ✅ Middleware ມີແລ້ວ, ຖືວ່າຖືກຕ້ອງ
    ]),
});