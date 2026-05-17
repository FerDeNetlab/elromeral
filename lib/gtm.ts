/**
 * GTM / dataLayer event helpers para El Romeral
 *
 * Uso en client components:
 *   import { trackEvent } from "@/lib/gtm"
 *   trackEvent("generate_lead", { method: "whatsapp" })
 *
 * En GTM Dashboard configura un Trigger "Custom Event" con cada
 * event_name para disparar tus etiquetas de Google Ads / GA4.
 */

type DataLayerObject = Record<string, unknown>

/** Push genérico al dataLayer (safe: no-op si GTM no ha cargado aún) */
export function trackEvent(
  eventName: string,
  params: DataLayerObject = {}
): void {
  if (typeof window === "undefined") return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dl = (window as any).dataLayer as DataLayerObject[] | undefined
  if (!Array.isArray(dl)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).dataLayer = []
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).dataLayer.push({ event: eventName, ...params })
}

// ── Eventos predefinidos del funnel de El Romeral ─────────────────────────────

/**
 * Click en cualquier CTA de WhatsApp.
 * En GA4 se mapea a `generate_lead`.
 * En Google Ads, dispara tu conversión "Lead WhatsApp".
 */
export function trackWhatsAppClick(location: string) {
  trackEvent("generate_lead", {
    method: "whatsapp",
    cta_location: location, // "hero" | "statement" | "gastro" | "final_cta" | "nav" | "floating_wa"
  })
}

/**
 * Apertura del webchat (asesor en el sitio).
 * En GA4 se mapea a `generate_lead`.
 * En Google Ads, dispara tu conversión "Lead Webchat".
 */
export function trackWebchatOpen() {
  trackEvent("generate_lead", {
    method: "webchat",
    cta_location: "floating_button",
  })
}

/**
 * Usuario abre una pregunta del FAQ — señal de interés.
 * Útil para audiencias de remarketing en Google Ads.
 */
export function trackFaqOpen(question: string) {
  trackEvent("faq_open", { question })
}

/**
 * Usuario navega al configurador/cotizador.
 * Alta intención — ideal para conversión de Google Ads.
 */
export function trackConfiguradorStart(source: string = "link") {
  trackEvent("begin_checkout", {
    // begin_checkout es un evento estándar GA4
    item_name: "Cotizador de bodas",
    source,
  })
}
