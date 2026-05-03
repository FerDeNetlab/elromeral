import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"
import {
  BUDGET_RANGES,
  CALENDLY_URL,
  type BudgetQualification,
  type GuestRange,
  type WaLeadData,
  type WaMessage,
  type WaStage,
} from "@/lib/whatsapp"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── System prompt del bot ───────────────────────────────────────────────────
function buildSystemPrompt(lead: WaLeadData): string {
  const nombre = lead.nombres && !lead.nombres.startsWith("Lead WhatsApp") ? lead.nombres : null
  const detail = lead.source_detail ?? {}
  const stage: WaStage = detail.wa_stage ?? "welcome"

  const context = [
    nombre ? `Nombre del prospecto: ${nombre}` : "Aún no sabemos el nombre del prospecto.",
    lead.tipo_evento ? `Tipo de evento: ${lead.tipo_evento}` : "",
    detail.wa_tiene_fecha !== undefined ? `Tiene fecha: ${detail.wa_tiene_fecha ? "sí" : "no"}` : "",
    detail.wa_fecha_texto ? `Fecha mencionada: ${detail.wa_fecha_texto}` : "",
    detail.wa_disponible !== undefined ? `Disponibilidad: ${detail.wa_disponible ? "disponible" : "no disponible"}` : "",
    detail.wa_rango_invitados ? `Rango de invitados: ${detail.wa_rango_invitados}` : "",
    lead.inversion_rango ? `Rango de inversión: ${lead.inversion_rango}` : "",
    lead.calificacion_lead ? `Calificación: ${lead.calificacion_lead}` : "",
    `Etapa actual del funnel: ${stage}`,
  ].filter(Boolean).join("\n")

  return `Eres la asistente virtual de El Romeral – Diseño de Experiencias Integrales, un jardín de bodas premium en Guadalajara, México.

Tu misión es convertir cada conversación en una cita presencial con un prospecto calificado, siguiendo un guión estructurado. Tu tono es cálido, elegante, cercano y profesional. Usas emojis con moderación. SIEMPRE personalizas los mensajes con el nombre del prospecto cuando lo tienes.

IDENTIDAD DE MARCA:
El Romeral no es "un lugar para eventos". Es un equipo integral que diseña, coordina y resuelve cada detalle de principio a fin para que los novios vivan una celebración extraordinaria. Nunca uses términos como "renta", "salón" o "paquetes".

INFORMACIÓN DE CONTEXTO ACTUAL:
${context}

TABLA DE RANGOS DE INVERSIÓN (úsala cuando alguien pregunte precios):
| Invitados  | Rango Bajo         | Rango Medio         | Rango Alto        |
|------------|--------------------|---------------------|-------------------|
| 50 – 100   | < $280,000         | $280k – $450k       | > $450k           |
| 100 – 150  | < $370,000         | $370k – $650k       | > $650k           |
| 150 – 200  | < $460,000         | $460k – $750k       | > $750k           |
| 200 – 250  | < $550,000         | $550k – $800k       | > $800k           |
| 250 – 300  | < $700,000         | $700k – $900k       | > $900k           |
| 300 – 350  | < $850,000         | —                   | > $850k           |

Si alguien insiste en precios antes de llegar a esa etapa, puedes dar rangos referenciales según los invitados que ya mencionaron, pero SIEMPRE redirige hacia la cita: "el desglose exacto lo armamos juntos en la cita".

REGLAS ABSOLUTAS:
1. Nunca inventes fechas, precios exactos ni disponibilidad — esa información te la pasa el sistema.
2. Nunca salgas del funnel sin completar las etapas pendientes.
3. Si alguien pregunta algo fuera del flujo (estacionamiento, ubicación, etc.), responde brevemente con elegancia y regresa al funnel.
4. Los mensajes deben ser cortos y claros. Un mensaje = un solo punto o pregunta.
5. Si el prospecto da respuestas ambiguas, interprétalas con generosidad y avanza, no pidas confirmación en exceso.

ETAPA ACTUAL: ${stage}
Genera ÚNICAMENTE el texto del siguiente mensaje de WhatsApp. Sin saludos extra, sin explicaciones, sin formato markdown. Solo el texto listo para enviar.`
}

