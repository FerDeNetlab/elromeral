"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import Link from "next/link"
import {
    ArrowLeft,
    Plus,
    Trash2,
    Loader2,
    Tag,
    GripVertical,
    ChevronUp,
    ChevronDown,
    Pencil,
    Check,
    X,
} from "lucide-react"

interface Category {
    id: string
    nombre: string
    descripcion: string | null
    orden: number
    activa: boolean
    product_count?: number
}

function CategoriasContent() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevaDescripcion, setNuevaDescripcion] = useState("")
    const [agregando, setAgregando] = useState(false)
    const [editandoId, setEditandoId] = useState<string | null>(null)
    const [editNombre, setEditNombre] = useState("")
    const [editDescripcion, setEditDescripcion] = useState("")
    const [error, setError] = useState("")

    const supabase = createClient()

    useEffect(() => {
        cargarCategorias()
    }, [])

    const cargarCategorias = async () => {
        setLoading(true)

        const { data: cats } = await supabase
            .from("product_categories")
            .select("*")
            .order("orden", { ascending: true })

        if (cats) {
            // Conteo de productos por categoría
            const catsWithCounts = await Promise.all(
                cats.map(async (cat) => {
                    const { count } = await supabase
                        .from("products")
                        .select("*", { count: "exact", head: true })
                        .eq("category_id", cat.id)
                    return { ...cat, product_count: count || 0 }
                })
            )
            setCategories(catsWithCounts)
        }

        setLoading(false)
    }

    const agregarCategoria = async () => {
        if (!nuevoNombre.trim()) {
            setError("El nombre es obligatorio")
            return
        }
        setAgregando(true)
        setError("")

        const maxOrden = categories.length > 0 ? Math.max(...categories.map((c) => c.orden)) + 1 : 0

        const { error: dbError } = await supabase.from("product_categories").insert({
            nombre: nuevoNombre.trim(),
            descripcion: nuevaDescripcion.trim() || null,
            orden: maxOrden,
            activa: true,
        })

        if (dbError) {
            setError("Error al agregar la categoría")
        } else {
            setNuevoNombre("")
            setNuevaDescripcion("")
            cargarCategorias()
        }
        setAgregando(false)
    }

    const iniciarEdicion = (cat: Category) => {
        setEditandoId(cat.id)
        setEditNombre(cat.nombre)
        setEditDescripcion(cat.descripcion || "")
    }

    const guardarEdicion = async () => {
        if (!editandoId || !editNombre.trim()) return

        await supabase
            .from("product_categories")
            .update({
                nombre: editNombre.trim(),
                descripcion: editDescripcion.trim() || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", editandoId)

        setEditandoId(null)
        cargarCategorias()
    }

    const cancelarEdicion = () => {
        setEditandoId(null)
        setEditNombre("")
        setEditDescripcion("")
    }

    const toggleActiva = async (id: string, activa: boolean) => {
        await supabase
            .from("product_categories")
            .update({ activa: !activa, updated_at: new Date().toISOString() })
            .eq("id", id)
        cargarCategorias()
    }

    const eliminarCategoria = async (id: string, productCount: number) => {
        if (productCount > 0) {
            if (
                !confirm(
                    `Esta categoría tiene ${productCount} producto(s) asociado(s). Los productos quedarán sin categoría. ¿Continuar?`
                )
            )
                return
        } else {
            if (!confirm("¿Estás seguro de eliminar esta categoría?")) return
        }

        await supabase.from("product_categories").delete().eq("id", id)
        cargarCategorias()
    }

    const moverCategoria = async (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= categories.length) return

        const updated = [...categories]
        const temp = updated[index]
        updated[index] = updated[newIndex]
        updated[newIndex] = temp

        // Actualizar orden en DB
        await Promise.all(
            updated.map((cat, i) =>
                supabase.from("product_categories").update({ orden: i }).eq("id", cat.id)
            )
        )

        cargarCategorias()
    }

    return (
        <AdminLayout currentPage="productos">
            <div className="p-4 lg:p-8 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/admin/productos"
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900">
                            Categorías
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Organiza tus productos y servicios por categoría
                        </p>
                    </div>
                </div>

                {/* Agregar nueva */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
                    <h2 className="text-base font-medium text-neutral-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Nueva categoría
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={nuevoNombre}
                                onChange={(e) => {
                                    setNuevoNombre(e.target.value)
                                    setError("")
                                }}
                                placeholder="Nombre de la categoría"
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={nuevaDescripcion}
                                onChange={(e) => setNuevaDescripcion(e.target.value)}
                                placeholder="Descripción (opcional)"
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                            />
                        </div>
                        <button
                            onClick={agregarCategoria}
                            disabled={agregando}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                        >
                            {agregando ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Agregar
                                </>
                            )}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </div>

                {/* Lista */}
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                        <h2 className="font-medium text-neutral-900 flex items-center gap-2">
                            <Tag className="w-5 h-5" />
                            Categorías registradas
                            <span className="text-sm text-neutral-500 font-normal">
                                ({categories.length})
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-12 text-center">
                            <Tag className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                            <p className="text-neutral-500">No hay categorías</p>
                            <p className="text-neutral-400 text-sm">
                                Agrega categorías para organizar tus productos
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {categories.map((cat, index) => (
                                <div
                                    key={cat.id}
                                    className={`p-4 flex items-center gap-3 transition-colors ${!cat.activa ? "bg-neutral-50 opacity-60" : ""
                                        }`}
                                >
                                    {/* Reorder */}
                                    <div className="flex flex-col items-center gap-0.5">
                                        <button
                                            onClick={() => moverCategoria(index, "up")}
                                            disabled={index === 0}
                                            className="p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                                        >
                                            <ChevronUp className="w-3 h-3" />
                                        </button>
                                        <GripVertical className="w-3 h-3 text-neutral-300" />
                                        <button
                                            onClick={() => moverCategoria(index, "down")}
                                            disabled={index === categories.length - 1}
                                            className="p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                                        >
                                            <ChevronDown className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Icon */}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cat.activa ? "bg-neutral-100" : "bg-neutral-200"
                                            }`}
                                    >
                                        <Tag
                                            className={`w-5 h-5 ${cat.activa ? "text-neutral-600" : "text-neutral-400"
                                                }`}
                                        />
                                    </div>

                                    {/* Content */}
                                    {editandoId === cat.id ? (
                                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                value={editNombre}
                                                onChange={(e) => setEditNombre(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                            />
                                            <input
                                                type="text"
                                                value={editDescripcion}
                                                onChange={(e) => setEditDescripcion(e.target.value)}
                                                placeholder="Descripción"
                                                className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                            />
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={guardarEdicion}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={cancelarEdicion}
                                                    className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-neutral-900 text-sm">
                                                    {cat.nombre}
                                                </p>
                                                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500">
                                                    {cat.product_count || 0} productos
                                                </span>
                                            </div>
                                            {cat.descripcion && (
                                                <p className="text-xs text-neutral-500 truncate">
                                                    {cat.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {editandoId !== cat.id && (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => iniciarEdicion(cat)}
                                                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => toggleActiva(cat.id, cat.activa)}
                                                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                            >
                                                {cat.activa ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <X className="w-4 h-4 text-neutral-400" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    eliminarCategoria(cat.id, cat.product_count || 0)
                                                }
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
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

export default function CategoriasPage() {
    return (
        <AuthGuard>
            <Suspense fallback={null}>
                <CategoriasContent />
            </Suspense>
        </AuthGuard>
    )
}
