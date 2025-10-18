import { createSlice } from "@reduxjs/toolkit";
// ✅ FIX 1: Corrected import paths for API slices
import { authApi } from "../authApi"; 
import { userApi } from "../api/userApi"; 

const initialState = {
    user: null,
    // ⚠️ WARNING: Keeping your original spelling 'isAuthenticate'
    isAuthenticate: false, 
    loading: true
};

export const userSlice = createSlice({
    name: "userSlice",
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
        setIsAuthenticate(state, action) {
            state.isAuthenticate = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        clearUser(state) {
            state.user = null;
            state.isAuthenticate = false;
            state.loading = false;
        }
    },
    
    // 🚀 FIX 2: Added extraReducers for RTK Query integration
    extraReducers(builder) {
        // --- 1. Load User / Login Success (useGetMeQuery or useLoginMutation) ---
        // Handles data from the initial check (getMe)
        builder.addMatcher(
            userApi.endpoints.getMe.matchFulfilled,
            (state, action) => {
                state.loading = false;
                state.isAuthenticate = true;
                state.user = action.payload.user; // Assuming API returns { user: {...} }
            }
        );
        // Handles data from successful login
        builder.addMatcher(
            authApi.endpoints.login.matchFulfilled,
            (state, action) => {
                state.loading = false;
                state.isAuthenticate = true;
                state.user = action.payload.user;
            }
        );
        
        // --- 2. Failed Auth / Token Expired (useGetMeQuery Failure) ---
        // This is crucial for handling expired tokens on app load
        builder.addMatcher(
            userApi.endpoints.getMe.matchRejected,
            (state, action) => {
                state.loading = false;
                state.isAuthenticate = false;
                state.user = null;
            }
        );
        
        // --- 3. Logout Success (useLogoutMutation Success) ---
        // This is the key to immediately refreshing the Header
        builder.addMatcher(
            authApi.endpoints.logout.matchFulfilled,
            (state, action) => {
                state.loading = false;
                state.isAuthenticate = false;
                state.user = null;
            }
        );
    },
});

export default userSlice.reducer;

// ✅ Export all actions
export const { setUser, setIsAuthenticate, clearUser, setLoading } = userSlice.actions;