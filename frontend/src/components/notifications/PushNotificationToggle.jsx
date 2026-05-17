import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  useGetVapidPublicKeyQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
} from "../redux/api/pushApi";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const supported =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export default function PushNotificationToggle() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [permission, setPermission] = useState(supported ? Notification.permission : "denied");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: vapidData } = useGetVapidPublicKeyQuery(undefined, {
    skip: !isAuthenticated || !supported,
  });

  const [subscribePush]   = useSubscribePushMutation();
  const [unsubscribePush] = useUnsubscribePushMutation();

  // Detect existing subscription on mount
  useEffect(() => {
    if (!supported || !isAuthenticated) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, [isAuthenticated]);

  if (!supported || !isAuthenticated) return null;

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (subscribed) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await unsubscribePush({ endpoint: sub.endpoint }).unwrap();
        }
        setSubscribed(false);
        toast.success("ປິດການແຈ້ງເຕືອນແລ້ວ");
      } else {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== "granted") {
          toast.error("ກະລຸນາອະນຸຍາດການແຈ້ງເຕືອນໃນ browser ກ່ອນ");
          setLoading(false);
          return;
        }

        const publicKey = vapidData?.publicKey;
        if (!publicKey) {
          toast.error("ຜິດພາດ: ບໍ່ສາມາດດຶງ VAPID key ໄດ້");
          setLoading(false);
          return;
        }

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        await subscribePush(sub.toJSON()).unwrap();
        setSubscribed(true);
        toast.success("ເປີດການແຈ້ງເຕືອນສຳເລັດ 🔔");
      }
    } catch (err) {
      console.error("[push toggle]", err);
      toast.error("ເກີດຂໍ້ຜິດພາດ: " + (err.message || "unknown"));
    }

    setLoading(false);
  };

  const blocked = permission === "denied";

  return (
    <button
      className="custom-dropdown-item"
      onClick={handleToggle}
      disabled={loading || blocked}
      title={blocked ? "ການແຈ້ງເຕືອນຖືກບລ໋ອກໂດຍ Browser — ກ່ອງ Site Settings" : undefined}
      style={{ opacity: blocked ? 0.5 : 1 }}
    >
      <i className={`fas fa-bell${subscribed ? "" : "-slash"}`} style={{ color: subscribed ? "#4ade80" : undefined }} />
      <span>
        {loading
          ? "ກຳລັງໂຫລດ..."
          : blocked
          ? "ການແຈ້ງເຕືອນຖືກບລ໋ອກ"
          : subscribed
          ? "ປິດການແຈ້ງເຕືອນ"
          : "ເປີດການແຈ້ງເຕືອນ"}
      </span>
      {subscribed && !loading && (
        <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#4ade80", fontWeight: 600 }}>
          ON
        </span>
      )}
    </button>
  );
}
