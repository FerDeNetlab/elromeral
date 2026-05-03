import crypto from "node:crypto"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { waitUntil } from "@vercel/functions"
import {
  appendToHistory,
  extractIncomingMessages,
  generateWhatsAppLeadSlug,
  guestRangeToApprox,
  parseGuestRange,
  sendWhatsAppTextMessage,
  type WaLeadData,
  type WaMessage,
  type WaSourceDetail,
  type WaStage,
} from "@/lib/whatsapp"
import {
  buildAdvisorNotifiedMessage,
  buildAvailabilityMessage,
  buildBudgetOptionsMessage,
  buildCalendlyMessage,
  buildNeedsHumanMessage,
  buildWelcomeMessage,
  checkDateAvailability,
  extractDateFromText,
  generateBotResponse,
} from "@/lib/bot-engine"

// Dar hasta 60s para que Claude + Supabase + WhatsApp API completen
export const maxDuration = 60

// ─── Env helpers ─────────────────────────────────────────────────────────────
function getEnv() {
  return {
    verifyToken:  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    accessToken:  process.env.WHATSAPP_ACCESS_TOKEN!,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
    appSecret:    process.env.WHATSAPP_APP_SECRET,
    notifyEmail:  process.env.WHATSAPP_NOTIFY_EMAIL,
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase no configurado")
  return createClient(url, key)
}

// ─── Verificación de firma Meta ───────────────────────────────────────────────
function verifySignature(rawBody: string, sig: string | null, secret: string | undefined): boolean {
  if (!secret) return true
  if (!sig) return false
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

// ─── Persistencia de lead ─────────────────────────────────────────────────────
async function findLeadByPhone(phone: string): Promise<WaLeadData | null> {
  const sb = getSupabase()
  const { data } = await sb
    .from("quotes")
    .select("id,slug,nombres,telefono,num_invitados,tipo_evento,calificacion_lead,inversion_rango,reconsidero_presupuesto,horario_preferido,etiqueta_wa,status,source,wa_last_message_at,source_detail")
    .eq("telefono", phone)
    .eq("source", "whatsapp")
    .order("created_at", { ascending: false })
    .limit(1)

  return data && data.length > 0 ? (data[0] as WaLeadData) : null
}

async function createLead(phone: string, profileName: string | null): Promise<WaLeadData> {
  const sb = getSupabase()
  const slug = generateWhatsAppLeadSlug(phone)
  const now = new Date().toISOString()
  const detail: WaSourceDetail = { wa_stage: "welcome" }

  const { data, error } = await sb
    .from("quotes")
    .insert({
      slug,
      nombres: profileName ?? "Lead WhatsApp",
      email: null,
      telefono: phone,
      num_invitados: 0,
      status: "nuevo_lead",
      source: "whatsapp",
      is_complete: false,
      current_step: 1,
      source_detail: detail,
      wa_last_message_at: now,
      last_saved_at: now,
    })
    .select("id,slug,nombres,telefono,num_invitados,tipo_evento,calificacion_lead,inversion_rango,reconsidero_presupuesto,horario_preferido,etiqueta_wa,status,source,wa_last_message_at,source_detail")
    .single()

  if (error) throw new Error(`Error creando lead: ${error.message}`)
  return data as WaLeadData
}

async function updateLead(id: string, patch: Record<string, unknown>): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from("quotes").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error(`Error actualizando lead: ${error.message}`)
}

// ─── Idempotencia de mensajes ─────────────────────────────────────────────────
async function logMessage(
  messageId: string, phone: string, text: string, quoteId: string,
  direction: "inbound" | "outbound", stage: WaStage,
): Promise<boolean> {
  const sb = getSupabase()
  const { error } = await sb.from("whatsapp_messages").insert({
    message_id: messageId,
    phone,
    text,
    quote_id: quoteId,
    direction,
    wa_stage: stage,
    payload: {},
  })
  // 23505 = unique violation → mensaje duplicado
  if (error?.code === "23505") return false
  // 42P01 = tabla no existe todavía → ignorar
  if (error?.code === "42P01") return true
  if (error) throw new Error(`Error guardando mensaje: ${error.message}`)
  return true
}

// ─── Notificación de asesora vía email + push ─────────────────────────────────
async function notifyAdvisor(lead: WaLeadData): Promise<void> {
  const { notifyEmail } = getEnv()
  const nombre = lead.nombres ?? "Sin nombre"

  // Push notification (non-blocking)
  import("@/lib/push-notify").then(({ sendPushToAll }) => {
    sendPushToAll(
      "Nuevo lead calificado",
      `${nombre} · ${lead.tipo_evento ?? ""} · ${lead.num_invitados ? lead.num_invitados + " inv." : ""}`,
      `/admin/whatsapp/${lead.telefono}`
    ).catch(console.error)
  }).catch(console.error)

  if (!notifyEmail || !process.env.RESEND_API_KEY) return

  const sb = getSupabase()
  const { data: alertEmails } = await sb
    .from("alert_emails")
    .select("email")
    .eq("activo", true)

  const recipients = [
    notifyEmail,
    ...(alertEmails ?? []).map((e: { email: string }) => e.email),
  ].filter(Boolean)

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: "El Romeral Bot <noreply@elromeral.com.mx>",
    to: recipients,
    subject: `🟢 Lead calificado por WhatsApp — ${nombre}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#1a1a1a">Nuevo lead calificado por WhatsApp</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#666">Nombre</td><td><strong>${nombre}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666">Teléfono</td><td><a href="https://wa.me/${lead.telefono}">${lead.telefono}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666">Tipo de evento</td><td>${lead.tipo_evento ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Invitados</td><td>${lead.num_invitados ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Inversión</td><td>${lead.inversion_rango ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Calificación</td><td><strong>${lead.calificacion_lead ?? "—"}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666">Horario preferido</td><td>${lead.horario_preferido ?? "—"}</td></tr>
        </table>
        <p style="margin-top:24px">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://elromeral.com.mx"}/admin/whatsapp/${lead.telefono}"
             style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;display:inline-block">
            Ver conversación en el admin
          </a>
        </p>
      </div>
    `,
  })
}

