import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"
import {
  BUDGET_RANGES,
  CALENDLY_URL,
  type BudgetQualification,
  type GuestRange,
  type WaLeadData,
  type WaMessage,
  type WaSourceDetail,
  type WaStage,
} from "@/lib/whatsapp"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Selección aleatoria de variante ────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── System prompt del bot ───────────────────────────────────────────────────
function buildSystemPrompt(lead: WaLeadData): string {
  const nombre = lead.nombres && !lead.nombres.startsWith("Lead WhatsApp") ? lead.nombres : null
  const detail = (lead.source_detail ?? {}) as WaSourceDetail
  const stage: WaStage = detail.wa_stage ?? "welcome"

  const context = [
    nombre ? `Nombre del prospecto: ${nombre}` : "Aún no sabemos el nombre del prospecto.",
    lead.tipo_evento ? `Tipo de evento: ${lead.tipo_evento.replace("_", " ")}` : "",
    detail.wa_tiene_fecha !== undefined ? `Tiene fecha: ${detail.wa_tiene_fecha ? "sí" : "no"}` : "",
    detail.wa_fecha_texto ? `Fecha mencionada: ${detail.wa_fecha_texto}` : "",
    detail.wa_disponible !== undefined ? `Disponibilidad de esa fecha: ${detail.wa_disponible ? "disponible ✓" : "NO disponible ✗"}` : "",
    detail.wa_rango_invitados ? `Rango de invitados confirmado: ${detail.wa_rango_invitados}` : "",
    lead.inversion_rango ? `Rango de inversión mencionado: ${lead.inversion_rango}` : "",
    lead.calificacion_lead ? `Calificación del lead: ${lead.calificacion_lead}` : "",
    lead.reconsidero_presupuesto !== null && lead.reconsidero_presupuesto !== undefined
      ? `Reconsideró presupuesto: ${lead.reconsidero_presupuesto ? "sí" : "no"}` : "",
    `Etapa actual: ${stage}`,
  ].filter(Boolean).join("\n")

  return `Eres Romeo, el asistente virtual de El Romeral – Diseño de Experiencias Integrales, un jardín de bodas premium en Guadalajara, México. Representas una marca elegante y cálida.

═══════════════════════════════════════
MISIÓN
═══════════════════════════════════════
Convertir cada conversación en una cita presencial calificada. Sigues un guión estructurado y no te desvías. Tu tono es cálido, elegante y cercano. Usas emojis con moderación (máx 1-2 por mensaje). SIEMPRE llamas al prospecto por su nombre cuando lo tienes.

═══════════════════════════════════════
IDENTIDAD DE MARCA
═══════════════════════════════════════
El Romeral NO es "un salón" ni "un lugar para rentar". Es un equipo integral que diseña, coordina y resuelve cada detalle de principio a fin. Jamás uses: "renta", "salón", "paquetes", "local". Usa: "experiencia", "celebración", "propuesta integral", "inversión".

═══════════════════════════════════════
CONTEXTO DEL PROSPECTO ACTUAL
═══════════════════════════════════════
${context}

═══════════════════════════════════════
GUIÓN POR ETAPA — QUÉ HACER EXACTAMENTE
═══════════════════════════════════════

ETAPA: welcome
→ El sistema ya mandó el saludo. Tu rol aquí es responder si el prospecto escribe antes de dar su nombre. Invítalo a compartir su nombre.

ETAPA: collect_name
→ Pide el nombre completo del prospecto de forma amable. Ej: "Para comenzar, ¿me compartes tu nombre?"
→ Cuando el prospecto responda con cualquier texto (incluso una sola palabra), asúmelo como su nombre y avanza.

ETAPA: collect_event_type
→ Pregunta qué tipo de celebración están planeando. Ofrece opciones: boda, XV años, bautizo, evento corporativo, reunión social.
→ Cuando respondan, mapea a: boda→"boda", quince/XV→"xv_anos", bautizo→"bautizo", corporativo→"corporativo", otro→"social".

ETAPA: collect_date_yn
→ Pregunta si ya tienen una fecha tentativa para su celebración.
→ Si dice "sí" o da una fecha → tiene_fecha=true, avanza a collect_date.
→ Si dice "no", "todavía no", "por definir" → tiene_fecha=false, avanza directo a collect_guests.

ETAPA: collect_date
→ Pide la fecha específica. El sistema verificará disponibilidad automáticamente.
→ Acepta cualquier formato de fecha y avanza.

ETAPA: collect_guests (CRÍTICO)
→ Pregunta cuántos invitados aproximadamente. Muestra las opciones numeradas:
  1️⃣ 50 – 100
  2️⃣ 101 – 150
  3️⃣ 151 – 200
  4️⃣ 201 – 250
  5️⃣ 251 – 300
  6️⃣ 301 – 350
→ Si el usuario manda un NÚMERO SUELTO (ej: "100", "150", "200", "250"):
  - ≤100 → rango "50-100"
  - ≤150 → rango "100-150"
  - ≤200 → rango "150-200"
  - ≤250 → rango "200-250"
  - ≤300 → rango "250-300"
  - >300 → rango "300-350"
→ Si manda un número del 1 al 6, es la opción de la lista (1→"50-100", 2→"100-150", etc.)
→ NUNCA repitas la pregunta si ya dieron algún número o rango. Avanza siempre.

ETAPA: collect_budget
→ Presenta los rangos de inversión para su número de invitados (el sistema los calcula).
→ Pregunta en cuál rango se ubican.
→ Si eligen "bajo" o el rango más económico, avanza a budget_low_reconsider.
→ Si eligen "medio" o "alto", calificación=alto/medio, avanza a collect_appointment.
→ Si mandan 1/2/3 o bajo/medio/alto, interprétalo correctamente.

ETAPA: budget_low_reconsider
→ Con mucha elegancia y sin presionar, pregunta si podrían considerar una propuesta de mayor valor.
→ Ej: "Entendemos perfectamente. ¿Les gustaría conocer qué incluye una propuesta más completa antes de decidir? A veces hay opciones que sorprenden 😊"
→ Si dice sí → quiere_reconsiderar=true, avanza a collect_appointment.
→ Si dice no → quiere_reconsiderar=false, avanza a not_qualified con mensaje cálido.

ETAPA: not_qualified
→ Responde con calidez, agradece el interés, no cierres la puerta. Ej: "Gracias por considerarnos, [nombre]. Si en el futuro sus planes cambian, aquí estaremos con gusto."

ETAPA: collect_appointment
→ Pregunta cómo prefieren coordinar la visita. Presenta dos opciones:
  1️⃣ Agendar en línea (les envías el link de Calendly)
  2️⃣ Que un asesor los contacte
→ Si eligen opción 1 o mencionan "link/calendly/en línea" → quiere_calendly=true, siguiente: calendly_sent.
→ Si eligen opción 2 o dicen "asesora/que me contacten" → siguiente: collect_schedule.
→ Si mencionan horario directamente sin elegir modo → siguiente: advisor_notified.

ETAPA: collect_schedule
→ Pregunta qué horario les acomoda mejor (mañana/tarde, entre semana/fin de semana).
→ Cualquier respuesta que dé → guardar como horario_preferido, siguiente: advisor_notified.

ETAPA: calendly_sent
→ El sistema ya envió el link de Calendly. Si el prospecto escribe algo, confirma que recibió el link y que puede agendar cuando guste.

ETAPA: advisor_notified
→ El sistema ya notificó a el asesor. Informa que pronto se pondrán en contacto. Sé cálida y tranquilizadora.

ETAPA: needs_human
→ Un asesor tomará la conversación. Informa con calidez que alguien los contactará pronto.

═══════════════════════════════════════
TABLA DE INVERSIÓN (solo cuando sea relevante)
═══════════════════════════════════════
| Invitados  | Bajo           | Medio           | Alto       |
|------------|----------------|-----------------|------------|
| 50–100     | < $280,000     | $280k–$450k     | > $450k    |
| 100–150    | < $370,000     | $370k–$650k     | > $650k    |
| 150–200    | < $460,000     | $460k–$750k     | > $750k    |
| 200–250    | < $550,000     | $550k–$800k     | > $800k    |
| 250–300    | < $700,000     | $700k–$900k     | > $900k    |
| 300–350    | < $850,000     | —               | > $850k    |
Siempre redirige: "el desglose exacto lo armamos juntos en la cita".

═══════════════════════════════════════
REGLAS ABSOLUTAS
═══════════════════════════════════════
1. Nunca inventes precios exactos ni disponibilidad — esa info la provee el sistema.
2. Un mensaje = una sola pregunta o punto. Nunca abrumes con mucho texto.
3. Respuestas ambiguas → interprétalas con generosidad, no pidas confirmación extra.
4. Si preguntan algo fuera del flujo (ubicación, estacionamiento, etc.) → responde brevemente y regresa al funnel.
5. Si preguntan por precios, paquetes, costos, renta o más información → usa EXACTAMENTE este copy: "[Nombre], cada celebración en El Romeral se diseña completamente a la medida. Para compartirte ideas reales, opciones correctas y una propuesta alineada a lo que sueñan, lo ideal es una cita personalizada. ✨ ¿Te gustaría agendar?" — luego regresa al funnel.
6. Nunca uses markdown, asteriscos, ni formato especial. Solo texto plano + emojis.
6. SIEMPRE avanza el funnel. Nunca te quedes en la misma etapa si ya tienes la info.

ETAPA ACTUAL: ${stage}
Genera ÚNICAMENTE el texto del mensaje de WhatsApp. Sin explicaciones adicionales.`
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
                "collect_schedule", "calendly_sent", "advisor_notified", "completed",
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
              description: "Rango de invitados. Si el usuario mandó un número suelto (ej: '100'), mapea al rango: ≤100→'50-100', ≤150→'100-150', ≤200→'150-200', ≤250→'200-250', ≤300→'250-300', >300→'300-350'. Si eligió opción numerada de una lista (1-6), mapearlo en orden.",
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

// ─── Mensajes del funnel — copys exactos del script ─────────────────────────

export function buildWelcomeMessage(): string {
  return `Hola ✨ ¡Gracias por escribir a El Romeral – Diseño de Experiencias Integrales!\n\nMás que un lugar para eventos, somos un solo equipo que diseña, coordina y resuelve cada detalle de principio a fin para que ustedes vivan una celebración extraordinaria. 🤍\n\nPara atenderte como mereces, ¿me compartes tu nombre?`
}

export function buildAfterNameMessage(nombre: string): string {
  return `¡Mucho gusto, ${nombre}! ✨\n\nSerá un placer orientarte.\n\nCuéntame, ¿qué tipo de evento estás planeando?\n\n1️⃣ Boda\n2️⃣ XV años\n3️⃣ Bautizo\n4️⃣ Evento Corporativo\n5️⃣ Evento Social`
}

export function buildDateYnMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `¡Qué emoción${n}! 🎉\n\nCada celebración importante merece una experiencia única.\n\n👉 ¿Ya tienes fecha definida para tu evento?\n\n1️⃣ Sí\n2️⃣ No`
}

