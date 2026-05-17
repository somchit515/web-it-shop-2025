import webpush from "web-push";
import PushSubscription from "../models/pushSubscription.js";

// Initialise VAPID once — skip if keys not configured
let vapidReady = false;
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@itshop.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  vapidReady = true;
}

/**
 * Build a user-facing push payload for an order event.
 * @param {string} action  created | payment_confirmed | payment_rejected | shipped | delivered | cancelled | refunded
 * @param {string} orderId
 */
export function buildOrderPushPayload(action, orderId) {
  const url = orderId ? `/orders/${orderId}` : "/me/orders";

  const MAP = {
    created:            { body: "ຮ້ານໄດ້ຮັບອໍເດີຂອງທ່ານແລ້ວ ✓" },
    payment_confirmed:  { body: "ຊຳລະເງິນສຳເລັດ — ທາງຮ້ານຈະຈັດສົ່ງໃນໄວໆນີ້ 📦" },
    payment_rejected:   { body: "ຫຼັກຖານການຊຳລະຖືກປະຕິເສດ — ກວດສອບ ແລະ ອັບໂຫລດໃໝ່" },
    shipped:            { body: "ສິນຄ້າຖືກສົ່ງແລ້ວ! ລໍຖ້າຮັບສິນຄ້າໄດ້ 🚚" },
    delivered:          { body: "ສິນຄ້າຮອດແລ້ວ! ຂໍຂອບໃຈທີ່ຊື້ IT HUBB ❤️" },
    cancelled:          { body: "ອໍເດີຂອງທ່ານຖືກຍົກເລີກ" },
    refunded:           { body: "ຄືນເງິນສຳເລັດ 💰" },
  };

  const entry = MAP[action] || { body: action };
  return { title: "IT HUBB", icon: "/images/logo.png", badge: "/images/logo.png", url, ...entry };
}

/**
 * Send a push notification to all subscriptions of a user.
 * Fire-and-forget — never throws.
 *
 * @param {string|ObjectId} userId
 * @param {object} payload  { title, body, icon, badge, url }
 */
export async function tryPushNotify(userId, payload) {
  if (!vapidReady || !userId) return;

  try {
    const subs = await PushSubscription.find({ user: userId }).lean();
    if (!subs.length) return;

    const dead = [];

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            JSON.stringify(payload)
          );
        } catch (err) {
          // 410 Gone / 404 = subscription expired → clean up
          if (err.statusCode === 410 || err.statusCode === 404) {
            dead.push(sub._id);
          } else {
            console.error("[push] send error:", err.statusCode, err.message);
          }
        }
      })
    );

    if (dead.length) {
      await PushSubscription.deleteMany({ _id: { $in: dead } });
    }
  } catch (err) {
    console.error("[push] tryPushNotify error:", err.message);
  }
}
