import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  // Verificar autenticación
  const supabaseAuth = await createServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const { endpoint, p256dh, auth } = body

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Faltan parámetros de suscripción" }, { status: 400 })
  }

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!sbUrl || !sbKey) {
    return NextResponse.json({ error: "Config. no disponible" }, { status: 500 })
  }

  const sb = createClient(sbUrl, sbKey)
  const { error } = await sb.from("push_subscriptions").upsert(
    {
      endpoint,
      p256dh,
      auth_key: auth,
      device_info: request.headers.get("user-agent") ?? null,
    },
    { onConflict: "endpoint" }
  )

  if (error) {
    console.error("[push-subscribe]", error)
    return NextResponse.json({ error: "Error guardando suscripción" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { endpoint } = await request.json()
  if (!endpoint) return NextResponse.json({ error: "Falta endpoint" }, { status: 400 })

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!sbUrl || !sbKey) {
    return NextResponse.json({ error: "Config. no disponible" }, { status: 500 })
  }

  const sb = createClient(sbUrl, sbKey)
  await sb.from("push_subscriptions").delete().eq("endpoint", endpoint)

  return NextResponse.json({ success: true })
}