// ─── Motor principal del funnel ───────────────────────────────────────────────
async function runFunnel(
  lead: WaLeadData,
  userMessage: string,
  phone: string,
): Promise<string> {
  const { accessToken, phoneNumberId } = getEnv()
  const detail = (lead.source_detail ?? {}) as WaSourceDetail
  const stage: WaStage = detail.wa_stage ?? "welcome"
  const history: WaMessage[] = detail.wa_conversation_history ?? []
  const nombre = lead.nombres && !lead.nombres.startsWith("Lead WhatsApp") ? lead.nombres : null

  // Etapas terminales: ignorar mensajes nuevos del bot, respuesta cortés
  if (["not_qualified", "calendly_sent", "advisor_notified", "completed"].includes(stage)) {
    return `Gracias por escribir${nombre ? `, ${nombre}` : ""}. Si necesitas algo más, aquí estaremos. 🤍`
  }

  // Etapa needs_human: el bot se detiene, asesora responde manualmente
  if (stage === "needs_human") {
    return `Gracias por tu mensaje${nombre ? `, ${nombre}` : ""}. Una asesora te atenderá en breve. 🤍`
  }

  // ── Bienvenida (primer mensaje) ──
  if (stage === "welcome") {
    const welcomeText = buildWelcomeMessage()
    const newDetail: WaSourceDetail = {
      ...detail,
      wa_stage: "collect_name",
      wa_conversation_history: appendToHistory(history, "assistant", welcomeText),
    }
    await updateLead(lead.id, { source_detail: newDetail, wa_last_message_at: new Date().toISOString() })
    return welcomeText
  }

  // ── Para todas las demás etapas: Claude genera respuesta y extrae datos ──
  const response = await generateBotResponse(lead, userMessage, history)
  const ex = response.extracted
  const newHistory = appendToHistory(
    appendToHistory(history, "user", userMessage),
    "assistant",
    response.text,
  )

  // Determinar siguiente etapa real (puede diferir de lo que Claude sugirió)
  let nextStage: WaStage = ex.next_stage ?? stage
  const patch: Record<string, unknown> = {
    source_detail: { ...detail, wa_stage: nextStage, wa_conversation_history: newHistory } as WaSourceDetail,
    wa_last_message_at: new Date().toISOString(),
  }

  // Procesar datos extraídos por Claude
  if (ex.nombre) patch.nombres = ex.nombre

  if (ex.tipo_evento) {
    patch.tipo_evento = ex.tipo_evento
    if (ex.tipo_evento === "corporativo" || ex.tipo_evento === "social") {
      nextStage = "needs_human"
      const humanMsg = buildNeedsHumanMessage(ex.nombre ?? nombre)
      patch.etiqueta_wa = "needs_human"
      ;(patch.source_detail as WaSourceDetail).wa_stage = "needs_human"
      await updateLead(lead.id, patch)
      await notifyAdvisor({ ...lead, ...patch } as WaLeadData)
      return humanMsg
    }
  }

  if (ex.tiene_fecha !== undefined) {
    ;(patch.source_detail as WaSourceDetail).wa_tiene_fecha = ex.tiene_fecha
  }

  if (ex.fecha_texto && (stage === "collect_date" || stage === "collect_date_yn")) {
    ;(patch.source_detail as WaSourceDetail).wa_fecha_texto = ex.fecha_texto
    // Intentar extraer fecha ISO y verificar disponibilidad
    const fechaISO = await extractDateFromText(ex.fecha_texto)
    if (fechaISO) {
      const available = await checkDateAvailability(fechaISO)
      ;(patch.source_detail as WaSourceDetail).wa_fecha_iso = fechaISO
      ;(patch.source_detail as WaSourceDetail).wa_disponible = available
      // El mensaje de disponibilidad lo generamos nosotros (no Claude) para que sea preciso
      nextStage = "collect_guests"
      ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_guests"
      await updateLead(lead.id, patch)
      return buildAvailabilityMessage(ex.nombre ?? nombre, available, fechaISO)
    }
  }

  if (ex.rango_invitados) {
    ;(patch.source_detail as WaSourceDetail).wa_rango_invitados = ex.rango_invitados
    patch.num_invitados = guestRangeToApprox(ex.rango_invitados)
    // Si tenemos rango de invitados, SIEMPRE avanzar a collect_budget
    const budgetMsg = buildBudgetOptionsMessage(ex.nombre ?? nombre, ex.rango_invitados)
    ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_budget"
    await updateLead(lead.id, patch)
    return budgetMsg
  }

  if (ex.budget_qualification) {
    patch.calificacion_lead = ex.budget_qualification
    if (ex.inversion_rango) patch.inversion_rango = ex.inversion_rango

    if (ex.budget_qualification === "bajo") {
      nextStage = "budget_low_reconsider"
      ;(patch.source_detail as WaSourceDetail).wa_stage = "budget_low_reconsider"
    } else {
      // medio o alto → calificado
      nextStage = "collect_appointment"
      ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_appointment"
    }
  }

  if (ex.quiere_reconsiderar === false && stage === "budget_low_reconsider") {
    nextStage = "not_qualified"
    patch.etiqueta_wa = "not_qualified"
    ;(patch.source_detail as WaSourceDetail).wa_stage = "not_qualified"
  }

  if (ex.quiere_reconsiderar === true && stage === "budget_low_reconsider") {
    nextStage = "collect_budget"
    ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_budget"
    await updateLead(lead.id, patch)
    const guestRange = detail.wa_rango_invitados ?? "150-200"
    return buildBudgetOptionsMessage(ex.nombre ?? nombre, guestRange)
  }

  if (stage === "collect_appointment") {
    if (ex.quiere_calendly) {
      nextStage = "calendly_sent"
      patch.etiqueta_wa = "calendly_sent"
      patch.calificacion_lead = lead.calificacion_lead ?? ex.budget_qualification
      ;(patch.source_detail as WaSourceDetail).wa_stage = "calendly_sent"
      await updateLead(lead.id, patch)
      await notifyAdvisor({ ...lead, ...patch } as WaLeadData)
      return buildCalendlyMessage(ex.nombre ?? nombre)
    } else {
      nextStage = "advisor_notified"
      patch.etiqueta_wa = "advisor_notified"
      if (ex.horario_preferido) patch.horario_preferido = ex.horario_preferido
      ;(patch.source_detail as WaSourceDetail).wa_stage = "advisor_notified"
      await updateLead(lead.id, patch)
      await notifyAdvisor({ ...lead, ...patch } as WaLeadData)
      return buildAdvisorNotifiedMessage(ex.nombre ?? nombre)
    }
  }

  // Actualizar stage final
  ;(patch.source_detail as WaSourceDetail).wa_stage = nextStage
  await updateLead(lead.id, patch)
  return response.text
}

