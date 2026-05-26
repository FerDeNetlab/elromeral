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
  sendWhatsAppTextMessage,
  type WaLeadData,
  type WaMessage,
  type WaSourceDetail,
  type WaStage,
} from "@/lib/whatsapp"
import {
  buildAdvisorNotifiedMessage,
  buildAfterNameMessage,
  buildAvailabilityMessage,
  buildBudgetLowCloseMessage,
  buildBudgetLowReconsiderMessage,
  buildBudgetOptionsMessage,
  buildBudgetQualifiedMessage,
  buildBudgetReconsiderReturnMessage,
  buildCalendlyMessage,
  buildCollectDateMessage,
  buildCollectGuestsMessage,
  buildCollectScheduleMessage,
  buildDateYnMessage,
  buildGuestEmotionalMessage,
  buildNeedsHumanMessage,
  buildNoDateMessage,
  buildNotQualifiedMessage,
  buildPriceDeflectMessage,
  buildSearchingDateMessage,
  buildWelcomeMessage,
  buildAskDateYearMessage,
  checkDateAvailability,
  extractDateFromText,
  generateBotResponse,
} from "@/lib/bot-engine"
import {
  classifyBudget,
  detectDateHint,
  dateTextHasYear,
  parseBudgetOption,
  parseCalendlyIntent,
  parseEventType,
  parseGuestRangeFromText,
  parseMXNAmount,
  parseScheduleHint,
  parseYesNo,
} from "@/lib/parse-wa-input"

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

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// ─── Motor principal del funnel ───────────────────────────────────────────────
// Arquitectura: fast paths determinísticos para inputs claros → Claude como
// motor primario para collect_name y todos los casos ambiguos. Claude decide
// next_stage y extrae datos estructurados; los datos se aplican completamente.
async function runFunnel(
  lead: WaLeadData,
  userMessage: string,
  phone: string,
): Promise<string> {
  const detail = (lead.source_detail ?? {}) as WaSourceDetail
  const stage: WaStage = detail.wa_stage ?? "welcome"
  const history: WaMessage[] = detail.wa_conversation_history ?? []
  const nombre = lead.nombres && !lead.nombres.startsWith("Lead WhatsApp") ? lead.nombres : null

  // ── Etapas terminales: bot silencioso ──
  if (["not_qualified", "calendly_sent", "advisor_notified", "needs_human", "completed"].includes(stage)) {
    return ""
  }

  // ── Bienvenida ──
  if (stage === "welcome") {
    const msg = buildWelcomeMessage()
    await updateLead(lead.id, {
      source_detail: { ...detail, wa_stage: "collect_name", wa_conversation_history: appendToHistory(history, "assistant", msg) } as WaSourceDetail,
      wa_last_message_at: new Date().toISOString(),
    })
    return msg
  }

  // ══════════════════════════════════════════════════════════════════════
  // FAST PATHS — parsers determinísticos para inputs claros.
  // Si el input es ambiguo, caen al motor Claude al final.
  // ══════════════════════════════════════════════════════════════════════

  // ── collect_schedule: siempre determinístico (cualquier respuesta → advisor) ──
  if (stage === "collect_schedule") {
    const trimmed = userMessage.trim()
    const horario = trimmed === "1" ? "mañana (9:00 – 13:00)"
      : trimmed === "2" ? "tarde (14:00 – 18:00)"
      : trimmed === "3" ? "noche (18:00 – 20:00)"
      : parseScheduleHint(userMessage) ?? trimmed
    const msg = buildAdvisorNotifiedMessage(nombre)
    const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
    await updateLead(lead.id, {
      horario_preferido: horario,
      etiqueta_wa: "advisor_notified",
      source_detail: { ...detail, wa_stage: "advisor_notified", wa_conversation_history: newHist } as WaSourceDetail,
      wa_last_message_at: new Date().toISOString(),
    })
    await notifyAdvisor(lead)
    return msg
  }

  // ── collect_event_type ──
  if (stage === "collect_event_type") {
    const eventType = parseEventType(userMessage)
    if (eventType) {
      const isHuman = eventType === "corporativo" || eventType === "social"
      const nextSt: WaStage = isHuman ? "needs_human" : "collect_date_yn"
      const msg = isHuman ? buildNeedsHumanMessage(nombre) : buildDateYnMessage(nombre)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      const patch: Record<string, unknown> = {
        tipo_evento: eventType,
        source_detail: { ...detail, wa_stage: nextSt, wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      }
      if (isHuman) patch.etiqueta_wa = "needs_human"
      await updateLead(lead.id, patch)
      if (isHuman) await notifyAdvisor({ ...lead, ...patch } as WaLeadData)
      return msg
    }
  }

  // ── collect_date_yn ──
  if (stage === "collect_date_yn") {
    const yn = parseYesNo(userMessage)
    if (yn !== false && detectDateHint(userMessage)) {
      if (!dateTextHasYear(userMessage)) {
        const msg = buildAskDateYearMessage(nombre, userMessage)
        const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
        await updateLead(lead.id, {
          source_detail: { ...detail, wa_stage: "collect_date", wa_tiene_fecha: true, wa_fecha_texto: userMessage, wa_conversation_history: newHist } as WaSourceDetail,
          wa_last_message_at: new Date().toISOString(),
        })
        return msg
      }
      const fechaISO = await extractDateFromText(userMessage)
      if (fechaISO) {
        await sendWhatsAppTextMessage({ accessToken: getEnv().accessToken, phoneNumberId: getEnv().phoneNumberId, to: phone, body: buildSearchingDateMessage() })
        const available = await checkDateAvailability(fechaISO)
        const msg = buildAvailabilityMessage(nombre, available, fechaISO)
        const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
        await updateLead(lead.id, {
          source_detail: { ...detail, wa_stage: "collect_guests", wa_tiene_fecha: true, wa_fecha_texto: userMessage, wa_fecha_iso: fechaISO, wa_disponible: available, wa_conversation_history: newHist } as WaSourceDetail,
          wa_last_message_at: new Date().toISOString(),
        })
        return msg
      }
    }
    if (yn === true) {
      const msg = buildCollectDateMessage(nombre)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, {
        source_detail: { ...detail, wa_stage: "collect_date", wa_tiene_fecha: true, wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      return msg
    }
    if (yn === false) {
      const msg = buildNoDateMessage(nombre)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, {
        source_detail: { ...detail, wa_stage: "collect_guests", wa_tiene_fecha: false, wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      return msg
    }
  }

  // ── collect_date ──
  if (stage === "collect_date" && detectDateHint(userMessage)) {
    if (!dateTextHasYear(userMessage)) {
      const msg = buildAskDateYearMessage(nombre, userMessage)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, {
        source_detail: { ...detail, wa_stage: "collect_date", wa_fecha_texto: userMessage, wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      return msg
    }
    const fechaISO = await extractDateFromText(userMessage)
    if (fechaISO) {
      await sendWhatsAppTextMessage({ accessToken: getEnv().accessToken, phoneNumberId: getEnv().phoneNumberId, to: phone, body: buildSearchingDateMessage() })
      const available = await checkDateAvailability(fechaISO)
      const msg = buildAvailabilityMessage(nombre, available, fechaISO)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, {
        source_detail: { ...detail, wa_stage: "collect_guests", wa_tiene_fecha: true, wa_fecha_texto: userMessage, wa_fecha_iso: fechaISO, wa_disponible: available, wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      return msg
    }
  }

  // ── collect_guests ──
  if (stage === "collect_guests") {
    const guestRange = parseGuestRangeFromText(userMessage)
    if (guestRange) {
      const emotionalMsg = buildGuestEmotionalMessage(nombre, guestRange)
      const budgetMsg = buildBudgetOptionsMessage(nombre, guestRange)
      const combined = `${emotionalMsg}\n\n${budgetMsg}`
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", combined)
      await updateLead(lead.id, {
        num_invitados: guestRangeToApprox(guestRange),
        source_detail: { ...detail, wa_stage: "collect_budget", wa_rango_invitados: guestRange, wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      return combined
    }
  }

  // ── collect_budget ──
  if (stage === "collect_budget") {
    const guestRange = detail.wa_rango_invitados ?? "150-200"
    const isReconsider = detail.wa_reconsidero === true
    let qualification = parseBudgetOption(userMessage)
    if (isReconsider && qualification === "bajo") qualification = null
    if (isReconsider) {
      const t = userMessage.trim()
      if (/^1$/.test(t)) qualification = "medio"
      else if (/^2$/.test(t)) qualification = "alto"
    }
    if (!qualification) {
      const amount = parseMXNAmount(userMessage)
      if (amount) qualification = classifyBudget(amount, guestRange)
      if (isReconsider && qualification === "bajo") qualification = null
    }
    if (qualification) {
      if (qualification === "bajo") {
        const msg = buildBudgetLowReconsiderMessage(nombre, guestRange)
        const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
        await updateLead(lead.id, {
          calificacion_lead: qualification,
          source_detail: { ...detail, wa_stage: "budget_low_reconsider", wa_conversation_history: newHist } as WaSourceDetail,
          wa_last_message_at: new Date().toISOString(),
        })
        return msg
      } else {
        const msg = buildBudgetQualifiedMessage(nombre)
        const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
        await updateLead(lead.id, {
          calificacion_lead: qualification,
          source_detail: { ...detail, wa_stage: "collect_appointment", wa_conversation_history: newHist } as WaSourceDetail,
          wa_last_message_at: new Date().toISOString(),
        })
        return msg
      }
    }
  }

  // ── budget_low_reconsider ──
  if (stage === "budget_low_reconsider") {
    const guestRange = detail.wa_rango_invitados ?? "150-200"
    const answer = parseYesNo(userMessage)
    const isYes = answer === true || /^1$|reconsider/.test(userMessage.toLowerCase().trim())
    const isNo = answer === false || /^2$/.test(userMessage.trim())
    if (isYes) {
      const msg = buildBudgetReconsiderReturnMessage(nombre, guestRange)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, {
        source_detail: { ...detail, wa_stage: "collect_budget", wa_reconsidero: true, wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      return msg
    }
    if (isNo) {
      const msg = buildBudgetLowCloseMessage(nombre)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, {
        etiqueta_wa: "not_qualified",
        source_detail: { ...detail, wa_stage: "not_qualified", wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      return msg
    }
  }

  // ── collect_appointment ──
  if (stage === "collect_appointment") {
    if (parseCalendlyIntent(userMessage) || /^2$/.test(userMessage.trim())) {
      const msg = buildCalendlyMessage(nombre)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, {
        etiqueta_wa: "calendly_sent",
        source_detail: { ...detail, wa_stage: "calendly_sent", wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      await notifyAdvisor(lead)
      return msg
    }
    if (/^1$/.test(userMessage.trim()) || /asesor|contacten|contacte|llamen|llámenme|me\s*contacten|prefer[io]\s*(que|un)|me\s*avisan/.test(userMessage.toLowerCase())) {
      const msg = buildCollectScheduleMessage(nombre)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, {
        source_detail: { ...detail, wa_stage: "collect_schedule", wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      return msg
    }
    const scheduleHint = parseScheduleHint(userMessage)
    if (scheduleHint) {
      const msg = buildAdvisorNotifiedMessage(nombre)
      const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, {
        horario_preferido: scheduleHint,
        etiqueta_wa: "advisor_notified",
        source_detail: { ...detail, wa_stage: "advisor_notified", wa_conversation_history: newHist } as WaSourceDetail,
        wa_last_message_at: new Date().toISOString(),
      })
      await notifyAdvisor(lead)
      return msg
    }
  }

  // ── Desvío de preguntas de precio (universal) ──
  if (/precio|paquete|costo|cu[áa]nto|renta|tarifa|cotiza|informes|m[áa]s\s+info|m[áa]s\s+informaci[oó]n/.test(userMessage.toLowerCase())) {
    const msg = buildPriceDeflectMessage(nombre)
    const newHist = appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
    await updateLead(lead.id, {
      source_detail: { ...detail, wa_conversation_history: newHist } as WaSourceDetail,
      wa_last_message_at: new Date().toISOString(),
    })
    return msg
  }

  // ══════════════════════════════════════════════════════════════════════
  // MOTOR CLAUDE — Motor primario para collect_name y todos los casos
  // que no resolvieron los fast paths. Aplica TODOS los campos extraídos.
  // ══════════════════════════════════════════════════════════════════════

  const response = await generateBotResponse(lead, userMessage, history)
  const ex = response.extracted
  const effectiveName = ex.nombre ?? nombre

  // Patch base — se irá llenando con los campos extraídos
  const patch: Record<string, unknown> = {
    source_detail: { ...detail } as WaSourceDetail,
    wa_last_message_at: new Date().toISOString(),
  }
  if (ex.nombre) patch.nombres = ex.nombre

  // — collect_name: Claude extrajo nombre → mensaje predefinido —
  if (stage === "collect_name") {
    const detectedName = ex.nombre ?? nombre ?? "amigo"
    const msg = buildAfterNameMessage(detectedName)
    patch.nombres = detectedName
    ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_event_type"
    ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
      appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
    await updateLead(lead.id, patch)
    return msg
  }

  // — Tipo de evento (fallback Claude) —
  if (ex.tipo_evento) {
    patch.tipo_evento = ex.tipo_evento
    if (ex.tipo_evento === "corporativo" || ex.tipo_evento === "social") {
      const msg = buildNeedsHumanMessage(effectiveName)
      patch.etiqueta_wa = "needs_human"
      ;(patch.source_detail as WaSourceDetail).wa_stage = "needs_human"
      ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
        appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, patch)
      await notifyAdvisor({ ...lead, ...patch } as WaLeadData)
      return msg
    }
  }

  // — Fecha (fallback Claude) —
  if (ex.tiene_fecha !== undefined) {
    ;(patch.source_detail as WaSourceDetail).wa_tiene_fecha = ex.tiene_fecha
  }
  if (ex.fecha_texto) {
    ;(patch.source_detail as WaSourceDetail).wa_fecha_texto = ex.fecha_texto
    if (!dateTextHasYear(ex.fecha_texto)) {
      const msg = buildAskDateYearMessage(effectiveName, ex.fecha_texto)
      ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_date"
      ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
        appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, patch)
      return msg
    }
    const fechaISO = await extractDateFromText(ex.fecha_texto)
    if (fechaISO) {
      await sendWhatsAppTextMessage({ accessToken: getEnv().accessToken, phoneNumberId: getEnv().phoneNumberId, to: phone, body: buildSearchingDateMessage() })
      const available = await checkDateAvailability(fechaISO)
      const msg = buildAvailabilityMessage(effectiveName, available, fechaISO)
      ;(patch.source_detail as WaSourceDetail).wa_fecha_iso = fechaISO
      ;(patch.source_detail as WaSourceDetail).wa_disponible = available
      ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_guests"
      ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
        appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, patch)
      return msg
    }
  }

  // — Invitados (fallback Claude para collect_guests) —
  if (ex.rango_invitados && stage === "collect_guests") {
    const emotionalMsg = buildGuestEmotionalMessage(effectiveName, ex.rango_invitados)
    const budgetMsg = buildBudgetOptionsMessage(effectiveName, ex.rango_invitados)
    const combined = `${emotionalMsg}\n\n${budgetMsg}`
    patch.num_invitados = guestRangeToApprox(ex.rango_invitados)
    ;(patch.source_detail as WaSourceDetail).wa_rango_invitados = ex.rango_invitados
    ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_budget"
    ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
      appendToHistory(appendToHistory(history, "user", userMessage), "assistant", combined)
    await updateLead(lead.id, patch)
    return combined
  }

  // — Presupuesto (fallback Claude para collect_budget) —
  if (ex.budget_qualification && stage === "collect_budget") {
    const guestRange = detail.wa_rango_invitados ?? "150-200"
    patch.calificacion_lead = ex.budget_qualification
    if (ex.budget_qualification === "bajo") {
      const msg = buildBudgetLowReconsiderMessage(effectiveName, guestRange)
      ;(patch.source_detail as WaSourceDetail).wa_stage = "budget_low_reconsider"
      ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
        appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, patch)
      return msg
    } else {
      const msg = buildBudgetQualifiedMessage(effectiveName)
      ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_appointment"
      ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
        appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, patch)
      return msg
    }
  }

  // — Reconsideración (fallback Claude para budget_low_reconsider) —
  if (stage === "budget_low_reconsider" && ex.quiere_reconsiderar !== undefined) {
    const guestRange = detail.wa_rango_invitados ?? "150-200"
    if (ex.quiere_reconsiderar) {
      const msg = buildBudgetReconsiderReturnMessage(effectiveName, guestRange)
      ;(patch.source_detail as WaSourceDetail).wa_stage = "collect_budget"
      ;(patch.source_detail as WaSourceDetail).wa_reconsidero = true
      ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
        appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, patch)
      return msg
    } else {
      const msg = buildBudgetLowCloseMessage(effectiveName)
      patch.etiqueta_wa = "not_qualified"
      ;(patch.source_detail as WaSourceDetail).wa_stage = "not_qualified"
      ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
        appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, patch)
      return msg
    }
  }

  // — Cita (fallback Claude para collect_appointment) —
  if (stage === "collect_appointment") {
    if (ex.quiere_calendly) {
      const msg = buildCalendlyMessage(effectiveName)
      patch.etiqueta_wa = "calendly_sent"
      ;(patch.source_detail as WaSourceDetail).wa_stage = "calendly_sent"
      ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
        appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, patch)
      await notifyAdvisor({ ...lead, ...patch } as WaLeadData)
      return msg
    }
    if (ex.next_stage === "advisor_notified" || ex.horario_preferido) {
      const msg = buildAdvisorNotifiedMessage(effectiveName)
      patch.etiqueta_wa = "advisor_notified"
      if (ex.horario_preferido) patch.horario_preferido = ex.horario_preferido
      ;(patch.source_detail as WaSourceDetail).wa_stage = "advisor_notified"
      ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
        appendToHistory(appendToHistory(history, "user", userMessage), "assistant", msg)
      await updateLead(lead.id, patch)
      await notifyAdvisor({ ...lead, ...patch } as WaLeadData)
      return msg
    }
  }

  // — Horario si Claude lo extrajo en otras etapas —
  if (ex.horario_preferido) patch.horario_preferido = ex.horario_preferido

  // — Default: aplicar next_stage de Claude y devolver su texto —
  const nextStage: WaStage = ex.next_stage ?? stage
  ;(patch.source_detail as WaSourceDetail).wa_stage = nextStage
  ;(patch.source_detail as WaSourceDetail).wa_conversation_history =
    appendToHistory(appendToHistory(history, "user", userMessage), "assistant", response.text)
  await updateLead(lead.id, patch)
  return response.text
}

// ─── Enviar respuesta y loguear outbound ─────────────────────────────────────
async function sendAndLog(
  phone: string, text: string, lead: WaLeadData, stage: WaStage,
): Promise<void> {
  const { accessToken, phoneNumberId } = getEnv()
  // Deduplicar mensajes outbound: ventana de 30s por contenido → evita duplicados
  // cuando Meta reintenta el webhook o hay dos procesos concurrentes
  const window30s = Math.floor(Date.now() / 30_000)
  const contentHash = crypto
    .createHash("sha256")
    .update(`${phone}:${text}:${window30s}`)
    .digest("hex")
    .slice(0, 24)
  const outboundId = `out-${contentHash}`

  // Loguear primero; si es duplicado, omitir el envío
  const shouldSend = await logMessage(outboundId, phone, text, lead.id, "outbound", stage)
    .catch(() => true) // ante error de log, priorizar el envío
  if (!shouldSend) return

  await sendWhatsAppTextMessage({ accessToken, phoneNumberId, to: phone, body: text })
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
          if (!replyText) continue // etapa terminal: bot silencioso
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
