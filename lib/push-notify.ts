import webpush from "web-push"
import { createClient } from "@supabase/supabase-js"

export async function sendPushToAll(title: string, body: string, url = "/admin/whatsapp") {
  const vapidPublic  = process.env.VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const sbUrl        = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sbKey        = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!vapidPublic || !vapidPrivate || !sbUrl || !sbKey) return

  webpush.setVapidDetails(
    "mailto:hola@elromeral.mx",
    vapidPublic,
    vapidPrivate
  )

  const sb = createClient(sbUrl, sbKey)
  const { data: subs } = await sb.from("push_subscriptions").select("endpoint,p256dh,auth_key")

  if (!subs || subs.length === 0) return

  const payload = JSON.stringify({ title, body, url })

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          payload
        )
      } catch (err: unknown) {
        // Si el endpoint ya no es válido (410), eliminarlo
        if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
          await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint)
        }
      }
    })
  )
}
