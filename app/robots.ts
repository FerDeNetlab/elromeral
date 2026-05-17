import type { MetadataRoute } from "next"

const PRIVATE_ROUTES = [
  "/admin/",
  "/admin/*",
  "/api/",
  "/api/*",
  "/brochure/",
  "/clientes/",
  "/encuesta/",
  "/cot-test/",
  "/cotizacion/",
  "/cotizacion-adicionales/",
  "/cotizacion-personalizada/",
  "/cotizador-personalizado/",
  "/adicionales-martha-kevin/",
  "/adicionales-paty-alex/",
  "/adicionales-perla-alexis/",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Allow all public crawlers (including Googlebot / AI Overview) ──────
      {
        userAgent: "*",
        allow: ["/"],
        disallow: PRIVATE_ROUTES,
      },
      // ── Explicitly allow AI ANSWER engines ───────────────────────────────
      // These power ChatGPT browsing, Perplexity, Claude answers, Bing Copilot.
      // Allowing them makes El Romeral citable when users ask about venues.
      {
        userAgent: [
          "GPTBot",          // ChatGPT web browsing
          "ChatGPT-User",    // ChatGPT plugins
          "OAI-SearchBot",   // OpenAI search index
          "anthropic-ai",    // Claude (Anthropic)
          "ClaudeBot",       // Claude (Anthropic, newer)
          "PerplexityBot",   // Perplexity.ai
          "YouBot",          // You.com AI search
          "cohere-ai",       // Cohere
        ],
        allow: ["/"],
        disallow: PRIVATE_ROUTES,
      },
      // ── Block AI TRAINING scrapers (not answer engines) ───────────────────
      // These scrape content to build training datasets, not to answer queries.
      {
        userAgent: [
          "CCBot",               // Common Crawl (training data)
          "Bytespider",          // TikTok / ByteDance
          "FacebookBot",         // Meta training
          "meta-externalagent",  // Meta training (newer)
          "Omgilibot",           // Training scraper
          "DataForSeoBot",       // SEO scraper
          "AhrefsBot",           // SEO scraper
          "SemrushBot",          // SEO scraper
        ],
        disallow: ["/"],
      },
    ],
    sitemap: "https://elromeral.com.mx/sitemap.xml",
    host: "https://elromeral.com.mx",
  }
}
