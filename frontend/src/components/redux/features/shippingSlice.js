// src/redux/features/shippingSlice.js
// ✅ Single source of truth สำหรับ shipping info (เคยซ้ำกับ cartSlice แล้วลบออกแล้ว)

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // Load shipping info from Local Storage on app startup
    shippingInfo: localStorage.getItem("shippingInfo")
        ? JSON.parse(localStorage.getItem("shippingInfo"))
        : {},
};

export const shippingSlice = createSlice({
    name: "shippingSlice",
    initialState,
    reducers: {
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
            localStorage.setItem("shippingInfo", JSON.stringify(action.payload));
        },

        // ✅ เคลียร์ shipping info ทั้ง state + localStorage
        clearShippingInfo: (state) => {
            state.shippingInfo = {};
            localStorage.removeItem("shippingInfo");
        },
    },
});

export const { saveShippingInfo, clearShippingInfo } = shippingSlice.actions;

export default shippingSlice.reducer;
