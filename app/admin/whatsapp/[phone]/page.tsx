"use client"

import { useEffect, useRef, useState, use } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ArrowLeft, Send, Phone, Calendar, Users, Loader2, Bot, User, RefreshCw } from "lucide-react"
import type { WaLeadData } from "@/lib/whatsapp"

interface WaMessage {
  id: string
  message_id: string
  phone: string
  direction: "inbound" | "outbound"
  text: string | null
  wa_stage: string | null
  created_at: string
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
  budget_low_reconsider:"Reconsiderando",
  not_qualified:        "No calificado",
  collect_appointment:  "Agendando cita",
  calendly_sent:        "Calendly enviado",
  advisor_notified:     "Asesora notificada",
  completed:            "Completado",
}

const CALIFICACION_COLORS: Record<string, string> = {
  bajo:  "text-red-600",
  medio: "text-amber-600",
  alto:  "text-green-600",
}

function formatTs(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  })
}

export default function WhatsAppChatPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = use(params)
  const decodedPhone = decodeURIComponent(phone)

  const [lead, setLead]         = useState<WaLeadData | null>(null)
  const [messages, setMessages] = useState<WaMessage[]>([])
  const [text, setText]         = useState("")
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLTextAreaElement>(null)

  const supabase = createClient()

  const loadData = async () => {
    const [{ data: leads }, { data: msgs }] = await Promise.all([
      supabase
        .from("quotes")
        .select("id,slug,nombres,telefono,num_invitados,tipo_evento,calificacion_lead,inversion_rango,reconsidero_presupuesto,horario_preferido,etiqueta_wa,status,source,wa_last_message_at,source_detail")
        .eq("telefono", decodedPhone)
        .eq("source", "whatsapp")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("phone", decodedPhone)
        .order("created_at", { ascending: true }),
    ])

    if (leads && leads.length > 0) setLead(leads[0] as WaLeadData)
    setMessages((msgs as WaMessage[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()

    // Realtime: mensajes nuevos
    const channel = supabase
      .channel(`wa-chat-${decodedPhone}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "whatsapp_messages",
        filter: `phone=eq.${decodedPhone}`,
      }, (payload) => {
        const newMsg = payload.new as WaMessage
        setMessages((prev) => {
          // Reemplazar mensaje optimístico si existe, sino agregar
          const withoutOptimistic = prev.filter(
            (m) => !(m.id.startsWith("optimistic-") && m.direction === newMsg.direction && m.text === newMsg.text)
          )
          // Evitar duplicados por message_id
          if (withoutOptimistic.some((m) => m.id === newMsg.id)) return prev
          return [...withoutOptimistic, newMsg]
        })
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "quotes",
        filter: `telefono=eq.${decodedPhone}`,
      }, (payload) => {
        setLead(payload.new as WaLeadData)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [decodedPhone])

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setText("")

    // Agregar mensaje optimísticamente para respuesta inmediata en UI
    const optimisticMsg: WaMessage = {
      id: `optimistic-${Date.now()}`,
      message_id: `optimistic-${Date.now()}`,
      phone: decodedPhone,
      direction: "outbound",
      text: trimmed,
      wa_stage: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: decodedPhone, text: trimmed }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(`Error: ${err.error}`)
        setText(trimmed) // restaurar texto
      }
    } catch {
      alert("Error enviando mensaje")
      setText(trimmed)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const stage = lead?.source_detail?.wa_stage ?? "welcome"
  const nombre = lead?.nombres && !lead.nombres.startsWith("Lead WhatsApp") ? lead.nombres : null

  return (
    <AdminLayout currentPage="whatsapp">
      {/* Layout split: lista izquierda (oculta en móvil) + chat derecha */}
      <div className="h-screen flex flex-col lg:flex-row overflow-hidden">

        {/* ── Panel de chat ── */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">

          {/* Header del chat */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
            <Link
              href="/admin/whatsapp"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 ${lead?.etiqueta_wa === "not_qualified" ? "bg-gray-400" : "bg-emerald-500"}`}>
              {nombre?.charAt(0)?.toUpperCase() ?? "?"}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{nombre ?? decodedPhone}</p>
              <p className="text-xs text-gray-500">{STAGE_LABELS[stage] ?? stage}</p>
            </div>

            <button
              onClick={loadData}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              title="Actualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f0f4f0]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">Sin mensajes aún</p>
            ) : (
              messages.map((msg) => {
                const isOutbound = msg.direction === "outbound"
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isOutbound ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isOutbound ? "bg-[#1a1a1a]" : "bg-emerald-500"}`}>
                      {isOutbound
                        ? <Bot className="w-3.5 h-3.5 text-white" />
                        : <User className="w-3.5 h-3.5 text-white" />
                      }
                    </div>
                    <div className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-3.5 py-2.5 shadow-sm ${isOutbound ? "bg-[#1a1a1a] text-white rounded-br-sm" : "bg-white text-gray-900 rounded-bl-sm"}`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isOutbound ? "text-white/50 text-right" : "text-gray-400"}`}>
                        {formatTs(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input de respuesta */}
          <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje... (Enter para enviar)"
                rows={1}
                className="flex-1 resize-none bg-gray-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white transition-all max-h-32 overflow-y-auto"
                style={{ minHeight: "44px" }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="flex-shrink-0 w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-emerald-600 transition-colors active:scale-95"
              >
                {sending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Shift+Enter para nueva línea</p>
          </div>
        </div>

        {/* ── Panel lateral de datos del lead (solo desktop) ── */}
        <aside className="hidden lg:flex flex-col w-80 border-l border-gray-200 bg-[#f8f8f6] overflow-y-auto">
          <div className="p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-base">Datos del prospecto</h2>

            {lead ? (
              <>
                <DataRow label="Nombre" value={nombre ?? "—"} />
                <DataRow label="Teléfono" value={
                  <a href={`https://wa.me/${decodedPhone}`} target="_blank" rel="noreferrer"
                    className="text-emerald-600 hover:underline flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {decodedPhone}
                  </a>
                } />
                <DataRow label="Tipo de evento" value={lead.tipo_evento?.replace("_", " ") ?? "—"} />
                <DataRow label="Invitados" value={lead.num_invitados ? `~${lead.num_invitados}` : "—"} />
                <DataRow label="Inversión" value={lead.inversion_rango ?? "—"} />
                <DataRow label="Calificación" value={
                  lead.calificacion_lead
                    ? <span className={`font-semibold capitalize ${CALIFICACION_COLORS[lead.calificacion_lead] ?? ""}`}>
                        {lead.calificacion_lead}
                      </span>
                    : "—"
                } />
                <DataRow label="Horario preferido" value={lead.horario_preferido ?? "—"} />
                <DataRow label="Reconsideró presupuesto" value={
                  lead.reconsidero_presupuesto === null ? "—"
                  : lead.reconsidero_presupuesto ? "Sí" : "No"
                } />
                <DataRow label="Etapa" value={STAGE_LABELS[stage] ?? stage} />
                <DataRow label="Etiqueta" value={lead.etiqueta_wa ?? "—"} />
                <DataRow label="Último mensaje" value={
                  lead.wa_last_message_at
                    ? new Date(lead.wa_last_message_at).toLocaleString("es-MX")
                    : "—"
                } />

                <div className="pt-2">
                  <Link
                    href={`/admin/crm`}
                    className="block w-full text-center py-2.5 px-4 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-white transition-colors"
                  >
                    Ver en CRM
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Cargando datos...</p>
            )}
          </div>
        </aside>
      </div>
    </AdminLayout>
  )
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  )
}
