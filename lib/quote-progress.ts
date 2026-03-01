import { createClient } from "@/lib/supabase/client"
import type { ConfiguradorData } from "@/app/configurador/types"
import { calcularPrecioTotal, generarPartidasDetalle } from "@/lib/calcular-precio"

// Genera un slug único para la cotización
function generarSlug(): string {
  const caracteres = "abcdefghijklmnopqrstuvwxyz0123456789"
  let slug = ""
  for (let i = 0; i < 10; i++) {
    slug += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return slug
}

export interface QuoteProgress {
  slug: string
  currentStep: number
  isComplete: boolean
}

const STORAGE_KEY = "romeral_quote_progress"

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function saveToLocalStorage(data: ConfiguradorData, step: number, slug: string | null) {
  if (!isBrowser()) return

  try {
    const storageData = {
      data,
      step,
      slug,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
  } catch (e) {
    console.error("[v0] Error guardando en localStorage:", e)
  }
}

export function loadFromLocalStorage(): { data: ConfiguradorData; step: number; slug: string | null } | null {
  if (!isBrowser()) return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored)
    // Si tiene más de 24 horas, limpiar
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return {
      data: parsed.data,
      step: parsed.step,
      slug: parsed.slug,
    }
  } catch (e) {
    console.error("[v0] Error cargando de localStorage:", e)
    return null
  }
}

export function clearLocalStorage() {
  if (!isBrowser()) return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error("[v0] Error limpiando localStorage:", e)
  }
}

// Guarda o actualiza el progreso de una cotización
export async function saveQuoteProgress(
  data: ConfiguradorData,
  currentStep: number,
  existingSlug?: string | null,
): Promise<QuoteProgress | null> {
  const supabase = createClient()

  const slug = existingSlug || generarSlug()
  
  saveToLocalStorage(data, currentStep, slug)

  // Preparar datos para guardar
  const quoteData: Record<string, unknown> = {
    slug,
    current_step: currentStep,
    is_complete: false, // Nunca marcar como completa desde aquí - solo desde Step13 al finalizar
    last_saved_at: new Date().toISOString(),
    // Datos del paso 1
    nombres: data.nombresNovios || null,
    email: data.email || null,
    telefono: data.telefono || null,
    num_invitados: data.numInvitados || 100,
    fecha_evento: data.fechaEvento || null,
    tipo_ceremonia: data.incluyeCapilla ? "capilla" : "civil",
    // Configuración completa como JSON
    configuracion_completa: data,
    // Status para CRM - progresando si está en pasos intermedios
    status: currentStep > 1 && currentStep < 13 ? "en_progreso" : "nuevo_lead",
  }

  try {
    if (existingSlug) {
      // Actualizar cotización existente
      const { error } = await supabase.from("quotes").update(quoteData).eq("slug", existingSlug)

      if (error) {
        console.error("[v0] Error actualizando cotización:", error)
        return null
      }
    } else {
      // Crear nueva cotización
      const { error } = await supabase.from("quotes").insert(quoteData)

      if (error) {
        console.error("[v0] Error creando cotización:", error)
        return null
      }
    }

    const isComplete = false; // Declare the variable before using it

    return {
      slug,
      currentStep,
      isComplete: false, // Solo se marca como completa desde Step13
    }
  } catch (err) {
    console.error("[v0] Error guardando progreso:", err)
    return null
  }
}

// Obtiene el progreso de una cotización por slug
export async function getQuoteProgress(slug: string): Promise<QuoteProgress | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("quotes")
      .select("slug, current_step, is_complete")
      .eq("slug", slug)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return {
      slug: data.slug,
      currentStep: data.current_step || 1,
      isComplete: data.is_complete || false,
    }
  } catch (err) {
    console.error("[v0] Error obteniendo progreso:", err)
    return null
  }
}
