"use client"

import { useState, useEffect, Suspense, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import Link from "next/link"
import {
    ArrowLeft,
    Loader2,
    Eye,
    Copy,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    User,
    Mail,
    Calendar,
    ClipboardList,
} from "lucide-react"

interface Survey {
    id: string
    slug: string
    titulo: string
    descripcion: string | null
    activa: boolean
    created_at: string
}

interface Question {
    id: string
    tipo: "abierta" | "cerrada"
    pregunta: string
    opciones: string[]
    orden: number
}

interface Response {
    id: string
    respondent_name: string | null
    respondent_email: string | null
    respuestas: { question_id: string; respuesta: string }[]
    created_at: string
}

function RespuestasContent({ surveyId }: { surveyId: string }) {
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [responses, setResponses] = useState<Response[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedResponse, setExpandedResponse] = useState<string | null>(null)
    const [copiedLink, setCopiedLink] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setLoading(true)

        // Cargar encuesta
        const { data: surveyData } = await supabase
            .from("surveys")
            .select("*")
            .eq("id", surveyId)
            .single()

        if (!surveyData) {
            setLoading(false)
            return
        }
        setSurvey(surveyData)

        // Cargar preguntas
        const { data: questionsData } = await supabase
            .from("survey_questions")
            .select("*")
            .eq("survey_id", surveyId)
            .order("orden", { ascending: true })

        setQuestions(questionsData || [])

        // Cargar respuestas
        const { data: responsesData } = await supabase
            .from("survey_responses")
            .select("*")
            .eq("survey_id", surveyId)
            .order("created_at", { ascending: false })

        setResponses(responsesData || [])
        setLoading(false)
    }

    const copiarEnlace = () => {
        if (!survey) return
        const url = `${window.location.origin}/encuesta/${survey.slug}`
        navigator.clipboard.writeText(url)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    // Calcular estadísticas de preguntas cerradas
    const getEstadisticasCerradas = (questionId: string, opciones: string[]) => {
        const conteo: Record<string, number> = {}
        opciones.forEach((o) => (conteo[o] = 0))

        responses.forEach((r) => {
            const resp = r.respuestas.find((a) => a.question_id === questionId)
            if (resp) {
                // Handle multi-select responses (comma-separated)
                const selectedOptions = resp.respuesta.split(", ")
                selectedOptions.forEach((opt) => {
                    if (conteo[opt] !== undefined) {
                        conteo[opt]++
                    }
                })
            }
        })

        const total = responses.filter((r) =>
            r.respuestas.some((a) => a.question_id === questionId)
        ).length
        return { conteo, total }
    }

    if (loading) {
        return (
            <AdminLayout currentPage="encuestas">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            </AdminLayout>
        )
    }

    if (!survey) {
        return (
            <AdminLayout currentPage="encuestas">
                <div className="p-8 text-center">
                    <p className="text-neutral-500">Encuesta no encontrada</p>
                    <Link href="/admin/encuestas" className="text-sm text-neutral-700 underline mt-2 inline-block">
                        Volver a encuestas
                    </Link>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout currentPage="encuestas">
            <div className="p-4 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-start gap-4 mb-8">
                    <Link
                        href="/admin/encuestas"
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors mt-0.5"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900 mb-1">
                            {survey.titulo}
                        </h1>
                        {survey.descripcion && (
                            <p className="text-sm text-neutral-500 mb-3">{survey.descripcion}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${survey.activa ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                                    }`}
                            >
                                {survey.activa ? "Activa" : "Inactiva"}
                            </span>
                            <button
                                onClick={copiarEnlace}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${copiedLink
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                    }`}
                            >
                                <Copy className="w-3 h-3" />
                                {copiedLink ? "¡Copiado!" : "Copiar enlace"}
                            </button>
                            <Link
                                href={`/encuesta/${survey.slug}`}
                                target="_blank"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Ver encuesta
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 lg:p-6">
                        <p className="text-xs text-neutral-500 mb-1">Total respuestas</p>
                        <p className="text-2xl lg:text-3xl font-semibold">{responses.length}</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 lg:p-6">
                        <p className="text-xs text-neutral-500 mb-1">Preguntas</p>
                        <p className="text-2xl lg:text-3xl font-semibold">{questions.length}</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 lg:p-6 col-span-2 lg:col-span-1">
                        <p className="text-xs text-neutral-500 mb-1">Última respuesta</p>
                        <p className="text-sm lg:text-base font-medium">
                            {responses.length > 0
                                ? new Date(responses[0].created_at).toLocaleDateString("es-MX", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })
                                : "Sin respuestas"}
                        </p>
                    </div>
                </div>

                {/* Resumen de preguntas cerradas */}
                {questions.filter((q) => q.tipo === "cerrada").length > 0 && responses.length > 0 && (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8">
                        <h2 className="text-base font-medium text-neutral-900 mb-4">
                            Resumen de preguntas cerradas
                        </h2>
                        <div className="space-y-6">
                            {questions
                                .filter((q) => q.tipo === "cerrada")
                                .map((question) => {
                                    const { conteo, total } = getEstadisticasCerradas(question.id, question.opciones)
                                    return (
                                        <div key={question.id}>
                                            <p className="text-sm font-medium text-neutral-700 mb-3">
                                                {question.pregunta}
                                            </p>
                                            <div className="space-y-2">
                                                {question.opciones.map((opcion) => {
                                                    const count = conteo[opcion] || 0
                                                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                                                    return (
                                                        <div key={opcion} className="flex items-center gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs text-neutral-600">{opcion}</span>
                                                                    <span className="text-xs text-neutral-400">
                                                                        {count} ({percentage}%)
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-neutral-100 rounded-full h-2">
                                                                    <div
                                                                        className="bg-[#1a1a1a] rounded-full h-2 transition-all duration-500"
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                )}

                {/* Lista de respuestas */}
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                    <div className="p-4 lg:p-6 border-b border-neutral-200 bg-neutral-50">
                        <h2 className="font-medium text-neutral-900 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5" />
                            Respuestas individuales
                            <span className="text-sm text-neutral-500 font-normal">({responses.length})</span>
                        </h2>
                    </div>

                    {responses.length === 0 ? (
                        <div className="p-12 text-center">
                            <Eye className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                            <p className="text-neutral-500">Aún no hay respuestas</p>
                            <p className="text-neutral-400 text-sm">
                                Comparte el enlace de la encuesta para recibir respuestas
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {responses.map((response) => (
                                <div key={response.id}>
                                    <button
                                        onClick={() =>
                                            setExpandedResponse(
                                                expandedResponse === response.id ? null : response.id
                                            )
                                        }
                                        className="w-full p-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-600 flex-shrink-0">
                                            {response.respondent_name
                                                ? response.respondent_name.charAt(0).toUpperCase()
                                                : "?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {response.respondent_name || "Anónimo"}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                {response.respondent_email && (
                                                    <span className="flex items-center gap-1 truncate">
                                                        <Mail className="w-3 h-3" />
                                                        {response.respondent_email}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(response.created_at).toLocaleDateString("es-MX", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        {expandedResponse === response.id ? (
                                            <ChevronUp className="w-5 h-5 text-neutral-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-neutral-400" />
                                        )}
                                    </button>

                                    {expandedResponse === response.id && (
                                        <div className="px-4 pb-4 pl-18">
                                            <div className="ml-14 space-y-3">
                                                {questions.map((question) => {
                                                    const answer = response.respuestas.find(
                                                        (a) => a.question_id === question.id
                                                    )
                                                    return (
                                                        <div key={question.id} className="bg-neutral-50 rounded-xl p-3">
                                                            <p className="text-xs text-neutral-500 mb-1">
                                                                {question.pregunta}
                                                            </p>
                                                            <p className="text-sm font-medium text-neutral-800">
                                                                {answer?.respuesta || (
                                                                    <span className="text-neutral-400 italic">Sin respuesta</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

export default function RespuestasPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    return (
        <AuthGuard>
            <Suspense fallback={null}>
                <RespuestasContent surveyId={resolvedParams.id} />
            </Suspense>
        </AuthGuard>
    )
}
