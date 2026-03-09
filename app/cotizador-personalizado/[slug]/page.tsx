"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"
import {
    Loader2, ChevronRight, ChevronLeft, Check,
    Users, ImageIcon, Download, Share2, Copy, Building2,
} from "lucide-react"
import { PRECIOS_INSTALACIONES } from "@/app/configurador/constants"

interface Product {
    id: string
    titulo: string
    descripcion: string | null
    tipo_precio: "fijo" | "por_invitado"
    precio: number
    imagen_url: string | null
}

interface Step {
    id: string
    titulo: string
    tipo_seleccion: "unico" | "multiple"
    orden: number
    requerido: boolean
    permite_omitir: boolean
    products: Product[]
}

interface Flow {
    id: string
    slug: string
    titulo: string
    descripcion: string | null
    incluir_paso_fijo: boolean
}

interface Selection {
    step_id: string
    step_titulo: string
    product_ids: string[]
    productos: Array<{ id: string; titulo: string; precio: number; tipo_precio: string; subtotal: number }>
    omitido: boolean
}

function calcularRentaInstalaciones(numInvitados: number): number {
    const rango = PRECIOS_INSTALACIONES.find((r: { min: number; max: number; precio: number }) => numInvitados >= r.min && numInvitados <= r.max)
    return rango ? rango.precio : PRECIOS_INSTALACIONES[PRECIOS_INSTALACIONES.length - 1].precio
}

