// Service Worker — Web Push Notifications

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { body: event.data.text() }; }

  const {
    title = "IT HUBB",
    body  = "",
    icon  = "/images/logo.png",
    badge = "/images/logo.png",
    url   = "/",
  } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: { url },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";
  const absolute  = targetUrl.startsWith("http")
    ? targetUrl
    : self.location.origin + targetUrl;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus an already-open tab if possible
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) client.navigate(absolute);
            return;
          }
        }
        if (clients.openWindow) return clients.openWindow(absolute);
      })
  );
});
