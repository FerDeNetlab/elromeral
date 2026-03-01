"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"

interface FechaBloqueada {
  id: string
  date: string
  reason?: string
  created_at: string
}

export default function FechasBloqueadasAdmin() {
  const [fechas, setFechas] = useState<FechaBloqueada[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [razon, setRazon] = useState("")

  const cargarFechas = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("blocked_dates").select("*").order("date", { ascending: true })

      if (error) throw error
      setFechas(data || [])
    } catch (error) {
      console.error("[v0] Error cargando fechas:", error)
      alert("Error al cargar las fechas bloqueadas")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarFechas()
  }, [])

  const agregarFecha = async () => {
    if (!nuevaFecha) {
      alert("Por favor selecciona una fecha")
      return
    }

    setGuardando(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("blocked_dates").insert([{ date: nuevaFecha, reason: razon || null }])

      if (error) throw error

      setNuevaFecha("")
      setRazon("")
      await cargarFechas()
      alert("Fecha bloqueada exitosamente")
    } catch (error: any) {
      console.error("[v0] Error agregando fecha:", error)
      if (error.code === "23505") {
        alert("Esta fecha ya está bloqueada")
      } else {
        alert("Error al bloquear la fecha")
      }
    } finally {
      setGuardando(false)
    }
  }

  const eliminarFecha = async (id: string) => {
    if (!confirm("¿Estás seguro de desbloquear esta fecha?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("blocked_dates").delete().eq("id", id)

      if (error) throw error
      await cargarFechas()
    } catch (error) {
      console.error("[v0] Error eliminando fecha:", error)
      alert("Error al desbloquear la fecha")
    }
  }

  const fechaMinima = new Date().toISOString().split("T")[0]

  return (
    <AdminLayout currentPage="fechas">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Fechas</h1>
            <p className="text-sm text-gray-500 mt-1">Administra las fechas bloqueadas para eventos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario para agregar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Bloquear Nueva Fecha</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Fecha</label>
                  <input
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    min={fechaMinima}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">Razón (opcional)</label>
                  <input
                    type="text"
                    value={razon}
                    onChange={(e) => setRazon(e.target.value)}
                    placeholder="Ej: Evento privado"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all placeholder:text-gray-400"
                  />
                </div>

                <button
                  onClick={agregarFecha}
                  disabled={guardando || !nuevaFecha}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Bloquear Fecha
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de fechas bloqueadas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Fechas Bloqueadas</h2>
                <span className="text-sm text-gray-500">{fechas.length} fechas</span>
              </div>

              {cargando ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : fechas.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-400">No hay fechas bloqueadas</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {fechas.map((fecha) => (
                    <div
                      key={fecha.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {new Date(fecha.date + "T00:00:00").toLocaleDateString("es-MX", { month: "short" })}
                          </span>
                          <span className="text-lg font-semibold text-gray-900">
                            {new Date(fecha.date + "T00:00:00").getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(fecha.date + "T00:00:00").toLocaleDateString("es-MX", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {fecha.reason && <p className="text-sm text-gray-500">{fecha.reason}</p>}
                        </div>
                      </div>

                      <button
                        onClick={() => eliminarFecha(fecha.id)}
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-colors"
                        title="Desbloquear fecha"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
