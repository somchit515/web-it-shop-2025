# 📋 IT HUBB Project — ບັນທຶກການພັດທະນາ

> ຮ້ານຄ້າອອນລາຍ IT HUBB — Full-stack MERN (MongoDB, Express, React, Node.js)
>
> ບັນທຶກສິ່ງທີ່ເຮັດແລ້ວ ແລະ ສິ່ງທີ່ຍັງຄ້າງເຮັດ

---

## ✅ ສິ່ງທີ່ເຮັດສຳເລັດແລ້ວ

### 🎨 Phase 1 — UI/UX Redesign

#### Header & Navigation
- ✅ ປັບປຸງ Header ໃໝ່ — glass-morphism, gradient ສີຟ້າ-ມ່ວງ, animations smooth
- ✅ Animated shimmer line ດ້ານລຸ່ມ header
- ✅ Logo glow effect + scale ເມື່ອ hover
- ✅ Pill-shaped navigation ກັບ active gradient
- ✅ Cart icon ໃໝ່ ມີ floating badge + pop animation
- ✅ User menu ມີ gradient avatar border
- ✅ Mobile menu ໃໝ່ ມີ background blur ສວຍ
- ✅ ແກ້ບັນຫາ Header ບໍ່ sticky (overflow-x:hidden → clip)

#### Search Bar (Search.css)
- ✅ Pill-shaped ມີ focus glow
- ✅ Shimmer effect ໃນປຸ່ມ "ຄົ້ນຫາ"
- ✅ Dropdown ດ້ວຍ recent searches + quick suggestions

#### Search Result Page (Home.jsx)
- ✅ Glass-morphism header card ສະແດງຜົນຄົ້ນຫາ
- ✅ Filters sidebar ໃໝ່ (gradient, hover effects)
- ✅ ເພີ່ມ "ສິນຄ້າອາດຖືກໃຈ" section ດ້ານລຸ່ມ

#### Auth Pages — Split-screen Design
- ✅ Login page — left brand panel + right form, ມີ floating orbs
- ✅ Forgot Password page — 3-step guide ໃນ brand panel
- ✅ Register page — perks (gift/bolt/star) ໃນ brand panel
- ✅ Responsive: ≤1024px ເຊື່ອງ brand panel

#### Footer
- ✅ ປ່ຽນສີຈາກນ້ຳຕານ-ທອງ ມາເປັນ dark navy + sky blue
- ✅ Trust chips (ຮັບປະກັນຂອງແທ້, ຈັດສົ່ງດ່ວນ, ຄືນສິນຄ້າ 7 ວັນ)
- ✅ Contact card ມີ glass-morphism
- ✅ Newsletter form ກັບ pill design
- ✅ Payment chips (BCEL, LDB, JDB, COD)
- ✅ Animated gradient line ດ້ານເທິງ
- ✅ ບໍ່ render ໃນໜ້າ auth/admin (isStandalonePage)

---

### 🛡️ Phase 2 — Admin System Refactor

#### Security & Routes
- ✅ ລຶບ duplicate routes (blog-admin-new, blog-admin-edit)
- ✅ ເພີ່ມ `<ProtectedRoute admin>` ໃຫ້ 3 routes ທີ່ຂາດ (shipments, orders/status, completed-orders)
- ✅ ປັບ ProtectedRoute ກວດ getMe error → redirect ໄປ /login

#### Auth Pattern Cleanup
- ✅ ລຶບ `localStorage.getItem('token')` ໃນ 8 ໄຟລ໌
- ✅ ປ່ຽນ Bearer token → cookie auth (`credentials: 'include'`)
- ✅ ປັບ 3 API files (productsApi, OrderApi, blogApi) ໃຫ້ໃຊ້ cookie

#### Raw fetch → RTK Query
- ✅ AdminLayout: useGetAdminOrdersQuery + polling 30s
- ✅ AdminVerifyPayment: useVerifyPaymentMutation + useNotifyOrderCustomerMutation
- ✅ Auto-invalidate cache ຫຼັງ mutation

#### Shared Components (`_shared/`)
- ✅ `confirmDialogStore.js` + `ConfirmDialog.jsx` — singleton modal (ແທນ window.confirm)
- ✅ `Breadcrumb.jsx` — reusable breadcrumb (auto ຫຼື custom)
- ✅ `useBulkSelect.js` — hook ຈັດການ checkbox state
- ✅ `BulkActionsBar.jsx` — sticky toolbar
- ✅ `exportCSV.js` — utility export ດ້ວຍ UTF-8 BOM

