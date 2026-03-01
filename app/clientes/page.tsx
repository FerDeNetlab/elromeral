import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Calendar, Mail, Phone, Users, ExternalLink } from "lucide-react"

async function checkAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

interface PartidaItem {
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
}

interface CategoriaDetalle {
  categoria: string
  items: PartidaItem[]
}

function parsePartidasDetalle(data: any): CategoriaDetalle[] {
  if (!data) return []
  if (typeof data === "string") {
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  }
  if (Array.isArray(data)) return data
  return []
}

export default async function ClientesPage() {
  const user = await checkAuth()

  if (!user) {
    redirect("/admin/login")
  }

  const supabase = await createClient()

  const { data: quotes, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching quotes:", error)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs tracking-[0.3em] text-neutral-400 uppercase mb-2">El Romeral</p>
              <h1 className="font-serif text-3xl md:text-4xl text-neutral-900 font-light">Dashboard de Clientes</h1>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm tracking-wide text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Ir al Dashboard
              </Link>
              <Link
                href="/configurador"
                className="text-sm tracking-wide text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                + Personaliza y cotiza tu boda
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!quotes || quotes.length === 0 ? (
          <div className="text-center py-24 border border-neutral-200 bg-neutral-50">
            <p className="text-neutral-500 mb-4">No hay cotizaciones aún</p>
            <Link
              href="/configurador"
              className="text-sm tracking-wide text-neutral-900 underline underline-offset-4 hover:no-underline"
            >
              Personaliza y cotiza tu boda
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header de tabla */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs tracking-wide text-neutral-400 uppercase border-b border-neutral-200">
              <div className="col-span-3">Cliente</div>
              <div className="col-span-2">Fecha Evento</div>
              <div className="col-span-2">Contacto</div>
              <div className="col-span-1 text-center">Invitados</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>

            {/* Filas */}
            {quotes.map((quote) => {
              const partidasDetalle = parsePartidasDetalle(quote.partidas_detalle)
              const totalServicios = partidasDetalle.reduce(
                (sum: number, cat: CategoriaDetalle) => sum + (cat.items?.length || 0),
                0,
              )

              return (
                <div
                  key={quote.id}
                  className="border border-neutral-200 hover:border-neutral-400 transition-colors bg-white"
                >
                  {/* Vista desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center">
                    <div className="col-span-3">
                      <p className="font-serif text-lg text-neutral-900">{quote.nombres}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {new Date(quote.created_at).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-neutral-700">
                        {quote.fecha_evento
                          ? new Date(quote.fecha_evento).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Por definir"}
                      </p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-neutral-500 truncate">{quote.email}</p>
                      <p className="text-xs text-neutral-500">{quote.telefono}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-sm text-neutral-700">{quote.num_invitados}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="font-serif text-xl text-neutral-900">
                        ${Number(quote.precio_total).toLocaleString("es-MX")}
                      </p>
                      {totalServicios > 0 && (
                        <p className="text-xs text-neutral-400 mt-1">{totalServicios} servicios</p>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      <Link
                        href={`/cotizacion/${quote.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                      >
                        Ver detalle
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Vista mobile */}
                  <Link href={`/cotizacion/${quote.slug}`} className="md:hidden block p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-serif text-lg text-neutral-900">{quote.nombres}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {new Date(quote.created_at).toLocaleDateString("es-MX")}
                        </p>
                      </div>
                      <p className="font-serif text-xl text-neutral-900">
                        ${Number(quote.precio_total).toLocaleString("es-MX")}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {quote.fecha_evento
                            ? new Date(quote.fecha_evento).toLocaleDateString("es-MX")
                            : "Por definir"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{quote.num_invitados} invitados</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm truncate">{quote.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{quote.telefono}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
