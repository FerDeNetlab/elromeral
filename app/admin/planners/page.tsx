"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Calendar, Users, ExternalLink, Search, Briefcase, Phone, Mail, Eye } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"

interface Planner {
  id: string
  nombre: string
  email: string
  telefono: string | null
  created_at: string
}

interface PlannerQuote {
  id: string
  nombres: string
  email: string
  telefono: string
  fecha_evento: string | null
  num_invitados: number
  precio_total: number
  status: string
  created_at: string
  slug: string
  current_step: number | null
  is_complete: boolean | null
  planner_id: string | null
  is_planner_inquiry: boolean | null
}

type StatusKey = "nuevo_lead" | "contactado" | "visito" | "cotizado" | "ganado" | "perdido"

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; bgColor: string }> = {
  nuevo_lead: { label: "Nuevos Leads", color: "text-blue-700", bgColor: "bg-blue-50" },
  contactado: { label: "Contactados", color: "text-amber-700", bgColor: "bg-amber-50" },
  visito: { label: "Visitaron", color: "text-purple-700", bgColor: "bg-purple-50" },
  cotizado: { label: "Cotizados", color: "text-orange-700", bgColor: "bg-orange-50" },
  ganado: { label: "Ganados", color: "text-green-700", bgColor: "bg-green-50" },
  perdido: { label: "Perdidos", color: "text-red-700", bgColor: "bg-red-50" },
}

const STATUS_ORDER: StatusKey[] = ["nuevo_lead", "contactado", "visito", "cotizado", "ganado", "perdido"]

function PlannersContent() {
  const [planners, setPlanners] = useState<Planner[]>([])
  const [quotes, setQuotes] = useState<PlannerQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlanner, setSelectedPlanner] = useState<Planner | null>(null)
  const [showPlannersList, setShowPlannersList] = useState(true)
  const [draggedQuote, setDraggedQuote] = useState<PlannerQuote | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Cargar planners
      const { data: plannersData, error: plannersError } = await supabase
        .from("planners")
        .select("*")
        .order("created_at", { ascending: false })

      if (plannersError) throw plannersError
      setPlanners(plannersData || [])

      // Cargar quotes de planners
      const { data: quotesData, error: quotesError } = await supabase
        .from("quotes")
        .select("*")
        .eq("is_planner_inquiry", true)
        .order("created_at", { ascending: false })

      if (quotesError) throw quotesError
      setQuotes(quotesData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDragStart = (e: React.DragEvent, quote: PlannerQuote) => {
    setDraggedQuote(quote)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, newStatus: StatusKey) => {
    e.preventDefault()

    if (!draggedQuote || draggedQuote.status === newStatus) {
      setDraggedQuote(null)
      return
    }

    setUpdating(draggedQuote.id)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("quotes")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", draggedQuote.id)

      if (error) throw error

      setQuotes((prev) => prev.map((q) => (q.id === draggedQuote.id ? { ...q, status: newStatus } : q)))
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Error al actualizar el estado")
    } finally {
      setDraggedQuote(null)
      setUpdating(null)
    }
  }

  const getQuotesByStatus = (status: StatusKey) => {
    return quotes
      .filter((q) => {
        if (selectedPlanner) {
          return q.planner_id === selectedPlanner.id
        }
        return true
      })
      .filter((q) => {
        if (status === "nuevo_lead") {
          return !q.status || q.status === "nuevo_lead"
        }
        return q.status === status
      })
      .filter(
        (q) =>
          searchTerm === "" ||
          (q.nombres && q.nombres.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (q.email && q.email.toLowerCase().includes(searchTerm.toLowerCase())),
      )
  }

  const filteredPlanners = planners.filter(
    (p) =>
      searchTerm === "" ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getQuotesCountForPlanner = (plannerId: string) => {
    return quotes.filter((q) => q.planner_id === plannerId).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portal Planners</h1>
          <p className="text-gray-500 mt-1">Gestiona las consultas de wedding planners</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowPlannersList(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showPlannersList ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Briefcase className="w-4 h-4 inline-block mr-2" />
              Planners ({planners.length})
            </button>
            <button
              onClick={() => {
                setShowPlannersList(false)
                setSelectedPlanner(null)
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showPlannersList ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              CRM ({quotes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={showPlannersList ? "Buscar planner..." : "Buscar consulta..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
        />
      </div>

      {showPlannersList ? (
        /* Lista de Planners */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlanners.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay planners registrados aún</p>
            </div>
          ) : (
            filteredPlanners.map((planner) => (
              <div
                key={planner.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {planner.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{planner.nombre}</h3>
                      <p className="text-sm text-gray-500">{getQuotesCountForPlanner(planner.id)} consultas</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{planner.email}</span>
                  </div>
                  {planner.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{planner.telefono}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedPlanner(planner)
                      setShowPlannersList(false)
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Consultas
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-3 text-center">
                  Registrado:{" "}
                  {new Date(planner.created_at).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      ) : (
        /* CRM de Planners */
        <div>
          {selectedPlanner && (
            <div className="mb-6 p-4 bg-purple-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                  {selectedPlanner.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-purple-900">Consultas de: {selectedPlanner.nombre}</p>
                  <p className="text-sm text-purple-700">{selectedPlanner.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanner(null)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                Ver Todas
              </button>
            </div>
          )}

          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_ORDER.map((status) => {
              const config = STATUS_CONFIG[status]
              const statusQuotes = getQuotesByStatus(status)

              return (
                <div
                  key={status}
                  className="flex-shrink-0 w-72"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{config.label}</h3>
                    <span className="text-sm text-gray-500">{statusQuotes.length}</span>
                  </div>

                  {/* Cards container */}
                  <div className="space-y-3 min-h-[400px]">
                    {statusQuotes.map((quote) => (
                      <div
                        key={quote.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, quote)}
                        className={`bg-white rounded-xl border border-gray-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-gray-300 transition-all ${
                          updating === quote.id ? "opacity-50" : ""
                        } ${draggedQuote?.id === quote.id ? "opacity-50 scale-95 rotate-2" : ""}`}
                      >
                        {/* Badge de Planner */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                            <Briefcase className="w-3 h-3" />
                            Planner
                          </span>
                        </div>

                        {/* Card content */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{quote.nombres || "Sin nombre"}</p>
                            <p className="text-sm text-gray-500 mt-1">{quote.num_invitados || 0} invitados</p>
                          </div>
                        </div>

                        {quote.fecha_evento && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-xs text-gray-600 mb-3">
                            <Calendar className="w-3 h-3" />
                            {new Date(quote.fecha_evento).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}

                        {/* Card footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            {new Date(quote.created_at).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <Link
                            href={`/cotizacion/${quote.slug || quote.id}`}
                            target="_blank"
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}

                    {statusQuotes.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
                        <p className="text-sm text-gray-400">Arrastra aquí</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlannersAdminPage() {
  return (
    <AdminLayout currentPage="planners">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <PlannersContent />
      </Suspense>
    </AdminLayout>
  )
}
