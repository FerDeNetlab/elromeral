import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

interface WebChatLead {
  name: string
  eventType: string
  hasDate: boolean
  date?: string
  guests: string
  budget: string
  phone: string
  schedule?: string
  apptDate?: string
  apptTime?: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase no configurado")
  return createClient(url, key)
}

function guestRangeToNum(range: string): number {
  const map: Record<string, number> = {
    "50–100": 75, "101–150": 125, "151–200": 175,
    "201–250": 225, "251–300": 275, "301–350": 325,
  }
  return map[range] ?? 0
}

function classifyBudget(budget: string): "bajo" | "medio" | "alto" {
  if (budget.toLowerCase().startsWith("menos")) return "bajo"
  if (budget.toLowerCase().startsWith("más")) return "alto"
  return "medio"
}

export async function POST(request: Request) {
  let body: WebChatLead
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  const { name, eventType, hasDate, date, guests, budget, phone, schedule, apptDate, apptTime } = body

  if (!name || !eventType || !guests || !budget || !phone) {
    return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
  }

  const sb = getSupabase()
  const now = new Date().toISOString()
  const slug = `webchat-${phone.replace(/\D/g, "")}-${Date.now()}`
  const calificacion = classifyBudget(budget)
  const horario = apptDate && apptTime
    ? `Cita: ${apptDate} · ${apptTime}`
    : schedule ?? null

  const { data: lead, error } = await sb
    .from("quotes")
    .insert({
      slug,
      nombres: name,
      telefono: phone.replace(/\D/g, ""),
      tipo_evento: eventType,
      num_invitados: guestRangeToNum(guests),
      inversion_rango: budget,
      calificacion_lead: calificacion,
      horario_preferido: horario,
      status: calificacion === "bajo" ? "no_calificado" : "nuevo_lead",
      source: "webchat",
      is_complete: false,
      current_step: 1,
      source_detail: {
        wa_stage: "advisor_notified",
        wa_tiene_fecha: hasDate,
        wa_fecha_texto: date ?? null,
        web_guests: guests,
      },
      wa_last_message_at: now,
      last_saved_at: now,
    })
    .select("id,nombres,telefono,tipo_evento,num_invitados,inversion_rango,calificacion_lead,horario_preferido")
    .single()

  if (error) {
    console.error("[webchat] Error creando lead:", error)
    return NextResponse.json({ error: "Error guardando lead" }, { status: 500 })
  }

  // Notificar al equipo por email (non-blocking)
  const notifyEmail = process.env.NOTIFY_EMAIL
  if (notifyEmail && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elromeral.com.mx"

    const { data: alertEmails } = await sb
      .from("alert_emails")
      .select("email")
      .eq("activo", true)

    const recipients = [
      notifyEmail,
      ...(alertEmails ?? []).map((e: { email: string }) => e.email),
    ].filter(Boolean)

    resend.emails.send({
      from: "El Romeral Bot <noreply@elromeral.com.mx>",
      to: recipients,
      subject: `🌐 Nuevo lead por Chat Web — ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#1a1a1a">Nuevo lead desde el Chat Web</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#666">Nombre</td><td><strong>${name}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#666">Teléfono</td><td><a href="https://wa.me/52${phone.replace(/\D/g, "")}">${phone}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666">Tipo de evento</td><td>${eventType}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Invitados</td><td>${guests}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Inversión estimada</td><td>${budget}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Calificación</td><td><strong>${calificacion}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#666">Fecha del evento</td><td>${date ?? "No definida"}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Horario / Cita</td><td>${horario ?? "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Canal</td><td>Chat Web (sitio)</td></tr>
          </table>
          <p style="margin-top:24px">
            <a href="${siteUrl}/admin/clientes/${lead.id}"
               style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;display:inline-block">
              Ver en el admin
            </a>
          </p>
        </div>
      `,
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true, leadId: lead.id })
}
