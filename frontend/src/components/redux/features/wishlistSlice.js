import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const KEY = "ithubb_wishlist";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const save = (items) => localStorage.setItem(KEY, JSON.stringify(items));

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: load() },
  reducers: {
    toggleWishlist(state, action) {
      const product = action.payload;
      const idx = state.items.findIndex((p) => p._id === product._id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
        toast.success("ລຶບອອກຈາກລາຍການໂປດ");
      } else {
        state.items.push(product);
        toast.success("❤️ ເພີ່ມໃສ່ລາຍການໂປດ");
      }
      save(state.items);
    },
    clearWishlist(state) {
      state.items = [];
      localStorage.removeItem(KEY);
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
