// ในไฟล์ backend/utils/sentToken.js

export default (user, statusCode, res, message = "Success") => {
  // create JWT Token
  const Token = user.getJwtToken(); 

  // options for Cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
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
  });
};
