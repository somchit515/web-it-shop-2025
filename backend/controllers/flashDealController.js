import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import FlashDeal from "../models/flashDeal.js";
import ErrorHandler from "../utils/errorHandler.js";

/* GET /api/v1/flash-deal — public */
export const getFlashDeal = catchAsyncErrors(async (req, res) => {
  let deal = await FlashDeal.findOne().sort({ updatedAt: -1 }).populate("products", "name price salePrice images rating numOfReviews stock");
  if (!deal) deal = { label: "Flash Deal", products: [], endsAt: null, isActive: false };
  res.status(200).json({ success: true, deal });
});

/* PUT /api/v1/admin/flash-deal — admin only */
export const updateFlashDeal = catchAsyncErrors(async (req, res, next) => {
  const { label, products, endsAt, isActive, discountPercent } = req.body;

  if (products && products.length > 6)
    return next(new ErrorHandler("ເລືອກໄດ້ສູງສຸດ 6 ສິນຄ້າ", 400));

  let deal = await FlashDeal.findOne().sort({ updatedAt: -1 });

  if (deal) {
    if (label           !== undefined) deal.label           = label;
    if (products        !== undefined) deal.products        = products;
    if (endsAt          !== undefined) deal.endsAt          = new Date(endsAt);
    if (isActive        !== undefined) deal.isActive        = isActive;
    if (discountPercent !== undefined) deal.discountPercent = Number(discountPercent);
    await deal.save();
  } else {
    deal = await FlashDeal.create({ label, products, endsAt: endsAt ? new Date(endsAt) : undefined, isActive, discountPercent: Number(discountPercent || 0) });
  }

  await deal.populate("products", "name price salePrice images rating numOfReviews stock");
  res.status(200).json({ success: true, deal });
});