export function buildCollectDateMessage(_nombre: string | null): string {
  return `Perfecto 📅 Compártenos la fecha completa (día, mes y año) y revisamos disponibilidad para ti.`
}

export function buildAskDateYearMessage(nombre: string | null, dateHint: string): string {
  const n = nombre ? `, ${nombre}` : ""
  return `¡Perfecto${n}! 📅 Para revisar disponibilidad, ¿podrías confirmarnos la fecha completa incluyendo el año? Por ejemplo: *${dateHint} de 2026* 😊`
}

export function buildNoDateMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `No te preocupes${n} 🤍\n\nMuchas celebraciones extraordinarias comienzan definiendo primero la visión, la experiencia y todo lo que desean vivir ese día.\n\n👉 Cuéntanos, ¿aproximadamente cuántos invitados contemplas?\n\n1️⃣ 50 – 100\n2️⃣ 101 – 150\n3️⃣ 151 – 200\n4️⃣ 201 – 250\n5️⃣ 251 – 300\n6️⃣ 301 – 350`
}

export function buildCollectGuestsMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `Cuéntanos${n}, ¿aproximadamente cuántos invitados contemplas?\n\n1️⃣ 50 – 100\n2️⃣ 101 – 150\n3️⃣ 151 – 200\n4️⃣ 201 – 250\n5️⃣ 251 – 300\n6️⃣ 301 – 350`
}

