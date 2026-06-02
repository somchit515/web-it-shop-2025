import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const MAX_COMPARE = 3;

const compareSlice = createSlice({
  name: "compare",
  initialState: { items: [] },
  reducers: {
    addToCompare(state, action) {
      const product = action.payload;
      if (state.items.find((p) => p._id === product._id)) {
        toast.error("ສິນຄ້ານີ້ຢູ່ໃນລາຍການປຽບທຽບແລ້ວ");
        return;
      }
      if (state.items.length >= MAX_COMPARE) {
        toast.error(`ປຽບທຽບໄດ້ສູງສຸດ ${MAX_COMPARE} ລາຍການ`);
        return;
      }
      state.items.push(product);
      toast.success("ເພີ່ມໃສ່ປຽບທຽບແລ້ວ");
    },
    removeFromCompare(state, action) {
      state.items = state.items.filter((p) => p._id !== action.payload);
    },
    clearCompare(state) {
      state.items = [];
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
