"use client"

import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Plus,
    Trash2,
    GripVertical,
    ChevronUp,
    ChevronDown,
    Loader2,
    Save,
    Type,
    ListChecks,
} from "lucide-react"
import Link from "next/link"

interface Pregunta {
    id: string
    tipo: "abierta" | "cerrada"
    pregunta: string
    opciones: string[]
    requerida: boolean
}

function generarId(): string {
    return Math.random().toString(36).substring(2, 12)
}

function generarSlug(): string {
    const caracteres = "abcdefghijklmnopqrstuvwxyz0123456789"
    let slug = ""
    for (let i = 0; i < 8; i++) {
        slug += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    }
    return slug
}

function NuevaEncuestaContent() {
    const router = useRouter()
    const [guardando, setGuardando] = useState(false)
    const [titulo, setTitulo] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [preguntas, setPreguntas] = useState<Pregunta[]>([])
    const [error, setError] = useState("")

    const agregarPregunta = (tipo: "abierta" | "cerrada") => {
        const nueva: Pregunta = {
            id: generarId(),
            tipo,
            pregunta: "",
            opciones: tipo === "cerrada" ? ["", ""] : [],
            requerida: false,
        }
        setPreguntas([...preguntas, nueva])
    }

    const actualizarPregunta = (id: string, campo: Partial<Pregunta>) => {
        setPreguntas(
            preguntas.map((p) => (p.id === id ? { ...p, ...campo } : p))
        )
    }

    const eliminarPregunta = (id: string) => {
        setPreguntas(preguntas.filter((p) => p.id !== id))
    }

    const agregarOpcion = (preguntaId: string) => {
        setPreguntas(
            preguntas.map((p) =>
                p.id === preguntaId
                    ? { ...p, opciones: [...p.opciones, ""] }
                    : p
            )
        )
    }

    const actualizarOpcion = (preguntaId: string, index: number, value: string) => {
        setPreguntas(
            preguntas.map((p) =>
                p.id === preguntaId
                    ? {
                        ...p,
                        opciones: p.opciones.map((o, i) => (i === index ? value : o)),
                    }
                    : p
            )
        )
    }

    const eliminarOpcion = (preguntaId: string, index: number) => {
        setPreguntas(
            preguntas.map((p) =>
                p.id === preguntaId
                    ? { ...p, opciones: p.opciones.filter((_, i) => i !== index) }
                    : p
            )
        )
    }

    const moverPregunta = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= preguntas.length) return
        const newPreguntas = [...preguntas]
        const temp = newPreguntas[index]
        newPreguntas[index] = newPreguntas[newIndex]
        newPreguntas[newIndex] = temp
        setPreguntas(newPreguntas)
    }

    const guardarEncuesta = async () => {
        setError("")

        if (!titulo.trim()) {
            setError("El título es obligatorio")
            return
        }

        if (preguntas.length === 0) {
            setError("Agrega al menos una pregunta")
            return
        }

        // Validar que todas las preguntas tengan texto
        const preguntaVacia = preguntas.find((p) => !p.pregunta.trim())
        if (preguntaVacia) {
            setError("Todas las preguntas deben tener texto")
            return
        }

        // Validar opciones de preguntas cerradas
        const opcionVacia = preguntas.find(
            (p) =>
                p.tipo === "cerrada" &&
                (p.opciones.length < 2 || p.opciones.some((o) => !o.trim()))
        )
        if (opcionVacia) {
            setError("Las preguntas cerradas necesitan al menos 2 opciones y no pueden estar vacías")
            return
        }

        setGuardando(true)

        const supabase = createClient()
        const slug = generarSlug()

        // Crear encuesta
        const { data: survey, error: surveyError } = await supabase
            .from("surveys")
            .insert({
                slug,
                titulo: titulo.trim(),
                descripcion: descripcion.trim() || null,
                activa: true,
            })
            .select("id")
            .single()

        if (surveyError || !survey) {
            setError("Error creando la encuesta. Intenta de nuevo.")
            setGuardando(false)
            return
        }

        // Crear preguntas
        const preguntasData = preguntas.map((p, index) => ({
            survey_id: survey.id,
            tipo: p.tipo,
            pregunta: p.pregunta.trim(),
            opciones: p.tipo === "cerrada" ? p.opciones.map((o) => o.trim()) : [],
            orden: index,
            requerida: p.requerida,
        }))

        const { error: questionsError } = await supabase
            .from("survey_questions")
            .insert(preguntasData)

        if (questionsError) {
            // Rollback: eliminar la encuesta si fallan las preguntas
            await supabase.from("surveys").delete().eq("id", survey.id)
            setError("Error guardando las preguntas. Intenta de nuevo.")
            setGuardando(false)
            return
        }

        router.push("/admin/encuestas")
    }

    return (
        <AdminLayout currentPage="encuestas">
            <div className="p-4 lg:p-8 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/admin/encuestas"
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900">
                            Nueva Encuesta
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Configura tu encuesta y agrega preguntas
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <div className="space-y-6">
                    {/* Info básica */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <h2 className="text-base font-medium text-neutral-900 mb-4">
                            Información de la encuesta
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1.5">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej: Encuesta de satisfacción del evento"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1.5">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Describe brevemente el propósito de esta encuesta..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preguntas */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-medium text-neutral-900">
                                Preguntas ({preguntas.length})
                            </h2>
                        </div>

                        {preguntas.length === 0 && (
                            <div className="py-8 text-center border-2 border-dashed border-neutral-200 rounded-xl mb-4">
                                <p className="text-sm text-neutral-400">
                                    Aún no hay preguntas. Agrega tu primera pregunta abajo.
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {preguntas.map((pregunta, index) => (
                                <div
                                    key={pregunta.id}
                                    className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50"
                                >
                                    {/* Header de pregunta */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="flex flex-col items-center gap-0.5 pt-1">
                                            <button
                                                onClick={() => moverPregunta(index, "up")}
                                                disabled={index === 0}
                                                className="p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                            <GripVertical className="w-4 h-4 text-neutral-300" />
                                            <button
                                                onClick={() => moverPregunta(index, "down")}
                                                disabled={index === preguntas.length - 1}
                                                className="p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 font-medium">
                                                    {index + 1}
                                                </span>
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${pregunta.tipo === "abierta"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-purple-100 text-purple-700"
                                                        }`}
                                                >
                                                    {pregunta.tipo === "abierta" ? "Abierta" : "Cerrada"}
                                                </span>
                                                <label className="flex items-center gap-1.5 ml-auto text-xs text-neutral-500 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={pregunta.requerida}
                                                        onChange={(e) =>
                                                            actualizarPregunta(pregunta.id, {
                                                                requerida: e.target.checked,
                                                            })
                                                        }
                                                        className="rounded border-neutral-300"
                                                    />
                                                    Requerida
                                                </label>
                                            </div>

                                            <input
                                                type="text"
                                                value={pregunta.pregunta}
                                                onChange={(e) =>
                                                    actualizarPregunta(pregunta.id, {
                                                        pregunta: e.target.value,
                                                    })
                                                }
                                                placeholder="Escribe tu pregunta aquí..."
                                                className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                                            />

                                            {/* Opciones para cerradas */}
                                            {pregunta.tipo === "cerrada" && (
                                                <div className="mt-3 space-y-2">
                                                    {pregunta.opciones.map((opcion, opIndex) => (
                                                        <div
                                                            key={opIndex}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0" />
                                                            <input
                                                                type="text"
                                                                value={opcion}
                                                                onChange={(e) =>
                                                                    actualizarOpcion(
                                                                        pregunta.id,
                                                                        opIndex,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder={`Opción ${opIndex + 1}`}
                                                                className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                                                            />
                                                            {pregunta.opciones.length > 2 && (
                                                                <button
                                                                    onClick={() =>
                                                                        eliminarOpcion(pregunta.id, opIndex)
                                                                    }
                                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => agregarOpcion(pregunta.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        Agregar opción
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => eliminarPregunta(pregunta.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botones agregar pregunta */}
                        <div className="flex items-center gap-3 mt-4">
                            <button
                                onClick={() => agregarPregunta("abierta")}
                                className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                                <Type className="w-4 h-4 text-blue-500" />
                                Pregunta Abierta
                            </button>
                            <button
                                onClick={() => agregarPregunta("cerrada")}
                                className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                                <ListChecks className="w-4 h-4 text-purple-500" />
                                Pregunta Cerrada
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Botón guardar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href="/admin/encuestas"
                            className="px-5 py-3 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            onClick={guardarEncuesta}
                            disabled={guardando}
                            className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                        >
                            {guardando ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {guardando ? "Guardando..." : "Guardar Encuesta"}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default function NuevaEncuestaPage() {
    return (
        <AuthGuard>
            <Suspense fallback={null}>
                <NuevaEncuestaContent />
            </Suspense>
        </AuthGuard>
    )
}
