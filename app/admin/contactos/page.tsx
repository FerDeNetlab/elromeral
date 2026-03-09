"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import Link from "next/link"
import { Plus, Search, Mail, Phone, Calendar, Users, Filter, RefreshCw } from "lucide-react"

interface Contact {
    id: string
    nombre_pareja: string
    email: string | null
    telefono: string | null
    fecha_evento: string | null
    num_invitados: number | null
    tipo_evento: string | null
    notas: string | null
    origen: "manual" | "configurador" | "planners"
    created_at: string
}

const origenBadge: Record<string, { label: string; color: string }> = {
    manual: { label: "Manual", color: "bg-blue-100 text-blue-700" },
    configurador: { label: "Configurador", color: "bg-green-100 text-green-700" },
    planners: { label: "Planners", color: "bg-purple-100 text-purple-700" },
}

export default function ContactosPage() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterOrigen, setFilterOrigen] = useState<string>("todos")
    const [syncing, setSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState<{ created: number; skipped: number } | null>(null)

    useEffect(() => {
        loadContacts()
    }, [])

    const loadContacts = async () => {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
            .from("contacts")
            .select("*")
            .order("created_at", { ascending: false })

        if (!error && data) {
            setContacts(data)
        }
        setLoading(false)
    }

    const syncFromClientes = async () => {
        setSyncing(true)
        setSyncResult(null)
        try {
            const supabase = createBrowserClient()

            // 1. Load all quotes (clientes)
            const { data: quotes, error: quotesError } = await supabase
                .from("quotes")
                .select("nombres, email, telefono, fecha_evento, num_invitados")

            if (quotesError || !quotes) throw quotesError

            // 2. Load existing contacts emails for dedup
            const { data: existingContacts } = await supabase
                .from("contacts")
                .select("email, nombre_pareja")

            const existingEmails = new Set(
                (existingContacts || [])
                    .filter((c) => c.email)
                    .map((c) => c.email!.toLowerCase().trim())
            )
            const existingNames = new Set(
                (existingContacts || [])
                    .map((c) => c.nombre_pareja.toLowerCase().trim())
            )

            // 3. Deduplicate quotes themselves (keep latest by email, then by name)
            const seenEmails = new Set<string>()
            const seenNames = new Set<string>()
            const uniqueQuotes: typeof quotes = []

            for (const q of quotes) {
                if (!q.nombres?.trim()) continue

                const email = q.email?.toLowerCase().trim()
                const name = q.nombres.toLowerCase().trim()

                // Skip if email already exists in contacts or already processed
                if (email && (existingEmails.has(email) || seenEmails.has(email))) continue
                // Skip if name (no email) already exists
                if (!email && (existingNames.has(name) || seenNames.has(name))) continue

                if (email) seenEmails.add(email)
                seenNames.add(name)
                uniqueQuotes.push(q)
            }

            // 4. Insert new contacts
            let created = 0
            if (uniqueQuotes.length > 0) {
                const toInsert = uniqueQuotes.map((q) => ({
                    nombre_pareja: q.nombres.trim(),
                    email: q.email?.trim() || null,
                    telefono: q.telefono?.trim() || null,
                    fecha_evento: q.fecha_evento || null,
                    num_invitados: q.num_invitados || null,
                    origen: "configurador" as const,
                }))

                const { error: insertError, data: inserted } = await supabase
                    .from("contacts")
                    .insert(toInsert)
                    .select("id")

                if (insertError) throw insertError
                created = inserted?.length || 0
            }

            const skipped = quotes.length - created
            setSyncResult({ created, skipped })
            await loadContacts()
        } catch (err) {
            console.error("Error syncing:", err)
            alert("Error al sincronizar clientes")
        } finally {
            setSyncing(false)
        }
    }

    const filtered = contacts.filter((c) => {
        const matchSearch =
            !search ||
            c.nombre_pareja.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.telefono?.includes(search)
        const matchOrigen = filterOrigen === "todos" || c.origen === filterOrigen
        return matchSearch && matchOrigen
    })

    return (
        <AdminLayout currentPage="contactos">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-light tracking-wide">Contactos</h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            {contacts.length} contacto{contacts.length !== 1 ? "s" : ""} registrado{contacts.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={syncFromClientes}
                            disabled={syncing}
                            className="inline-flex items-center gap-2 px-4 py-3 border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                            {syncing ? "Sincronizando..." : "Sincronizar Clientes"}
                        </button>
                        <Link
                            href="/admin/contactos/nuevo"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-900 text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Contacto
                        </Link>
                    </div>
                </div>

                {/* Sync result */}
                {syncResult && (
                    <div className="mb-6 px-4 py-3 border border-green-200 bg-green-50 text-sm text-green-800 flex items-center justify-between">
                        <span>
                            ✅ Sincronización completada: <strong>{syncResult.created}</strong> nuevo{syncResult.created !== 1 ? "s" : ""}, <strong>{syncResult.skipped}</strong> omitido{syncResult.skipped !== 1 ? "s" : ""} (duplicados)
                        </span>
                        <button onClick={() => setSyncResult(null)} className="text-green-600 hover:text-green-800">✕</button>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, email o teléfono..."
                            className="w-full pl-10 pr-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <select
                            value={filterOrigen}
                            onChange={(e) => setFilterOrigen(e.target.value)}
                            className="pl-10 pr-8 py-3 border border-neutral-200 text-sm appearance-none bg-white cursor-pointer focus:border-neutral-400 focus:outline-none"
                        >
                            <option value="todos">Todos los orígenes</option>
                            <option value="manual">Manual</option>
                            <option value="configurador">Configurador</option>
                            <option value="planners">Planners</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 border border-neutral-200">
                        <Users className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                        <p className="text-neutral-500 text-sm">
                            {search || filterOrigen !== "todos" ? "No se encontraron contactos con esos filtros" : "Aún no hay contactos"}
                        </p>
                        {contacts.length === 0 && (
                            <button
                                onClick={syncFromClientes}
                                disabled={syncing}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                                Importar desde Clientes
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="border border-neutral-200 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50">
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase">Pareja</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase hidden sm:table-cell">Email</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase hidden md:table-cell">Teléfono</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase hidden lg:table-cell">Fecha Evento</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase hidden lg:table-cell">Invitados</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase">Origen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((contact) => (
                                    <tr key={contact.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/admin/contactos/${contact.id}/editar`}
                                                className="font-medium text-neutral-900 hover:underline"
                                            >
                                                {contact.nombre_pareja}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600 hidden sm:table-cell">
                                            {contact.email ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                                    {contact.email}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600 hidden md:table-cell">
                                            {contact.telefono ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                                    {contact.telefono}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600 hidden lg:table-cell">
                                            {contact.fecha_evento ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                                    {new Date(contact.fecha_evento + "T00:00:00").toLocaleDateString("es-MX", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600 hidden lg:table-cell">
                                            {contact.num_invitados || <span className="text-neutral-300">—</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-block px-2.5 py-1 text-xs rounded-full font-medium ${origenBadge[contact.origen]?.color || "bg-neutral-100 text-neutral-600"}`}>
                                                {origenBadge[contact.origen]?.label || contact.origen}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
