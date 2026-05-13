main
const sendToken = (user, statusCode, res, message = "Success") => {
  const token = user.getJwtToken();

  // ການຕັ້ງຄ່າ Option ສຳລັບ Cookie

// ในไฟล์ backend/utils/sentToken.js

export default (user, statusCode, res, message = "Success") => {
  // create JWT Token
  const Token = user.getJwtToken(); 

  // options for Cookie
 master
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
 main
    httpOnly: true, // 🛑 ປ້ອງກັນ XSS
    secure: false,  // 🛑 ຕ້ອງເປັນ false ເທົ່ານັ້ນໃນ localhost (ຖ້າ true ມັນຈະບໍ່ຂຶ້ນ)
    sameSite: 'Lax', // 🛑 ຕ້ອງເປັນ Lax ເພື່ອໃຫ້ສົ່ງຂ້າມ Port ໄດ້
    path: '/',      // 🛑 ເພີ່ມ Path ເພື່ອໃຫ້ໃຊ້ໄດ້ທຸກ Route
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
    token,

    httpOnly: true,
    // 🚀 ເພີ່ມ 2 ແຖວນີ້ເຂົ້າໄປ (ສຳຄັນຫຼາຍສຳລັບ Production)
    secure: true,      // ບອກວ່າຕ້ອງສົ່ງຜ່ານ HTTPS ເທົ່ານັ້ນ (Koyeb ໃຊ້ HTTPS ຢູ່ແລ້ວ)
    sameSite: "none",  // ອະນຸຍາດໃຫ້ສົ່ງ Cookie ຂ້າມ Domain ຈາກ Koyeb ໄປ Vercel
  };

  res.status(statusCode).cookie("token", Token, options).json({
    success: true,
    Token,
    user,
    message,
 master
  });
};

export default sendToken;