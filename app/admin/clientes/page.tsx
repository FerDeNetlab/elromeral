"use client"

import { Suspense, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  Calendar,
  Mail,
  Users,
  Loader2,
  Search,
  Phone,
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
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
  is_complete: boolean | null
  current_step: number | null
}

function ClientesContent() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"todos" | "completas" | "incompletas">("todos")

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching clients:", error)
      }
      setQuotes(data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      searchTerm === "" ||
      (q.nombres && q.nombres.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.email && q.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const isComplete = q.is_complete === true && q.precio_total > 0

    if (filter === "completas") return matchesSearch && isComplete
    if (filter === "incompletas") return matchesSearch && !isComplete
    return matchesSearch
  })

  const stats = {
    total: quotes.length,
    completas: quotes.filter((q) => q.is_complete === true && q.precio_total > 0).length,
    incompletas: quotes.filter((q) => !(q.is_complete === true && q.precio_total > 0)).length,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportToCSV = () => {
    const headers = ["Nombre", "Email", "Teléfono", "Fecha Evento", "Invitados", "Total", "Estado", "Creado"]
    const rows = filteredQuotes.map((q) => [
      q.nombres || "",
      q.email || "",
      q.telefono || "",
      q.fecha_evento ? formatDate(q.fecha_evento) : "",
      q.num_invitados || "",
      q.precio_total || 0,
      q.is_complete && q.precio_total > 0 ? "Completa" : "Incompleta",
      formatDate(q.created_at),
    ])

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `base-clientes-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Base de Clientes</h1>
        <p className="text-sm text-gray-500">Directorio de todos los contactos y sus cotizaciones</p>
      </div>

      {/* Estadísticas simples */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setFilter("todos")}
          className={`p-4 rounded-xl border transition-all ${
            filter === "todos"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className={`w-5 h-5 ${filter === "todos" ? "text-white" : "text-gray-400"}`} />
            <div className="text-left">
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className={`text-xs ${filter === "todos" ? "text-gray-300" : "text-gray-500"}`}>Total contactos</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter("completas")}
          className={`p-4 rounded-xl border transition-all ${
            filter === "completas"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className={`w-5 h-5 ${filter === "completas" ? "text-white" : "text-green-500"}`} />
            <div className="text-left">
              <p className="text-2xl font-semibold">{stats.completas}</p>
              <p className={`text-xs ${filter === "completas" ? "text-green-100" : "text-gray-500"}`}>
                Cotizaciones completas
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter("incompletas")}
          className={`p-4 rounded-xl border transition-all ${
            filter === "incompletas"
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-5 h-5 ${filter === "incompletas" ? "text-white" : "text-amber-500"}`} />
            <div className="text-left">
              <p className="text-2xl font-semibold">{stats.incompletas}</p>
              <p className={`text-xs ${filter === "incompletas" ? "text-amber-100" : "text-gray-500"}`}>
                Cotizaciones incompletas
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Búsqueda y exportar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
          />
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay contactos</p>
          <p className="text-sm text-gray-400 mt-1">Los contactos aparecerán cuando inicien una cotización</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Vista de tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Contacto
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Datos de Contacto
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Evento
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Cotización
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((quote) => {
                  const isComplete = quote.is_complete === true && quote.precio_total > 0
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                              isComplete ? "bg-green-500" : "bg-amber-500"
                            }`}
                          >
                            {quote.nombres?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{quote.nombres || "Sin nombre"}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(quote.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <a
                            href={`mailto:${quote.email}`}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[180px]">{quote.email}</span>
                          </a>
                          {quote.telefono && (
                            <a
                              href={`https://wa.me/${quote.telefono.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 transition-colors"
                            >
                              <Phone className="w-4 h-4 text-gray-400" />
                              {quote.telefono}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {quote.fecha_evento ? formatDate(quote.fecha_evento) : "Sin fecha"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4 text-gray-400" />
                            {quote.num_invitados || 0} invitados
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isComplete ? (
                          <div>
                            <p className="font-semibold text-gray-900">{formatCurrency(quote.precio_total)}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs mt-1">
                              <CheckCircle className="w-3 h-3" />
                              Completa
                            </span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-500">Paso {quote.current_step || 1} de 14</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs mt-1">
                              <AlertCircle className="w-3 h-3" />
                              En progreso
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isComplete && (
                            <Link
                              href={`/cotizacion/${quote.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              Ver
                            </Link>
                          )}
                          <a
                            href={`mailto:${quote.email}`}
                            className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          {quote.telefono && (
                            <a
                              href={`https://wa.me/${quote.telefono.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClientesPage() {
  return (
    <AdminLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <ClientesContent />
      </Suspense>
    </AdminLayout>
  )
}
