"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NuevoContactoPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        nombre_pareja: "",
        email: "",
        telefono: "",
        fecha_evento: "",
        num_invitados: "",
        tipo_evento: "",
        notas: "",
    })

    const handleSave = async () => {
        if (!form.nombre_pareja.trim()) {
            alert("El nombre de la pareja es obligatorio")
            return
        }
        setSaving(true)
        try {
            const supabase = createBrowserClient()
            const { error } = await supabase.from("contacts").insert({
                nombre_pareja: form.nombre_pareja.trim(),
                email: form.email.trim() || null,
                telefono: form.telefono.trim() || null,
                fecha_evento: form.fecha_evento || null,
                num_invitados: form.num_invitados ? parseInt(form.num_invitados) : null,
                tipo_evento: form.tipo_evento || null,
                notas: form.notas.trim() || null,
                origen: "manual",
            })
            if (error) throw error
            router.push("/admin/contactos")
        } catch (err) {
            console.error("Error creating contact:", err)
            alert("Error al crear el contacto")
        } finally {
            setSaving(false)
        }
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

                <h1 className="text-3xl font-light tracking-wide mb-8">Nuevo Contacto</h1>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">
                            Nombre de la pareja *
                        </label>
                        <input
                            type="text"
                            value={form.nombre_pareja}
                            onChange={(e) => setForm({ ...form, nombre_pareja: e.target.value })}
                            placeholder='Ej: "Martha & Kevin"'
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
                                placeholder="correo@ejemplo.com"
                                className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs tracking-wider uppercase text-neutral-500 mb-2">Teléfono</label>
                            <input
                                type="tel"
                                value={form.telefono}
                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                placeholder="+52 33 1234 5678"
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
                                placeholder="250"
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
                            placeholder="Notas internas sobre este contacto..."
                            className="w-full px-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Guardando..." : "Guardar Contacto"}
                    </button>
                </div>
            </div>
        </AdminLayout>
    )
}
