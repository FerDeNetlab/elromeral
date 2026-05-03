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
  2️⃣ 100 – 150
  3️⃣ 150 – 200
  4️⃣ 200 – 250
  5️⃣ 250 – 300
  6️⃣ 300 – 350
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
→ Invita a agendar una visita presencial. Menciona que es sin compromiso, que verán el jardín y resolverán todas sus dudas.
→ Pregunta qué horario les acomoda mejor (mañana/tarde, entre semana/fin de semana).
→ Captura el horario preferido en horario_preferido.

ETAPA: calendly_sent
→ El sistema ya envió el link de Calendly. Si el prospecto escribe algo, confirma que recibió el link y que puede agendar cuando guste.

ETAPA: advisor_notified
→ El sistema ya notificó a la asesora. Informa que pronto se pondrán en contacto. Sé cálida y tranquilizadora.

ETAPA: needs_human
→ Una asesora tomará la conversación. Informa con calidez que alguien los contactará pronto.

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
5. Nunca uses markdown, asteriscos, ni formato especial. Solo texto plano + emojis.
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

// ─── Mensajes del funnel con variantes ──────────────────────────────────────
export function buildWelcomeMessage(): string {
  return pick([
    `Hola ✨ ¡Gracias por escribir a El Romeral!\n\nSoy Romeo, y estoy aquí para ayudarte a diseñar una celebración extraordinaria. Somos un equipo completo que coordina y resuelve cada detalle de principio a fin. 🤍\n\nPara comenzar, ¿me compartes tu nombre?`,
    `¡Hola! Bienvenido a El Romeral – Diseño de Experiencias Integrales. 🌿\n\nSoy Romeo. Aquí no rentamos espacios — diseñamos celebraciones completas, de principio a fin.\n\n¿Con quién tengo el gusto de hablar?`,
    `Hola, ¡qué gusto que nos escribas! ✨\n\nSoy Romeo, asistente de El Romeral. Estamos aquí para ayudarte a crear una experiencia que se recuerde para siempre.\n\n¿Me dices tu nombre para comenzar?`,
  ])
}

export function buildCollectDateMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return pick([
    `Perfecto${n}. ¿Cuál es la fecha que tienen en mente? Puede ser aproximada, la verificamos al instante. 📅`,
    `¿Qué fecha tienen contemplada${n}? Con eso verificamos disponibilidad de inmediato.`,
    `¡Genial${n}! Cuéntame la fecha que están pensando y la revisamos juntos. 📅`,
  ])
}

export function buildCollectGuestsMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  const lista = `\n\n1️⃣ 50 – 100\n2️⃣ 100 – 150\n3️⃣ 150 – 200\n4️⃣ 200 – 250\n5️⃣ 250 – 300\n6️⃣ 300 – 350`
  return pick([
    `Sin problema${n}. ¿Aproximadamente cuántos invitados contemplan?${lista}`,
    `Perfecto${n}. Para orientarte mejor, ¿cuántas personas asistirán aproximadamente?${lista}`,
    `Entendido${n}. ¿Qué número de invitados tienen en mente?${lista}`,
  ])
}

export function buildAvailabilityMessage(nombre: string | null, available: boolean, _fecha: string): string {
  const n = nombre ? `, ${nombre}` : ""
  const lista = `\n\n1️⃣ 50 – 100\n2️⃣ 100 – 150\n3️⃣ 150 – 200\n4️⃣ 200 – 250\n5️⃣ 250 – 300\n6️⃣ 300 – 350`
  if (available) {
    return pick([
      `✨ ¡Buenas noticias${n}! Tenemos opciones disponibles para esa fecha.\n\nCuéntanos, ¿aproximadamente cuántos invitados contemplan?${lista}`,
      `Qué emocionante${n} 🤍 Esa fecha tiene disponibilidad.\n\n¿Cuántos invitados estiman para la celebración?${lista}`,
      `¡Perfecto${n}! Podemos trabajar con esa fecha. ¿Aproximadamente cuántas personas asistirán?${lista}`,
    ])
  }
  return pick([
    `💫 Esa fecha está muy solicitada${n}, pero podemos proponerte alternativas igual de especiales.\n\n¿Aproximadamente cuántos invitados contemplan?${lista}`,
    `Esa fecha tiene mucha demanda${n}, pero no te preocupes — encontramos la opción perfecta. ¿Cuántos invitados serían?${lista}`,
    `La agenda en esa fecha está apretada${n}, pero nos encantaría proponer alternativas igualmente hermosas. ¿Cuántos invitados son?${lista}`,
  ])
}

