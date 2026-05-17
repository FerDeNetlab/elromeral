import type { MetadataRoute } from "next"

const BASE_URL = "https://elromeral.com.mx"

/**
 * Public routes with their SEO configuration.
 * Routes omitted intentionally (private/internal):
 *   /admin, /api, /brochure, /clientes, /encuesta,
 *   /cotizacion*, /cotizador-personalizado, /adicionales-*, /cot-test
 */
const staticRoutes: {
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  lastModified?: Date
}[] = [
  // ── Core landing ──────────────────────────────────────────────────────────
  {
    path: "/",
    priority: 1.0,
    changeFrequency: "weekly",
  },
  // ── High-intent conversion pages ─────────────────────────────────────────
  {
    path: "/configurador",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "/eventos-diurnos",
    priority: 0.85,
    changeFrequency: "monthly",
  },
  {
    path: "/comunion",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  // ── Content & discovery ───────────────────────────────────────────────────
  {
    path: "/galeria",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    path: "/blog",
    priority: 0.75,
    changeFrequency: "weekly",
  },
  {
    path: "/planners",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/experiencia-bienvenida",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: "/one-pager",
    priority: 0.5,
    changeFrequency: "monthly",
  },
  {
    path: "/manifiesto-2026",
    priority: 0.4,
    changeFrequency: "yearly",
  },
  // ── Legal ─────────────────────────────────────────────────────────────────
  {
    path: "/condiciones-de-servicio",
    priority: 0.2,
    changeFrequency: "yearly",
  },
  {
    path: "/politica-de-privacidad",
    priority: 0.2,
    changeFrequency: "yearly",
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static routes ────────────────────────────────────────────────────────
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: route.lastModified ?? now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        "es-MX": `${BASE_URL}${route.path}`,
        "x-default": `${BASE_URL}${route.path}`,
      },
    },
  }))

  // ── Dynamic blog posts ────────────────────────────────────────────────────
  // When blog posts are stored in Supabase, add them here:
  //
  //   const { createClient } = await import("@/lib/supabase/server")
  //   const supabase = createClient()
  //   const { data: posts } = await supabase
  //     .from("blog_posts")
  //     .select("slug, updated_at")
  //     .eq("published", true)
  //   const blogEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
  //     url: `${BASE_URL}/blog/${post.slug}`,
  //     lastModified: new Date(post.updated_at),
  //     changeFrequency: "monthly",
  //     priority: 0.65,
  //     alternates: { languages: { "es-MX": `${BASE_URL}/blog/${post.slug}`, "x-default": `${BASE_URL}/blog/${post.slug}` } },
  //   }))
  //   return [...staticEntries, ...blogEntries]

  return staticEntries
}
