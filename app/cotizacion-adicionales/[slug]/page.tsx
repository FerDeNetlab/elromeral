"use client"

import { use, useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Heart, FileDown, Minus, Plus } from "lucide-react"
import Link from "next/link"

interface Linea {
    id: string
    nombre: string
    descripcion: string | null
    categoria: string | null
    precio_unitario: number
    cantidad: number
    es_por_invitado: boolean
    nota: string | null
    es_acordado: boolean
    orden: number
}

interface Cotizacion {
    id: string
    titulo: string
    slug: string
    notas_alcance: string | null
    total_estimado: number
    contacts: {
        nombre_pareja: string
        email: string | null
        telefono: string | null
        fecha_evento: string | null
        num_invitados: number | null
    } | null
}

interface CategoriaAgrupada {
    nombre: string
    lineas: Linea[]
}

const categoriaIconos: Record<string, string> = {
    "Mesa de Novios": "💍",
    "Diseño de Mesas": "🪑",
    "Iluminación": "💡",
    "Recepción": "🍸",
    "Ceremonia": "⛪",
    "Momentos Especiales": "🎆",
    "Montaje": "🌿",
    "Spot de Fotos": "📸",
    "Coordinación": "👰",
    "Coctelería": "🍸",
    "Decoración": "🌿",
    "Música": "🎵",
    "Catering": "🍽️",
}

function getIcono(categoria: string): string {
    for (const [key, icon] of Object.entries(categoriaIconos)) {
        if (categoria.toLowerCase().includes(key.toLowerCase())) return icon
    }
    return "✨"
}

