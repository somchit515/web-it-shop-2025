// src/redux/features/shippingSlice.js

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
            // Store data in Local Storage immediately after saving to state
            localStorage.setItem("shippingInfo", JSON.stringify(action.payload));
        },
    },
});

export const { saveShippingInfo } = shippingSlice.actions;

export default shippingSlice.reducer;

// Don't forget to add this reducer to your store (e.g., store.js)