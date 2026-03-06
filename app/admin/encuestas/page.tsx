"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import Link from "next/link"
import {
    ClipboardList,
    Plus,
    Copy,
    Eye,
    ToggleLeft,
    ToggleRight,
    Loader2,
    ExternalLink,
    Trash2,
    Pencil,
} from "lucide-react"

interface Survey {
    id: string
    slug: string
    titulo: string
    descripcion: string | null
    activa: boolean
    created_at: string
    updated_at: string
    response_count?: number
}

function EncuestasContent() {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [loading, setLoading] = useState(true)
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        cargarEncuestas()
    }, [])

    const cargarEncuestas = async () => {
        setLoading(true)

        // Obtener encuestas
        const { data: surveysData, error } = await supabase
            .from("surveys")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error cargando encuestas:", error)
            setLoading(false)
            return
        }

        // Obtener conteo de respuestas por encuesta
        if (surveysData && surveysData.length > 0) {
            const surveysWithCounts = await Promise.all(
                surveysData.map(async (survey) => {
                    const { count } = await supabase
                        .from("survey_responses")
                        .select("*", { count: "exact", head: true })
                        .eq("survey_id", survey.id)

                    return { ...survey, response_count: count || 0 }
                })
            )
            setSurveys(surveysWithCounts)
        } else {
            setSurveys([])
        }

        setLoading(false)
    }

    const toggleActiva = async (id: string, activa: boolean) => {
        await supabase
            .from("surveys")
            .update({ activa: !activa, updated_at: new Date().toISOString() })
            .eq("id", id)
        cargarEncuestas()
    }

    const eliminarEncuesta = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta encuesta? Esto también eliminará todas las preguntas y respuestas asociadas.")) return
        await supabase.from("surveys").delete().eq("id", id)
        cargarEncuestas()
    }

    const copiarEnlace = (slug: string) => {
        const url = `${window.location.origin}/encuesta/${slug}`
        navigator.clipboard.writeText(url)
        setCopiedSlug(slug)
        setTimeout(() => setCopiedSlug(null), 2000)
    }

    return (
        <AdminLayout currentPage="encuestas">
            <div className="p-4 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900 mb-1">
                            Encuestas
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Crea encuestas para tus clientes y recibe retroalimentación
                        </p>
                    </div>
                    <Link
                        href="/admin/encuestas/nueva"
                        className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Encuesta
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                    </div>
                ) : surveys.length === 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                        <ClipboardList className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                        <h2 className="text-lg font-medium text-neutral-700 mb-2">
                            Sin encuestas aún
                        </h2>
                        <p className="text-sm text-neutral-500 mb-6">
                            Crea tu primera encuesta para recibir retroalimentación de tus clientes
                        </p>
                        <Link
                            href="/admin/encuestas/nueva"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Crear Primera Encuesta
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {surveys.map((survey) => (
                            <div
                                key={survey.id}
                                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow"
                            >
                                <div className="p-4 lg:p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-neutral-900 truncate">
                                                    {survey.titulo}
                                                </h3>
                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${survey.activa
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-neutral-100 text-neutral-500"
                                                        }`}
                                                >
                                                    {survey.activa ? "Activa" : "Inactiva"}
                                                </span>
                                            </div>
                                            {survey.descripcion && (
                                                <p className="text-sm text-neutral-500 truncate mb-2">
                                                    {survey.descripcion}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-neutral-400">
                                                <span>
                                                    Creada:{" "}
                                                    {new Date(survey.created_at).toLocaleDateString("es-MX", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {survey.response_count || 0} respuestas
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => copiarEnlace(survey.slug)}
                                                className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all ${copiedSlug === survey.slug
                                                        ? "bg-green-50 border-green-200 text-green-700"
                                                        : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                                    }`}
                                            >
                                                <Copy className="w-3 h-3" />
                                                {copiedSlug === survey.slug ? "¡Copiado!" : "Copiar enlace"}
                                            </button>

                                            <Link
                                                href={`/encuesta/${survey.slug}`}
                                                target="_blank"
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                <span className="hidden sm:inline">Ver</span>
                                            </Link>

                                            <Link
                                                href={`/admin/encuestas/${survey.id}/respuestas`}
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-[#1a1a1a] text-white hover:bg-black transition-colors"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Respuestas
                                            </Link>

                                            <Link
                                                href={`/admin/encuestas/${survey.id}/editar`}
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </Link>

                                            <button
                                                onClick={() => toggleActiva(survey.id, survey.activa)}
                                                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                                title={survey.activa ? "Desactivar" : "Activar"}
                                            >
                                                {survey.activa ? (
                                                    <ToggleRight className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5 text-neutral-400" />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => eliminarEncuesta(survey.id)}
                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                title="Eliminar"
                                            >
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

export default function EncuestasPage() {
    return (
        <AuthGuard>
            <Suspense fallback={null}>
                <EncuestasContent />
            </Suspense>
        </AuthGuard>
    )
}
