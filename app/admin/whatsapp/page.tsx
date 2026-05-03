"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { MessageSquare, Search, Phone, ChevronRight, Bell } from "lucide-react"
import type { WaLeadData } from "@/lib/whatsapp"

async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
  const permission = await Notification.requestPermission()
  if (permission !== "granted") return

  const reg = await navigator.serviceWorker.ready
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) return

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidKey,
  })

  const json = sub.toJSON()
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    }),
  })
}

const ETIQUETA_STYLES: Record<string, { label: string; className: string }> = {
  needs_human:      { label: "Requiere asesora", className: "bg-amber-100 text-amber-700" },
  not_qualified:    { label: "No calificado",    className: "bg-red-100 text-red-700" },
  calendly_sent:    { label: "Calendly enviado", className: "bg-blue-100 text-blue-700" },
  advisor_notified: { label: "Asesora notificada", className: "bg-purple-100 text-purple-700" },
  completed:        { label: "Completado",        className: "bg-green-100 text-green-700" },
}

const CALIFICACION_STYLES: Record<string, { label: string; className: string }> = {
  bajo:  { label: "Bajo",  className: "bg-red-100 text-red-700" },
  medio: { label: "Medio", className: "bg-amber-100 text-amber-700" },
  alto:  { label: "Alto",  className: "bg-green-100 text-green-700" },
}

const STAGE_LABELS: Record<string, string> = {
  welcome:              "Bienvenida",
  collect_name:         "Recopilando nombre",
  collect_event_type:   "Tipo de evento",
  needs_human:          "Requiere asesora",
  collect_date_yn:      "¿Tiene fecha?",
  collect_date:         "Capturando fecha",
  collect_guests:       "Invitados",
  collect_budget:       "Presupuesto",
  budget_low_reconsider:"Reconsiderando presupuesto",
  not_qualified:        "No calificado",
  collect_appointment:  "Agendando cita",
  calendly_sent:        "Calendly enviado",
  advisor_notified:     "Asesora notificada",
  completed:            "Completado",
}

function formatTime(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = diffMs / 3_600_000

  if (diffH < 24) {
    return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
  }
  if (diffH < 48) return "Ayer"
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" })
}

export default function WhatsAppInboxPage() {
  const [leads, setLeads] = useState<WaLeadData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const loadLeads = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("quotes")
      .select("id,slug,nombres,telefono,num_invitados,tipo_evento,calificacion_lead,inversion_rango,reconsidero_presupuesto,horario_preferido,etiqueta_wa,status,source,wa_last_message_at,source_detail")
      .eq("source", "whatsapp")
      .order("wa_last_message_at", { ascending: false, nullsFirst: false })

    setLeads((data as WaLeadData[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadLeads()

    // Realtime: actualizar lista cuando llegan mensajes nuevos
    const supabase = createClient()
    const channel = supabase
      .channel("wa-inbox-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes", filter: "source=eq.whatsapp" }, () => {
        loadLeads()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const filtered = leads.filter((l) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      l.nombres?.toLowerCase().includes(s) ||
      l.telefono?.includes(s) ||
      l.tipo_evento?.includes(s)
    )
  })

  const pendingCount = leads.filter((l) =>
    l.etiqueta_wa === "needs_human" || (!l.etiqueta_wa && l.source_detail?.wa_stage !== "not_qualified")
  ).length

  return (
    <AdminLayout currentPage="whatsapp">
      <div className="h-screen flex flex-col bg-[#f8f8f6]">
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-semibold text-gray-900">Inbox WhatsApp</h1>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full">
                  {pendingCount}
                </span>
              )}
            </div>
            <button
              onClick={subscribeToPush}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              title="Activar notificaciones push"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{search ? "Sin resultados" : "Sin conversaciones aún"}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((lead) => {
                const stage = lead.source_detail?.wa_stage ?? "welcome"
                const etiqueta = lead.etiqueta_wa ? ETIQUETA_STYLES[lead.etiqueta_wa] : null
                const cal = lead.calificacion_lead ? CALIFICACION_STYLES[lead.calificacion_lead] : null
                const isActive = !["not_qualified", "calendly_sent", "advisor_notified", "completed"].includes(stage)

                return (
                  <li key={lead.id}>
                    <Link
                      href={`/admin/whatsapp/${lead.telefono}`}
                      className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${isActive ? "bg-emerald-500" : "bg-gray-300"}`}>
                        {lead.nombres?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-semibold text-gray-900 truncate">
                            {lead.nombres && !lead.nombres.startsWith("Lead WhatsApp")
                              ? lead.nombres
                              : lead.telefono}
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatTime(lead.wa_last_message_at)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 truncate mb-1.5">
                          {STAGE_LABELS[stage] ?? stage}
                          {lead.tipo_evento && ` · ${lead.tipo_evento.replace("_", " ")}`}
                          {lead.num_invitados ? ` · ${lead.num_invitados} inv.` : ""}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {etiqueta && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${etiqueta.className}`}>
                              {etiqueta.label}
                            </span>
                          )}
                          {cal && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cal.className}`}>
                              {cal.label}
                            </span>
                          )}
                          {lead.telefono && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {lead.telefono}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
