import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Allow public crawlers ─────────────────────────────────────────────
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          // Admin & internal tooling
          "/admin/",
          "/admin/*",
          // API routes
          "/api/",
          "/api/*",
          // Private client-facing pages
          "/brochure/",
          "/clientes/",
          "/encuesta/",
          "/cot-test/",
          // Quote/sales flows (private)
          "/cotizacion/",
          "/cotizacion-adicionales/",
          "/cotizacion-personalizada/",
          "/cotizador-personalizado/",
          // Addon pages (internal)
          "/adicionales-martha-kevin/",
          "/adicionales-paty-alex/",
          "/adicionales-perla-alexis/",
        ],
      },
      // ── Block AI training crawlers ────────────────────────────────────────
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "Omgilibot",
          "FacebookBot",
          "Bytespider",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: "https://elromeral.com.mx/sitemap.xml",
    host: "https://elromeral.com.mx",
  }
}
