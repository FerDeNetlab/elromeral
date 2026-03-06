"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface Survey {
    id: string
    titulo: string
    descripcion: string | null
    activa: boolean
}

interface Question {
    id: string
    tipo: "abierta" | "cerrada"
    pregunta: string
    opciones: string[]
    orden: number
    requerida: boolean
}

export default function EncuestaPublicaPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = use(params)
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const [error, setError] = useState("")
    const [notFound, setNotFound] = useState(false)
    const [inactive, setInactive] = useState(false)

    // Form state
    const [nombre, setNombre] = useState("")
    const [email, setEmail] = useState("")
    const [respuestas, setRespuestas] = useState<Record<string, string>>({})

    const supabase = createClient()

    useEffect(() => {
        cargarEncuesta()
    }, [])

    const cargarEncuesta = async () => {
        setLoading(true)

        const { data: surveyData, error: surveyError } = await supabase
            .from("surveys")
            .select("*")
            .eq("slug", slug)
            .single()

        if (surveyError || !surveyData) {
            setNotFound(true)
            setLoading(false)
            return
        }

        if (!surveyData.activa) {
            setInactive(true)
            setLoading(false)
            return
        }

        setSurvey(surveyData)

        const { data: questionsData } = await supabase
            .from("survey_questions")
            .select("*")
            .eq("survey_id", surveyData.id)
            .order("orden", { ascending: true })

        setQuestions(questionsData || [])
        setLoading(false)
    }

    const actualizarRespuesta = (questionId: string, value: string) => {
        setRespuestas((prev) => ({ ...prev, [questionId]: value }))
    }

    const enviarRespuestas = async () => {
        setError("")

        // Validar campos requeridos
        const preguntasFaltantes = questions.filter(
            (q) => q.requerida && (!respuestas[q.id] || !respuestas[q.id].trim())
        )
        if (preguntasFaltantes.length > 0) {
            setError("Por favor responde todas las preguntas obligatorias")
            // Scroll to first missing question
            const el = document.getElementById(`question-${preguntasFaltantes[0].id}`)
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
            return
        }

        setEnviando(true)

        const respuestasArray = Object.entries(respuestas)
            .filter(([_, value]) => value.trim())
            .map(([question_id, respuesta]) => ({
                question_id,
                respuesta: respuesta.trim(),
            }))

        const { error: dbError } = await supabase.from("survey_responses").insert({
            survey_id: survey!.id,
            respondent_name: nombre.trim() || null,
            respondent_email: email.trim() || null,
            respuestas: respuestasArray,
        })

        if (dbError) {
            setError("Hubo un error al enviar tus respuestas. Intenta de nuevo.")
            setEnviando(false)
            return
        }

        setEnviado(true)
        setEnviando(false)
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4a5043]" />
            </div>
        )
    }

    // Not found state
    if (notFound) {
        return (
            <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 mx-auto text-[#4a5043]/30 mb-4" />
                    <h1 className="font-serif text-2xl text-[#4a5043] mb-2">
                        Encuesta no encontrada
                    </h1>
                    <p className="text-sm text-[#4a5043]/60">
                        Esta encuesta no existe o el enlace es incorrecto.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center mt-6 px-5 py-2.5 bg-[#4a5043] text-white rounded-lg text-sm hover:bg-[#3a4033] transition-colors"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        )
    }

    // Inactive state
    if (inactive) {
        return (
            <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 mx-auto text-[#4a5043]/30 mb-4" />
                    <h1 className="font-serif text-2xl text-[#4a5043] mb-2">
                        Encuesta cerrada
                    </h1>
                    <p className="text-sm text-[#4a5043]/60">
                        Esta encuesta ya no se encuentra disponible.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center mt-6 px-5 py-2.5 bg-[#4a5043] text-white rounded-lg text-sm hover:bg-[#3a4033] transition-colors"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        )
    }

    // Thank you state
    if (enviado) {
        return (
            <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4">
                <div className="text-center max-w-md animate-fade-in">
                    {/* Logo */}
                    <div className="mb-8">
                        <Image
                            src="/el-romeral-logo.png"
                            alt="El Romeral"
                            width={120}
                            height={40}
                            className="mx-auto"
                        />
                    </div>

                    <div className="w-20 h-20 rounded-full bg-[#4a5043]/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-[#4a5043]" />
                    </div>
                    <h1
                        className="font-serif text-3xl lg:text-4xl text-[#4a5043] mb-3"
                        style={{ fontFamily: "var(--font-serif)" }}
                    >
                        ¡Gracias por tu respuesta!
                    </h1>
                    <p className="text-[#4a5043]/70 text-sm lg:text-base leading-relaxed">
                        Tus respuestas han sido registradas exitosamente.
                        <br />
                        Agradecemos mucho tu tiempo y retroalimentación.
                    </p>

                    <div className="mt-8 pt-8 border-t border-[#4a5043]/10">
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-[#4a5043] text-white rounded-lg text-sm font-medium hover:bg-[#3a4033] transition-colors"
                        >
                            Visitar El Romeral
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8f7f4]">
            {/* Header elegante */}
            <header className="bg-white/80 backdrop-blur-md border-b border-[#4a5043]/10 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center">
                    <Link href="/">
                        <Image
                            src="/el-romeral-logo.png"
                            alt="El Romeral"
                            width={100}
                            height={35}
                            className="opacity-80 hover:opacity-100 transition-opacity"
                        />
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 lg:py-12">
                {/* Título de la encuesta */}
                <div className="text-center mb-10 animate-fade-in">
                    <h1
                        className="text-3xl lg:text-4xl text-[#4a5043] mb-3 leading-tight"
                        style={{ fontFamily: "var(--font-serif)" }}
                    >
                        {survey?.titulo}
                    </h1>
                    {survey?.descripcion && (
                        <p className="text-[#4a5043]/60 text-sm lg:text-base max-w-lg mx-auto leading-relaxed">
                            {survey.descripcion}
                        </p>
                    )}
                    <div className="w-16 h-0.5 bg-[#4a5043]/20 mx-auto mt-6" />
                </div>

                {/* Formulario */}
                <div className="space-y-6 animate-fade-in-up">
                    {/* Info del respondiente */}
                    <div className="bg-white rounded-2xl border border-[#4a5043]/10 p-6 shadow-sm">
                        <p
                            className="text-sm text-[#4a5043]/50 mb-4 uppercase tracking-widest"
                            style={{ fontSize: "10px", letterSpacing: "0.15em" }}
                        >
                            Tu información (opcional)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-[#4a5043]/60 mb-1.5">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="w-full px-4 py-3 bg-[#f8f7f4] border border-[#4a5043]/10 rounded-xl text-sm text-[#4a5043] placeholder-[#4a5043]/30 focus:outline-none focus:ring-2 focus:ring-[#4a5043]/10 focus:border-[#4a5043]/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[#4a5043]/60 mb-1.5">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full px-4 py-3 bg-[#f8f7f4] border border-[#4a5043]/10 rounded-xl text-sm text-[#4a5043] placeholder-[#4a5043]/30 focus:outline-none focus:ring-2 focus:ring-[#4a5043]/10 focus:border-[#4a5043]/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preguntas */}
                    {questions.map((question, index) => (
                        <div
                            key={question.id}
                            id={`question-${question.id}`}
                            className="bg-white rounded-2xl border border-[#4a5043]/10 p-6 shadow-sm transition-all"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <span
                                    className="flex-shrink-0 w-7 h-7 rounded-full bg-[#4a5043]/5 flex items-center justify-center text-xs font-medium text-[#4a5043]/60"
                                >
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="text-sm lg:text-base font-medium text-[#4a5043] leading-relaxed">
                                        {question.pregunta}
                                        {question.requerida && (
                                            <span className="text-red-400 ml-1">*</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {question.tipo === "abierta" ? (
                                <textarea
                                    value={respuestas[question.id] || ""}
                                    onChange={(e) => actualizarRespuesta(question.id, e.target.value)}
                                    placeholder="Escribe tu respuesta aquí..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#f8f7f4] border border-[#4a5043]/10 rounded-xl text-sm text-[#4a5043] placeholder-[#4a5043]/30 focus:outline-none focus:ring-2 focus:ring-[#4a5043]/10 focus:border-[#4a5043]/20 transition-all resize-none"
                                />
                            ) : (
                                <div className="space-y-2 ml-10">
                                    {question.opciones.map((opcion, opIndex) => (
                                        <label
                                            key={opIndex}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${respuestas[question.id] === opcion
                                                    ? "bg-[#4a5043]/5 border-[#4a5043]/30"
                                                    : "bg-[#f8f7f4] border-[#4a5043]/10 hover:border-[#4a5043]/20"
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${respuestas[question.id] === opcion
                                                        ? "border-[#4a5043] bg-[#4a5043]"
                                                        : "border-[#4a5043]/30"
                                                    }`}
                                            >
                                                {respuestas[question.id] === opcion && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <span className="text-sm text-[#4a5043]">{opcion}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    {/* Botón enviar */}
                    <div className="pt-4 pb-8">
                        <button
                            onClick={enviarRespuestas}
                            disabled={enviando}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#4a5043] text-white rounded-xl text-sm font-medium hover:bg-[#3a4033] transition-all disabled:opacity-50 shadow-lg shadow-[#4a5043]/10"
                        >
                            {enviando ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                "Enviar Respuestas"
                            )}
                        </button>
                        <p className="text-center text-xs text-[#4a5043]/40 mt-3">
                            Tus respuestas son confidenciales
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#4a5043]/10 py-6">
                <div className="text-center">
                    <p className="text-xs text-[#4a5043]/40">
                        © {new Date().getFullYear()} El Romeral · Jardín para Eventos
                    </p>
                </div>
            </footer>
        </div>
    )
}