export function buildBudgetOptionsMessage(nombre: string | null, range: GuestRange): string {
  const n = nombre ? `, ${nombre}` : ""
  const r = BUDGET_RANGES[range]
  const opciones = `\n\n1️⃣ Rango Bajo — ${r.bajo}\n2️⃣ Rango Medio — ${r.medio}\n3️⃣ Rango Alto — ${r.alto}`
  return pick([
    `Para orientarte correctamente${n}, ¿en cuál de estos rangos de inversión se encuentran para la experiencia completa?${opciones}`,
    `Perfecto${n}. Para mostrarte las posibilidades que mejor se adaptan a su visión, ¿en cuál rango de inversión contemplan?${opciones}`,
    `Cada celebración es única${n}. ¿En qué rango de inversión para la experiencia completa se encuentran?${opciones}`,
  ])
}

export function buildBudgetLowReconsiderMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return pick([
    `Entendemos perfectamente${n}. ¿Les gustaría conocer qué incluye una propuesta más completa antes de decidir? A veces hay opciones que sorprenden 😊`,
    `Lo entendemos${n}. Antes de continuar, ¿les interesaría ver qué se puede lograr con un presupuesto más amplio? Muchas veces cambia la perspectiva. 🤍`,
    `Claro${n}, cada presupuesto es válido. ¿Podrían considerar conocer una propuesta de mayor valor antes de decidir? Quizás encuentren algo que los enamore. ✨`,
  ])
}

export function buildBudgetQualifiedMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return pick([
    `¡Excelente${n}! Con esa visión podemos diseñar algo verdaderamente especial. 🤍\n\n¿Cuándo les gustaría visitar El Romeral? Puede ser entre semana o fin de semana — indícanos qué horario les acomoda mejor.`,
    `Perfecto${n}, eso nos da muy buena claridad. ✨\n\nNos encantaría invitarlos a conocer El Romeral en persona. ¿Qué horario les queda mejor — mañana, tarde, entre semana o fin de semana?`,
    `Maravilloso${n}, estamos muy emocionados de acompañarlos en esto. 🌿\n\n¿Cuándo podrían venir a conocernos? Tenemos horarios entre semana y fines de semana.`,
  ])
}

export function buildNotQualifiedMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return pick([
    `Gracias por considerarnos${n}. Si en el futuro sus planes cambian, aquí estaremos con gusto. 🤍`,
    `Lo entendemos perfectamente${n}. Cuando quieran retomar la conversación, aquí estamos. ✨`,
    `Claro${n}, no hay problema. Si en algún momento sus planes evolucionan, será un placer recibirlos. 🌿`,
  ])
}

export function buildCalendlyMessage(nombre: string | null): string {
  const n = nombre ? `${nombre}, ` : ""
  return pick([
    `Perfecto, ${n}aquí puedes agendar tu cita personalizada:\n\n📅 ${CALENDLY_URL}\n\nEn la cita conoceremos tu visión, compartiremos ideas y comenzaremos a diseñar algo extraordinario juntos. 🤍`,
    `¡Excelente${nombre ? `, ${nombre}` : ""}! Reserva tu cita aquí:\n\n📅 ${CALENDLY_URL}\n\nEs sin compromiso, y será el primer paso para diseñar la celebración de sus sueños. 🤍`,
    `Nos emociona mucho conocerlos${nombre ? `, ${nombre}` : ""} 🌿\n\nAgenda tu visita en:\n📅 ${CALENDLY_URL}\n\nAhí resolveremos cada duda y comenzaremos a darle forma a su experiencia.`,
  ])
}

export function buildAdvisorNotifiedMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return pick([
    `Perfecto${n} ✨\n\nUna asesora de El Romeral se pondrá en contacto contigo muy pronto para coordinar tu cita personalizada. 🤍`,
    `Listo${n}, ya registramos tu solicitud 🤍\n\nUna de nuestras asesoras te contactará en breve para agendar la visita.`,
    `¡Anotado${n}! Muy pronto una asesora se comunicará contigo para coordinar los detalles. ✨`,
  ])
}

export function buildNeedsHumanMessage(nombre: string | null): string {
  const n = nombre ? `, ${nombre}` : ""
  return pick([
    `Gracias${n} ✨\n\nEn El Romeral cada evento se diseña de forma personalizada. Un asesor especializado se pondrá en contacto contigo a la brevedad. 🤍`,
    `Claro${n}, para este tipo de evento un asesor puede orientarte mucho mejor. 🌿\n\nPronto alguien del equipo se comunicará contigo personalmente.`,
    `Perfecto${n}, para esa ocasión nos encanta hacer las cosas a medida. Un asesor te contactará muy pronto. ✨`,
  ])
}
