import { createSlice } from "@reduxjs/toolkit";

// ✅ cartSlice รับผิดชอบแค่ cartItems เท่านั้น
//    shippingInfo อยู่ใน shippingSlice (single source of truth)
const initialState = {
    cartItems: localStorage.getItem("cartItems")
        ? JSON.parse(localStorage.getItem("cartItems"))
        : [],
};

export const cartSlice = createSlice({
    name: "cartSlice",
    initialState,
    reducers: {
        setcartItems(state, action) {
            const item = action.payload;

            // CRITICAL CHECK: Ensure item and its ID exist
            if (!item || !item.product) {
                console.error("Attempted to add invalid item to cart:", item);
                return;
            }

            // Check if the item already exists in the cart
            const isItemExist = state.cartItems.find(
                (i) => i.product === item.product
            );

            if (isItemExist) {
                state.cartItems = state.cartItems.map((i) =>
                    i.product === isItemExist.product ? item : i
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }

            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

        removeItemFromCart: (state, action) => {
            const idToRemove = action.payload;
            state.cartItems = state.cartItems.filter(
                (item) => item.product !== idToRemove
            );
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

        // ✅ clearCart เคลียร์เฉพาะ cart (ไม่ยุ่งกับ shipping)
        //    ถ้าต้องการเคลียร์ shipping ด้วย ให้ dispatch clearShippingInfo() จาก shippingSlice
        clearCart: (state) => {
            localStorage.removeItem("cartItems");
            state.cartItems = [];
        },
    },
});

export const {
    setcartItems,
    removeItemFromCart,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