// ─── Enviar respuesta y loguear outbound ─────────────────────────────────────
async function sendAndLog(
  phone: string, text: string, lead: WaLeadData, stage: WaStage,
): Promise<void> {
  const { accessToken, phoneNumberId } = getEnv()
  await sendWhatsAppTextMessage({ accessToken, phoneNumberId, to: phone, body: text })
  await logMessage(
    `out-${Date.now()}-${phone}`, phone, text, lead.id, "outbound", stage,
  ).catch(() => {/* outbound log no es crítico */})
}

// ─── GET: verificación del webhook con Meta ───────────────────────────────────
export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode      = url.searchParams.get("hub.mode")
  const token     = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")
  const { verifyToken } = getEnv()

  if (mode === "subscribe" && token && verifyToken && token === verifyToken) {
    return new NextResponse(challenge ?? "", { status: 200 })
  }
  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 })
}

// ─── POST: mensajes entrantes de Meta ────────────────────────────────────────
export async function POST(request: Request) {
  const rawBody = await request.text()
  const sig     = request.headers.get("x-hub-signature-256")
  const { appSecret } = getEnv()

  if (!verifySignature(rawBody, sig, appSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  // Procesar en background manteniendo la función viva con waitUntil
  waitUntil(
    (async () => {
      try {
        const payload  = JSON.parse(rawBody)
        const incoming = extractIncomingMessages(payload)

        for (const msg of incoming) {
          if (!msg.text) continue

          let lead = await findLeadByPhone(msg.from)
          if (!lead) {
            lead = await createLead(msg.from, msg.profileName)
          }

          const stage: WaStage = (lead.source_detail as WaSourceDetail)?.wa_stage ?? "welcome"

          const shouldProcess = await logMessage(msg.messageId, msg.from, msg.text, lead.id, "inbound", stage)
          if (!shouldProcess) continue

          const replyText = await runFunnel(lead, msg.text, msg.from)
          const updatedLead = await findLeadByPhone(msg.from)
          const currentStage: WaStage = (updatedLead?.source_detail as WaSourceDetail)?.wa_stage ?? stage
          await sendAndLog(msg.from, replyText, updatedLead ?? lead, currentStage)
        }
      } catch (err) {
        console.error("[whatsapp-webhook]", err)
      }
    })()
  )

  return NextResponse.json({ success: true })
}