#### Wire-up in Admin Pages
- ✅ ListProducts: confirm + breadcrumb + bulk delete + export
- ✅ ListUsers: confirm + breadcrumb + bulk delete + export
- ✅ ListOrder: confirm + breadcrumb + export
- ✅ AdminVerifyPayment: confirm ສຳລັບ verify/reject
- ✅ ProductReviews: confirm
- ✅ UploadImages: confirm

#### Search/Filter/Pagination
- ✅ AdminVerifyPayment + ShipmentsPage: ເພີ່ມ client-side pagination (10/page)
- ✅ Auto-reset page ເມື່ອປ່ຽນ filter
- ✅ Windowing logic (max 7 page buttons)

#### Bug Fixes
- ✅ Case-collision (confirmDialog.js ↔ ConfirmDialog.jsx) → rename store
- ✅ AdminLayout overflow lock leak → useEffect with cleanup
- ✅ FinanceReport useEffect dependency loop → useCallback

---

### 🛒 Phase 3 — Shopping Flow Improvements

#### Critical Backend Fixes (P0)

**#1 Stock Validation + Atomic Decrement**
- ✅ `stockManager.js` utility: validateStock, decrementStockBatch, restoreStockBatch
- ✅ Pre-flight validation ກ່ອນສ້າງ order (return 409 ມີລາຍລະອຽດ)
- ✅ Atomic decrement ດ້ວຍ MongoDB `findOneAndUpdate({ stock: $gte: qty }, { $inc: -qty })`
- ✅ Rollback ຖ້າ race condition
- ✅ Restore stock ເມື່ອ cancel/delete order
- ✅ Frontend handle 409 errors ໃຫ້ສະແດງລາຍລະອຽດ

**#2 Clear Cart After Order**
- ✅ Dispatch `clearCart()` + `clearShippingInfo()` ຫຼັງສ້າງ order ສຳເລັດ
- ✅ ປ້ອງກັນ user ສ້າງ order ຊ້ຳໂດຍກົດ back

**#9 Order Ownership Check**
- ✅ `authHelpers.js`: `checkOwnershipOrAdmin()` + `assertOwnershipOrAdmin()`
- ✅ ໃຊ້ໃນ `getOrderDetails` (admin override OK)
- ✅ `attachPaymentProof` ກວດ owner-only (admin ບໍ່ allow)
- ✅ Frontend OrderDetail handle 403 → redirect ໄປ /me/orders

#### State & Calculation Fixes (P1)

**#3 Remove Duplicate shippingInfo**
- ✅ ລຶບ `shippingInfo` ອອກຈາກ cartSlice (single source ໃນ shippingSlice)
- ✅ ເພີ່ມ `clearShippingInfo` reducer
- ✅ Update 3 consumers (PaymentMethod, MyOrders, UploadPaymentProof)

**#4 Tax Inclusive Model**
- ✅ PaymentMethod + ConfrimOder + Invoice + invoiceHtmlTemplate
- ✅ VAT 10% ຝັງໃນລາຄາສິນຄ້າແລ້ວ
- ✅ Total = items + shipping (ບໍ່ບວກ tax ຊ້ຳ)
- ✅ ໝາຍເຫດເລັກໆ "ລາຄາລວມພາສີ 10% ແລ້ວ"

**#5 Frontend Stock Validation**
- ✅ Backend endpoint `POST /products/check-stock` (batch)
- ✅ Cart page: ກວດ stock onMount + ກ່ອນ checkout
- ✅ Warning badge per item (out_of_stock / insufficient / not_found)
- ✅ ປຸ່ມ "ປັບເປັນ X" auto-adjust quantity
- ✅ Block checkout ຖ້າມີບັນຫາ
- ✅ Defense-in-depth ໃນ PaymentMethod ກ່ອນ submit

**#6 Single Source of Truth Status**
- ✅ ເພີ່ມ `fulfillmentStatus` field ໃໝ່
- ✅ Pre-save hook bidirectional sync ກັບ legacy `orderStatus`/`shipmentStatus`
- ✅ Virtual `status` getter ສຳລັບ backward compat
- ✅ Helper `deriveFulfillmentStatus()` ສຳລັບ orders ເກົ່າ
- ✅ ShipmentsPage UI: ລວມ 2 dropdown ເປັນ 1

