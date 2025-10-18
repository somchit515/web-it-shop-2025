import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // Load cart items from Local Storage
    cartItems: localStorage.getItem("cartItems")
        ? JSON.parse(localStorage.getItem("cartItems"))
        : [],
    
    // 💡 ENHANCEMENT: Load and store shippingInfo in the cart slice
    //    This matches the structure expected by the PaymentMethod component.
    shippingInfo: localStorage.getItem("shippingInfo")
        ? JSON.parse(localStorage.getItem("shippingInfo"))
        : {}, 
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
                return; // Use 'return' instead of 'return state' in Immer-based reducers
            }

            // Check if the item already exists in the cart
            const isItemExist = state.cartItems.find(
                (i) => i.product === item.product
            );

            if (isItemExist) {
                // If item exists, replace the old item with the new one (e.g., updated quantity)
                state.cartItems = state.cartItems.map((i) =>
                    i.product === isItemExist.product ? item : i
                );
            } else {
                // If item is new, add it to the cart
                state.cartItems = [...state.cartItems, item];
            }

            // Store the updated cart items in Local Storage
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

        removeItemFromCart: (state, action) => {
            const idToRemove = action.payload;
            
            // Filter the existing state to remove the item
            state.cartItems = state.cartItems.filter(
                (item) => item.product !== idToRemove
            );
            
            // Update Local Storage
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

        // 💡 NEW REDUCER: Save shipping info
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
            // Store in Local Storage
            localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
        },

        // ✅ FIX: Keep only one definition of clearCart and clean both items and info
        clearCart: (state) => {
            localStorage.removeItem("cartItems");
            localStorage.removeItem("shippingInfo"); // 💡 Clear shipping info too
            state.cartItems = [];
            state.shippingInfo = {};
        },
    },
});

// ✅ EXPORT ALL ACTIONS
export const { 
    setcartItems, 
    removeItemFromCart, 
    saveShippingInfo, 
    clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;