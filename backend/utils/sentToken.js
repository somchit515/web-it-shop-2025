const sendToken = (user, statusCode, res, message = "Success") => {
  const token = user.getJwtToken();

  // ການຕັ້ງຄ່າ Option ສຳລັບ Cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
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
  });
};

export default sendToken;