**#7 Server-side Filter**
- ✅ `GET /admin/orders` ຮັບ query params: paymentStatus, fulfillmentStatus, paymentMethod, q, page, perPage
- ✅ Backward compat: ບໍ່ສົ່ງ params → return all
- ✅ AdminLayout badge: ໃຊ້ `?paymentStatus=AwaitingProof&perPage=1` → ໃຊ້ total
- ✅ AdminVerifyPayment: server-side filter ແທນ client-side
- ✅ Populate user ໃນ allOrder

**#8 User Cancel Order**
- ✅ Endpoint `POST /orders/:id/cancel` (owner-only)
- ✅ ກວດສະຖານະ: ສະເພາະ Unfulfilled/Processing
- ✅ Block ຖ້າ paymentStatus = Paid (ຕ້ອງ refund)
- ✅ Auto-restore stock + cancelReason + cancelledAt
- ✅ UI: ປຸ່ມ "ຍົກເລີກອໍເດີ" + Modal ຮັບເຫດຜົນ
- ✅ Badge "ຍົກເລີກໄດ້" ໃນ MyOrders card

**#10 Carrier-based Shipping**
- ✅ `frontend/constans/shipping.js` + `backend/utils/shippingRates.js`
- ✅ 4 carriers ມີລາຄາຕ່າງກັນ:
  - ອານຸສິດ: 30,000 (ຟຣີ ≥1M)
  - ມີໄຊ: 20,000 (ຟຣີ ≥1M)
  - ຢູນິເທວ: 50,000 (ບໍ່ມີໂປຣ)
  - ຮັບເອງ: 0 (ຟຣີຕະຫຼອດ)
- ✅ Server-side recalculate (ກັນ tampering)
- ✅ ບັນທຶກ shippingCarrier + shippingCarrierCode ໃນ Order

---

### 🚀 Phase 4 — Advanced Features

#### #11 Idempotency (Double-click Protection)
- ✅ ເພີ່ມ `idempotencyKey` field ໃນ Order (sparse unique index)
- ✅ Frontend: `crypto.randomUUID()` per mount → ສົ່ງ header `Idempotency-Key`
- ✅ Backend: STEP 0 ກວດ key → return existing order ຖ້າມີ
- ✅ Catch E11000 duplicate → rollback stock + return existing
- ✅ Response ມີ `idempotent: true` flag → frontend ສະແດງ message ຕ່າງ

#### #12 Inventory Reservation (15-min Auto-cancel)
- ✅ `orderCleanup.js` utility: `releaseExpiredBankOrders()`
- ✅ Cleanup logic: BankTransfer + AwaitingProof + ບໍ່ມີ proof + > 15 ນາທີ
- ✅ Auto-cancel + restore stock + cancelReason
- ✅ 3-layer cleanup:
  - Scheduled: setInterval ທຸກ 1 ນາທີ
  - Lazy: ກ່ອນ validateStock ໃນ checkout
  - UI: countdown timer ໃນ UploadPaymentProof
- ✅ Frontend: countdown MM:SS, ສີສົ້ມ (<3min), ສີແດງ (ໝົດ), auto redirect
- ✅ Configurable via `BANK_TRANSFER_EXPIRY_MINUTES` env var

#### #13 Email Notifications
- ✅ 4 ປະເພດ email templates ໃໝ່ (Lao + English):
  - `created` — receipt ຫຼັງສ້າງ order
  - `shipped` — ມີ tracking code + carrier
  - `delivered` — ປຸ່ມ "ໃຫ້ຄະແນນ"
  - `cancelled` — ມີເຫດຜົນ
- ✅ `tryNotifyOrder()` fire-and-forget wrapper
- ✅ ສົ່ງ email ໃນ 4 ບ່ອນ:
  - paymentController: ຫຼັງ create order → 'created'
  - orderController.updateOrder: ຫຼັງ status change → 'shipped'/'delivered'/'cancelled'
  - orderController.updateOrderStatus: ດຽວກັນ
  - orderController.cancelMyOrder: ຫຼັງ cancel → 'cancelled'
- ✅ ບໍ່ block API response (try/catch + console.log)

