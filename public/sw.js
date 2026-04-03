/* eslint-disable no-restricted-globals */
/* TIC Portal SW — bump CACHE when changing notification assets */
const NOTIFICATION_ICON = new URL("/tic.ico", self.location.origin).href;

self.addEventListener("push", (event) => {
  let payload = { title: "TIC Portal", body: "", url: "/" };
  try {
    if (event.data) {
      const j = event.data.json();
      payload = { ...payload, ...j };
    }
  } catch {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || "TIC Portal", {
      body: payload.body || "",
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      data: { url: payload.url || "/" },
      tag: payload.messageId || "community",
      renotify: false,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const c of clientList) {
        if (c.url && "focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
