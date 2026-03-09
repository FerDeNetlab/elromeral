"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import Link from "next/link"
import { Plus, Search, Filter, FileText, ExternalLink, Mail } from "lucide-react"

interface Cotizacion {
    id: string
    titulo: string
    slug: string
    estado: "borrador" | "enviada" | "aceptada" | "rechazada"
    total_estimado: number
    email_enviado: boolean
    created_at: string
    contacts: { nombre_pareja: string } | null
}

const estadoBadge: Record<string, { label: string; color: string }> = {
    borrador: { label: "Borrador", color: "bg-neutral-100 text-neutral-600" },
    enviada: { label: "Enviada", color: "bg-blue-100 text-blue-700" },
    aceptada: { label: "Aceptada", color: "bg-green-100 text-green-700" },
    rechazada: { label: "Rechazada", color: "bg-red-100 text-red-700" },
}

export default function CotizacionesPage() {
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterEstado, setFilterEstado] = useState<string>("todos")

    useEffect(() => {
        loadCotizaciones()
    }, [])

    const loadCotizaciones = async () => {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
            .from("cotizaciones")
            .select("*, contacts(nombre_pareja)")
            .order("created_at", { ascending: false })

        if (!error && data) {
            setCotizaciones(data as Cotizacion[])
        }
        setLoading(false)
    }

    const filtered = cotizaciones.filter((c) => {
        const matchSearch =
            !search ||
            c.titulo.toLowerCase().includes(search.toLowerCase()) ||
            c.contacts?.nombre_pareja.toLowerCase().includes(search.toLowerCase()) ||
            c.slug.toLowerCase().includes(search.toLowerCase())
        const matchEstado = filterEstado === "todos" || c.estado === filterEstado
        return matchSearch && matchEstado
    })

    const formatPrice = (n: number) =>
        new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n)

    return (
        <AdminLayout currentPage="cotizaciones">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-light tracking-wide">Cotizaciones</h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            {cotizaciones.length} cotización{cotizaciones.length !== 1 ? "es" : ""}
                        </p>
                    </div>
                    <Link
                        href="/admin/cotizaciones/nueva"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-900 text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Cotización
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por título, contacto o slug..."
                            className="w-full pl-10 pr-4 py-3 border border-neutral-200 text-sm focus:border-neutral-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="pl-10 pr-8 py-3 border border-neutral-200 text-sm appearance-none bg-white cursor-pointer focus:border-neutral-400 focus:outline-none"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="borrador">Borrador</option>
                            <option value="enviada">Enviada</option>
                            <option value="aceptada">Aceptada</option>
                            <option value="rechazada">Rechazada</option>
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
                        <FileText className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                        <p className="text-neutral-500 text-sm">
                            {search || filterEstado !== "todos" ? "No se encontraron cotizaciones" : "Aún no hay cotizaciones"}
                        </p>
                    </div>
                ) : (
                    <div className="border border-neutral-200 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50">
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase">Título</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase hidden sm:table-cell">Contacto</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase">Estado</th>
                                    <th className="text-right px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase hidden md:table-cell">Total</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase hidden lg:table-cell">Fecha</th>
                                    <th className="text-right px-4 py-3 font-medium text-neutral-600 text-xs tracking-wider uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((cot) => (
                                    <tr key={cot.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/admin/cotizaciones/${cot.id}/editar`}
                                                className="font-medium text-neutral-900 hover:underline"
                                            >
                                                {cot.titulo}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600 hidden sm:table-cell">
                                            {cot.contacts?.nombre_pareja || <span className="text-neutral-300">Sin contacto</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-block px-2.5 py-1 text-xs rounded-full font-medium ${estadoBadge[cot.estado]?.color}`}>
                                                {estadoBadge[cot.estado]?.label}
                                            </span>
                                            {cot.email_enviado && (
                                                <Mail className="w-3.5 h-3.5 text-blue-400 inline ml-2" />
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right font-medium hidden md:table-cell">
                                            {formatPrice(cot.total_estimado || 0)}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-500 hidden lg:table-cell">
                                            {new Date(cot.created_at).toLocaleDateString("es-MX", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link
                                                href={`/cotizacion-adicionales/${cot.slug}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                                                title="Ver enlace público"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Ver</span>
                                            </Link>
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