#### #14 Order Timeline (Event History)
- ✅ ເພີ່ມ `events[]` array ໃນ Order schema
- ✅ Pre-save hook auto-append events:
  - `created` (isNew)
  - `payment_confirmed` / `payment_rejected` / `refunded` (paymentStatus change)
  - `processing` / `shipped` / `delivered` / `cancelled` / `returned` (fulfillmentStatus change)
  - `proof_uploaded` (paymentProof grew, ຄັ້ງດຽວ)
- ✅ Frontend: `OrderTimeline` component ໃນ OrderDetail
- ✅ Vertical timeline ມີ dot ສີ + icon emoji + relative time
- ✅ 11 event types ມີ config ສະເພາະ (icon/ສີ/label)

#### #17 Coupon System
- ✅ `Coupon` model: code, type (percentage/fixed), value, limits, validity, usedBy[]
- ✅ Static method `validateForOrder()` ກວດເງື່ອນໄຂທັງໝົດ
- ✅ Backend endpoints:
  - `POST /coupons/validate` (user — preview)
  - `POST/GET/PUT/DELETE /admin/coupons` (admin CRUD)
- ✅ `Order.couponCode` + `Order.discountAmount` fields
- ✅ paymentController: validate + apply + mark used (server-side)
- ✅ Frontend RTK Query: `couponApi.js`
- ✅ PaymentMethod UI: coupon input + applied badge + discount row
- ✅ Admin page: `/admin/coupons` — card grid + inline form + toggle/edit/delete
- ✅ Sidebar menu: "ລະຫັດສ່ວນຫຼຸດ"

---

## 🚧 ສິ່ງທີ່ຍັງຕ້ອງເຮັດ

### Priority P2 — ສຳຄັນ ແຕ່ບໍ່ດ່ວນ

#### #15 ປ່ຽນ window.confirm ໃນ Cart
- 📌 Cart.jsx ມີ 2 ບ່ອນຍັງໃຊ້ `window.confirm()`
- 📝 ໃຊ້ `confirmDialog.show()` ທີ່ມີຢູ່ແລ້ວ ໃນ admin/_shared
- ⏱️ ປະມານ 5 ນາທີ

#### #16 Empty Cart Redirect
- 📌 User ເຂົ້າ /shipping ຫຼື /payment ດ້ວຍ cart ຫວ່າງເປົ່າໄດ້
- 📝 ໃຊ້ useEffect ໃນ shipping/payment ກວດ cart ຕອນ mount → redirect ກັບ /cart
- ⚠️ ຕ້ອງລະວັງ: ບໍ່ໃຫ້ trigger ຫຼັງ clearCart (deps `[]` ບໍ່ແມ່ນ `[cartItems]`)
- ⏱️ ປະມານ 5-10 ນາທີ

#### #18 ບັນທຶກ shippingCarrier ໃນ Order
- ✅ **ສຳເລັດແລ້ວໃນ #10** — shippingInfo.shippingCarrier + shippingCarrierCode

#### #19 paymentStatus Enum ຂັດແຍ່ງ
- 📌 Schema enum: `["Pending", "AwaitingProof", "Paid", "Rejected", "Refunded"]`
- 📌 Controllers ບາງບ່ອນໃຊ້ `"Confirmed"` (ບໍ່ມີໃນ enum) — ບັນທຶກບໍ່ໄດ້
- 📝 ກວດ frontend code ທີ່ກວດ `"Confirmed"` → ປ່ຽນເປັນ `"Paid"`
- ⏱️ ປະມານ 10 ນາທີ

#### #20 User Search Orders
- 📌 MyOrders page ບໍ່ມີ search ສຳລັບ user
- 📝 ເພີ່ມ search box + status filter ໃນ MyOrders.jsx
- 📝 Backend `/me/orders` ຮັບ query param `q` + `status`
- ⏱️ ປະມານ 15 ນາທີ

#### #21 Stock Refresh Polling
- 📌 ຫຼັງ admin update stock → cart user ຍັງຄ້າງ stock ເກົ່າ
- 📌 ການ check-stock ກວດເມື່ອ load cart ເທົ່ານັ້ນ
- 📝 ເພີ່ມ polling ທຸກ 60 ວິ ໃນ Cart.jsx
- 📝 ຫຼື refetch ເມື່ອ window focus
- ⏱️ ປະມານ 10 ນາທີ

