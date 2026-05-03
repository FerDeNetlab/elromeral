// El Romeral Admin — Service Worker
const CACHE_NAME = "romeral-admin-v1"

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

// Push notification handler
self.addEventListener("push", (event) => {
  let data = { title: "El Romeral", body: "Nuevo mensaje de WhatsApp" }

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/images/logo-dark.png",
      badge: "/images/logo-dark.png",
      tag: "wa-notification",
      renotify: true,
      data: { url: data.url ?? "/admin/whatsapp" },
    })
  )
})

// Abrir /admin/whatsapp al hacer clic en la notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url ?? "/admin/whatsapp"

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes("/admin") && "focus" in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        return self.clients.openWindow(targetUrl)
      })
  )
})
