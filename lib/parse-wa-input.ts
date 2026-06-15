/**
 * Parsers determinísticos para inputs críticos del funnel.
 * Estos reemplazan la extracción de Claude en etapas clave para garantizar robustez.
 */

import type { GuestRange, BudgetQualification } from "@/lib/whatsapp"
import { BUDGET_RANGES } from "@/lib/whatsapp"

// ─── Invitados ────────────────────────────────────────────────────────────────

/**
 * Convierte texto libre → rango de invitados.
 * Maneja: "110", "2" (opción lista), "100-150", "como 200 personas", etc.
 */
export function parseGuestRangeFromText(text: string): GuestRange | null {
  const clean = text.toLowerCase().trim().replace(/[,._]/g, "")

  // Opción numerada pura (1-7) o con contexto: "opción 2", "el 3", "número 4"
  const optMatch = clean.match(/(?:opci[oó]n\s*|n[uú]mero\s*|el\s*)?([1-7])(?:\s|$|[^\d])/)
  if (optMatch && clean.replace(/\D/g, "").length === 1) {
    const options: GuestRange[] = ["50-100", "100-150", "150-200", "200-250", "250-300", "300-350", "350-400"]
    return options[parseInt(optMatch[1]) - 1]
  }

  // Rango explícito mencionado: "150-200", "150 a 200", "entre 150 y 200"
  const rangePatterns: [RegExp, GuestRange][] = [
    [/\b50\b.{0,10}\b100\b/, "50-100"],
    [/\b100\b.{0,10}\b150\b/, "100-150"],
    [/\b150\b.{0,10}\b200\b/, "150-200"],
    [/\b200\b.{0,10}\b250\b/, "200-250"],
    [/\b250\b.{0,10}\b300\b/, "250-300"],
    [/\b300\b.{0,10}\b350\b/, "300-350"],
    [/\b350\b.{0,10}\b400\b/, "350-400"],
  ]
  for (const [re, range] of rangePatterns) {
    if (re.test(clean)) return range
  }

  // Número suelto → mapeo al rango
  const numMatch = clean.match(/\b(\d{2,3})\b/)
  if (numMatch) {
    const n = parseInt(numMatch[1])
    if (n >= 1 && n <= 7) {
      const options: GuestRange[] = ["50-100", "100-150", "150-200", "200-250", "250-300", "300-350", "350-400"]
      return options[n - 1]
    }
    if (n <= 100) return "50-100"
    if (n <= 150) return "100-150"
    if (n <= 200) return "150-200"
    if (n <= 250) return "200-250"
    if (n <= 300) return "250-300"
    if (n <= 350) return "300-350"
    return "350-400"
  }

  return null
}

// ─── Presupuesto ──────────────────────────────────────────────────────────────

/**
 * Convierte texto libre → monto en pesos MXN.
 * Maneja: "450 mil", "medio millón", "1 mdp", "1,000,000", "450k", "$500,000", etc.
 */
export function parseMXNAmount(text: string): number | null {
  const clean = text
    .toLowerCase()
    .replace(/[$,]/g, "")
    .replace(/\bpesos?\b/g, "")
    .trim()

  // Frases especiales
  if (/cuarto\s*mill[oó]n/.test(clean)) return 250_000
  if (/medio\s*mill[oó]n|half\s*million/.test(clean)) return 500_000
  if (/un?\s*mill[oó]n\b|1\s*mill[oó]n/.test(clean)) return 1_000_000
  if (/dos?\s*mill[oó]nes?\b|2\s*mill[oó]n/.test(clean)) return 2_000_000
  if (/tres?\s*mill[oó]nes?\b|3\s*mill[oó]n/.test(clean)) return 3_000_000

  // Número + sufijo
  const m = clean.match(/(\d+(?:\.\d+)?)\s*(mill[oó]n(?:es)?|mdp|millones?|mil\b|k\b|m\b)?/)
  if (!m) return null

  let num = parseFloat(m[1])
  const suffix = (m[2] ?? "").trim()

  if (/mill[oó]n|mdp|millones/.test(suffix)) num *= 1_000_000
  else if (/\bk\b|mil\b/.test(suffix)) num *= 1_000
  else if (suffix === "m") num *= 1_000_000
  else if (num < 1_000 && num >= 50) {
    // Número razonable sin sufijo (ej "450") → asumir miles
    num *= 1_000
  }

  return num > 0 ? num : null
}

/**
 * Determina si el monto es bajo/medio/alto para el rango de invitados dado.
 */