function WizardContent({ slug }: { slug: string }) {
    const [flow, setFlow] = useState<Flow | null>(null)
    const [steps, setSteps] = useState<Step[]>([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [currentStep, setCurrentStep] = useState(0) // 0 = info, 1..N = steps, N+1 = resumen
    const [guardando, setGuardando] = useState(false)
    const [cotizacionGuardada, setCotizacionGuardada] = useState<string | null>(null)
    const [copiedLink, setCopiedLink] = useState(false)

    // Step 0 fields
    const [nombre, setNombre] = useState("")
    const [email, setEmail] = useState("")
    const [numInvitados, setNumInvitados] = useState(100)
    const [tipoEvento, setTipoEvento] = useState<"comida" | "cena">("comida")
    const [step0Error, setStep0Error] = useState("")

    // Selections
    const [selections, setSelections] = useState<Record<string, Selection>>({})

    const supabase = createClient()

    useEffect(() => { loadFlow() }, [])

    const loadFlow = async () => {
        setLoading(true)
        const { data: flowData } = await supabase
            .from("quote_flows")
            .select("*")
            .eq("slug", slug)
            .eq("activo", true)
            .single()

        if (!flowData) { setNotFound(true); setLoading(false); return }
        setFlow({ ...flowData, incluir_paso_fijo: flowData.incluir_paso_fijo !== false })

        const { data: stepsData } = await supabase
            .from("quote_flow_steps")
            .select("*, quote_flow_step_products(product_id, products(*))")
            .eq("flow_id", flowData.id)
            .order("orden")

        if (stepsData) {
            const mapped: Step[] = stepsData.map((s: Record<string, unknown>) => ({
                id: s.id as string,
                titulo: s.titulo as string,
                tipo_seleccion: s.tipo_seleccion as "unico" | "multiple",
                orden: s.orden as number,
                requerido: s.requerido as boolean,
                permite_omitir: s.permite_omitir as boolean,
                products: ((s.quote_flow_step_products as Array<{ products: Product }>) || [])
                    .map((sp) => sp.products)
                    .filter(Boolean),
            }))
            setSteps(mapped)
        }

        setLoading(false)
    }

    const incluirPasoFijo = flow?.incluir_paso_fijo !== false
    const infoSteps = incluirPasoFijo ? 1 : 0
    const totalSteps = steps.length + infoSteps + 1 // info (optional) + N steps + resumen
    const isResumen = currentStep === steps.length + infoSteps
    const progress = ((currentStep) / (totalSteps - 1)) * 100

    const selectProduct = (step: Step, productId: string) => {
        const existing = selections[step.id]
        let productIds: string[]

        if (step.tipo_seleccion === "unico") {
            productIds = existing?.product_ids.includes(productId) ? [] : [productId]
        } else {
            productIds = existing?.product_ids.includes(productId)
                ? existing.product_ids.filter((id) => id !== productId)
                : [...(existing?.product_ids || []), productId]
        }

        const productos = productIds.map((pid) => {
            const p = step.products.find((pr) => pr.id === pid)!
            const subtotal = p.tipo_precio === "por_invitado" ? p.precio * numInvitados : p.precio
            return { id: p.id, titulo: p.titulo, precio: p.precio, tipo_precio: p.tipo_precio, subtotal }
        })

        setSelections({
            ...selections,
            [step.id]: { step_id: step.id, step_titulo: step.titulo, product_ids: productIds, productos, omitido: false },
        })
    }

    const omitirStep = (step: Step) => {
        setSelections({
            ...selections,
            [step.id]: { step_id: step.id, step_titulo: step.titulo, product_ids: [], productos: [], omitido: true },
        })
    }

    const rentaInstalaciones = incluirPasoFijo ? calcularRentaInstalaciones(numInvitados) : 0

    const getTotal = () => {
        const totalProductos = Object.values(selections).reduce(
            (sum, sel) => sum + sel.productos.reduce((s, p) => s + p.subtotal, 0), 0
        )
        return rentaInstalaciones + totalProductos
    }

    const canProceed = () => {
        if (incluirPasoFijo && currentStep === 0) return nombre.trim().length > 0 && numInvitados > 0
        if (isResumen) return true
        const stepIndex = currentStep - infoSteps
        const step = steps[stepIndex]
        if (!step) return true
        const sel = selections[step.id]
        if (sel?.omitido) return true
        if (!step.requerido && !sel) return true
        return sel && sel.product_ids.length > 0
    }

    const nextStep = () => {
        if (incluirPasoFijo && currentStep === 0) {
            if (!nombre.trim()) { setStep0Error("El nombre es obligatorio"); return }
            if (numInvitados < 1) { setStep0Error("Ingresa el número de invitados"); return }
            setStep0Error("")
        }
        if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1)
    }

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1)
    }

    const guardarCotizacion = async () => {
        if (!flow) return
        setGuardando(true)

        const quotSlug = `cot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
        const seleccionesProductos = Object.values(selections).filter((s) => !s.omitido && s.productos.length > 0)

        // Inyectar renta de instalaciones como primera selección (solo si paso fijo está activo)
        const seleccionesArray = []
        if (incluirPasoFijo) {
            const rangoTexto = PRECIOS_INSTALACIONES.find((r) => numInvitados >= r.min && numInvitados <= r.max)
            seleccionesArray.push({
                step_id: "renta-instalaciones",
                step_titulo: "Renta de Instalaciones",
                product_ids: ["renta-instalaciones"],
                productos: [{
                    id: "renta-instalaciones",
                    titulo: `Renta de instalaciones (${rangoTexto ? `${rangoTexto.min}–${rangoTexto.max}` : numInvitados} invitados)`,
                    precio: rentaInstalaciones,
                    tipo_precio: "fijo",
                    subtotal: rentaInstalaciones,
                }],
                omitido: false,
            })
        }
        seleccionesArray.push(...seleccionesProductos)

        const { error } = await supabase.from("custom_quotes").insert({
            slug: quotSlug,
            flow_id: flow.id,
            nombre_cliente: incluirPasoFijo ? nombre.trim() : null,
            email: incluirPasoFijo ? (email.trim() || null) : null,
            tipo_evento: incluirPasoFijo ? tipoEvento : null,
            num_invitados: incluirPasoFijo ? numInvitados : null,
            selecciones: seleccionesArray,
            total: getTotal(),
        })

        if (!error) {
            setCotizacionGuardada(quotSlug)
        }
        setGuardando(false)
    }

    const copyLink = () => {
        if (!cotizacionGuardada) return
        navigator.clipboard.writeText(`${window.location.origin}/cotizacion-personalizada/${cotizacionGuardada}`)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4a5043]" />
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-serif text-[#4a5043] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Cotizador no encontrado</h1>
                    <p className="text-neutral-500">Este enlace no es válido o el cotizador fue desactivado.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

            <div className="min-h-screen bg-[#f8f7f4]">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#f8f7f4]/95 backdrop-blur-sm border-b border-[#4a5043]/10">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/"><Image src="/images/el-romeral-logo-nuevo.png" alt="El Romeral" width={120} height={40} /></Link>
                        <div className="text-right">
                            <p className="text-xs text-[#4a5043]/60">Total estimado</p>
                            <p className="text-lg font-semibold text-[#4a5043]">${getTotal().toLocaleString("es-MX")} <span className="text-xs font-normal">MXN</span></p>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 bg-[#4a5043]/10"><div className="h-full bg-[#4a5043] transition-all duration-500" style={{ width: `${progress}%` }} /></div>
                </header>

                <main className="max-w-3xl mx-auto px-4 py-8">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl lg:text-3xl text-[#4a5043] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {flow?.titulo || "Personalización de Boda"}
                        </h1>
                        {flow?.descripcion && <p className="text-sm text-[#4a5043]/60">{flow.descripcion}</p>}
                    </div>

                    {/* STEP 0: Info básica (solo si incluir_paso_fijo) */}
                    {incluirPasoFijo && currentStep === 0 && (
                        <div className="bg-white rounded-2xl border border-[#4a5043]/10 p-6 lg:p-8 animate-in fade-in-0 duration-300">
                            <h2 className="text-xl text-[#4a5043] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Información Básica</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[#4a5043]/70 mb-1.5">Nombre *</label>
                                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de los novios" className="w-full px-4 py-3 bg-[#f8f7f4] border border-[#4a5043]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5043]/20 focus:border-[#4a5043]/30 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#4a5043]/70 mb-1.5">Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full px-4 py-3 bg-[#f8f7f4] border border-[#4a5043]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5043]/20 focus:border-[#4a5043]/30 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#4a5043]/70 mb-1.5">Número de invitados *</label>
                                    <input type="number" value={numInvitados} onChange={(e) => setNumInvitados(Number(e.target.value))} min={1} max={500} className="w-full px-4 py-3 bg-[#f8f7f4] border border-[#4a5043]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5043]/20 focus:border-[#4a5043]/30 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#4a5043]/70 mb-1.5">Tipo de evento *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(["comida", "cena"] as const).map((tipo) => (
                                            <button key={tipo} onClick={() => setTipoEvento(tipo)} className={`p-4 rounded-xl border-2 transition-all text-center ${tipoEvento === tipo ? "border-[#4a5043] bg-[#4a5043]/5" : "border-[#4a5043]/15 hover:border-[#4a5043]/30"}`}>
                                                <p className="text-sm font-medium text-[#4a5043] capitalize">{tipo}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {step0Error && <p className="text-sm text-red-500">{step0Error}</p>}
                            </div>
                        </div>
                    )}

                    {/* DYNAMIC STEPS */}
                    {currentStep >= infoSteps && !isResumen && (() => {
                        const step = steps[currentStep - infoSteps]
                        if (!step) return null
                        const sel = selections[step.id]
                        return (
                            <div className="bg-white rounded-2xl border border-[#4a5043]/10 p-6 lg:p-8 animate-in fade-in-0 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl text-[#4a5043]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{step.titulo}</h2>
                                    <span className="text-xs text-[#4a5043]/40">Paso {currentStep + 1} de {totalSteps}</span>
                                </div>

                                <p className="text-xs text-[#4a5043]/50 mb-4">
                                    {step.tipo_seleccion === "unico" ? "Selecciona una opción" : "Puedes seleccionar varias opciones"}
                                </p>

                                <div className="space-y-3">
                                    {step.products.map((product) => {
                                        const isSelected = sel?.product_ids.includes(product.id) && !sel?.omitido
                                        const displayPrice = product.tipo_precio === "por_invitado" ? product.precio * numInvitados : product.precio
                                        return (
                                            <button
                                                key={product.id}
                                                onClick={() => { selectProduct(step, product.id) }}
                                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? "border-[#4a5043] bg-[#4a5043]/5" : "border-[#4a5043]/10 hover:border-[#4a5043]/25"}`}
                                            >
                                                <div className="w-16 h-16 rounded-xl bg-[#f8f7f4] overflow-hidden flex-shrink-0">
                                                    {product.imagen_url ? (
                                                        <Image src={product.imagen_url} alt={product.titulo} width={64} height={64} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-[#4a5043]/20" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[#4a5043]">{product.titulo}</p>
                                                    {product.descripcion && <p className="text-xs text-[#4a5043]/50 line-clamp-1 mt-0.5">{product.descripcion}</p>}
                                                    <p className="text-xs text-[#4a5043]/40 mt-1">
                                                        {product.tipo_precio === "por_invitado"
                                                            ? <><Users className="w-3 h-3 inline mr-1" />${Number(product.precio).toLocaleString("es-MX")}/persona × {numInvitados}</>
                                                            : `Precio fijo`
                                                        }
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-base font-semibold text-[#4a5043]">${displayPrice.toLocaleString("es-MX")}</p>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 rounded-full bg-[#4a5043] flex items-center justify-center mt-1 ml-auto">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}

                                    {/* Omitir */}
                                    {step.permite_omitir && (
                                        <button
                                            onClick={() => omitirStep(step)}
                                            className={`w-full p-4 rounded-xl border-2 transition-all text-center ${sel?.omitido ? "border-[#4a5043] bg-[#4a5043]/5" : "border-dashed border-[#4a5043]/15 hover:border-[#4a5043]/25"}`}
                                        >
                                            <p className="text-sm text-[#4a5043]/60">Omitir este paso</p>
                                            {sel?.omitido && <Check className="w-4 h-4 text-[#4a5043] mx-auto mt-1" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })()}

                    {/* RESUMEN */}
                    {isResumen && !cotizacionGuardada && (
                        <div className="bg-white rounded-2xl border border-[#4a5043]/10 p-6 lg:p-8 animate-in fade-in-0 duration-300">
                            <h2 className="text-xl text-[#4a5043] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Resumen de tu Cotización</h2>
                            <p className="text-xs text-[#4a5043]/50 mb-6">{incluirPasoFijo ? `${nombre} · ${numInvitados} invitados · ${tipoEvento}` : "Revisa tu selección"}</p>

                            <div className="space-y-4 mb-6">
                                {/* Renta de Instalaciones (solo si paso fijo incluido) */}
                                {incluirPasoFijo && (
                                    <div className="border border-[#4a5043]/10 rounded-xl p-4 bg-[#4a5043]/[0.02]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="w-3.5 h-3.5 text-[#4a5043]/50" />
                                            <p className="text-xs font-medium text-[#4a5043]">Renta de Instalaciones</p>
                                        </div>
                                        <div className="flex justify-between text-xs py-1">
                                            <span className="text-[#4a5043]/70">Renta según {numInvitados} invitados</span>
                                            <span className="font-medium text-[#4a5043]">${rentaInstalaciones.toLocaleString("es-MX")}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Selecciones de productos */}
                                {Object.values(selections).filter((s) => !s.omitido && s.productos.length > 0).map((sel) => (
                                    <div key={sel.step_id} className="border border-[#4a5043]/10 rounded-xl p-4">
                                        <p className="text-xs font-medium text-[#4a5043] mb-2">{sel.step_titulo}</p>
                                        {sel.productos.map((p) => (
                                            <div key={p.id} className="flex justify-between text-xs py-1">
                                                <span className="text-[#4a5043]/70">{p.titulo}{p.tipo_precio === "por_invitado" && ` (${numInvitados} inv.)`}</span>
                                                <span className="font-medium text-[#4a5043]">${p.subtotal.toLocaleString("es-MX")}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-[#4a5043]/10 pt-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-medium text-[#4a5043]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Total Estimado</p>
                                    <p className="text-2xl font-semibold text-[#4a5043]">${getTotal().toLocaleString("es-MX")} <span className="text-xs font-normal">MXN</span></p>
                                </div>
                            </div>

                            <button
                                onClick={guardarCotizacion}
                                disabled={guardando}
                                className="w-full py-4 bg-[#4a5043] text-white rounded-xl text-sm font-medium hover:bg-[#3d4338] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                                {guardando ? "Guardando..." : "Guardar y Obtener Enlace"}
                            </button>
                        </div>
                    )}

                    {/* COTIZACIÓN GUARDADA */}
                    {cotizacionGuardada && (
                        <div className="bg-white rounded-2xl border border-[#4a5043]/10 p-6 lg:p-8 text-center animate-in fade-in-0 duration-300">
                            <div className="w-16 h-16 rounded-full bg-[#4a5043]/10 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-[#4a5043]" />
                            </div>
                            <h2 className="text-xl text-[#4a5043] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>¡Cotización Guardada!</h2>
                            <p className="text-sm text-[#4a5043]/60 mb-6">Tu cotización ha sido guardada exitosamente. Comparte el enlace con quien desees.</p>

                            <div className="bg-[#f8f7f4] rounded-xl p-4 mb-4">
                                <p className="text-xs text-[#4a5043]/50 mb-1">Enlace de tu cotización</p>
                                <p className="text-sm text-[#4a5043] font-medium break-all">{window.location.origin}/cotizacion-personalizada/{cotizacionGuardada}</p>
                            </div>

                            <div className="flex items-center justify-center gap-3">
                                <button onClick={copyLink} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${copiedLink ? "bg-green-600 text-white" : "bg-[#4a5043] text-white hover:bg-[#3d4338]"}`}>
                                    <Copy className="w-4 h-4" />{copiedLink ? "¡Copiado!" : "Copiar Enlace"}
                                </button>
                                <Link href={`/cotizacion-personalizada/${cotizacionGuardada}`} className="flex items-center gap-2 px-5 py-3 border border-[#4a5043]/20 text-[#4a5043] rounded-xl text-sm hover:bg-[#4a5043]/5 transition-colors">
                                    Ver Cotización
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    {!cotizacionGuardada && (
                        <div className="flex items-center justify-between mt-8">
                            <button onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-2 px-5 py-3 text-sm text-[#4a5043]/60 hover:text-[#4a5043] disabled:opacity-30 transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Anterior
                            </button>
                            {!isResumen && (
                                <button onClick={nextStep} disabled={!canProceed()} className="flex items-center gap-2 px-6 py-3 bg-[#4a5043] text-white rounded-xl text-sm font-medium hover:bg-[#3d4338] disabled:opacity-40 transition-colors">
                                    Siguiente <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}

export default function CotizadorPersonalizadoPage({ params }: { params: Promise<{ slug: string }> }) {
    const p = use(params)
    return <WizardContent slug={p.slug} />
}
