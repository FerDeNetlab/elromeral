"use client"

import { createClient } from "@/lib/supabase/client"
import {
  Edit,
  Phone,
  Mail,
  Download,
  MessageCircle,
  Link2,
  Check,
  Copy,
  Loader2,
  Gift,
  ChevronDown,
  ChevronUp,
  Send,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { parsePartidas, type CategoriaDetalle } from "@/lib/parse-partidas"
import { EnviarEmailModal } from "@/components/cotizacion/enviar-email-modal"

interface Quote {
  id: string
  slug: string
  nombres: string
  email: string
  telefono: string
  fecha_evento: string
  num_invitados: number
  tipo_ceremonia: string
  menu: string
  barra: string
  decoracion: string
  servicios_adicionales: string[]
  partidas_detalle: any
  precio_total: number
  created_at: string
}

export default function CotizacionPage() {
  const params = useParams()
  const slug = params.slug as string

  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiado, setCopiado] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [showCondiciones, setShowCondiciones] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [descargandoPDF, setDescargandoPDF] = useState(false)
  const [showServiciosExternos, setShowServiciosExternos] = useState(false)
  const [showDireccionDetalle, setShowDireccionDetalle] = useState(false)
  const [checkVision, setCheckVision] = useState(false)
  const [checkPresupuesto, setCheckPresupuesto] = useState(false)
  const todosChecksMarcados = checkVision && checkPresupuesto

  // ============================================================================
  // CHECKBOXES TEMPORALMENTE DESHABILITADOS (17 ENERO 2026)
  // SE VOLVERÁN A HABILITAR EN APROXIMADAMENTE 2 SEMANAS
  // ============================================================================
  // const [checkVision, setCheckVision] = useState(false)
  // const [checkPresupuesto, setCheckPresupuesto] = useState(false)
  // const todosChecksMarcados = checkVision && checkPresupuesto
  // ============================================================================

  useEffect(() => {
    const fetchQuote = async () => {
      console.log("[v0] Iniciando fetchQuote para slug:", slug)
      console.log("[v0] SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("[v0] SUPABASE_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      const supabase = createClient()
      console.log("[v0] Cliente Supabase creado")

      let { data, error: dbError } = await supabase.from("quotes").select("*").eq("slug", slug).maybeSingle()

      console.log("[v0] Resultado búsqueda por slug:", { data: !!data, error: dbError?.message })

      // Si no encuentra por slug, intentar buscar por id
      if (!data && !dbError) {
        console.log("[v0] No encontrado por slug, buscando por id...")
        const result = await supabase.from("quotes").select("*").eq("id", slug).maybeSingle()
        data = result.data
        dbError = result.error
        console.log("[v0] Resultado búsqueda por id:", { data: !!data, error: result.error?.message })
      }

      if (dbError || !data) {
        console.log("[v0] Error final:", dbError?.message || "No data found")
        setQuote(null)
        setLoading(false)
        setError("Cotización no encontrada")
        return
      }

      console.log("[v0] Cotización encontrada:", data.id)
      setQuote(data as Quote)
      setLoading(false)
    }

    fetchQuote()
  }, [slug])

  const copiarLink = () => {
    const url = `${window.location.origin}/cotizacion/${slug}`
    navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const descargarPDF = async () => {
    if (!quote) return

    setDescargandoPDF(true)

    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      // Si el popup fue bloqueado, usar método alternativo
      alert("Por favor permite las ventanas emergentes para descargar el PDF")
      setDescargandoPDF(false)
      return
    }

    // Mostrar mensaje de carga mientras se genera
    printWindow.document.write(`
      <html>
        <head>
          <title>Generando PDF...</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
              background: #fafaf9;
            }
            .loader { text-align: center; color: #737373; }
          </style>
        </head>
        <body>
          <div class="loader">
            <p>Generando cotización...</p>
          </div>
        </body>
      </html>
    `)

    try {
      const response = await fetch(`/api/export-pdf?slug=${slug}`)

      if (!response.ok) {
        throw new Error("Error al generar PDF")
      }

      const html = await response.text()
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()

      // Esperar a que cargue y luego imprimir
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      printWindow.document.open()
      printWindow.document.write(`
        <html>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:system-ui;">
            <p style="color:#ef4444;">Error al generar el PDF. Por favor intenta de nuevo.</p>
          </body>
        </html>
      `)
      printWindow.document.close()
    } finally {
      setDescargandoPDF(false)
    }
  }

  const toggleCategory = (categoria: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoria) ? prev.filter((cat) => cat !== categoria) : [...prev, categoria],
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Cargando cotización...</p>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500">{error}</p>
        </div>
      </div>
    )
  }

  const partidasDetalle: CategoriaDetalle[] = parsePartidas(quote.partidas_detalle, quote)
  const cotizacionUrl = typeof window !== "undefined" ? `${window.location.origin}/cotizacion/${slug}` : ""

  const numInvitados = quote.num_invitados || 100
  let precioInstalaciones = 119000
  if (numInvitados <= 100) precioInstalaciones = 119000
  else if (numInvitados <= 150) precioInstalaciones = 149000
  else if (numInvitados <= 200) precioInstalaciones = 169000
  else if (numInvitados <= 250) precioInstalaciones = 189000
  else if (numInvitados <= 300) precioInstalaciones = 229000
  else if (numInvitados <= 350) precioInstalaciones = 259000
  else precioInstalaciones = 299000

  const precioInstalacionesReal = precioInstalaciones + 20000

  return (
    <div className="min-h-screen bg-white">
      {/* Header minimalista */}
      <header className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <p className="text-[10px] sm:text-xs tracking-[0.3em] text-neutral-400 uppercase">El Romeral</p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl text-neutral-900 font-light">{quote.nombres}</h1>
            <p className="text-xs sm:text-sm text-neutral-500 tracking-wide">Cotización de Boda</p>
          </div>
        </div>
      </header>

      {/* Info cards - Optimizado para móvil */}
      <section className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs tracking-wide text-neutral-400 uppercase mb-1 sm:mb-2">
                Fecha Cotización
              </p>
              <p className="font-serif text-sm sm:text-lg text-neutral-800">
                {new Date(quote.created_at).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs tracking-wide text-neutral-400 uppercase mb-1 sm:mb-2">Invitados</p>
              <p className="font-serif text-xl sm:text-2xl text-neutral-800">{quote.num_invitados}</p>
            </div>
            <div className="text-center col-span-2">
              <p className="text-[10px] sm:text-xs tracking-wide text-neutral-400 uppercase mb-1 sm:mb-2">
                Fecha del Evento
              </p>
              <p className="font-serif text-sm sm:text-lg text-neutral-800">
                {quote.fecha_evento
                  ? new Date(quote.fecha_evento).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Por definir"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto - Optimizado para móvil */}
      <section className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-neutral-50">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-neutral-400">Teléfono</p>
                <p className="text-sm sm:text-base text-neutral-800 truncate">{quote.telefono || "No especificado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-neutral-50">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-neutral-400">Correo</p>
                <p className="text-sm sm:text-base text-neutral-800 truncate">{quote.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Total - Optimizado para móvil */}
      <section className="bg-neutral-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="text-center md:text-left">
              <p className="text-[10px] sm:text-xs tracking-[0.2em] text-neutral-400 uppercase mb-1">
                Total Experiencia Integral
              </p>
              <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">
                ${Number(quote.precio_total).toLocaleString("es-MX")}
              </p>
              <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">MXN + IVA</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={descargarPDF}
                disabled={descargandoPDF}
                className="flex items-center gap-2 px-4 py-2.5 h-auto border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 rounded-md transition-all bg-white text-neutral-700 disabled:opacity-50"
              >
                {descargandoPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="text-xs sm:text-sm font-medium">
                  {descargandoPDF ? "Generando..." : "Descargar PDF"}
                </span>
              </Button>
              <a
                href="http://wa.me/3338708159"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 h-auto border border-neutral-300 hover:border-green-600 hover:bg-green-50 rounded-md transition-all bg-white text-neutral-700 hover:text-green-700"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">WhatsApp</span>
              </a>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2.5 h-auto border-neutral-300 hover:border-blue-600 hover:bg-blue-50 rounded-md transition-all bg-white text-neutral-700 hover:text-blue-700"
                onClick={() => setShowEmailModal(true)}
              >
                <Send className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">
                  <span className="hidden sm:inline">Enviar por Correo</span>
                  <span className="sm:hidden">Correo</span>
                </span>
              </Button>
              <Link href={`/configurador?slug=${slug}&step=13`}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2.5 h-auto border-neutral-300 hover:border-neutral-900 hover:bg-neutral-100 rounded-md transition-all bg-white text-neutral-700"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">Modificar</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Desglose detallado - Optimizado para móvil */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-xl sm:text-2xl text-neutral-800 text-center mb-8 sm:mb-12">
            Desglose de Inversión
          </h2>

          {partidasDetalle.length > 0 ? (
            <div className="space-y-8 sm:space-y-12">
              {partidasDetalle.map((categoriaData, catIdx) => {
                const totalCategoria = categoriaData.items.reduce((sum, item) => sum + item.total, 0)

                const isInstalaciones = categoriaData.categoria === "Instalaciones"

                return (
                  <div key={catIdx} className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="h-px flex-1 bg-neutral-200" />
                      <h3 className="text-[10px] sm:text-sm tracking-[0.2em] text-neutral-500 uppercase text-center">
                        {categoriaData.categoria}
                      </h3>
                      <div className="h-px flex-1 bg-neutral-200" />
                    </div>

                    <div className="border border-neutral-200 overflow-x-auto">
                      <table className="w-full min-w-[400px]">
                        <thead>
                          <tr className="border-b border-neutral-200 bg-neutral-50">
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-xs tracking-wide text-neutral-500 uppercase font-medium w-16 sm:w-20">
                              Cant.
                            </th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-xs tracking-wide text-neutral-500 uppercase font-medium">
                              Descripción
                            </th>
                            <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-xs tracking-wide text-neutral-500 uppercase font-medium w-24 sm:w-32">
                              Precio
                            </th>
                            <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-xs tracking-wide text-neutral-500 uppercase font-medium w-24 sm:w-32">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {categoriaData.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                              <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-base text-neutral-800">
                                {item.cantidad}
                              </td>
                              <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-base text-neutral-800">
                                {item.descripcion}
                              </td>
                              <td className="text-right py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-base text-neutral-500">
                                {isInstalaciones ? (
                                  <div className="flex flex-col items-end">
                                    <span className="text-neutral-400 line-through text-[10px] sm:text-xs">
                                      ${(item.precioUnitario + 20000).toLocaleString("es-MX")}
                                    </span>
                                    <span>${item.precioUnitario.toLocaleString("es-MX")}</span>
                                  </div>
                                ) : (
                                  `$${item.precioUnitario.toLocaleString("es-MX")}`
                                )}
                              </td>
                              <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-medium text-xs sm:text-base text-neutral-800">
                                ${item.total.toLocaleString("es-MX")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-neutral-200 bg-neutral-50">
                            <td
                              colSpan={3}
                              className="py-3 sm:py-4 px-3 sm:px-6 text-right text-[10px] sm:text-sm text-neutral-600"
                            >
                              Subtotal {categoriaData.categoria}:
                            </td>
                            <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-base text-neutral-900">
                              ${totalCategoria.toLocaleString("es-MX")}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {isInstalaciones && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs sm:text-sm text-neutral-500 italic">
                          * Beneficio de $20,000 MXN aplicable al contratar todos los servicios seleccionados y
                          adicionales con El Romeral para sus Bodas. Esto garantiza la calidad del servicio y una
                          coordinación efectiva durante todo el proceso de sus eventos.
                        </p>
                        <button
                          onClick={() => setShowServiciosExternos(!showServiciosExternos)}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {showServiciosExternos ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          Ver servicios que pueden contratarse con externos
                        </button>
                        {showServiciosExternos && (
                          <div className="mt-2 p-3 bg-neutral-50 rounded text-xs sm:text-sm text-neutral-600 space-y-1">
                            <p>
                              • Vinos y licores en botella cerrada{" "}
                              <span className="italic text-neutral-400">
                                (No servicios a proveedores externos de barras de vinos y licores)
                              </span>
                            </p>
                            <p>• Fotógrafo y video</p>
                            <p>• Mariachi</p>
                            <p>• Social DJ</p>
                            <p>
                              • Souvenirs <span className="italic text-neutral-400">(Cilindros, pantuflas, etc)</span>
                            </p>
                            <p>
                              • Grupo musical{" "}
                              <span className="italic text-neutral-400">
                                (Se rentará con El Romeral la planta de luz para grupo musical y/o tarimas o estrados)
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {isInstalaciones && (
                      <div key={`direccion-${catIdx}`} className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="h-px flex-1 bg-neutral-200" />
                          <h3 className="text-[10px] sm:text-sm tracking-[0.2em] text-neutral-500 uppercase text-center">
                            Dirección Integral
                          </h3>
                          <div className="h-px flex-1 bg-neutral-200" />
                        </div>

                        <div className="border border-neutral-200 p-4 sm:p-6 bg-gradient-to-br from-neutral-50 to-white">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-serif text-base sm:text-lg text-neutral-800">
                                    Dirección Integral del Evento
                                  </h4>
                                  <span className="text-[9px] sm:text-[10px] px-2 py-0.5 bg-primary/10 text-primary uppercase tracking-wider">
                                    Cortesía
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                                  El Romeral no solo es un venue, contamos con todos los servicios in house para que su
                                  evento fluya con orden y tranquilidad.
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] sm:text-xs text-neutral-400">Valor real</p>
                              <p className="text-sm sm:text-base text-neutral-400 line-through">$40,500</p>
                              <p className="text-lg sm:text-xl font-serif text-primary">$0</p>
                            </div>
                          </div>

                          <button
                            onClick={() => setShowDireccionDetalle(!showDireccionDetalle)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline mt-4"
                          >
                            {showDireccionDetalle ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            {showDireccionDetalle ? "Ocultar detalle" : "Ver detalle"}
                          </button>

                          {showDireccionDetalle && (
                            <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3">
                              <p className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider">
                                Incluye:
                              </p>
                              <ul className="text-xs sm:text-sm text-neutral-600 space-y-2">
                                <li className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  Producción creativa del evento
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  Coordinación operativa el día del evento (minuto a minuto)
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  Coordinación con fotógrafo, video, grupos musicales y social DJ
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  Coordinación de vinos y licores en botella cerrada
                                </li>
                              </ul>
                              <p className="text-xs sm:text-sm text-neutral-500 italic mt-4">
                                * Esta cortesía es aplicable al contratar todos los servicios seleccionados y
                                adicionales con El Romeral para su Boda. Esto garantiza la calidad del servicio y una
                                coordinación efectiva durante todo el proceso de su evento.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 border border-neutral-200 bg-neutral-50">
              <p className="text-sm sm:text-base text-neutral-500 mb-2">No hay desglose detallado disponible</p>
              <p className="text-xs sm:text-sm text-neutral-400">
                Las cotizaciones nuevas incluirán el desglose completo
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================================ */}
      {/* SECCIÓN DE CHECKBOXES TEMPORALMENTE DESHABILITADA (17 ENERO 2026) */}
      {/* SE VOLVERÁ A HABILITAR EN APROXIMADAMENTE 2 SEMANAS */}
      {/* ============================================================================ */}
      {/* <section className="border-t border-neutral-200 py-8 sm:py-12 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="border border-neutral-200 bg-white p-6 sm:p-10 space-y-6 sm:space-y-8">
            <div className="text-center space-y-3">
              <h4 className="font-serif text-xl sm:text-2xl text-neutral-800">Antes de agendar su visita</h4>
              <p className="text-neutral-500 text-sm">
                Es un momento para conectar, para confirmar que podemos hacer de su boda un día verdaderamente
                inolvidable en sus vidas.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={checkVision}
                    onChange={(e) => setCheckVision(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 border-2 transition-all duration-200 flex items-center justify-center ${
                      checkVision
                        ? "bg-neutral-900 border-neutral-900"
                        : "border-neutral-300 group-hover:border-neutral-400"
                    }`}
                  >
                    {checkVision && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Lo que acabamos de configurar refleja lo que estamos buscando para nuestra boda, y sentimos que El
                  Romeral puede hacer de este día algo verdaderamente especial.
                </span>
              </label>

              <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={checkPresupuesto}
                    onChange={(e) => setCheckPresupuesto(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 border-2 transition-all duration-200 flex items-center justify-center ${
                      checkPresupuesto
                        ? "bg-neutral-900 border-neutral-900"
                        : "border-neutral-300 group-hover:border-neutral-400"
                    }`}
                  >
                    {checkPresupuesto && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Entendemos la inversión aproximada y nos sentimos cómodos con este nivel de presupuesto para nuestro
                  evento.
                </span>
              </label>
            </div>

            {!todosChecksMarcados && (
              <p className="text-center text-xs text-neutral-400 italic">
                Por favor, confirme los dos puntos para continuar
              </p>
            )}
          </div>
        </div>
      </section> */}
      {/* ============================================================================ */}

      {/* Sección de Agendar Cita (ahora sin checkboxes) */}
      <section className="border-t border-neutral-200 py-8 sm:py-12 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="border border-neutral-200 bg-white p-6 sm:p-10 space-y-6">
            <div className="text-center">
              <Button
                onClick={() => window.open("https://cal.com/ricardo-heredia-jxuu3m", "_blank")}
                className="px-8 sm:px-12 py-4 sm:py-6 text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Agendar Visita
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Link de cotización - Optimizado para móvil */}
      <section className="border-t border-neutral-200 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-2 text-neutral-600">
              <Link2 className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Enlace permanente de su cotización</span>
            </div>
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-neutral-50 border border-neutral-200">
              <input
                type="text"
                value={cotizacionUrl}
                readOnly
                className="flex-1 bg-transparent text-neutral-600 text-xs sm:text-sm outline-none truncate"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copiarLink}
                className="rounded-none hover:bg-neutral-200 flex-shrink-0"
              >
                {copiado ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Condiciones comerciales - Optimizado para móvil con mismos términos */}
      <section className="border-t border-neutral-200 py-8 sm:py-12 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => setShowCondiciones(!showCondiciones)}
            className="w-full flex items-center justify-center gap-2 font-serif text-lg sm:text-xl text-neutral-800 hover:text-neutral-600 transition-colors mb-6 sm:mb-8"
          >
            <span>Condiciones Comerciales</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showCondiciones ? "rotate-180" : ""}`} />
          </button>

          {showCondiciones && (
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
              <p>
                Esta propuesta es válida únicamente a la fecha de su emisión. Transcurrida la fecha, los precios y
                condiciones podrán modificarse sin previo aviso. La propuesta será vinculante únicamente una vez
                aceptada por escrito por ambas partes.
              </p>
              <p>
                Todos los servicios incluidos en esta propuesta están sujetos a disponibilidad y fechas hasta la firma
                del contrato y el bloqueo de 25k MXN.
              </p>
              <p>
                A los 30 días de realizar el bloqueo de fecha, deberá llevar a cabo el pago del 30% del total del
                proyecto para congelar los precios estipulados en la propuesta. El resto de los pagos será a meses sin
                intereses hasta un mes antes del evento estar liquidado en su totalidad.
              </p>
              <p className="font-medium text-neutral-800">Precios antes de IVA</p>
              <p>
                Cancelaciones mayores a 181 días previos al evento se deberá liquidar el 60% del precio pactado por
                daños y perjuicios.
              </p>
              <p>
                Cancelaciones entre 1 y 180 días previos al evento deberá liquidar el 100% del precio pactado por
                concepto de daños y perjuicios.
              </p>
              <p>
                Para llevar a cabo una experiencia integral con Romeral todos los servicios de su boda deberán ser
                contratados con El Romeral.
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-300">
                <p className="font-medium text-neutral-700 mb-2">
                  Servicios que pueden contratarse con proveedores externos:
                </p>
                <ul className="space-y-1 text-neutral-600">
                  <li>
                    • Vinos y licores en botella cerrada{" "}
                    <span className="italic text-neutral-400">
                      (No servicios a proveedores externos de barras de vinos y licores)
                    </span>
                  </li>
                  <li>• Fotógrafo y video</li>
                  <li>• Mariachi</li>
                  <li>• Social DJ</li>
                  <li>
                    • Souvenirs <span className="italic text-neutral-400">(Cilindros, pantuflas, etc)</span>
                  </li>
                  <li>
                    • Grupo musical{" "}
                    <span className="italic text-neutral-400">
                      (Se rentará con El Romeral la planta de luz para grupo musical y/o tarimas o estrados)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {quote && (
        <EnviarEmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          clientEmail={quote.email}
          quoteName={quote.nombres}
          quoteSlug={quote.slug}
          quoteTotal={quote.precio_total}
          quoteDate={quote.fecha_evento}
          numInvitados={quote.num_invitados}
        />
      )}
    </div>
  )
}
