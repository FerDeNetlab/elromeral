"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Copy, Users, DollarSign, Calendar } from "lucide-react"

interface QuoteData {
    id: string
    slug: string
    nombre_cliente: string
    email: string | null
    tipo_evento: string
    num_invitados: number
    selecciones: Array<{
        step_titulo: string
        productos: Array<{ titulo: string; precio: number; tipo_precio: string; subtotal: number }>
    }>
    total: number
    created_at: string
    quote_flows?: { titulo: string; descripcion: string | null }
}

function CotizacionContent({ slug }: { slug: string }) {
    const [quote, setQuote] = useState<QuoteData | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        loadQuote()
    }, [])

    const loadQuote = async () => {
        setLoading(true)
        const { data } = await supabase
            .from("custom_quotes")
            .select("*, quote_flows(titulo, descripcion)")
            .eq("slug", slug)
            .single()

        if (!data) { setNotFound(true) } else { setQuote(data as QuoteData) }
        setLoading(false)
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    if (loading) return <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#4a5043]" /></div>
    if (notFound || !quote) return (
        <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-2xl font-serif text-[#4a5043] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Cotización no encontrada</h1>
                <p className="text-neutral-500">Este enlace no es válido.</p>
            </div>
        </div>
    )

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

            <div className="min-h-screen bg-[#f8f7f4]">
                {/* Header */}
                <header className="border-b border-[#4a5043]/10 bg-[#f8f7f4]">
                    <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
                        <Link href="/"><Image src="/images/el-romeral-logo-nuevo.png" alt="El Romeral" width={120} height={40} /></Link>
                        <button onClick={copyLink} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${copiedLink ? "bg-green-600 text-white" : "bg-[#4a5043] text-white hover:bg-[#3d4338]"}`}>
                            <Copy className="w-3 h-3" />{copiedLink ? "¡Copiado!" : "Compartir"}
                        </button>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto px-4 py-8">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <p className="text-xs text-[#4a5043]/40 uppercase tracking-wider mb-2">Cotización Personalizada</p>
                        <h1 className="text-3xl text-[#4a5043] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{quote.nombre_cliente}</h1>
                        {quote.quote_flows && <p className="text-sm text-[#4a5043]/50">{(quote.quote_flows as { titulo: string }).titulo}</p>}
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-2xl border border-[#4a5043]/10 p-4 text-center">
                            <Users className="w-5 h-5 text-[#4a5043]/40 mx-auto mb-1" />
                            <p className="text-lg font-semibold text-[#4a5043]">{quote.num_invitados}</p>
                            <p className="text-[10px] text-[#4a5043]/40">invitados</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-[#4a5043]/10 p-4 text-center">
                            <Calendar className="w-5 h-5 text-[#4a5043]/40 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-[#4a5043] capitalize">{quote.tipo_evento}</p>
                            <p className="text-[10px] text-[#4a5043]/40">tipo de evento</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-[#4a5043]/10 p-4 text-center">
                            <Calendar className="w-5 h-5 text-[#4a5043]/40 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-[#4a5043]">{new Date(quote.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</p>
                            <p className="text-[10px] text-[#4a5043]/40">fecha</p>
                        </div>
                    </div>

                    {/* Detalle */}
                    <div className="bg-white rounded-2xl border border-[#4a5043]/10 overflow-hidden mb-8">
                        <div className="p-6 border-b border-[#4a5043]/10 bg-[#4a5043]/[0.02]">
                            <h2 className="text-lg text-[#4a5043]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Detalle de Selecciones</h2>
                        </div>

                        <div className="divide-y divide-[#4a5043]/10">
                            {quote.selecciones?.map((sel, i) => (
                                <div key={i} className="p-5">
                                    <p className="text-xs font-medium text-[#4a5043]/50 uppercase tracking-wider mb-3">{sel.step_titulo}</p>
                                    {sel.productos?.map((p, j) => (
                                        <div key={j} className="flex justify-between items-center py-2">
                                            <div>
                                                <p className="text-sm text-[#4a5043]">{p.titulo}</p>
                                                {p.tipo_precio === "por_invitado" && (
                                                    <p className="text-[10px] text-[#4a5043]/40">${Number(p.precio).toLocaleString("es-MX")} × {quote.num_invitados} invitados</p>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-[#4a5043]">${Number(p.subtotal).toLocaleString("es-MX")}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="p-6 bg-[#4a5043] text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-white/60" />
                                    <p className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Total Estimado</p>
                                </div>
                                <p className="text-2xl font-semibold">${Number(quote.total).toLocaleString("es-MX")} <span className="text-xs font-normal text-white/60">MXN</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-[#4a5043]/30">
                        <p>Cotización generada por El Romeral · Los precios son estimados y pueden variar</p>
                    </div>
                </main>
            </div>
        </>
    )
}

export default function CotizacionPersonalizadaPage({ params }: { params: Promise<{ slug: string }> }) {
    const p = use(params)
    return <CotizacionContent slug={p.slug} />
}