---

### Priority P3 — Future Enhancements

- 🔮 **Refund flow** — Admin issue refund for Paid orders (ປະຈຸບັນບລ໋ອກ user cancel)
- 🔮 **Order notes/timeline** — Admin add custom notes ໃນ timeline
- 🔮 **Bulk admin actions** — Bulk update order status
- 🔮 **Real cron** — ປ່ຽນ setInterval orderCleanup ໄປໃຊ້ node-cron
- 🔮 **Stripe integration** — Real payment gateway (placeholder ມີຢູ່ແລ້ວ)
- 🔮 **Review system** — User leave review ຫຼັງ Delivered
- 🔮 **Loyalty points** — Earn points ຕໍ່ການຊື້ → ໃຊ້ເປັນ discount
- 🔮 **Push notifications** — Web push for order updates
- 🔮 **Multi-language UI** — i18n switcher (Lao/EN/Thai)
- 🔮 **Dashboard analytics** — Charts ປະຈຳວັນ/ເດືອນ/ປີ

---

## 🏗️ ໂຄງສ້າງສຳຄັນ

### Backend Architecture
```
backend/
├── controllers/        # API logic
│   ├── orderController        # Order CRUD + lifecycle
│   ├── paymentController      # Checkout + idempotency + stock
│   ├── paymentProofController # Bank slip + admin verify
│   ├── couponController       # Coupon CRUD + validate
│   ├── productControllers     # Product CRUD + check-stock
│   └── userController/authController
├── models/
│   ├── orders.js              # fulfillmentStatus (new) + events[] + idempotencyKey
│   ├── coupon.js              # validateForOrder() static method
│   └── product.js
├── utils/
│   ├── stockManager.js        # validate/decrement/restore stock
│   ├── authHelpers.js         # checkOwnershipOrAdmin
│   ├── shippingRates.js       # server-side carrier rates
│   ├── orderCleanup.js        # auto-cancel expired bank orders
│   ├── mailer.js              # tryNotifyOrder (fire-and-forget)
│   ├── emailTemplatesPayment.js  # 7 templates × 2 langs
│   └── invoiceHtmlTemplate.js
└── routes/
    └── *.js
```

### Frontend Architecture
```
frontend/src/
├── components/
│   ├── admin/
│   │   ├── _shared/        # ConfirmDialog, Breadcrumb, BulkActions, exportCSV
│   │   ├── CouponsPage.jsx     # ✨ NEW
│   │   └── ...
│   ├── cart/
│   │   └── Cart, Shipping, PaymentMethod, ConfrimOder, UploadPaymentProof
│   ├── order/
│   │   └── MyOrders, OrderDetail (+ Timeline component inline)
│   ├── auth/               # Login, Register, ForgetPassword (split-screen)
│   ├── layout/             # Header, Footer, AdminLayout
│   └── redux/
│       ├── api/
│       │   ├── OrderApi.js     # +verifyPayment, notifyOrderCustomer, cancelMyOrder
│       │   ├── productsApi.js  # +checkStock
│       │   └── couponApi.js    # ✨ NEW
│       └── features/
│           ├── cartSlice.js    # ลบ shippingInfo ออก
│           └── shippingSlice.js  # +clearShippingInfo
├── constans/
│   └── shipping.js         # ✨ NEW — single source of truth for carriers
```

### Key Conventions
- **Auth**: Cookie-only (httpOnly), no localStorage tokens
- **Status**: `fulfillmentStatus` ເປັນ source of truth, legacy `orderStatus`/`shipmentStatus` auto-synced
- **Tax**: Inclusive (10% VAT ຝັງໃນລາຄາ)
- **Currency**: LAK (ກີບ) ບໍ່ມີເສດສະຕາງ
- **Language**: ພາສາລາວເປັນຫຼັກ + English fallback ໃນ email
- **Idempotency**: `Idempotency-Key` header ຕໍ່ checkout
- **Email**: Fire-and-forget, ບໍ່ block API response

---

## 🧪 Test Scenarios ສຳຄັນ

ກ່ອນ deploy production ຄວນທົດສອບ:

