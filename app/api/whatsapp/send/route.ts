import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendWhatsAppTextMessage } from "@/lib/whatsapp"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    // Verificar autenticación del admin
    const supabaseAuth = await createServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { phone, text } = await request.json()

    if (!phone || !text?.trim()) {
      return NextResponse.json({ error: "Faltan parámetros: phone y text son requeridos" }, { status: 400 })
    }

    const accessToken  = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json({ error: "Credenciales de WhatsApp no configuradas" }, { status: 500 })
    }

    await sendWhatsAppTextMessage({ accessToken, phoneNumberId, to: phone, body: text.trim() })

    // Loguear mensaje outbound en historial
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key) {
      const sb = createClient(url, key)
      // Obtener quote_id
      const { data: lead } = await sb
        .from("quotes")
        .select("id, source_detail")
        .eq("telefono", phone)
        .eq("source", "whatsapp")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (lead) {
        const stage = (lead.source_detail as Record<string, unknown>)?.wa_stage ?? "completed"
        await sb.from("whatsapp_messages").insert({
          message_id: `manual-${Date.now()}-${phone}`,
          phone,
          text: text.trim(),
          quote_id: lead.id,
          direction: "outbound",
          wa_stage: String(stage),
          payload: { sent_by: user.email, manual: true },
        })

        // Actualizar último mensaje
        await sb
          .from("quotes")
          .update({ wa_last_message_at: new Date().toISOString() })
          .eq("id", lead.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[whatsapp-send]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error enviando mensaje" },
      { status: 500 },
    )
  }
}
