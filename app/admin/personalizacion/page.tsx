"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import Link from "next/link"
import {
    Wand2,
    Plus,
    Loader2,
    Copy,
    ExternalLink,
    Eye,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
} from "lucide-react"

interface Flow {
    id: string
    slug: string
    titulo: string
    descripcion: string | null
    activo: boolean
    created_at: string
    step_count?: number
    quote_count?: number
}

function PersonalizacionContent() {
    const [flows, setFlows] = useState<Flow[]>([])
    const [loading, setLoading] = useState(true)
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => { cargarFlujos() }, [])

    const cargarFlujos = async () => {
        setLoading(true)
        const { data } = await supabase
            .from("quote_flows")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) {
            const enriched = await Promise.all(
                data.map(async (flow) => {
                    const [steps, quotes] = await Promise.all([
                        supabase.from("quote_flow_steps").select("*", { count: "exact", head: true }).eq("flow_id", flow.id),
                        supabase.from("custom_quotes").select("*", { count: "exact", head: true }).eq("flow_id", flow.id),
                    ])
                    return { ...flow, step_count: steps.count || 0, quote_count: quotes.count || 0 }
                })
            )
            setFlows(enriched)
        }
        setLoading(false)
    }

    const toggleActivo = async (id: string, activo: boolean) => {
        await supabase.from("quote_flows").update({ activo: !activo, updated_at: new Date().toISOString() }).eq("id", id)
        cargarFlujos()
    }

    const eliminar = async (id: string) => {
        if (!confirm("¿Eliminar este flujo y todas sus cotizaciones?")) return
        await supabase.from("quote_flows").delete().eq("id", id)
        cargarFlujos()
    }

    const copiarEnlace = (slug: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/cotizador-personalizado/${slug}`)
        setCopiedSlug(slug)
        setTimeout(() => setCopiedSlug(null), 2000)
    }

    return (
        <AdminLayout currentPage="personalizacion">
            <div className="p-4 lg:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900 mb-1">Creador de Flujos</h1>
                        <p className="text-sm text-neutral-500">Crea flujos de cotización personalizados para tus clientes</p>
                    </div>
                    <Link href="/admin/personalizacion/nuevo" className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors">
                        <Plus className="w-4 h-4" />
                        Nuevo Flujo
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
                ) : flows.length === 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                        <Wand2 className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                        <h2 className="text-lg font-medium text-neutral-700 mb-2">Sin flujos aún</h2>
                        <p className="text-sm text-neutral-500 mb-6">Crea tu primer flujo de cotización personalizado</p>
                        <Link href="/admin/personalizacion/nuevo" className="inline-flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors">
                            <Plus className="w-4 h-4" /> Crear Flujo
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {flows.map((flow) => (
                            <div key={flow.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                                <div className="p-4 lg:p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-neutral-900 truncate">{flow.titulo}</h3>
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${flow.activo ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                                                    {flow.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                            {flow.descripcion && <p className="text-sm text-neutral-500 truncate mb-2">{flow.descripcion}</p>}
                                            <div className="flex items-center gap-4 text-xs text-neutral-400">
                                                <span>{flow.step_count} pasos</span>
                                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{flow.quote_count} cotizaciones</span>
                                                <span>Creado: {new Date(flow.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={() => copiarEnlace(flow.slug)} className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all ${copiedSlug === flow.slug ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
                                                <Copy className="w-3 h-3" />{copiedSlug === flow.slug ? "¡Copiado!" : "Enlace"}
                                            </button>
                                            <Link href={`/cotizador-personalizado/${flow.slug}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                            <Link href={`/admin/personalizacion/${flow.id}/cotizaciones`} className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-[#1a1a1a] text-white hover:bg-black transition-colors">
                                                <Eye className="w-3 h-3" />Cotizaciones
                                            </Link>
                                            <Link href={`/admin/personalizacion/${flow.id}/editar`} className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">
                                                <Pencil className="w-3 h-3" />
                                            </Link>
                                            <button onClick={() => toggleActivo(flow.id, flow.activo)} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                                                {flow.activo ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-neutral-400" />}
                                            </button>
                                            <button onClick={() => eliminar(flow.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default function PersonalizacionPage() {
    return <AuthGuard><Suspense fallback={null}><PersonalizacionContent /></Suspense></AuthGuard>
}
