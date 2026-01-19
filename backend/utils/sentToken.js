// ในไฟล์ backend/utils/sentToken.js (หรือชื่อไฟล์ที่คุณใช้)

// 🚀 รับ message เข้ามาเป็น parameter ตัวที่ 4 และกำหนดค่า default เป็น 'Success'
export default (user, statusCode, res, message = "Success") => {
  // create JWT Token
  const Token = user.getJwtToken(); //options for Cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }; // 🚀 สำคัญ: เพิ่ม message และ user object เข้าไปใน JSON response
  res.status(statusCode).cookie("token", Token, options).json({
    success: true, // ควรเพิ่ม success: true เข้าไปด้วยเพื่อให้ชัดเจน
    Token,
    user, // มักจะส่ง user object กลับไปด้วย
    message, // <--- Field ที่ Frontend คาดหวัง
  });
};
