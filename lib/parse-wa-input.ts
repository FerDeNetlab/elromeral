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

  // Opción numerada pura (1-6) o con contexto: "opción 2", "el 3", "número 4"
  const optMatch = clean.match(/(?:opci[oó]n\s*|n[uú]mero\s*|el\s*)?([1-6])(?:\s|$|[^\d])/)
  if (optMatch && clean.replace(/\D/g, "").length === 1) {
    const options: GuestRange[] = ["50-100", "100-150", "150-200", "200-250", "250-300", "300-350"]
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
  ]
  for (const [re, range] of rangePatterns) {
    if (re.test(clean)) return range
  }

  // Número suelto → mapeo al rango
  const numMatch = clean.match(/\b(\d{2,3})\b/)
  if (numMatch) {
    const n = parseInt(numMatch[1])
    if (n >= 1 && n <= 6) {
      const options: GuestRange[] = ["50-100", "100-150", "150-200", "200-250", "250-300", "300-350"]
      return options[n - 1]
    }
    if (n <= 100) return "50-100"
    if (n <= 150) return "100-150"
    if (n <= 200) return "150-200"
    if (n <= 250) return "200-250"
    if (n <= 300) return "250-300"
    return "300-350"
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
    "50-100":  [280_000, 450_000],
    "100-150": [370_000, 650_000],
    "150-200": [460_000, 750_000],
    "200-250": [550_000, 800_000],
    "250-300": [700_000, 900_000],
    "300-350": [850_000, 850_000],
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

  if (/^1$|^uno$|\bbajo\b|\bm[aá]s\s*econ[oó]mico\b|\bm[aá]s\s*barato\b/.test(clean)) return "bajo"
  if (/^2$|^dos$|\bmedio\b|\bintermedio\b|\bregular\b/.test(clean)) return "medio"
  if (/^3$|^tres$|\balto\b|\bpremium\b|\bm[aá]s\s*completo\b|\bm[aá]s\s*caro\b/.test(clean)) return "alto"

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
