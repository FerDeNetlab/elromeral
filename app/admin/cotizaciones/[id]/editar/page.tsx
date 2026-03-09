"use client"

import { useState, useEffect, useMemo, use } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ArrowLeft, Save, Plus, Trash2, Search, Send, Copy, Check, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Contact {
    id: string
    nombre_pareja: string
    email: string | null
    fecha_evento: string | null
    num_invitados: number | null
}

interface Product {
    id: string
    titulo: string
    precio: number
    tipo_precio: "fijo" | "por_invitado"
    category_name?: string
}

interface LineaForm {
    id?: string
    tempId: string
    product_id: string | null
    nombre: string
    descripcion: string
    categoria: string
    precio_unitario: number
    cantidad: number
    es_por_invitado: boolean
    nota: string
    es_acordado: boolean
}

export default function EditarCotizacionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    const [titulo, setTitulo] = useState("")
    const [slug, setSlug] = useState("")
    const [estado, setEstado] = useState("borrador")
    const [contactId, setContactId] = useState("")
    const [notasAlcance, setNotasAlcance] = useState("")
    const [lineas, setLineas] = useState<LineaForm[]>([])

    const [contacts, setContacts] = useState<Contact[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [contactSearch, setContactSearch] = useState("")
    const [showContactDropdown, setShowContactDropdown] = useState(false)
    const [productSearch, setProductSearch] = useState("")
    const [showProductDropdown, setShowProductDropdown] = useState<string | null>(null)

    const selectedContact = contacts.find((c) => c.id === contactId)

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        const supabase = createBrowserClient()
        const [contactsRes, productsRes, cotRes, lineasRes] = await Promise.all([
            supabase.from("contacts").select("id, nombre_pareja, email, fecha_evento, num_invitados").order("nombre_pareja"),
            supabase.from("products").select("id, titulo, precio, tipo_precio, category_id, product_categories(nombre)").eq("activo", true).order("titulo"),
            supabase.from("cotizaciones").select("*").eq("id", id).single(),
            supabase.from("cotizacion_lineas").select("*").eq("cotizacion_id", id).order("orden"),
        ])

        if (contactsRes.data) setContacts(contactsRes.data)
        if (productsRes.data) {
            setProducts(productsRes.data.map((p: any) => ({ ...p, category_name: p.product_categories?.nombre || "Sin categoría" })))
        }
        if (cotRes.data) {
            setTitulo(cotRes.data.titulo)
            setSlug(cotRes.data.slug)
            setEstado(cotRes.data.estado)
            setContactId(cotRes.data.contact_id || "")
            setNotasAlcance(cotRes.data.notas_alcance || "")
        }
        if (lineasRes.data) {
            setLineas(lineasRes.data.map((l: any) => ({
                id: l.id,
                tempId: l.id,
                product_id: l.product_id,
                nombre: l.nombre,
                descripcion: l.descripcion || "",
                categoria: l.categoria || "",
                precio_unitario: l.precio_unitario,
                cantidad: l.cantidad,
                es_por_invitado: l.es_por_invitado,
                nota: l.nota || "",
                es_acordado: l.es_acordado,
            })))
        }
        setLoading(false)
    }

    const filteredContacts = contacts.filter(
        (c) => !contactSearch || c.nombre_pareja.toLowerCase().includes(contactSearch.toLowerCase()) || c.email?.toLowerCase().includes(contactSearch.toLowerCase())
    )

    const addLinea = (product?: Product) => {
        const newLinea: LineaForm = {
            tempId: crypto.randomUUID(),
            product_id: product?.id || null,
            nombre: product?.titulo || "",
            descripcion: "",
            categoria: product?.category_name || "",
            precio_unitario: product?.precio || 0,
            cantidad: 1,
            es_por_invitado: product?.tipo_precio === "por_invitado" || false,
            nota: "",
            es_acordado: false,
        }
        setLineas([...lineas, newLinea])
        setShowProductDropdown(null)
        setProductSearch("")
    }

    const updateLinea = (tempId: string, field: keyof LineaForm, value: any) => {
        setLineas(lineas.map((l) => (l.tempId === tempId ? { ...l, [field]: value } : l)))
    }

    const removeLinea = (tempId: string) => {
        setLineas(lineas.filter((l) => l.tempId !== tempId))
    }

    const totalEstimado = useMemo(() => {
        const numInvitados = selectedContact?.num_invitados || 1
        return lineas.reduce((sum, l) => {
            const qty = l.es_por_invitado ? numInvitados : l.cantidad
            return sum + l.precio_unitario * qty
        }, 0)
    }, [lineas, selectedContact])

    const formatPrice = (n: number) =>
        new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n)

    const handleSave = async (sendEmail = false) => {
        if (!titulo.trim()) { alert("El título es obligatorio"); return }
        if (lineas.length === 0) { alert("Agrega al menos una línea"); return }

        if (sendEmail) setSending(true)
        else setSaving(true)

        try {
            const supabase = createBrowserClient()
            const newEstado = sendEmail ? "enviada" : estado
            const { error: cotError } = await supabase
                .from("cotizaciones")
                .update({
                    contact_id: contactId || null,
                    titulo: titulo.trim(),
                    estado: newEstado,
                    notas_alcance: notasAlcance.trim() || null,
                    total_estimado: totalEstimado,
                    fecha_envio: sendEmail ? new Date().toISOString() : undefined,
                    email_enviado: sendEmail ? true : undefined,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
            if (cotError) throw cotError

            // Delete old lines and insert new ones
            await supabase.from("cotizacion_lineas").delete().eq("cotizacion_id", id)
            const lineasData = lineas.map((l, i) => ({
                cotizacion_id: id,
                product_id: l.product_id || null,
                nombre: l.nombre,
                descripcion: l.descripcion || null,
                categoria: l.categoria || null,
                precio_unitario: l.precio_unitario,
                cantidad: l.cantidad,
                es_por_invitado: l.es_por_invitado,
                nota: l.nota || null,
                es_acordado: l.es_acordado,
                orden: i,
            }))
            const { error: lineasError } = await supabase.from("cotizacion_lineas").insert(lineasData)
            if (lineasError) throw lineasError

            if (sendEmail && selectedContact?.email) {
                await fetch("/api/send-cotizacion-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: selectedContact.email,
                        contactName: selectedContact.nombre_pareja,
                        titulo,
                        slug,
                        total: totalEstimado,
                        fechaEvento: selectedContact.fecha_evento,
                        numInvitados: selectedContact.num_invitados,
                    }),
                })
            }

            setEstado(newEstado)
            router.push("/admin/cotizaciones")
        } catch (err) {
            console.error("Error saving cotización:", err)
            alert("Error al guardar la cotización")
        } finally {
            setSaving(false)
            setSending(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("¿Eliminar esta cotización? Esta acción no se puede deshacer.")) return
        try {
            const supabase = createBrowserClient()
            await supabase.from("cotizaciones").delete().eq("id", id)
            router.push("/admin/cotizaciones")
        } catch (err) {
            console.error("Error deleting:", err)
            alert("Error al eliminar la cotización")
        }
    }

    const copyLink = () => {
        const url = `${window.location.origin}/cotizacion-adicionales/${slug}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <AdminLayout currentPage="cotizaciones">
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout currentPage="cotizaciones">
            <div className="max-w-5xl mx-auto">
                <Link
                    href="/admin/cotizaciones"
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a cotizaciones
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-light tracking-wide">Editar Cotización</h1>
                    <div className="flex items-center gap-3">
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="px-3 py-1.5 border border-neutral-200 text-sm bg-white"
                        >
                            <option value="borrador">Borrador</option>
                            <option value="enviada">Enviada</option>
                            <option value="aceptada">Aceptada</option>
                            <option value="rechazada">Rechazada</option>
                        </select>
                        <button
                            onClick={copyLink}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 text-sm hover:bg-neutral-50 transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copiado" : "Copiar link"}
                        </button>
                        <Link
                            href={`/cotizacion-adicionales/${slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 text-sm hover:bg-neutral-50 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver
                        </Link>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Encabezado */}
                    <div className="border border-neutral-200 p-6 space-y-4">
                        <h2 className="text-xs tracking-wider uppercase text-neutral-500 font-medium">Datos generales</h2>
                        <div>
                            <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Título *</label>
                            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none" />
                        </div>

                        {/* Contact selector */}
                        <div className="relative">
                            <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Contacto</label>
                            {selectedContact ? (
                                <div className="flex items-center justify-between px-4 py-3 border border-neutral-200 bg-neutral-50">
                                    <div>
                                        <span className="font-medium">{selectedContact.nombre_pareja}</span>
                                        {selectedContact.email && <span className="text-neutral-500 text-sm ml-2">· {selectedContact.email}</span>}
                                        {selectedContact.num_invitados && <span className="text-neutral-400 text-sm ml-2">· {selectedContact.num_invitados} inv.</span>}
                                    </div>
                                    <button onClick={() => { setContactId(""); setContactSearch("") }} className="text-xs text-neutral-400 hover:text-neutral-600">Cambiar</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        value={contactSearch}
                                        onChange={(e) => { setContactSearch(e.target.value); setShowContactDropdown(true) }}
                                        onFocus={() => setShowContactDropdown(true)}
                                        placeholder="Buscar contacto..."
                                        className="w-full pl-10 pr-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none"
                                    />
                                    {showContactDropdown && filteredContacts.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 shadow-lg max-h-48 overflow-y-auto z-10">
                                            {filteredContacts.slice(0, 10).map((c) => (
                                                <button key={c.id} onClick={() => { setContactId(c.id); setShowContactDropdown(false); setContactSearch("") }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm border-b border-neutral-100 last:border-0">
                                                    <span className="font-medium">{c.nombre_pareja}</span>
                                                    {c.email && <span className="text-neutral-400 ml-2">· {c.email}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Notas generales de alcance</label>
                            <textarea value={notasAlcance} onChange={(e) => setNotasAlcance(e.target.value)} rows={3} placeholder="Rubros acordados..." className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none resize-none" />
                        </div>
                    </div>

                    {/* Líneas */}
                    <div className="border border-neutral-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                            <h2 className="text-xs tracking-wider uppercase text-neutral-500 font-medium">Líneas ({lineas.length})</h2>
                        </div>

                        {lineas.length > 0 && (
                            <div className="hidden md:grid grid-cols-[2fr_1fr_100px_80px_100px_1fr_40px] gap-2 px-6 py-2 text-xs tracking-wider uppercase text-neutral-400 border-b border-neutral-100">
                                <span>Producto</span><span>Categoría</span><span className="text-right">Precio</span><span className="text-center">Cant.</span><span className="text-right">Subtotal</span><span>Nota</span><span></span>
                            </div>
                        )}

                        <div className="divide-y divide-neutral-100">
                            {lineas.map((linea) => {
                                const numInv = selectedContact?.num_invitados || 1
                                const qty = linea.es_por_invitado ? numInv : linea.cantidad
                                const subtotal = linea.precio_unitario * qty
                                return (
                                    <div key={linea.tempId} className="px-6 py-3">
                                        <div className="hidden md:grid grid-cols-[2fr_1fr_100px_80px_100px_1fr_40px] gap-2 items-center">
                                            <input type="text" value={linea.nombre} onChange={(e) => updateLinea(linea.tempId, "nombre", e.target.value)} className="px-2 py-1.5 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none" />
                                            <input type="text" value={linea.categoria} onChange={(e) => updateLinea(linea.tempId, "categoria", e.target.value)} className="px-2 py-1.5 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none" />
                                            <input type="number" value={linea.precio_unitario} onChange={(e) => updateLinea(linea.tempId, "precio_unitario", parseFloat(e.target.value) || 0)} className="px-2 py-1.5 border border-neutral-200 text-sm text-right focus:border-neutral-400 focus:outline-none" />
                                            {linea.es_por_invitado ? (
                                                <div className="px-2 py-1.5 border border-neutral-100 bg-neutral-50 text-sm text-center text-neutral-400">{numInv}</div>
                                            ) : (
                                                <input type="number" value={linea.cantidad} onChange={(e) => updateLinea(linea.tempId, "cantidad", parseInt(e.target.value) || 1)} min={1} className="px-2 py-1.5 border border-neutral-200 text-sm text-center focus:border-neutral-400 focus:outline-none" />
                                            )}
                                            <div className="text-sm text-right font-medium px-2">{formatPrice(subtotal)}{linea.es_por_invitado && <span className="block text-[10px] text-neutral-400">×{numInv} inv.</span>}</div>
                                            <input type="text" value={linea.nota} onChange={(e) => updateLinea(linea.tempId, "nota", e.target.value)} placeholder="Nota..." className="px-2 py-1.5 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none" />
                                            <button onClick={() => removeLinea(linea.tempId)} className="p-1 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <div className="md:hidden space-y-2">
                                            <div className="flex items-center justify-between">
                                                <input type="text" value={linea.nombre} onChange={(e) => updateLinea(linea.tempId, "nombre", e.target.value)} className="flex-1 px-2 py-1.5 border border-neutral-200 text-sm mr-2" />
                                                <button onClick={() => removeLinea(linea.tempId)} className="text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <input type="number" value={linea.precio_unitario} onChange={(e) => updateLinea(linea.tempId, "precio_unitario", parseFloat(e.target.value) || 0)} className="px-2 py-1.5 border border-neutral-200 text-sm" />
                                                {linea.es_por_invitado ? (
                                                    <div className="px-2 py-1.5 border border-neutral-100 bg-neutral-50 text-sm text-center text-neutral-400">{numInv} inv.</div>
                                                ) : (
                                                    <input type="number" value={linea.cantidad} onChange={(e) => updateLinea(linea.tempId, "cantidad", parseInt(e.target.value) || 1)} min={1} className="px-2 py-1.5 border border-neutral-200 text-sm text-center" />
                                                )}
                                                <div className="text-sm text-right font-medium self-center">{formatPrice(subtotal)}</div>
                                            </div>
                                        </div>
                                        {linea.es_por_invitado && (
                                            <div className="mt-1">
                                                <span className="inline-block px-2 py-0.5 text-[10px] tracking-wider uppercase bg-amber-50 text-amber-600 border border-amber-200 rounded">
                                                    Precio por invitado · Se multiplica ×{numInv}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="px-6 py-4 border-t border-neutral-200 relative">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input type="text" value={productSearch} onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown("main") }} onFocus={() => setShowProductDropdown("main")} placeholder="Buscar producto..." className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none" />
                                    {showProductDropdown === "main" && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 shadow-lg max-h-60 overflow-y-auto z-10">
                                            {products.filter((p) => !productSearch || p.titulo.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 15).map((p) => (
                                                <button key={p.id} onClick={() => addLinea(p)} className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 text-sm border-b border-neutral-100 last:border-0">
                                                    <span className="font-medium">{p.titulo}</span>
                                                    <span className="text-neutral-400 ml-2">· {formatPrice(p.precio)}{p.tipo_precio === "por_invitado" ? "/inv" : ""}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => addLinea()} className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors whitespace-nowrap">
                                    <Plus className="w-4 h-4" />Línea manual
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border border-neutral-900 bg-neutral-900 text-white px-6 py-5 flex items-center justify-between">
                        <span className="text-xs tracking-wider uppercase font-light">Total estimado</span>
                        <span className="text-3xl font-light tracking-wide">{formatPrice(totalEstimado)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-12">
                        <button onClick={handleDelete} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 transition-colors">
                            <Trash2 className="w-4 h-4" />Eliminar
                        </button>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={() => handleSave(false)} disabled={saving || sending} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50">
                                <Save className="w-4 h-4" />{saving ? "Guardando..." : "Guardar"}
                            </button>
                            {selectedContact?.email && (
                                <button onClick={() => handleSave(true)} disabled={saving || sending} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm tracking-wide hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    <Send className="w-4 h-4" />{sending ? "Enviando..." : "Guardar y Enviar"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {(showContactDropdown || showProductDropdown) && (
                <div className="fixed inset-0 z-0" onClick={() => { setShowContactDropdown(false); setShowProductDropdown(null) }} />
            )}
        </AdminLayout>
    )
}