// ─── Verificar disponibilidad en blocked_dates ───────────────────────────────
export async function checkDateAvailability(dateISO: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return true

  const supabase = createClient(url, key)

  // Misma lógica que el configurador: ±6 días alrededor de cada fecha bloqueada
  const target = new Date(dateISO + "T00:00:00")
  const { data } = await supabase.from("blocked_dates").select("date")

  if (!data || data.length === 0) return true

  for (const row of data) {
    const blocked = new Date(row.date + "T00:00:00")
    const diffDays = Math.abs((target.getTime() - blocked.getTime()) / 86_400_000)
    if (diffDays <= 7) return false
  }

  return true
}

// ─── Intentar parsear una fecha del texto libre ──────────────────────────────
export async function extractDateFromText(text: string): Promise<string | null> {
  try {
    const today = new Date().toISOString().split("T")[0]
    const result = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `El usuario escribió: "${text}"\nFecha de hoy: ${today}\nExtrae la fecha del evento en formato YYYY-MM-DD. Si no puedes determinar una fecha, responde null. Solo responde con la fecha o null, nada más.`,
        },
      ],
    })
    const raw = (result.content[0] as { type: string; text: string }).text.trim()
    if (raw === "null" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
    return raw
  } catch {
    return null
  }
}

// ─── Generar respuesta del bot con Claude ────────────────────────────────────
export interface BotResponse {
  text: string
  extracted: {
    nombre?: string
    tipo_evento?: "boda" | "xv_anos" | "bautizo" | "corporativo" | "social"
    tiene_fecha?: boolean
    fecha_texto?: string
    fecha_iso?: string
    rango_invitados?: GuestRange
    budget_qualification?: BudgetQualification
    inversion_rango?: string
    quiere_reconsiderar?: boolean
    quiere_calendly?: boolean
    horario_preferido?: string
    next_stage?: WaStage
  }
}

export async function generateBotResponse(
  lead: WaLeadData,
  userMessage: string,
  history: WaMessage[],
): Promise<BotResponse> {
  const stage: WaStage = lead.source_detail?.wa_stage ?? "welcome"
  const nombre = lead.nombres && !lead.nombres.startsWith("Lead WhatsApp") ? lead.nombres : null

  // Mensajes para Claude: historial + mensaje actual
  const claudeMessages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: userMessage },
  ]

  const result = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 600,
    system: buildSystemPrompt(lead),
    tools: [
      {
        name: "bot_action",
        description: "Extrae datos estructurados del mensaje del usuario y determina la siguiente acción del bot.",
        input_schema: {
          type: "object" as const,
          properties: {
            response_text: {
              type: "string",
              description: "Texto exacto del mensaje a enviar por WhatsApp. Sin markdown.",
            },
            next_stage: {
              type: "string",
              description: "Siguiente etapa del funnel después de este mensaje.",
              enum: [
                "welcome", "collect_name", "collect_event_type", "needs_human",
                "collect_date_yn", "collect_date", "collect_guests", "collect_budget",
                "budget_low_reconsider", "not_qualified", "collect_appointment",
                "calendly_sent", "advisor_notified", "completed",
              ],
            },
            nombre: { type: "string", description: "Nombre completo del prospecto si lo mencionó." },
            tipo_evento: {
              type: "string",
              enum: ["boda", "xv_anos", "bautizo", "corporativo", "social"],
              description: "Tipo de evento si lo mencionó.",
            },
            tiene_fecha: { type: "boolean", description: "Si el prospecto ya tiene fecha definida." },
            fecha_texto: { type: "string", description: "Fecha tal como la escribió el usuario." },
            rango_invitados: {
              type: "string",
              enum: ["50-100", "100-150", "150-200", "200-250", "250-300", "300-350"],
              description: "Rango de invitados elegido.",
            },
            budget_qualification: {
              type: "string",
              enum: ["bajo", "medio", "alto"],
              description: "Calificación del presupuesto.",
            },
            inversion_rango: { type: "string", description: "Rango de inversión tal como se presentó." },
            quiere_reconsiderar: { type: "boolean", description: "Si el prospecto quiere reconsiderar el presupuesto." },
            quiere_calendly: { type: "boolean", description: "Si el prospecto prefiere agendar por Calendly." },
            horario_preferido: { type: "string", description: "Horario preferido para la cita si lo mencionó." },
          },
          required: ["response_text", "next_stage"],
        },
      },
    ],
    tool_choice: { type: "any" },
    messages: claudeMessages,
  })

  // Extraer la llamada a la tool
  const toolUse = result.content.find((b) => b.type === "tool_use")
  if (toolUse && toolUse.type === "tool_use") {
    const input = toolUse.input as Record<string, unknown>
    return {
      text: String(input.response_text ?? ""),
      extracted: {
        nombre: input.nombre ? String(input.nombre) : undefined,
        tipo_evento: input.tipo_evento as BotResponse["extracted"]["tipo_evento"],
        tiene_fecha: input.tiene_fecha as boolean | undefined,
        fecha_texto: input.fecha_texto ? String(input.fecha_texto) : undefined,
        rango_invitados: input.rango_invitados as GuestRange | undefined,
        budget_qualification: input.budget_qualification as BudgetQualification | undefined,
        inversion_rango: input.inversion_rango ? String(input.inversion_rango) : undefined,
        quiere_reconsiderar: input.quiere_reconsiderar as boolean | undefined,
        quiere_calendly: input.quiere_calendly as boolean | undefined,
        horario_preferido: input.horario_preferido ? String(input.horario_preferido) : undefined,
        next_stage: input.next_stage as WaStage | undefined,
      },
    }
  }

  // Fallback si Claude no usó la tool
  const textBlock = result.content.find((b) => b.type === "text")
  const fallbackText = textBlock && textBlock.type === "text" ? textBlock.text : "Gracias por tu mensaje. En breve te atendemos. 🤍"

  return {
    text: fallbackText,
    extracted: { next_stage: stage },
  }
}

