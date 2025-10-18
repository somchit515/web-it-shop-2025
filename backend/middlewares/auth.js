import jwt from "jsonwebtoken";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/user.js"; // ✅ FIX 1: Correctly using capitalized 'User' model

// Check if the user is authenticated
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    
    let token;

    // 1. Check for token in the Authorization header (Bearer Token standard)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        // Extract token from "Bearer <token>" string
        token = req.headers.authorization.split(" ")[1];
    } 
    // 2. Fallback: Check for token in cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        // Returns 401 if token is missing
        return next(new ErrorHandler("Login first to access this resource", 401));
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user based on the decoded ID and attach to the request object
        req.user = await User.findById(decoded.id); // ✅ FIX 2: Correctly using capitalized 'User'

        // 🚀 IMPROVEMENT: Handle case where user ID is valid but user doesn't exist
        if (!req.user) {
            return next(new ErrorHandler("The user for this token no longer exists.", 401));
        }

        next();

    } catch (error) {
        // Handles expired or invalid token signature
        return next(new ErrorHandler("Invalid or expired token. Please log in again.", 401));
    }
});


// AuthorizeRoles (Restrict access based on user role)
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Ensure req.user exists before checking the role
        if (!req.user || !roles.includes(req.user.role)) {
            // Returns 403 (Forbidden) if the role is not allowed
            return next(new ErrorHandler(`Role (${req.user ? req.user.role : 'N/A'}) is not allowed access this resource.`, 403));
        }
        next();
    };
};