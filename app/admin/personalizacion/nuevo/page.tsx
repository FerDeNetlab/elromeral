"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
    ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical,
    ChevronUp, ChevronDown, ImageIcon, Search, X,
} from "lucide-react"

interface Product {
    id: string
    titulo: string
    descripcion: string | null
    tipo_precio: "fijo" | "por_invitado"
    precio: number
    imagen_url: string | null
    activo: boolean
    product_categories?: { nombre: string } | null
}

interface StepDraft {
    titulo: string
    tipo_seleccion: "unico" | "multiple"
    requerido: boolean
    permite_omitir: boolean
    product_ids: string[]
}

function NuevoFlujoContent() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState("")

    const [titulo, setTitulo] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [incluirPasoFijo, setIncluirPasoFijo] = useState(true)
    const [steps, setSteps] = useState<StepDraft[]>([])
    const [productSearch, setProductSearch] = useState<Record<number, string>>({})

    const supabase = createClient()

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        const { data } = await supabase
            .from("products")
            .select("*, product_categories(nombre)")
            .eq("activo", true)
            .order("titulo")
        if (data) setProducts(data)
        setLoading(false)
    }

    const addStep = () => {
        setSteps([...steps, { titulo: "", tipo_seleccion: "unico", requerido: true, permite_omitir: false, product_ids: [] }])
    }

    const updateStep = (index: number, updates: Partial<StepDraft>) => {
        const updated = [...steps]
        updated[index] = { ...updated[index], ...updates }
        setSteps(updated)
    }

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index))
    }

    const moveStep = (index: number, dir: "up" | "down") => {
        const newIndex = dir === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= steps.length) return
        const updated = [...steps]
        const temp = updated[index]
        updated[index] = updated[newIndex]
        updated[newIndex] = temp
        setSteps(updated)
    }

    const toggleProduct = (stepIndex: number, productId: string) => {
        const step = steps[stepIndex]
        const ids = step.product_ids.includes(productId)
            ? step.product_ids.filter((id) => id !== productId)
            : [...step.product_ids, productId]
        updateStep(stepIndex, { product_ids: ids })
    }

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36)
    }

    const guardarFlujo = async () => {
        setError("")
        if (!titulo.trim()) { setError("El título es obligatorio"); return }
        if (steps.length === 0) { setError("Agrega al menos un paso"); return }
        for (let i = 0; i < steps.length; i++) {
            if (!steps[i].titulo.trim()) { setError(`El paso ${i + 1} necesita un título`); return }
            if (steps[i].product_ids.length === 0) { setError(`El paso ${i + 1} necesita al menos un producto`); return }
        }

        setGuardando(true)
        const slug = generateSlug(titulo)

        const { data: flow, error: flowError } = await supabase
            .from("quote_flows")
            .insert({ titulo: titulo.trim(), descripcion: descripcion.trim() || null, slug, activo: true, incluir_paso_fijo: incluirPasoFijo })
            .select("id")
            .single()

        if (flowError || !flow) { setError("Error creando el flujo"); setGuardando(false); return }

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i]
            const { data: dbStep, error: stepError } = await supabase
                .from("quote_flow_steps")
                .insert({
                    flow_id: flow.id,
                    titulo: step.titulo.trim(),
                    tipo_seleccion: step.tipo_seleccion,
                    orden: i,
                    requerido: step.requerido,
                    permite_omitir: step.permite_omitir,
                })
                .select("id")
                .single()

            if (stepError || !dbStep) { setError(`Error creando paso ${i + 1}`); setGuardando(false); return }

            const stepProducts = step.product_ids.map((pid) => ({ step_id: dbStep.id, product_id: pid }))
            await supabase.from("quote_flow_step_products").insert(stepProducts)
        }

        router.push("/admin/personalizacion")
    }

    const getFilteredProducts = (stepIndex: number) => {
        const search = (productSearch[stepIndex] || "").toLowerCase()
        if (!search) return products
        return products.filter(
            (p) => p.titulo.toLowerCase().includes(search) || (p.descripcion && p.descripcion.toLowerCase().includes(search))
        )
    }

    if (loading) {
        return <AdminLayout currentPage="personalizacion"><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div></AdminLayout>
    }

    return (
        <AdminLayout currentPage="personalizacion">
            <div className="p-4 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/personalizacion" className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900">Nuevo Flujo</h1>
                        <p className="text-sm text-neutral-500">Configura los pasos y productos para la personalización de boda</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Info básica */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <h2 className="text-base font-medium text-neutral-900 mb-4">Información del flujo</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1.5">Título *</label>
                                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Cotizador Boda 2026" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1.5">Descripción</label>
                                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción breve del flujo..." rows={2} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Paso fijo */}
                    <div className={`bg-neutral-50 border border-neutral-200 rounded-2xl p-6 transition-opacity ${!incluirPasoFijo ? "opacity-40" : "opacity-70"}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-medium">1</span>
                            <h3 className={`font-medium text-neutral-900 ${!incluirPasoFijo ? "line-through" : ""}`}>Información básica</h3>
                            <span className="px-2 py-0.5 text-[10px] bg-neutral-200 text-neutral-600 rounded-full">Paso fijo</span>
                            <label className="ml-auto flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={incluirPasoFijo}
                                    onChange={(e) => setIncluirPasoFijo(e.target.checked)}
                                    className="rounded border-neutral-300"
                                />
                                <span className="text-xs text-neutral-500">Incluir</span>
                            </label>
                        </div>
                        <p className="text-xs text-neutral-500 ml-11">Nombre del cliente, email, número de invitados y tipo de evento (comida/cena). {incluirPasoFijo ? "Este paso se muestra automáticamente." : "Este paso no se mostrará en el flujo."}</p>
                    </div>

                    {/* Pasos dinámicos */}
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    {/* Reorder */}
                                    <div className="flex flex-col items-center gap-0.5">
                                        <button onClick={() => moveStep(index, "up")} disabled={index === 0} className="p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                        <GripVertical className="w-3 h-3 text-neutral-300" />
                                        <button onClick={() => moveStep(index, "down")} disabled={index === steps.length - 1} className="p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                    </div>

                                    <span className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-medium">{incluirPasoFijo ? index + 2 : index + 1}</span>

                                    <input
                                        type="text"
                                        value={step.titulo}
                                        onChange={(e) => updateStep(index, { titulo: e.target.value })}
                                        placeholder="Título del paso (ej: Tipo de Mesa)"
                                        className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    />

                                    <button onClick={() => removeStep(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Opciones del paso */}
                                <div className="ml-11 space-y-4">
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-neutral-500">Selección:</label>
                                            <select
                                                value={step.tipo_seleccion}
                                                onChange={(e) => updateStep(index, { tipo_seleccion: e.target.value as "unico" | "multiple" })}
                                                className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none"
                                            >
                                                <option value="unico">Única (radio)</option>
                                                <option value="multiple">Múltiple (checkbox)</option>
                                            </select>
                                        </div>

                                        <label className="flex items-center gap-2 text-xs text-neutral-500 cursor-pointer">
                                            <input type="checkbox" checked={step.permite_omitir} onChange={(e) => updateStep(index, { permite_omitir: e.target.checked })} className="rounded border-neutral-300" />
                                            Permitir omitir este paso
                                        </label>
                                    </div>

                                    {/* Selector de productos */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs text-neutral-500 font-medium">Productos ({step.product_ids.length} seleccionados)</label>
                                        </div>

                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
                                            <input
                                                type="text"
                                                value={productSearch[index] || ""}
                                                onChange={(e) => setProductSearch({ ...productSearch, [index]: e.target.value })}
                                                placeholder="Buscar producto..."
                                                className="w-full pl-8 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black/5"
                                            />
                                        </div>

                                        <div className="max-h-60 overflow-y-auto border border-neutral-200 rounded-xl divide-y divide-neutral-100">
                                            {getFilteredProducts(index).map((product) => {
                                                const selected = step.product_ids.includes(product.id)
                                                return (
                                                    <button
                                                        key={product.id}
                                                        onClick={() => toggleProduct(index, product.id)}
                                                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${selected ? "bg-[#1a1a1a]/5" : "hover:bg-neutral-50"}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "bg-[#1a1a1a] border-[#1a1a1a]" : "border-neutral-300"}`}>
                                                            {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                                                            {product.imagen_url ? <Image src={product.imagen_url} alt="" width={32} height={32} className="object-cover w-full h-full" /> : <ImageIcon className="w-4 h-4 m-2 text-neutral-300" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-neutral-900 truncate">{product.titulo}</p>
                                                            <p className="text-[10px] text-neutral-400">
                                                                ${Number(product.precio).toLocaleString("es-MX")}{product.tipo_precio === "por_invitado" ? "/persona" : " fijo"}
                                                                {product.product_categories && ` · ${(product.product_categories as { nombre: string }).nombre}`}
                                                            </p>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                            {getFilteredProducts(index).length === 0 && (
                                                <p className="p-4 text-xs text-neutral-400 text-center">Sin productos</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Agregar paso */}
                    <button
                        onClick={addStep}
                        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-neutral-300 rounded-2xl text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar paso
                    </button>

                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href="/admin/personalizacion" className="px-5 py-3 text-sm text-neutral-600 hover:text-neutral-800 transition-colors">Cancelar</Link>
                        <button onClick={guardarFlujo} disabled={guardando} className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50">
                            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {guardando ? "Guardando..." : "Guardar Flujo"}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default function NuevoFlujoPage() {
    return <AuthGuard><Suspense fallback={null}><NuevoFlujoContent /></Suspense></AuthGuard>
}
