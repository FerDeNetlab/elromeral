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
    Mail,
    Calendar,
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

                {/* Contador */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-4 lg:p-6 mb-6">
                    <p className="text-xs text-neutral-500 mb-1">Total respuestas</p>
                    <p className="text-2xl lg:text-3xl font-semibold">{responses.length}</p>
                </div>

                {/* Respuestas */}
                {responses.length === 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                        <Eye className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                        <p className="text-neutral-500">Aún no hay respuestas</p>
                        <p className="text-neutral-400 text-sm">
                            Comparte el enlace de la encuesta para recibir respuestas
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {responses.map((response, rIndex) => (
                            <div key={response.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                                {/* Encabezado de la respuesta */}
                                <div className="px-5 py-4 bg-neutral-50 border-b border-neutral-100 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-600 flex-shrink-0">
                                        {response.respondent_name
                                            ? response.respondent_name.charAt(0).toUpperCase()
                                            : "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-neutral-900 truncate">
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
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-neutral-400 font-medium">#{responses.length - rIndex}</span>
                                </div>

                                {/* Todas las respuestas visibles */}
                                <div className="p-5 space-y-4">
                                    {questions.map((question) => {
                                        const answer = response.respuestas.find(
                                            (a) => a.question_id === question.id
                                        )
                                        const selectedOptions = answer?.respuesta?.split(", ") || []
                                        return (
                                            <div key={question.id}>
                                                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">
                                                    {question.pregunta}
                                                </p>
                                                {question.tipo === "cerrada" ? (
                                                    selectedOptions.length > 0 && selectedOptions[0] !== "" ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedOptions.map((opcion, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800"
                                                                >
                                                                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    {opcion}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-neutral-400 italic">Sin respuesta</p>
                                                    )
                                                ) : (
                                                    <p className="text-sm text-neutral-800">
                                                        {answer?.respuesta || (
                                                            <span className="text-neutral-400 italic">Sin respuesta</span>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
