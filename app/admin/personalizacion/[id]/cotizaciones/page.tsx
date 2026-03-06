"use client"

import { useState, useEffect, Suspense, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import Link from "next/link"
import {
    ArrowLeft, Loader2, Eye, Copy, DollarSign, Users as UsersIcon,
    Calendar, ChevronDown, ChevronUp,
} from "lucide-react"

interface Quote {
    id: string
    slug: string
    nombre_cliente: string
    email: string | null
    tipo_evento: string
    num_invitados: number
    selecciones: Array<{ step_titulo: string; productos: Array<{ titulo: string; precio: number; tipo_precio: string }> }>
    total: number
    created_at: string
}

interface Flow {
    id: string
    slug: string
    titulo: string
    descripcion: string | null
}

function CotizacionesContent({ flowId }: { flowId: string }) {
    const [flow, setFlow] = useState<Flow | null>(null)
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => { load() }, [])

    const load = async () => {
        setLoading(true)
        const [flowRes, quotesRes] = await Promise.all([
            supabase.from("quote_flows").select("*").eq("id", flowId).single(),
            supabase.from("custom_quotes").select("*").eq("flow_id", flowId).order("created_at", { ascending: false }),
        ])
        if (flowRes.data) setFlow(flowRes.data)
        if (quotesRes.data) setQuotes(quotesRes.data as Quote[])
        setLoading(false)
    }

    const copiarEnlace = (slug: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/cotizacion-personalizada/${slug}`)
        setCopiedSlug(slug)
        setTimeout(() => setCopiedSlug(null), 2000)
    }

    if (loading) return <AdminLayout currentPage="personalizacion"><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div></AdminLayout>
    if (!flow) return null

    return (
        <AdminLayout currentPage="personalizacion">
            <div className="p-4 lg:p-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/personalizacion" className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"><ArrowLeft className="w-5 h-5 text-neutral-600" /></Link>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900">Cotizaciones</h1>
                        <p className="text-sm text-neutral-500">Flujo: {flow.titulo}</p>
                    </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                        <p className="text-xs text-neutral-500 mb-1">Total cotizaciones</p>
                        <p className="text-2xl font-semibold">{quotes.length}</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                        <p className="text-xs text-neutral-500 mb-1">Promedio total</p>
                        <p className="text-2xl font-semibold">${quotes.length > 0 ? Math.round(quotes.reduce((s, q) => s + Number(q.total), 0) / quotes.length).toLocaleString("es-MX") : 0}</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                        <p className="text-xs text-neutral-500 mb-1">Mayor cotización</p>
                        <p className="text-2xl font-semibold text-green-600">${quotes.length > 0 ? Math.max(...quotes.map((q) => Number(q.total))).toLocaleString("es-MX") : 0}</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                        <p className="text-xs text-neutral-500 mb-1">Prom. invitados</p>
                        <p className="text-2xl font-semibold">{quotes.length > 0 ? Math.round(quotes.reduce((s, q) => s + q.num_invitados, 0) / quotes.length) : 0}</p>
                    </div>
                </div>

                {quotes.length === 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                        <Eye className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                        <p className="text-neutral-500">Aún no hay cotizaciones para este flujo</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {quotes.map((q) => (
                            <div key={q.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                                <button onClick={() => setExpanded(expanded === q.id ? null : q.id)} className="w-full p-4 lg:p-5 text-left">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-neutral-900">{q.nombre_cliente}</p>
                                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-neutral-100 text-neutral-500">{q.tipo_evento}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-neutral-400">
                                                {q.email && <span>{q.email}</span>}
                                                <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" />{q.num_invitados} invitados</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(q.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-lg font-semibold text-green-600 flex items-center gap-1"><DollarSign className="w-4 h-4" />{Number(q.total).toLocaleString("es-MX")}</p>
                                            <button onClick={(e) => { e.stopPropagation(); copiarEnlace(q.slug) }} className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${copiedSlug === q.slug ? "bg-green-50 border-green-200 text-green-700" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"}`}>
                                                <Copy className="w-3 h-3 inline mr-1" />{copiedSlug === q.slug ? "¡Copiado!" : "Enlace"}
                                            </button>
                                            {expanded === q.id ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                                        </div>
                                    </div>
                                </button>

                                {expanded === q.id && (
                                    <div className="px-4 lg:px-5 pb-5 border-t border-neutral-100 pt-4">
                                        <div className="space-y-3">
                                            {q.selecciones?.map((sel, i) => (
                                                <div key={i} className="bg-neutral-50 rounded-xl p-3">
                                                    <p className="text-xs font-medium text-neutral-900 mb-2">{sel.step_titulo}</p>
                                                    <div className="space-y-1">
                                                        {sel.productos?.map((prod, j) => (
                                                            <div key={j} className="flex items-center justify-between text-xs">
                                                                <span className="text-neutral-600">{prod.titulo}</span>
                                                                <span className="font-medium text-neutral-900">
                                                                    ${Number(prod.precio).toLocaleString("es-MX")}
                                                                    {prod.tipo_precio === "por_invitado" && <span className="text-neutral-400 text-[10px]"> × {q.num_invitados}</span>}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default function CotizacionesPage({ params }: { params: Promise<{ id: string }> }) {
    const p = use(params)
    return <AuthGuard><Suspense fallback={null}><CotizacionesContent flowId={p.id} /></Suspense></AuthGuard>
}