// ─── Mensajes de bienvenida y acciones fijas ─────────────────────────────────
export function buildWelcomeMessage(): string {
  return `Hola ✨ ¡Gracias por escribir a El Romeral – Diseño de Experiencias Integrales!\n\nMás que un lugar para eventos, somos un solo equipo que diseña, coordina y resuelve cada detalle de principio a fin para que ustedes vivan una celebración extraordinaria. 🤍\n\nPara atenderte como mereces, ¿me compartes tu nombre?`
}

export function buildAvailabilityMessage(nombre: string | null, available: boolean, fecha: string): string {
  const n = nombre ?? ""
  if (available) {
    return `✨ ¡Buenas noticias${n ? `, ${n}` : ""}! Tenemos opciones disponibles para esa fecha.\n\nCuéntanos, ¿aproximadamente cuántos invitados contemplan?\n\n1️⃣ 50 – 100\n2️⃣ 100 – 150\n3️⃣ 150 – 200\n4️⃣ 200 – 250\n5️⃣ 250 – 300\n6️⃣ 300 – 350`
  }
  return `💫 Esa fecha está muy solicitada, pero podemos proponerte alternativas igual de especiales para construir una experiencia inolvidable.\n\nCuéntanos, ¿aproximadamente cuántos invitados contemplan?\n\n1️⃣ 50 – 100\n2️⃣ 100 – 150\n3️⃣ 150 – 200\n4️⃣ 200 – 250\n5️⃣ 250 – 300\n6️⃣ 300 – 350`
}

export function buildBudgetOptionsMessage(nombre: string | null, range: GuestRange): string {
  const n = nombre ? `, ${nombre}` : ""
  const r = BUDGET_RANGES[range]
  return `Para orientarte correctamente${n}:\n\n¿Cuál es el rango de inversión estimado para la experiencia completa de su evento?\n\n1️⃣ Rango Bajo — ${r.bajo}\n2️⃣ Rango Medio — ${r.medio}\n3️⃣ Rango Alto — ${r.alto}`
}

export function buildCalendlyMessage(nombre: string | null): string {
  const n = nombre ? `${nombre}, ` : ""
  return `Perfecto, ${n}aquí puedes agendar tu cita personalizada directamente:\n\n📅 ${CALENDLY_URL}\n\nEn la cita conoceremos tu visión, compartiremos ideas y comenzaremos a diseñar algo extraordinario juntos. 🤍`
}

export function buildAdvisorNotifiedMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `Perfecto${n} ✨\n\nUna asesora de El Romeral se pondrá en contacto contigo muy pronto para coordinar tu cita personalizada. 🤍`
}

export function buildNeedsHumanMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `Gracias${n} ✨\n\nEn El Romeral cada evento se diseña de forma personalizada según sus objetivos y necesidades.\n\nUno de nuestros asesores especializados se pondrá en contacto contigo a la brevedad para ayudarte. 🤍`
}
