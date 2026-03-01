"use client"

import { Suspense } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, Loader2, ArrowUpRight, AlertCircle, CheckCircle2, X, Eye } from "lucide-react"

interface Quote {
  id: string
  slug: string
  nombres: string
  email: string
  created_at: string
  precio_total: number
  num_invitados: number
  fecha_evento: string | null
  status: string
  current_step: number | null
  is_complete: boolean | null
  last_saved_at: string | null
  configuracion_completa: any | null
  partidas_detalle: any[] | null
}

async function fetchDashboardData() {
  const supabase = createClient()
  const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching quotes:", error)
    return []
  }
  return data || []
}

function AdminDashboardContent() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [mostrarTodasIncompletas, setMostrarTodasIncompletas] = useState(false)
  const [mostrarTodasCompletas, setMostrarTodasCompletas] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const data = await fetchDashboardData()
      setQuotes(data)
      setLoading(false)
    }
    loadData()
  }, [])

  // Lógica corregida: una cotización es completa SOLO si is_complete=true Y precio_total>0
  // Todo lo demás es incompleta (evita duplicaciones)
  const cotizacionesCompletas = quotes.filter((q) => q.is_complete === true && q.precio_total > 0)
  const cotizacionesIncompletas = quotes.filter(
    (q) => !(q.is_complete === true && q.precio_total > 0)
  )

  // Identificar cotizaciones que llegaron al final pero tienen precio = 0 o null (error de cálculo)
  const cotizacionesConErrorPrecio = cotizacionesIncompletas.filter((q) => q.is_complete === true)

  // Calcular métricas
  const totalCotizaciones = quotes.length
  const totalIngresos = cotizacionesCompletas.reduce((sum, q) => sum + Number(q.precio_total || 0), 0)

  // Contar por status
  const statusCounts = {
    nuevo_lead: quotes.filter((q) => !q.status || q.status === "nuevo_lead").length,
    en_progreso: quotes.filter((q) => q.status === "en_progreso").length,
    cotizacion_completa: quotes.filter((q) => q.status === "cotizacion_completa").length,
    contactado: quotes.filter((q) => q.status === "contactado").length,
    perdido: quotes.filter((q) => q.status === "perdido").length,
    visito: quotes.filter((q) => q.status === "visito").length,
    cotizado: quotes.filter((q) => q.status === "cotizado").length,
    ganado: quotes.filter((q) => q.status === "ganado").length,
  }

  // Cotizaciones de este mes
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)
  const cotizacionesMes = quotes.filter((q) => new Date(q.created_at) >= inicioMes).length

  // Tasa de conversión
  const tasaConversion = totalCotizaciones > 0 ? Math.round((statusCounts.ganado / totalCotizaciones) * 100) : 0

  // Cotizaciones por día de la semana (últimos 5 días)
  const cotizacionesPorDia = Array.from({ length: 5 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (4 - i))
    const count = quotes.filter((q) => {
      const qDate = new Date(q.created_at)
      return qDate.toDateString() === date.toDateString()
    }).length
    return {
      day:
        date.toLocaleDateString("es-MX", { weekday: "short" }).charAt(0).toUpperCase() +
        date.toLocaleDateString("es-MX", { weekday: "short" }).slice(1),
      count,
    }
  })

  const maxCount = Math.max(...cotizacionesPorDia.map((d) => d.count), 1)

  const stepNames: Record<number, string> = {
    1: "Información",
    2: "Menú",
    3: "Vinos",
    4: "Mobiliario",
    5: "Mesa Novios",
    6: "Floristería",
    7: "Toldo",
    8: "Superficie",
    9: "Música",
    10: "Pista",
    11: "Capilla",
    12: "Extras",
    13: "Cotización",
  }

  const getCurrentStepFromData = (quote: Quote): number => {
    if (quote.current_step && quote.current_step >= 1 && quote.current_step <= 13) {
      return quote.current_step
    }
    return 1
  }

  const parseQuoteData = (quote: Quote) => {
    try {
      const config = quote.configuracion_completa || {}

      // Mapear tipoComida a nombre legible
      const tipoComidaMap: Record<string, string> = {
        parrillada: "Parrillada",
        menu3tiempos: "Menú 3 Tiempos",
        menu4tiempos: "Menú 4 Tiempos",
        menu5tiempos: "Menú 5 Tiempos",
      }

      // Mapear tipoMusica a nombre legible
      const tipoMusicaMap: Record<string, string> = {
        grupo: "Grupo Musical",
        dj: "DJ",
        ambos: "Grupo + DJ",
        no: "Sin música",
      }

      // Mapear tipoPista a nombre legible
      const tipoPistaMap: Record<string, string> = {
        pintada: "Pista Pintada",
        madera: "Pista de Madera",
        led: "Pista LED",
        no: "Sin pista",
      }

      // Mapear tipoToldo a nombre legible
      const tipoToldoMap: Record<string, string> = {
        personalizado: "Toldo Personalizado",
        carpa: "Carpa",
        no: "Sin toldo",
      }

      // Mapear tipoSuperficie a nombre legible
      const tipoSuperficieMap: Record<string, string> = {
        pasto: "Pasto Natural",
        duela: "Duela",
        concreto: "Concreto",
      }

      // Calcular mesas seleccionadas
      const mesasConfig = config.mesasSeleccionadas || {}
      const mesasTexto = []
      if (mesasConfig.default > 0) mesasTexto.push(`${mesasConfig.default} Mesas Estándar`)
      if (mesasConfig.parota > 0) mesasTexto.push(`${mesasConfig.parota} Mesas Parota`)
      if (mesasConfig.marmol > 0) mesasTexto.push(`${mesasConfig.marmol} Mesas Mármol`)
      if (mesasConfig.cristal > 0) mesasTexto.push(`${mesasConfig.cristal} Mesas Cristal`)
      if (mesasConfig.reyArturo > 0) mesasTexto.push(`${mesasConfig.reyArturo} Mesas Rey Arturo`)
      if (mesasConfig.shabbyChic > 0) mesasTexto.push(`${mesasConfig.shabbyChic} Mesas Shabby Chic`)

      return {
        numInvitados: config.numInvitados || quote.num_invitados || 0,
        tipoEvento: config.tipoEvento || "No seleccionado",
        tipoComida: config.tipoComida ? tipoComidaMap[config.tipoComida] || config.tipoComida : "No seleccionado",
        incluyeVinosLicores:
          config.incluyeVinosLicores === true ? "Sí" : config.incluyeVinosLicores === false ? "No" : "No seleccionado",
        mesas: mesasTexto.length > 0 ? mesasTexto.join(", ") : "No seleccionado",
        incluyeMesaNovios:
          config.incluyeMesaNovios === true ? "Sí" : config.incluyeMesaNovios === false ? "No" : "No seleccionado",
        tipoMesaNovios: config.tipoMesaNovios || "No seleccionado",
        arreglosFlorales:
          config.arreglosFlorales?.length > 0
            ? `${config.arreglosFlorales.length} arreglos configurados`
            : "No seleccionado",
        tipoToldo: config.tipoToldo ? tipoToldoMap[config.tipoToldo] || config.tipoToldo : "No seleccionado",
        tipoSuperficie: config.tipoSuperficie
          ? tipoSuperficieMap[config.tipoSuperficie] || config.tipoSuperficie
          : "No seleccionado",
        tipoMusica: config.tipoMusica ? tipoMusicaMap[config.tipoMusica] || config.tipoMusica : "No seleccionado",
        tipoPista: config.tipoPista ? tipoPistaMap[config.tipoPista] || config.tipoPista : "No seleccionado",
        incluyeCapilla:
          config.incluyeCapilla === true ? "Sí" : config.incluyeCapilla === false ? "No" : "No seleccionado",
        extrasSeleccionados: config.extrasSeleccionados?.length > 0 ? config.extrasSeleccionados : [],
      }
    } catch (error) {
      console.error("[v0] Error parseando datos de cotización:", error)
      return null
    }
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header con búsqueda - Haciéndolo responsive */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:justify-between mb-8">
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
          <Link
            href="/admin/crm"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
          >
            + <span className="hidden sm:inline">Ver</span> CRM
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Métricas principales - Grid responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {/* Gráfico de nuevos clientes */}
            <div className="bg-white rounded-2xl p-4 lg:p-6 border border-gray-100">
              <p className="text-xs lg:text-sm text-gray-500 mb-4">Nuevos clientes</p>
              <div className="flex items-end gap-1 lg:gap-2 h-16 lg:h-24">
                {cotizacionesPorDia.map((dia, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 lg:gap-2">
                    <div
                      className="w-full bg-[#1a1a1a] rounded-sm transition-all"
                      style={{ height: `${(dia.count / maxCount) * 80}px`, minHeight: dia.count > 0 ? "8px" : "2px" }}
                    />
                    <span className="text-[10px] lg:text-xs text-gray-400">{dia.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasa de conversión */}
            <div className="bg-white rounded-2xl p-4 lg:p-6 border border-gray-100">
              <p className="text-xs lg:text-sm text-gray-500 mb-2 lg:mb-4">Tasa de éxito</p>
              <div className="relative w-16 h-16 lg:w-24 lg:h-24 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="3"
                    strokeDasharray={`${tasaConversion}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg lg:text-2xl font-semibold">{tasaConversion}%</span>
                </div>
              </div>
              <p className="text-[10px] lg:text-xs text-gray-400 text-center mt-1 lg:mt-2">Eventos ganados</p>
            </div>

            {/* Cotizaciones activas */}
            <div className="bg-white rounded-2xl p-4 lg:p-6 border border-gray-100">
              <p className="text-xs lg:text-sm text-gray-500 mb-1 lg:mb-2">En proceso</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-4xl font-semibold">
                  {statusCounts.contactado + statusCounts.visito + statusCounts.cotizado}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 lg:mt-2 text-[10px] lg:text-xs text-gray-400">
                <span>Cotizaciones activas</span>
                <ArrowUpRight className="w-3 h-3 hidden lg:block" />
              </div>
            </div>

            {/* Ingresos potenciales */}
            <div className="bg-white rounded-2xl p-4 lg:p-6 border border-gray-100">
              <p className="text-xs lg:text-sm text-gray-500 mb-1 lg:mb-2">Valor potencial</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl lg:text-4xl font-semibold">${(totalIngresos / 1000000).toFixed(1)}</span>
                <span className="text-sm lg:text-lg text-gray-400">M</span>
              </div>
              <div className="flex items-center gap-1 mt-1 lg:mt-2 text-[10px] lg:text-xs text-gray-400">
                <span>Total en cotizaciones</span>
                <ArrowUpRight className="w-3 h-3 hidden lg:block" />
              </div>
            </div>
          </div>

          {cotizacionesIncompletas.length > 0 && (
            <div className="mb-8 bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-amber-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h2 className="font-semibold text-amber-800 text-sm lg:text-base">
                  Cotizaciones Incompletas ({cotizacionesIncompletas.length})
                </h2>
              </div>

              <div className="divide-y divide-amber-200">
                {(mostrarTodasIncompletas ? cotizacionesIncompletas : cotizacionesIncompletas.slice(0, 5)).map((quote) => (
                  <div
                    key={quote.id}
                    className="p-3 lg:p-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 hover:bg-amber-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-sm font-medium text-amber-700 flex-shrink-0">
                        {quote.nombres ? quote.nombres.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate text-sm lg:text-base">{quote.nombres || "Sin nombre"}</p>
                          {quote.is_complete === true && (!quote.precio_total || quote.precio_total === 0) && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full font-medium whitespace-nowrap">
                              Error precio
                            </span>
                          )}
                        </div>
                        <p className="text-xs lg:text-sm text-amber-600 truncate">{quote.email || "Sin email"}</p>
                        <p className="text-[10px] text-amber-500 mt-0.5">
                          {new Date(quote.created_at).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          •{" "}
                          {new Date(quote.created_at).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between lg:flex-1 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 lg:gap-1">
                          {Array.from({ length: 13 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${
                                i < getCurrentStepFromData(quote) ? "bg-amber-500" : "bg-amber-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] lg:text-xs text-amber-600">
                          {stepNames[getCurrentStepFromData(quote)] || `Paso ${getCurrentStepFromData(quote)}`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedQuote(quote)
                          setShowProgressModal(true)
                        }}
                        className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Eye className="w-3 h-3" />
                        Ver Avance
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {cotizacionesIncompletas.length > 5 && (
                <button
                  onClick={() => setMostrarTodasIncompletas(!mostrarTodasIncompletas)}
                  className="w-full p-4 text-center border-t border-amber-200 hover:bg-amber-100/50 transition-colors"
                >
                  <span className="text-xs lg:text-sm text-amber-600 font-medium">
                    {mostrarTodasIncompletas 
                      ? "Mostrar menos" 
                      : `+${cotizacionesIncompletas.length - 5} cotizaciones incompletas más`
                    }
                  </span>
                </button>
              )}
            </div>
          )}

          {cotizacionesCompletas.length > 0 && (
            <div className="mb-8 bg-green-50 rounded-2xl border border-green-200 overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-green-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-green-800 text-sm lg:text-base">
                  Cotizaciones Completas ({cotizacionesCompletas.length})
                </h2>
              </div>

              <div className="divide-y divide-green-200">
                {(mostrarTodasCompletas ? cotizacionesCompletas : cotizacionesCompletas.slice(0, 5)).map((quote) => (
                  <div
                    key={quote.id}
                    className="p-3 lg:p-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 hover:bg-green-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-sm font-medium text-green-700 flex-shrink-0">
                        {quote.nombres ? quote.nombres.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm lg:text-base">{quote.nombres || "Sin nombre"}</p>
                        <p className="text-xs lg:text-sm text-green-600 truncate">{quote.email || "Sin email"}</p>
                        <p className="text-[10px] text-green-500 mt-0.5">
                          {new Date(quote.created_at).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          •{" "}
                          {new Date(quote.created_at).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between lg:justify-end gap-3">
                      <div className="text-left lg:text-right">
                        <p className="font-semibold text-sm lg:text-base text-green-800">
                          ${Number(quote.precio_total || 0).toLocaleString("es-MX")}
                        </p>
                        <p className="text-[10px] lg:text-xs text-green-600">{quote.num_invitados || 0} invitados</p>
                      </div>
                      <Link
                        href={`/cotizacion/${quote.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">Ver Cotización</span>
                        <span className="sm:hidden">Ver</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {cotizacionesCompletas.length > 5 && (
                <button
                  onClick={() => setMostrarTodasCompletas(!mostrarTodasCompletas)}
                  className="w-full p-4 text-center border-t border-green-200 hover:bg-green-100/50 transition-colors"
                >
                  <span className="text-xs lg:text-sm text-green-600 font-medium">
                    {mostrarTodasCompletas 
                      ? "Mostrar menos" 
                      : `+${cotizacionesCompletas.length - 5} cotizaciones completas más`
                    }
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Pipeline Kanban preview - Grid responsive */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-sm lg:text-base">Pipeline de Ventas</h2>
              <Link
                href="/admin/crm"
                className="text-xs lg:text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                Ver todo <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
                  {[
                    { key: "nuevo_lead", label: "Nuevos", count: statusCounts.nuevo_lead, color: "bg-blue-50" },
                    { key: "en_progreso", label: "En Progreso", count: statusCounts.en_progreso, color: "bg-yellow-50" },
                    { key: "cotizacion_completa", label: "Cotizaciones", count: statusCounts.cotizacion_completa, color: "bg-green-50" },
                    { key: "contactado", label: "Contactados", count: statusCounts.contactado, color: "bg-purple-50" },
                    { key: "visito", label: "Visitaron", count: statusCounts.visito, color: "bg-indigo-50" },
                    { key: "cotizado", label: "Cotizados", count: statusCounts.cotizado, color: "bg-cyan-50" },
                    { key: "ganado", label: "Ganados", count: statusCounts.ganado, color: "bg-emerald-50" },
                    { key: "perdido", label: "Perdidos", count: statusCounts.perdido, color: "bg-red-50" },
                  ].map((item) => (
                <Link
                  key={item.key}
                  href="/admin/crm"
                  className={`p-3 lg:p-6 hover:opacity-90 transition-all text-center ${item.color}`}
                >
                  <p className="text-xl lg:text-3xl font-semibold mb-1">{item.count}</p>
                  <p className="text-[10px] lg:text-xs text-gray-600 truncate">{item.label}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Últimos clientes */}
          <div className="mt-6 lg:mt-8 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-sm lg:text-base">Últimas Cotizaciones</h2>
              <Link
                href="/admin/clientes"
                className="text-xs lg:text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                Ver todos <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {cotizacionesCompletas.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">No hay cotizaciones completas aún</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cotizacionesCompletas
                  .filter(
                    (q) =>
                      searchTerm === "" || (q.nombres && q.nombres.toLowerCase().includes(searchTerm.toLowerCase())),
                  )
                  .slice(0, 5)
                  .map((quote) => (
                    <Link
                      key={quote.id}
                      href={`/cotizacion/${quote.slug || quote.id}`}
                      target="_blank"
                      className="p-3 lg:p-4 flex items-center gap-3 lg:gap-4 hover:bg-gray-50 transition-colors block"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                        {quote.nombres ? quote.nombres.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm lg:text-base">{quote.nombres || "Sin nombre"}</p>
                        <p className="text-xs lg:text-sm text-gray-400 truncate">
                          {new Date(quote.created_at).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                          })}
                          {quote.fecha_evento && (
                            <>
                              {" "}
                              · Evento:{" "}
                              {new Date(quote.fecha_evento).toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "short",
                              })}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm lg:text-base">
                          ${Number(quote.precio_total).toLocaleString("es-MX")}
                        </p>
                        <p className="text-[10px] lg:text-xs text-gray-400">{quote.num_invitados} inv.</p>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de progreso */}
      {showProgressModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold text-base lg:text-lg">{selectedQuote.nombres}</h3>
                <p className="text-xs lg:text-sm text-gray-500">{selectedQuote.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProgressModal(false)
                  setSelectedQuote(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 lg:p-6">
              {/* Indicador visual de progreso */}
              <div className="mb-6">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 13 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${
                        i < getCurrentStepFromData(selectedQuote) ? "bg-amber-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs lg:text-sm text-gray-600">
                  Progreso: {getCurrentStepFromData(selectedQuote)} de 13 pasos completados
                </p>
              </div>

              {(() => {
                const data = parseQuoteData(selectedQuote)
                if (!data) return <p className="text-gray-500 text-sm">No se pudieron cargar los datos</p>

                return (
                  <div className="space-y-3">
                    {/* Información básica */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Invitados</p>
                        <p className="font-medium text-sm">{data.numInvitados} personas</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Tipo de Evento</p>
                        <p className="font-medium text-sm capitalize">{data.tipoEvento}</p>
                      </div>
                    </div>

                    {/* Menú */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Menú</p>
                      <p
                        className={`font-medium text-sm ${data.tipoComida === "No seleccionado" ? "text-gray-400" : ""}`}
                      >
                        {data.tipoComida}
                      </p>
                    </div>

                    {/* Vinos y Licores */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Vinos y Licores</p>
                      <p
                        className={`font-medium text-sm ${data.incluyeVinosLicores === "No seleccionado" ? "text-gray-400" : ""}`}
                      >
                        {data.incluyeVinosLicores}
                      </p>
                    </div>

                    {/* Mobiliario */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Mesas</p>
                      <p className={`font-medium text-sm ${data.mesas === "No seleccionado" ? "text-gray-400" : ""}`}>
                        {data.mesas}
                      </p>
                    </div>

                    {/* Mesa de Novios */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Mesa de Novios</p>
                      <p
                        className={`font-medium text-sm ${data.incluyeMesaNovios === "No seleccionado" ? "text-gray-400" : ""}`}
                      >
                        {data.incluyeMesaNovios === "Sí"
                          ? `Sí${data.tipoMesaNovios ? ` - ${data.tipoMesaNovios}` : ""}`
                          : data.incluyeMesaNovios}
                      </p>
                    </div>

                    {/* Floristería */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Arreglos Florales</p>
                      <p
                        className={`font-medium text-sm ${data.arreglosFlorales === "No seleccionado" ? "text-gray-400" : ""}`}
                      >
                        {data.arreglosFlorales}
                      </p>
                    </div>

                    {/* Toldo y Superficie */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Toldo</p>
                        <p
                          className={`font-medium text-sm ${data.tipoToldo === "No seleccionado" ? "text-gray-400" : ""}`}
                        >
                          {data.tipoToldo}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Superficie</p>
                        <p
                          className={`font-medium text-sm ${data.tipoSuperficie === "No seleccionado" ? "text-gray-400" : ""}`}
                        >
                          {data.tipoSuperficie}
                        </p>
                      </div>
                    </div>

                    {/* Música y Pista */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Música</p>
                        <p
                          className={`font-medium text-sm ${data.tipoMusica === "No seleccionado" ? "text-gray-400" : ""}`}
                        >
                          {data.tipoMusica}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Pista de Baile</p>
                        <p
                          className={`font-medium text-sm ${data.tipoPista === "No seleccionado" ? "text-gray-400" : ""}`}
                        >
                          {data.tipoPista}
                        </p>
                      </div>
                    </div>

                    {/* Capilla */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Capilla</p>
                      <p
                        className={`font-medium text-sm ${data.incluyeCapilla === "No seleccionado" ? "text-gray-400" : ""}`}
                      >
                        {data.incluyeCapilla}
                      </p>
                    </div>

                    {/* Extras */}
                    {data.extrasSeleccionados.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Extras Seleccionados</p>
                        <p className="font-medium text-sm">{data.extrasSeleccionados.length} extras</p>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Botón para ver cotización */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  href={`/cotizacion/${selectedQuote.slug}`}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Ver Cotización Completa
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminLayout currentPage="dashboard">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <AdminDashboardContent />
      </Suspense>
    </AdminLayout>
  )
}