export function classifyBudget(amount: number, guestRange: GuestRange): BudgetQualification {
  const thresholds: Record<GuestRange, [number, number]> = {
    "50-100":  [290_000, 500_000],
    "100-150": [390_000, 680_000],
    "150-200": [480_000, 890_000],
    "200-250": [570_000, 910_000],
    "250-300": [700_000, 950_000],
    "300-350": [830_000, 1_300_000],
    "350-400": [925_000, 1_400_000],
  }
  const [low, high] = thresholds[guestRange]
  if (amount < low) return "bajo"
  if (amount > high) return "alto"
  return "medio"
}

/**
 * Detecta selección de opción 1/2/3 (bajo/medio/alto) de una lista.
 */
export function parseBudgetOption(text: string): BudgetQualification | null {
  const clean = text.toLowerCase().trim()

  // "menos de X" o "la primera" / "opción 1" → bajo
  if (/^1$|^uno$|\bbajo\b|\bm[aá]s\s*econ[oó]mico\b|\bm[aá]s\s*barato\b|\bmenos\s+de\b|\bla\s+primera\b|\bopci[oó]n\s*1\b/.test(clean)) return "bajo"
  if (/^2$|^dos$|\bmedio\b|\bintermedio\b|\bregular\b/.test(clean)) return "medio"
  if (/^3$|^tres$|\balto\b|\bpremium\b|\bm[aá]s\s+completo\b|\bm[aá]s\s+caro\b/.test(clean)) return "alto"

  return null
}

/**
 * Parsea sí/no de texto libre.
 */
export function parseYesNo(text: string): boolean | null {
  const clean = text.toLowerCase().trim()
  if (/^(s[ií]|yes|claro|por supuesto|ok|dale|va|[áa]ndale|[oó]rale|sure|obvio|correcto|afirmativo|me gustar[ií]a|me interesa|con gusto|por favor)/.test(clean)) return true
  if (/^(no\b|nel|nope|negativo|para nada|tampoco|no\s+gracias|no\s+por\s+ahora)/.test(clean)) return false
  return null
}

// ─── Tipo de evento ───────────────────────────────────────────────────────────

/**
 * Parsea tipo de evento desde texto libre.
 */
export type EventType = "boda" | "xv_anos" | "bautizo" | "corporativo" | "social"

export function parseEventType(text: string): EventType | null {
  const clean = text.toLowerCase().trim()
  if (/\bboda\b|casarnos|casamiento|matrimonio|wedding/.test(clean)) return "boda"
  if (/\bxv\b|quince|quincea[ñn]era|15\s*a[ñn]os/.test(clean)) return "xv_anos"
  if (/\bbautizo\b|bautismo/.test(clean)) return "bautizo"
  if (/\bcorporativo\b|\bempresa\b|negocio|congreso|convenci[oó]n/.test(clean)) return "corporativo"
  if (/\bsocial\b|graduaci[oó]n|aniversario|cumplea[ñn]os|reuni[oó]n|familiar/.test(clean)) return "social"
  return null
}

// ─── Fechas ───────────────────────────────────────────────────────────────────

/**
 * Detecta si el texto contiene un año explícito (2025-2039).
 */
export function dateTextHasYear(text: string): boolean {
  return /20(2[5-9]|3\d)/.test(text)
}

/**
 * Detecta si el texto contiene un hint de fecha (mes, año, formato numérico).
 */
export function detectDateHint(text: string): boolean {
  const clean = text.toLowerCase()
  const hasMonth = /enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/.test(clean)
  const hasYear = /20(2[5-9]|3\d)/.test(clean)
  const hasNumericDate = /\b\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?\b/.test(clean)
  return hasMonth || hasYear || hasNumericDate
}

// ─── Cita / appointment ───────────────────────────────────────────────────────

/**
 * Detecta si el texto menciona un horario o día (para collect_appointment).
 * Retorna el texto original si encontró algo.
 */
export function parseScheduleHint(text: string): string | null {
  const clean = text.toLowerCase()
  const patterns = [
    /ma[ñn]ana/,
    /tarde/,
    /fin\s*de\s*semana/,
    /s[áa]bado/,
    /domingo/,
    /\b(lunes|martes|mi[eé]rcoles|jueves|viernes)\b/,
    /entre\s*semana/,
    /\d{1,2}\s*(am|pm|hrs?)/,
    /por\s+la\s+(ma[ñn]ana|tarde|noche)/,
    /cualquier\s*(d[ií]a|momento|horario)/,
    /cuando\s*(puedan|gusten|sea|les|quieran)/,
  ]
  for (const p of patterns) {
    if (p.test(clean)) return text.trim()
  }
  return null
}

/**
 * Detecta si el usuario quiere agendar por Calendly / en línea.
 */
export function parseCalendlyIntent(text: string): boolean {
  const clean = text.toLowerCase()
  return /calendly|en\s*l[ií]nea|link|liga|p[áa]gina|online|yo\s*mismo|por\s*m[ií]\b/.test(clean)
}