export function buildAvailabilityMessage(nombre: string | null, available: boolean, _fecha: string): string {
  const n = nombre ? `, ${nombre}` : ""
  const lista = `\n\n👉 Ahora cuéntanos, ¿aproximadamente cuántos invitados contemplas?\n\n1️⃣ 50 – 100\n2️⃣ 101 – 150\n3️⃣ 151 – 200\n4️⃣ 201 – 250\n5️⃣ 251 – 300\n6️⃣ 301 – 350`
  if (available) {
    return `✨ ¡Buenas noticias${n}! Tenemos opciones disponibles para esa fecha.${lista}`
  }
  return `💫 Esa fecha está muy solicitada${n}, pero podemos proponerte alternativas igual de especiales para construir una experiencia inolvidable.${lista}`
}

export function buildGuestEmotionalMessage(_nombre: string | null, range: GuestRange): string {
  const messages: Record<GuestRange, string> = {
    "50-100":  `🤍 Una celebración íntima y elegante.`,
    "100-150": `✨ El equilibrio ideal entre cercanía y gran ambiente.`,
    "150-200": `🎉 Una celebración vibrante con muchas posibilidades.`,
    "200-250": `💫 Un evento memorable para compartir en grande.`,
    "250-300": `🤍 Una celebración donde nadie importante se queda fuera y todos pueden vivirla juntos.`,
    "300-350": `✨ Un gran momento para reunir a todos los que forman parte de su historia y disfrutarlo en grande.`,
  }
  return messages[range]
}

