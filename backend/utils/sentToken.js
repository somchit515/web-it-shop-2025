// backend/utils/sendToken.js

const sendToken = (user, statusCode, res, message = "Success") => {
  // Create JWT Token
  const token = user.getJwtToken();

  // Cookie Options
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents XSS attacks
    path: '/',      // Accessible on all routes
  };

  // Logic to handle Development vs Production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;    // Required for HTTPS (Koyeb)
    options.sameSite = 'none'; // Required for cross-domain (Koyeb to Vercel)
  } else {
    options.secure = false;   // Must be false for HTTP localhost
    options.sameSite = 'lax';  // Standard for local development
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
    token,
  });
};

export default sendToken;