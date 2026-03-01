"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Calendar, Users, ExternalLink, MoreVertical, Search, ArrowUpDown, Archive } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"

interface Quote {
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
  is_archived: boolean | null
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

const STEP_NAMES: Record<number, string> = {
  1: "Info",
  2: "Menú",
  3: "Vinos",
  4: "Mobiliario",
  5: "Mesa",
  6: "Flores",
  7: "Toldo",
  8: "Superficie",
  9: "Música",
  10: "Pista",
  11: "Capilla",
  12: "Extras",
  13: "Final",
}

function CRMContent() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedQuote, setDraggedQuote] = useState<Quote | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showArchived, setShowArchived] = useState(false)

  const loadQuotes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setQuotes(data || [])
    } catch (error) {
      console.error("[v0] Error loading quotes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuotes()
  }, [])

  const handleDragStart = (e: React.DragEvent, quote: Quote) => {
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
      console.error("[v0] Error updating status:", error)
      alert("Error al actualizar el estado")
    } finally {
      setDraggedQuote(null)
      setUpdating(null)
    }
  }

  const getQuotesByStatus = (status: StatusKey) => {
    return quotes
      .filter((q) => (showArchived ? q.is_archived === true : q.is_archived !== true))
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

  const archivedCount = quotes.filter((q) => q.is_archived === true).length
  const activeCount = quotes.filter((q) => q.is_archived !== true).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative flex-1 max-w-md">
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
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showArchived ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Activos ({activeCount})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                showArchived ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Archive className="w-4 h-4" />
              Archivados ({archivedCount})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{statusQuotes.length}</span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Cards container */}
                <div className="space-y-3 min-h-[500px]">
                  {statusQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, quote)}
                      className={`bg-white rounded-xl border border-gray-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-gray-300 transition-all ${
                        updating === quote.id ? "opacity-50" : ""
                      } ${draggedQuote?.id === quote.id ? "opacity-50 scale-95 rotate-2" : ""}`}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{quote.nombres || "Sin nombre"}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {quote.num_invitados || 0} invitados · $
                            {Number(quote.precio_total || 0).toLocaleString("es-MX")}
                          </p>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded -mr-1">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {quote.fecha_evento && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(quote.fecha_evento).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                        )}
                        {quote.is_complete ? (
                          <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                            Completa
                          </span>
                        ) : quote.current_step ? (
                          <span className="inline-flex px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">
                            Paso {quote.current_step}: {STEP_NAMES[quote.current_step]}
                          </span>
                        ) : null}
                      </div>

                      {/* Card footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Users className="w-3 h-3" />
                          <span>{quote.num_invitados || 0}</span>
                        </div>
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
      )}
    </div>
  )
}

export default function CRMPage() {
  return (
    <AdminLayout currentPage="crm">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <CRMContent />
      </Suspense>
    </AdminLayout>
  )
}
