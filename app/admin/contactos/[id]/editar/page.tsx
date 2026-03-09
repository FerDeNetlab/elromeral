"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EditarContactoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({
        nombre_pareja: "",
        email: "",
        telefono: "",
        fecha_evento: "",
        num_invitados: "",
        tipo_evento: "",
        notas: "",
        origen: "manual",
    })

    useEffect(() => {
        const load = async () => {
            const supabase = createBrowserClient()
            const { data, error } = await supabase
                .from("contacts")
                .select("*")
                .eq("id", id)
                .single()

            if (!error && data) {
                setForm({
                    nombre_pareja: data.nombre_pareja || "",
                    email: data.email || "",
                    telefono: data.telefono || "",
                    fecha_evento: data.fecha_evento || "",
                    num_invitados: data.num_invitados?.toString() || "",
                    tipo_evento: data.tipo_evento || "",
                    notas: data.notas || "",
                    origen: data.origen || "manual",
                })
            }
            setLoading(false)
        }
        load()
    }, [id])

    const handleSave = async () => {
        if (!form.nombre_pareja.trim()) {
            alert("El nombre de la pareja es obligatorio")
            return
        }
        setSaving(true)
        try {
            const supabase = createBrowserClient()
            const { error } = await supabase
                .from("contacts")
                .update({
                    nombre_pareja: form.nombre_pareja.trim(),
                    email: form.email.trim() || null,
                    telefono: form.telefono.trim() || null,
                    fecha_evento: form.fecha_evento || null,
                    num_invitados: form.num_invitados ? parseInt(form.num_invitados) : null,
                    tipo_evento: form.tipo_evento || null,
                    notas: form.notas.trim() || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
            if (error) throw error
            router.push("/admin/contactos")
        } catch (err) {
            console.error("Error updating contact:", err)
            alert("Error al actualizar el contacto")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("¿Eliminar este contacto? Esta acción no se puede deshacer.")) return
        try {
            const supabase = createBrowserClient()
            const { error } = await supabase.from("contacts").delete().eq("id", id)
            if (error) throw error
            router.push("/admin/contactos")
        } catch (err) {
            console.error("Error deleting contact:", err)
            alert("Error al eliminar el contacto")
        }
    }

    if (loading) {
        return (
            <AdminLayout currentPage="contactos">
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout currentPage="contactos">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/admin/contactos"
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a contactos
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-light tracking-wide">Editar Contacto</h1>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${form.origen === "configurador" ? "bg-green-100 text-green-700" :
                            form.origen === "planners" ? "bg-purple-100 text-purple-700" :
                                "bg-blue-100 text-blue-700"
                        }`}>
                        {form.origen === "configurador" ? "Configurador" : form.origen === "planners" ? "Planners" : "Manual"}
                    </span>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">
                            Nombre de la pareja *
                        </label>
                        <input
                            type="text"
                            value={form.nombre_pareja}
                            onChange={(e) => setForm({ ...form, nombre_pareja: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Teléfono</label>
                            <input
                                type="tel"
                                value={form.telefono}
                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Fecha del evento</label>
                            <input
                                type="date"
                                value={form.fecha_evento}
                                onChange={(e) => setForm({ ...form, fecha_evento: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Invitados</label>
                            <input
                                type="number"
                                value={form.num_invitados}
                                onChange={(e) => setForm({ ...form, num_invitados: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Tipo de evento</label>
                            <select
                                value={form.tipo_evento}
                                onChange={(e) => setForm({ ...form, tipo_evento: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none bg-white"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="comida">Comida</option>
                                <option value="cena">Cena</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Notas</label>
                        <textarea
                            value={form.notas}
                            onChange={(e) => setForm({ ...form, notas: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
