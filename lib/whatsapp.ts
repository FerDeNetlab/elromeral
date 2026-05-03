import { sanitizeHtml } from "@/lib/utils"

// ─── Etapas del funnel ──────────────────────────────────────────────────────
export type WaStage =
  | "welcome"
  | "collect_name"
  | "collect_event_type"
  | "needs_human"          // corporativo / social → asesora
  | "collect_date_yn"      // ¿tienes fecha?
  | "collect_date"         // captura la fecha
  | "collect_guests"       // rango de invitados
  | "collect_budget"       // rango de inversión
  | "budget_low_reconsider"// presupuesto bajo → ¿reconsideras?
  | "not_qualified"        // no reconsideró → fin
  | "collect_appointment"  // ¿en línea o que las contactemos?
  | "collect_schedule"     // ¿qué horario prefieren?
  | "calendly_sent"        // link enviado → fin bot
  | "advisor_notified"     // asesora notificada → fin bot
  | "completed"            // flujo terminado

export type EventType = "boda" | "xv_anos" | "bautizo" | "corporativo" | "social"
export type GuestRange = "50-100" | "100-150" | "150-200" | "200-250" | "250-300" | "300-350"
export type BudgetQualification = "bajo" | "medio" | "alto"

// ─── Datos del lead capturados por el bot ───────────────────────────────────
export interface WaLeadData {
  id: string
  slug: string
  nombres: string | null
  telefono: string | null
  num_invitados: number | null
  tipo_evento: string | null
  calificacion_lead: string | null
  inversion_rango: string | null
  reconsidero_presupuesto: boolean | null
  horario_preferido: string | null
  etiqueta_wa: string | null
  status: string | null
  source: string | null
  wa_last_message_at: string | null
  source_detail: WaSourceDetail | null
}

export interface WaSourceDetail {
  wa_stage: WaStage
  wa_tiene_fecha?: boolean
  wa_fecha_texto?: string
  wa_fecha_iso?: string
  wa_disponible?: boolean
  wa_rango_invitados?: GuestRange
  wa_conversation_history?: WaMessage[]
}

export interface WaMessage {
  role: "user" | "assistant"
  content: string
}

// ─── Mensajes entrantes de Meta ─────────────────────────────────────────────
export interface IncomingWhatsAppMessage {
  messageId: string
  from: string
  text: string
  profileName: string | null
  timestamp: string | null
}

// ─── Tabla de rangos de inversión por invitados ─────────────────────────────
export const BUDGET_RANGES: Record<GuestRange, { bajo: string; medio: string; alto: string }> = {
  "50-100":  { bajo: "menos de $280,000",      medio: "$280,000 – $450,000",  alto: "más de $450,000" },
  "100-150": { bajo: "menos de $370,000",      medio: "$370,000 – $650,000",  alto: "más de $650,000" },
  "150-200": { bajo: "menos de $460,000",      medio: "$460,000 – $750,000",  alto: "más de $750,000" },
  "200-250": { bajo: "menos de $550,000",      medio: "$550,000 – $800,000",  alto: "más de $800,000" },
  "250-300": { bajo: "menos de $700,000",      medio: "$700,000 – $900,000",  alto: "más de $900,000" },
  "300-350": { bajo: "menos de $850,000",      medio: "no disponible",        alto: "más de $850,000" },
}

export const GUEST_RANGE_LABELS: Record<GuestRange, string> = {
  "50-100":  "1️⃣ 50 – 100",
  "100-150": "2️⃣ 100 – 150",
  "150-200": "3️⃣ 150 – 200",
  "200-250": "4️⃣ 200 – 250",
  "250-300": "5️⃣ 250 – 300",
  "300-350": "6️⃣ 300 – 350",
}

export const CALENDLY_URL = "https://cal.com/ricardo-heredia-jxuu3m/presencial?overlayCalendar=true"

// ─── Utilidades ─────────────────────────────────────────────────────────────
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return ""
  return raw.replace(/[^0-9]/g, "")
}

export function generateWhatsAppLeadSlug(phone: string): string {
  const random = Math.random().toString(36).slice(2, 8)
  const suffix = phone.slice(-6) || "lead"
  return `wa-${suffix}-${random}`
}

export function appendToHistory(
  history: WaMessage[],
  role: "user" | "assistant",
  content: string,
  maxMessages = 20,
): WaMessage[] {
  const updated = [...history, { role, content }]
  return updated.slice(-maxMessages)
}

export function parseGuestRange(text: string): GuestRange | null {
  const n = text.trim()
  if (/^1$|50.?100/i.test(n)) return "50-100"
  if (/^2$|100.?150/i.test(n)) return "100-150"
  if (/^3$|150.?200/i.test(n)) return "150-200"
  if (/^4$|200.?250/i.test(n)) return "200-250"
  if (/^5$|250.?300/i.test(n)) return "250-300"
  if (/^6$|300.?350/i.test(n)) return "300-350"
  return null
}

export function guestRangeToApprox(range: GuestRange): number {
  const map: Record<GuestRange, number> = {
    "50-100": 75, "100-150": 125, "150-200": 175,
    "200-250": 225, "250-300": 275, "300-350": 325,
  }
  return map[range]
}

// ─── Parseo del payload de Meta ─────────────────────────────────────────────
export function extractIncomingMessages(payload: unknown): IncomingWhatsAppMessage[] {
  const p = payload as Record<string, unknown>
  const entries = Array.isArray(p?.entry) ? p.entry : []
  const messages: IncomingWhatsAppMessage[] = []

  for (const entry of entries) {
    const e = entry as Record<string, unknown>
    const changes = Array.isArray(e?.changes) ? e.changes : []
    for (const change of changes) {
      const c = change as Record<string, unknown>
      const value = c?.value as Record<string, unknown>
      const contacts = Array.isArray(value?.contacts) ? value.contacts : []
      const incoming = Array.isArray(value?.messages) ? value.messages : []

      for (const msg of incoming) {
        const m = msg as Record<string, unknown>
        const from = normalizePhone(String(m?.from ?? ""))
        const type = m?.type
        const rawText = type === "text" ? ((m?.text as Record<string, unknown>)?.body ?? "") : ""
        const messageId = String(m?.id ?? "")

        if (!from || !messageId) continue

        const contact0 = contacts[0] as Record<string, unknown>
        const profileRaw = (contact0?.profile as Record<string, unknown>)?.name
        const profileName = profileRaw ? sanitizeHtml(String(profileRaw)) : null
        const cleanText = sanitizeHtml(String(rawText)).trim()

        messages.push({
          messageId,
          from,
          text: cleanText,
          profileName,
          timestamp: m?.timestamp ? String(m.timestamp) : null,
        })
      }
    }
  }

  return messages
}

// ─── Envío de mensajes a Meta ────────────────────────────────────────────────
export async function sendWhatsAppTextMessage(params: {
  accessToken: string
  phoneNumberId: string
  to: string
  body: string
}): Promise<void> {
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v22.0"

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${params.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.to,
        type: "text",
        text: { body: params.body },
      }),
    },
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`WhatsApp send failed (${response.status}): ${details}`)
  }
}