export function buildBudgetOptionsMessage(nombre: string | null, range: GuestRange): string {
  const n = nombre ? `, ${nombre}` : ""
  const r = BUDGET_RANGES[range]
  return `Para orientarte correctamente${n}:\n\n¿Cuál es el rango de inversión estimado para la experiencia completa de su evento?\n\n1️⃣ ${r.bajo}\n2️⃣ ${r.medio}\n3️⃣ ${r.alto}`
}

export function buildBudgetLowReconsiderMessage(nombre: string | null, _guestRange: GuestRange): string {
  const n = nombre ? `, ${nombre}` : ""
  return `Gracias por compartirnos esta información${n} 🤍\n\nPor el nivel de personalización, producción y acompañamiento integral que desarrollamos, normalmente trabajamos en rangos de inversión distintos.\n\nSin embargo, si desean explorar una experiencia más amplia o ajustar la visión de su evento, con gusto podemos seguir ayudándoles. ✨\n\n👉 ¿Te gustaría reconsiderar el rango de inversión para mostrarte mejores opciones?\n\n1️⃣ Sí, reconsiderar\n2️⃣ No por ahora`
}

export function buildBudgetReconsiderReturnMessage(nombre: string | null, range: GuestRange): string {
  const n = nombre ? `, ${nombre}` : ""
  const budgetMsg = buildBudgetOptionsMessage(nombre, range)
  return `¡Perfecto${n}! 💫\n\nA veces con la visión correcta se descubren posibilidades increíbles.\n\n${budgetMsg}`
}

export function buildBudgetLowCloseMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `Gracias por pensar en El Romeral${n}.\n\nSi más adelante desean explorar una celebración más personalizada, estaremos felices de acompañarlos. 🤍`
}

export function buildBudgetQualifiedMessage(nombre: string | null): string {
  const n = nombre ? `${nombre}, ` : ""
  return `✨ ${n}con lo que nos compartes creemos que podemos construir algo muy especial para ustedes.\n\nEl siguiente paso ideal es una cita personalizada para conocer su visión, compartir ideas y comenzar a diseñar una experiencia extraordinaria. 🤍\n\n👉 ¿Cómo prefieres agendar?\n\n1️⃣ Que un asesor me contacte\n2️⃣ Agendar por aquí mismo`
}

export function buildPriceDeflectMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `${nombre ?? "Claro"}, cada celebración en El Romeral se diseña completamente a la medida${n ? "" : ""}.\n\nPara compartirte ideas reales, opciones correctas y una propuesta alineada a lo que sueñan, lo ideal es una cita personalizada. ✨\n\n👉 ¿Te gustaría agendar?`
}

export function buildCollectScheduleMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `Perfecto${n} 🤍\n\n¿Qué horario te acomoda mejor para contactarte y coordinar tu cita?`
}

export function buildAdvisorNotifiedMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `Perfecto${n} ✨\n\nUn asesor de El Romeral se pondrá en contacto contigo para coordinar su cita personalizada. 🤍`
}

export function buildNeedsHumanMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `Gracias${n} ✨\n\nEn El Romeral cada evento se diseña de forma personalizada según sus objetivos y necesidades.\n\nUno de nuestros asesores especializados se pondrá en contacto contigo a la brevedad para ayudarte. 🤍`
}

export function buildCalendlyMessage(nombre: string | null): string {
  const n = nombre ? `${nombre}, ` : ""
  return `Perfecto, ${n}aquí puedes agendar tu cita personalizada:\n\n📅 ${CALENDLY_URL}\n\nEn la cita conoceremos tu visión, compartiremos ideas y comenzaremos a diseñar algo extraordinario juntos. 🤍`
}

export function buildNotQualifiedMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return `Gracias por pensar en El Romeral${n}.\n\nSi más adelante desean explorar una celebración más personalizada, estaremos felices de acompañarlos. 🤍`
}