1. **Stock race condition** — 2 users ຊື້ສຸດທ້າຍພ້ອມກັນ → ຄົນດຽວສຳເລັດ
2. **Idempotency** — double-click submit → 1 order
3. **Auto-cancel** — Bank Transfer ປະທິ້ງ > 15 ນາທີ → stock ກັບ
4. **Coupon limits** — ໃຊ້ເກີນ limit → block
5. **Owner check** — User A ເບິ່ງ order User B → 403
6. **Carrier shipping** — ປ່ຽນ carrier → ລາຄາ recalculate
7. **Status sync** — update orderStatus → fulfillmentStatus + shipmentStatus auto-sync
8. **Email notifications** — ທຸກ status change → email ສົ່ງ
9. **Timeline** — ສ້າງ → ຊຳລະ → ສົ່ງ → ສຳເລັດ → 5 events ໃນ timeline
10. **Empty cart redirect** — (ຍັງບໍ່ໄດ້ເຮັດ #16)

---

## 📚 Environment Variables ສຳຄັນ

```env
# Backend
PORT=8000
NODE_ENV=development
DB_URI=mongodb://...
FRONTEND_URL=http://localhost:3000
JWT_SECRET=...
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRES_TIME=7

# SMTP (Email)
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM_NAME=IT HUBB
SMTP_FROM_EMAIL=no-reply@ithubb.com

# Bank Transfer
BANK_NAME=...
BANK_ACCOUNT_NUMBER=...
BANK_ACCOUNT_NAME=...
BANK_TRANSFER_EXPIRY_MINUTES=15

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
```

---

## 🤝 ສຳລັບ developers ໃໝ່

### Pattern ທີ່ຕ້ອງປະຕິບັດຕາມ

1. **API calls** — ໃຊ້ RTK Query (ບໍ່ໃຊ້ raw fetch)
2. **Auth** — ໃຊ້ cookie ຜ່ານ `credentials: 'include'`
3. **Confirm dialogs** — ໃຊ້ `confirmDialog.show()` (ບໍ່ໃຊ້ window.confirm)
4. **Status reads** — ໃຊ້ `order.fulfillmentStatus` (fallback `order.status`)
5. **Status writes** — ສົ່ງ `fulfillmentStatus` (pre-save sync ໃຫ້)
6. **Stock changes** — ໃຊ້ helpers ໃນ `stockManager.js`
7. **Owner checks** — ໃຊ້ `assertOwnershipOrAdmin()`
8. **Email** — ໃຊ້ `tryNotifyOrder()` (fire-and-forget)
9. **Shipping fee** — ໃຊ້ `calculateShippingFee()` ກັບ shared constants
10. **Idempotency** — frontend ສ້າງ UUID, backend ກວດ + save

---

## 📊 ສະຖິຕິການແກ້ໄຂ

| Phase | ໄຟລ໌ໃໝ່ | ໄຟລ໌ປັບປຸງ | ບັນຫາແກ້ |
|-------|---------|-----------|----------|
| Phase 1: UI/UX | 0 | ~15 | Design System |
| Phase 2: Admin | 6 | ~20 | Security + Architecture |
| Phase 3: Shop Flow | 4 | ~10 | Data Integrity |
| Phase 4: Features | 5 | ~8 | UX + Business |
| **ລວມ** | **15** | **~53** | **17 ບັນຫາ** |

---

## 📝 ບັນທຶກ session ປະຈຸບັນ

**ໄຟລ໌ໃໝ່ທີ່ສ້າງ:**
- `backend/utils/stockManager.js`
- `backend/utils/authHelpers.js`
- `backend/utils/shippingRates.js`
- `backend/utils/orderCleanup.js`
- `backend/models/coupon.js`
- `backend/controllers/couponController.js`
- `backend/routes/coupons.js`
- `frontend/src/constans/shipping.js`
- `frontend/src/components/admin/_shared/confirmDialogStore.js`
- `frontend/src/components/admin/_shared/ConfirmDialog.jsx`
- `frontend/src/components/admin/_shared/Breadcrumb.jsx`
- `frontend/src/components/admin/_shared/useBulkSelect.js`
- `frontend/src/components/admin/_shared/BulkActionsBar.jsx`
- `frontend/src/components/admin/_shared/exportCSV.js`
- `frontend/src/components/admin/CouponsPage.jsx`
- `frontend/src/components/redux/api/couponApi.js`

---

# userEmail
The user's email address is amphavongs@gmail.com.

# currentDate
Today's date is 2026-05-11.
