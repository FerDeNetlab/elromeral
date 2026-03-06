"use client"

import { useState, useEffect, Suspense, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
    ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical,
    ChevronUp, ChevronDown, ImageIcon, Search,
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

function EditarFlujoContent({ flowId }: { flowId: string }) {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState("")

    const [titulo, setTitulo] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [steps, setSteps] = useState<StepDraft[]>([])
    const [productSearch, setProductSearch] = useState<Record<number, string>>({})

    const supabase = createClient()

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setLoading(true)
        const [flowRes, stepsRes, productsRes] = await Promise.all([
            supabase.from("quote_flows").select("*").eq("id", flowId).single(),
            supabase.from("quote_flow_steps").select("*, quote_flow_step_products(product_id)").eq("flow_id", flowId).order("orden"),
            supabase.from("products").select("*, product_categories(nombre)").eq("activo", true).order("titulo"),
        ])

        if (flowRes.error || !flowRes.data) { router.push("/admin/personalizacion"); return }

        setTitulo(flowRes.data.titulo)
        setDescripcion(flowRes.data.descripcion || "")
        if (productsRes.data) setProducts(productsRes.data)

        if (stepsRes.data) {
            setSteps(stepsRes.data.map((s: Record<string, unknown>) => ({
                titulo: s.titulo as string,
                tipo_seleccion: s.tipo_seleccion as "unico" | "multiple",
                requerido: s.requerido as boolean,
                permite_omitir: s.permite_omitir as boolean,
                product_ids: ((s.quote_flow_step_products as Array<{ product_id: string }>) || []).map((p) => p.product_id),
            })))
        }
        setLoading(false)
    }

    const addStep = () => setSteps([...steps, { titulo: "", tipo_seleccion: "unico", requerido: true, permite_omitir: false, product_ids: [] }])
    const updateStep = (i: number, u: Partial<StepDraft>) => { const s = [...steps]; s[i] = { ...s[i], ...u }; setSteps(s) }
    const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i))
    const moveStep = (i: number, d: "up" | "down") => { const n = d === "up" ? i - 1 : i + 1; if (n < 0 || n >= steps.length) return; const s = [...steps];[s[i], s[n]] = [s[n], s[i]]; setSteps(s) }
    const toggleProduct = (si: number, pid: string) => { const s = steps[si]; updateStep(si, { product_ids: s.product_ids.includes(pid) ? s.product_ids.filter((id) => id !== pid) : [...s.product_ids, pid] }) }
    const getFiltered = (i: number) => { const q = (productSearch[i] || "").toLowerCase(); return q ? products.filter((p) => p.titulo.toLowerCase().includes(q)) : products }

    const guardarFlujo = async () => {
        setError("")
        if (!titulo.trim()) { setError("El título es obligatorio"); return }
        if (steps.length === 0) { setError("Agrega al menos un paso"); return }
        for (let i = 0; i < steps.length; i++) {
            if (!steps[i].titulo.trim()) { setError(`Paso ${i + 1} necesita título`); return }
            if (steps[i].product_ids.length === 0) { setError(`Paso ${i + 1} necesita productos`); return }
        }

        setGuardando(true)

        await supabase.from("quote_flows").update({ titulo: titulo.trim(), descripcion: descripcion.trim() || null, updated_at: new Date().toISOString() }).eq("id", flowId)

        // Borrar pasos antiguos (cascade borra step_products)
        await supabase.from("quote_flow_steps").delete().eq("flow_id", flowId)

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i]
            const { data: dbStep } = await supabase.from("quote_flow_steps").insert({
                flow_id: flowId, titulo: step.titulo.trim(), tipo_seleccion: step.tipo_seleccion,
                orden: i, requerido: step.requerido, permite_omitir: step.permite_omitir,
            }).select("id").single()

            if (dbStep) {
                await supabase.from("quote_flow_step_products").insert(step.product_ids.map((pid) => ({ step_id: dbStep.id, product_id: pid })))
            }
        }

        router.push("/admin/personalizacion")
    }

    if (loading) return <AdminLayout currentPage="personalizacion"><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div></AdminLayout>

    return (
        <AdminLayout currentPage="personalizacion">
            <div className="p-4 lg:p-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/personalizacion" className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"><ArrowLeft className="w-5 h-5 text-neutral-600" /></Link>
                    <div><h1 className="text-xl lg:text-2xl font-semibold text-neutral-900">Editar Flujo</h1><p className="text-sm text-neutral-500">Modifica los pasos y productos del flujo</p></div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <h2 className="text-base font-medium text-neutral-900 mb-4">Información del flujo</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm text-neutral-500 mb-1.5">Título *</label><input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" /></div>
                            <div><label className="block text-sm text-neutral-500 mb-1.5">Descripción</label><textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none" /></div>
                        </div>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 opacity-70">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-medium">1</span>
                            <h3 className="font-medium text-neutral-900">Información básica</h3>
                            <span className="px-2 py-0.5 text-[10px] bg-neutral-200 text-neutral-600 rounded-full">Paso fijo</span>
                        </div>
                        <p className="text-xs text-neutral-500 ml-11">Nombre, email, invitados, comida/cena (automático)</p>
                    </div>

                    {steps.map((step, index) => (
                        <div key={index} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex flex-col items-center gap-0.5">
                                        <button onClick={() => moveStep(index, "up")} disabled={index === 0} className="p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                        <GripVertical className="w-3 h-3 text-neutral-300" />
                                        <button onClick={() => moveStep(index, "down")} disabled={index === steps.length - 1} className="p-0.5 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                    </div>
                                    <span className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-medium">{index + 2}</span>
                                    <input type="text" value={step.titulo} onChange={(e) => updateStep(index, { titulo: e.target.value })} placeholder="Título del paso" className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                                    <button onClick={() => removeStep(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>

                                <div className="ml-11 space-y-4">
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-neutral-500">Selección:</label>
                                            <select value={step.tipo_seleccion} onChange={(e) => updateStep(index, { tipo_seleccion: e.target.value as "unico" | "multiple" })} className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none">
                                                <option value="unico">Única</option><option value="multiple">Múltiple</option>
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-2 text-xs text-neutral-500 cursor-pointer">
                                            <input type="checkbox" checked={step.permite_omitir} onChange={(e) => updateStep(index, { permite_omitir: e.target.checked })} className="rounded border-neutral-300" />
                                            Permitir omitir
                                        </label>
                                    </div>

                                    <div>
                                        <label className="text-xs text-neutral-500 font-medium block mb-2">Productos ({step.product_ids.length})</label>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
                                            <input type="text" value={productSearch[index] || ""} onChange={(e) => setProductSearch({ ...productSearch, [index]: e.target.value })} placeholder="Buscar..." className="w-full pl-8 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black/5" />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-xl divide-y divide-neutral-100">
                                            {getFiltered(index).map((p) => {
                                                const sel = step.product_ids.includes(p.id)
                                                return (
                                                    <button key={p.id} onClick={() => toggleProduct(index, p.id)} className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${sel ? "bg-[#1a1a1a]/5" : "hover:bg-neutral-50"}`}>
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${sel ? "bg-[#1a1a1a] border-[#1a1a1a]" : "border-neutral-300"}`}>
                                                            {sel && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                                                            {p.imagen_url ? <Image src={p.imagen_url} alt="" width={32} height={32} className="object-cover w-full h-full" /> : <ImageIcon className="w-4 h-4 m-2 text-neutral-300" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0"><p className="text-xs font-medium text-neutral-900 truncate">{p.titulo}</p><p className="text-[10px] text-neutral-400">${Number(p.precio).toLocaleString("es-MX")}{p.tipo_precio === "por_invitado" ? "/persona" : " fijo"}</p></div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={addStep} className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-neutral-300 rounded-2xl text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-all"><Plus className="w-4 h-4" />Agregar paso</button>

                    {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-600">{error}</p></div>}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href="/admin/personalizacion" className="px-5 py-3 text-sm text-neutral-600">Cancelar</Link>
                        <button onClick={guardarFlujo} disabled={guardando} className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50">
                            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{guardando ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default function EditarFlujoPage({ params }: { params: Promise<{ id: string }> }) {
    const p = use(params)
    return <AuthGuard><Suspense fallback={null}><EditarFlujoContent flowId={p.id} /></Suspense></AuthGuard>
}