export default function CotizacionPublicaPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
    const [lineas, setLineas] = useState<Linea[]>([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const [itemsSeleccionados, setItemsSeleccionados] = useState<Record<string, boolean>>({})
    const [cantidades, setCantidades] = useState<Record<string, number>>({})
    const [descargandoPDF, setDescargandoPDF] = useState(false)

    useEffect(() => {
        loadCotizacion()
    }, [slug])

    const loadCotizacion = async () => {
        const supabase = createBrowserClient()
        const { data: cotData, error: cotError } = await supabase
            .from("cotizaciones")
            .select("*, contacts(nombre_pareja, email, telefono, fecha_evento, num_invitados)")
            .eq("slug", slug)
            .single()

        if (cotError || !cotData) {
            setNotFound(true)
            setLoading(false)
            return
        }

        const { data: lineasData } = await supabase
            .from("cotizacion_lineas")
            .select("*")
            .eq("cotizacion_id", cotData.id)
            .order("orden")

        setCotizacion(cotData as Cotizacion)
        const items = (lineasData || []) as Linea[]
        setLineas(items)

        // Start all selected
        const inicial: Record<string, boolean> = {}
        items.forEach((l) => { inicial[l.id] = true })
        setItemsSeleccionados(inicial)

        setLoading(false)
    }

    const numInvitados = cotizacion?.contacts?.num_invitados || 1

    const categoriasAgrupadas = useMemo<CategoriaAgrupada[]>(() => {
        const map = new Map<string, Linea[]>()
        lineas.forEach((l) => {
            const cat = l.categoria || "Otros"
            if (!map.has(cat)) map.set(cat, [])
            map.get(cat)!.push(l)
        })
        return Array.from(map.entries()).map(([nombre, lineas]) => ({ nombre, lineas }))
    }, [lineas])

    const totalSeleccionado = useMemo(() => {
        return lineas.reduce((sum, l) => {
            if (!itemsSeleccionados[l.id]) return sum
            const cant = cantidades[l.id] || l.cantidad
            const qty = l.es_por_invitado ? cant * numInvitados : cant
            return sum + l.precio_unitario * qty
        }, 0)
    }, [lineas, itemsSeleccionados, cantidades, numInvitados])

    const toggleItem = (id: string) => {
        setItemsSeleccionados((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const actualizarCantidad = (id: string, cantidad: number) => {
        if (cantidad >= 1 && cantidad <= 500) {
            setCantidades((prev) => ({ ...prev, [id]: cantidad }))
        }
    }

    const generarPDF = async () => {
        setDescargandoPDF(true)
        try {
            const { jsPDF } = await import("jspdf")
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()

            doc.setFontSize(24)
            doc.setTextColor(60, 60, 60)
            doc.text("EL ROMERAL", pageWidth / 2, 25, { align: "center" })
            doc.setFontSize(10)
            doc.setTextColor(120, 120, 120)
            doc.text((cotizacion?.titulo || "COTIZACIÓN").toUpperCase(), pageWidth / 2, 33, { align: "center" })

            doc.setFontSize(14)
            doc.setTextColor(80, 80, 80)
            doc.text(cotizacion?.contacts?.nombre_pareja || "", pageWidth / 2, 45, { align: "center" })

            if (cotizacion?.contacts?.fecha_evento) {
                doc.setFontSize(10)
                const dateStr = new Date(cotizacion.contacts.fecha_evento + "T00:00:00").toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })
                doc.text(dateStr, pageWidth / 2, 52, { align: "center" })
            }

            let yPos = 70

            categoriasAgrupadas.forEach((cat) => {
                const items = cat.lineas.filter((l) => itemsSeleccionados[l.id])
                if (items.length === 0) return

                if (yPos > 260) { doc.addPage(); yPos = 20 }

                doc.setFontSize(10)
                doc.setTextColor(74, 80, 67)
                doc.text(cat.nombre.toUpperCase(), 20, yPos)
                yPos += 3
                doc.setDrawColor(74, 80, 67)
                doc.setLineWidth(0.3)
                doc.line(20, yPos, pageWidth - 20, yPos)
                yPos += 7

                items.forEach((item) => {
                    if (yPos > 270) { doc.addPage(); yPos = 20 }
                    const cant = cantidades[item.id] || item.cantidad
                    const qty = item.es_por_invitado ? cant * numInvitados : cant
                    const subtotal = item.precio_unitario * qty
                    doc.setFontSize(9)
                    doc.setTextColor(40, 40, 40)
                    const nombre = item.nombre.length > 60 ? item.nombre.substring(0, 60) + "..." : item.nombre
                    doc.text(nombre, 25, yPos)
                    doc.text(`$${subtotal.toLocaleString("es-MX")}`, pageWidth - 20, yPos, { align: "right" })
                    yPos += 6
                })
                yPos += 6
            })

            yPos += 5
            if (yPos > 260) { doc.addPage(); yPos = 20 }
            doc.setFillColor(74, 80, 67)
            doc.rect(20, yPos, pageWidth - 40, 15, "F")
            yPos += 10
            doc.setFontSize(12)
            doc.setTextColor(255, 255, 255)
            doc.text("TOTAL SELECCIONADO", 25, yPos)
            doc.text(`$${totalSeleccionado.toLocaleString("es-MX")} MXN`, pageWidth - 25, yPos, { align: "right" })

            yPos += 25
            doc.setFontSize(8)
            doc.setTextColor(120, 120, 120)
            doc.text("Precios en moneda nacional - No incluye I.V.A.", pageWidth / 2, yPos, { align: "center" })
            doc.text(`Generado el ${new Date().toLocaleDateString("es-MX")}`, pageWidth / 2, yPos + 5, { align: "center" })

            const fileName = `cotizacion-${cotizacion?.contacts?.nombre_pareja?.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "y") || slug}.pdf`
            doc.save(fileName)
        } catch (error) {
            console.error("Error al generar PDF:", error)
        } finally {
            setDescargandoPDF(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <h1 className="text-3xl font-light tracking-wide">Cotización no encontrada</h1>
                <p className="text-muted-foreground">El enlace que intentas acceder no es válido.</p>
            </div>
        )
    }

    const contact = cotizacion?.contacts
    const fechaEvento = contact?.fecha_evento
        ? new Date(contact.fecha_evento + "T00:00:00").toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : null

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <section className="relative py-16 md:py-24 px-6 text-center border-b border-foreground/10">
                <div className="max-w-4xl mx-auto space-y-6">
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-muted-foreground font-light">
                        {cotizacion?.titulo || "Cotización"}
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.15em] uppercase font-extralight leading-tight">
                        {contact?.nombre_pareja || ""}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-sm md:text-base text-foreground/80 font-light">
                        {fechaEvento && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <p>{fechaEvento}</p>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            <p>El Romeral</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Notas de alcance */}
            {cotizacion?.notas_alcance && (
                <section className="py-12 md:py-16 px-6 md:px-12 max-w-5xl mx-auto">
                    <div className="border border-foreground/10 p-8 md:p-12 bg-background">
                        <h2 className="text-xl md:text-2xl tracking-[0.15em] uppercase font-light mb-6">
                            Notas Generales de Alcance
                        </h2>
                        <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                            {cotizacion.notas_alcance}
                        </div>
                    </div>
                </section>
            )}

            {/* Categorías y productos */}
            <section className="py-16 md:py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="space-y-16">
                    {categoriasAgrupadas.map((cat) => (
                        <div key={cat.nombre} className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
                                <span className="text-2xl">{getIcono(cat.nombre)}</span>
                                <h2 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light">
                                    {cat.nombre}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {cat.lineas.map((item) => {
                                    const cant = cantidades[item.id] || item.cantidad
                                    const qty = item.es_por_invitado ? cant * numInvitados : cant
                                    const subtotal = item.precio_unitario * qty

                                    return (
                                        <div key={item.id} className="border border-foreground/10 p-6 bg-background hover:border-foreground/20 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <Checkbox
                                                    checked={itemsSeleccionados[item.id]}
                                                    onCheckedChange={() => toggleItem(item.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base md:text-lg font-light tracking-wide mb-2 leading-snug">
                                                        {item.nombre}
                                                    </h4>

                                                    {item.es_acordado && (
                                                        <span className="inline-block text-xs tracking-wider uppercase bg-primary/10 text-primary px-3 py-1 mb-3">
                                                            Acordado
                                                        </span>
                                                    )}

                                                    {item.descripcion && (
                                                        <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.descripcion}</p>
                                                    )}

                                                    {item.cantidad > 1 && (
                                                        <div className="flex items-center gap-4 mt-4">
                                                            <p className="text-sm text-muted-foreground">Cantidad:</p>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); actualizarCantidad(item.id, cant - 1) }}
                                                                    className="w-8 h-8 flex items-center justify-center border border-foreground/20 hover:bg-muted transition-colors"
                                                                    disabled={cant <= 1}
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <span className="w-12 text-center text-lg font-light">{cant}</span>
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); actualizarCantidad(item.id, cant + 1) }}
                                                                    className="w-8 h-8 flex items-center justify-center border border-foreground/20 hover:bg-muted transition-colors"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            {item.es_por_invitado && (
                                                                <span className="text-xs text-muted-foreground">×{numInvitados} inv.</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {item.nota && (
                                                        <p className="text-sm text-primary/80 leading-relaxed mt-3 italic border-l-2 border-primary/20 pl-3">
                                                            {item.nota}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-2xl md:text-3xl font-extralight tracking-wide">
                                                        ${subtotal.toLocaleString("es-MX")}
                                                    </p>
                                                    <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">MXN</p>
                                                    {item.es_por_invitado && (
                                                        <p className="text-[10px] text-muted-foreground mt-1">${item.precio_unitario.toLocaleString("es-MX")}/inv. ×{cant}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Total flotante */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-foreground/10 shadow-lg z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2 flex-1 min-w-0 overflow-hidden">
                        <p className="text-xs tracking-widest uppercase text-muted-foreground shrink-0">Total:</p>
                        <p className="text-xl sm:text-3xl md:text-4xl font-extralight tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                            ${totalSeleccionado.toLocaleString("es-MX")}
                        </p>
                        <p className="text-xs tracking-widest uppercase text-muted-foreground shrink-0">MXN</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            onClick={generarPDF}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 bg-transparent px-3"
                            disabled={descargandoPDF}
                        >
                            <FileDown className="w-4 h-4" />
                            <span className="hidden sm:inline">{descargandoPDF ? "Generando..." : "PDF"}</span>
                        </Button>

                        {contact?.telefono && (
                            <Link
                                href={`https://wa.me/${contact.telefono.replace(/\D/g, "")}?text=Hola,%20me%20interesa%20la%20cotización`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button size="sm" className="gap-1.5 px-3">
                                    <Heart className="w-4 h-4" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="h-24 sm:h-20" />
        </div>
    )
}
