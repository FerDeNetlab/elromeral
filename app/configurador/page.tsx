"use client"

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { saveQuoteProgress, loadFromLocalStorage, clearLocalStorage, saveToLocalStorage } from "@/lib/quote-progress"

import TotalFlotante from "@/components/configurador/TotalFlotante"
import EditorInvitados from "@/components/configurador/EditorInvitados"
import Step1 from "@/components/configurador/Step1"
import Step2Nuevo from "@/components/configurador/Step2Nuevo"
import Step2 from "@/components/configurador/Step2"
import Step3 from "@/components/configurador/Step3"
import Step4 from "@/components/configurador/Step4"
import Step5 from "@/components/configurador/Step5"
import Step6 from "@/components/configurador/Step6"
import Step7 from "@/components/configurador/Step7"
import Step9 from "@/components/configurador/Step9"
import Step10 from "@/components/configurador/Step10"
import Step11 from "@/components/configurador/Step11"
import Step12 from "@/components/configurador/Step12"
import Step13 from "@/components/configurador/Step13"

import type { ConfiguradorData } from "./types"

const stepTitles: Record<number, string> = {
  1: "Cuéntennos sobre su día especial",
  2: "El momento perfecto para su celebración",
  3: "La experiencia gastronómica",
  4: "El brindis y las celebraciones",
  5: "Los espacios donde convivirán",
  6: "Su mesa, su momento",
  7: "La belleza en cada detalle",
  8: "Protección y elegancia",
  9: "La banda sonora de su historia",
  10: "Donde todos celebrarán juntos",
  11: "Un espacio sagrado",
  12: "Momentos que completan la experiencia",
  13: "Su experiencia diseñada",
}

const totalSteps = 13

const initialData: ConfiguradorData = {
  nombresNovios: "",
  tipoEvento: "",
  numInvitados: 100,
  fechaEvento: "",
  email: "",
  telefono: "",
  tipoComida: "",
  incluyeVinosLicores: null,
  mesasDefault: 0,
  mesasShabbyChic: 0,
  mesasMarmol: 0,
  mesasReyArturo: 0,
  mesasCristal: 0,
  mesasParota: 0,
  incluyeMesaNovios: null,
  tipoMesaNovios: "",
  tipoAsientoNovios: "",
  arreglosFlorales: [],
  tipoToldo: "",
  tipoSuperficie: "",
  tipoMusica: "",
  tipoPista: "",
  incluyeCapilla: false,
  extrasSeleccionados: [],
}

function ConfiguradorContent() {
  const searchParams = useSearchParams()
  const slugFromUrl = searchParams.get("cotizacion")
  const stepFromUrl = searchParams.get("step")

  const [paso, setPaso] = useState(1)
  const [editandoDesdeResumen, setEditandoDesdeResumen] = useState(false)
  const [cargandoCotizacion, setCargandoCotizacion] = useState(false)

  const [currentSlug, setCurrentSlug] = useState<string | null>(slugFromUrl)
  const [guardando, setGuardando] = useState(false)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)
  const lastSavedStep = useRef<number>(0)
  const isInitialized = useRef(false)
  const leadAlertSent = useRef(false)
  const mainContentRef = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<ConfiguradorData>(initialData)

  useEffect(() => {
    if (isInitialized.current && !cargandoCotizacion) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [paso, cargandoCotizacion])

  useEffect(() => {
    const initializeData = async () => {
      if (isInitialized.current) return
      isInitialized.current = true

      if (slugFromUrl) {
        setCargandoCotizacion(true)
      }

      try {
        if (slugFromUrl) {
          try {
            const supabase = createClient()
            const { data: quote, error } = await supabase
              .from("quotes")
              .select("*")
              .eq("slug", slugFromUrl)
              .maybeSingle()

            if (!error && quote) {
              let configuracionCompleta = quote.configuracion_completa

              if (typeof configuracionCompleta === "string") {
                try {
                  configuracionCompleta = JSON.parse(configuracionCompleta)
                } catch (e) {
                  configuracionCompleta = null
                }
              }

              if (configuracionCompleta && typeof configuracionCompleta === "object") {
                setData((prev) => ({ ...prev, ...configuracionCompleta }))
              }

              const targetStep = stepFromUrl ? Number.parseInt(stepFromUrl, 10) : quote.current_step || 13
              if (targetStep >= 1 && targetStep <= 13) {
                setPaso(targetStep)
                lastSavedStep.current = targetStep
              }
              setCurrentSlug(slugFromUrl)
              setCargandoCotizacion(false)
              return
            }
          } catch (err) {
            console.error("[v0] Error cargando cotización de BD:", err)
          }
        }

        const stored = loadFromLocalStorage()
        if (stored && stored.data) {
          setData((prev) => ({ ...prev, ...stored.data }))
          setPaso(stored.step || 1)
          setCurrentSlug(stored.slug)
          lastSavedStep.current = stored.step || 1

          if (stored.slug && typeof window !== "undefined") {
            window.history.replaceState(null, "", `/configurador?cotizacion=${stored.slug}&step=${stored.step}`)
          }
        }
      } catch (err) {
        console.error("[v0] Error en inicialización:", err)
      } finally {
        setCargandoCotizacion(false)
      }
    }

    initializeData()
  }, [slugFromUrl, stepFromUrl])

  useEffect(() => {
    if (!cargandoCotizacion && isInitialized.current) {
      saveToLocalStorage(data, paso, currentSlug)
    }
  }, [data, paso, currentSlug, cargandoCotizacion])

  const sendLeadAlert = useCallback(
    async (currentData: ConfiguradorData, currentStep: number, isComplete = false, detalles?: string[]) => {
      try {
        await fetch("/api/send-lead-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombres: currentData.nombresNovios,
            email: currentData.email,
            telefono: currentData.telefono,
            fechaEvento: currentData.fechaEvento,
            numInvitados: currentData.numInvitados,
            tipoEvento: currentData.tipoEvento,
            paso: currentStep,
            cotizacionCompleta: isComplete,
            detallesCotizacion: detalles,
          }),
        })
      } catch (error) {
        console.error("[v0] Error enviando alerta de lead:", error)
      }
    },
    [],
  )

  const guardarProgreso = useCallback(
    async (currentStep: number) => {
      if (lastSavedStep.current === currentStep && currentSlug) return

      const tieneDataMinima = data.nombresNovios && data.email
      if (!tieneDataMinima) return

      setGuardando(true)
      try {
        const result = await saveQuoteProgress(data, currentStep, currentSlug)
        if (result?.slug) {
          setCurrentSlug(result.slug)
          lastSavedStep.current = currentStep

          saveToLocalStorage(data, currentStep, result.slug)

          if (!window.location.search.includes("cotizacion=")) {
            window.history.replaceState(null, "", `/configurador?cotizacion=${result.slug}`)
          }

          if (currentStep === 2 && !leadAlertSent.current) {
            leadAlertSent.current = true
            console.log("[v0] Enviando alerta de nuevo lead...")
            sendLeadAlert(data, currentStep, false)
          }
        }

        setGuardadoExitoso(true)
        setTimeout(() => setGuardadoExitoso(false), 2000)
      } catch (error) {
        console.error("[v0] Error guardando progreso:", error)
      } finally {
        setGuardando(false)
      }
    },
    [data, currentSlug, sendLeadAlert],
  )

  useEffect(() => {
    if (!cargandoCotizacion && isInitialized.current && paso > 1) {
      guardarProgreso(paso)
    }
  }, [paso, guardarProgreso, cargandoCotizacion])

  const updateDataOnly = useCallback((newData: Partial<ConfiguradorData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }, [])

  const updateData = useCallback(
    (newData: Partial<ConfiguradorData>) => {
      setData((prev) => ({ ...prev, ...newData }))
      if (editandoDesdeResumen) {
        setPaso(13)
        setEditandoDesdeResumen(false)
      } else {
        setPaso((p) => Math.min(p + 1, 13))
      }
    },
    [editandoDesdeResumen],
  )

  const goToPrevStep = useCallback(() => setPaso((prev) => Math.max(1, prev - 1)), [])

  const goToStep = useCallback((step: number, fromResumen = false) => {
    if (fromResumen) {
      setEditandoDesdeResumen(true)
    }
    setPaso(step)
  }, [])

  const volverAlResumen = useCallback(() => {
    setPaso(13)
    setEditandoDesdeResumen(false)
  }, [])

  const handleCambiarInvitados = useCallback((nuevoNumero: number) => {
    setData((prev) => ({ ...prev, numInvitados: nuevoNumero }))
  }, [])

  const reiniciarCotizacion = useCallback(() => {
    clearLocalStorage()
    setData(initialData)
    setPaso(1)
    setCurrentSlug(null)
    lastSavedStep.current = 0
    window.history.replaceState(null, "", "/configurador")
  }, [])

  const currentStep = useMemo(() => {
    const stepProps = { data, onChange: updateDataOnly, onContinue: updateData }

    switch (paso) {
      case 1:
        return <Step1 {...stepProps} />
      case 2:
        return <Step2Nuevo {...stepProps} />
      case 3:
        return <Step2 {...stepProps} />
      case 4:
        return <Step3 {...stepProps} />
      case 5:
        return <Step4 {...stepProps} />
      case 6:
        return <Step5 {...stepProps} />
      case 7:
        return <Step6 {...stepProps} />
      case 8:
        return <Step7 {...stepProps} />
      case 9:
        return <Step9 {...stepProps} />
      case 10:
        return <Step10 {...stepProps} />
      case 11:
        return <Step11 {...stepProps} />
      case 12:
        return <Step12 {...stepProps} />
      case 13:
        return (
          <Step13
            key={`step13-${data.numInvitados}-${data.extrasSeleccionados?.length || 0}-${data.tipoComida}-${data.tipoToldo || ""}-${data.tipoMusica || ""}`}
            data={data}
            onGoToStep={(step) => goToStep(step, true)}
            onCambiarInvitados={handleCambiarInvitados}
            onNuevaCotizacion={reiniciarCotizacion}
          />
        )
      default:
        return null
    }
  }, [paso, data, updateDataOnly, updateData, goToStep, handleCambiarInvitados, reiniciarCotizacion])

  if (cargandoCotizacion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-extralight tracking-wide">Cargando cotización...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.03)_0%,transparent_50%)] pointer-events-none" />

      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-40 xl:w-48 z-50 flex-col items-center justify-between py-12 xl:py-16 px-6 xl:px-8 border-r border-primary/5 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="hover:opacity-70 transition-opacity duration-700">
            <Image
              src="/images/el-romeral-logo-nuevo.png"
              alt="El Romeral"
              width={100}
              height={50}
              className="object-contain"
              priority
            />
          </Link>
          <div className="h-8 w-[1px] bg-gradient-to-b from-primary/20 to-transparent" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <span className="text-[8px] tracking-[0.35em] uppercase font-extralight text-primary/50 [writing-mode:vertical-rl] rotate-180">
            Configurador
          </span>

          <div className="relative h-40 w-[2px] bg-border/30 rounded-full overflow-hidden">
            <div
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary via-primary to-primary/50 transition-all duration-1000 ease-out rounded-full"
              style={{ height: `${(paso / totalSteps) * 100}%` }}
            />
            <div
              className="absolute left-0 w-full h-4 bg-gradient-to-t from-transparent via-white/30 to-transparent transition-all duration-1000"
              style={{ bottom: `${(paso / totalSteps) * 100 - 10}%` }}
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl font-serif font-extralight tracking-wide">{paso}</span>
            <div className="h-[1px] w-4 bg-primary/30 my-1" />
            <span className="text-[10px] font-extralight text-muted-foreground">{totalSteps}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Link
            href="/"
            className="text-[9px] tracking-[0.2em] uppercase font-extralight text-muted-foreground hover:text-foreground transition-all duration-500 flex items-center gap-2 group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform duration-300" />
            Inicio
          </Link>

          <a
            href="https://netlab.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-20 hover:opacity-50 transition-opacity duration-500"
          >
            <Image
              src="/images/netlab-logo.png"
              alt="NETLAB"
              width={60}
              height={20}
              className="object-contain"
              loading="lazy"
            />
          </a>
        </div>
      </nav>

      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/5">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-500 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-[9px] tracking-[0.2em] uppercase font-extralight">Inicio</span>
          </Link>

          <Image
            src="/images/el-romeral-logo-nuevo.png"
            alt="El Romeral"
            width={70}
            height={35}
            className="object-contain"
            priority
          />

          <div className="flex items-center gap-2">
            <span className="text-lg font-serif font-extralight">{paso}</span>
            <span className="text-[9px] text-muted-foreground font-extralight">/ {totalSteps}</span>
          </div>
        </div>

        <div className="h-[2px] bg-border/20">
          <div
            className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/80 transition-all duration-700 ease-out"
            style={{ width: `${(paso / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      <main className="lg:ml-40 xl:ml-48 pt-16 lg:pt-0 min-h-screen relative" ref={mainContentRef}>
        <div className="relative py-16 lg:py-20 xl:py-24 px-6 sm:px-10 lg:px-16 xl:px-24 border-b border-primary/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-[9px] tracking-[0.4em] uppercase text-primary/50 font-extralight">
                Paso {String(paso).padStart(2, "0")}
              </span>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary/30" />
            </div>

            <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extralight tracking-[0.01em] sm:tracking-[0.02em] text-foreground leading-tight px-4">
              {stepTitles[paso]}
            </h1>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 py-6 sm:py-8 max-w-5xl mx-auto">
          {editandoDesdeResumen && paso !== 13 && (
            <button
              onClick={volverAlResumen}
              className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-extralight hover:bg-primary/90 transition-all duration-500 group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="hidden xs:inline">Volver a tu resumen</span>
              <span className="xs:hidden">Resumen</span>
            </button>
          )}

          {paso > 1 && paso < 13 && !editandoDesdeResumen && (
            <button
              onClick={goToPrevStep}
              className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500 group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform duration-300" />
              Paso anterior
            </button>
          )}
        </div>

        <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 pb-32 sm:pb-40">{currentStep}</div>

        <TotalFlotante data={data} paso={paso} />

        {paso >= 2 && paso <= 12 && (
          <EditorInvitados numInvitados={data.numInvitados} onCambiar={handleCambiarInvitados} />
        )}
      </main>

      <div
        className={`fixed bottom-24 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${guardando
          ? "bg-primary/10 text-primary opacity-100 translate-y-0"
          : guardadoExitoso
            ? "bg-green-500/10 text-green-600 opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        {guardando ? (
          <>
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-xs tracking-wide">Guardando paso {paso}...</span>
          </>
        ) : guardadoExitoso ? (
          <>
            <Check className="w-4 h-4" />
            <span className="text-xs tracking-wide">Guardado</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function ConfiguradorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground font-extralight tracking-wide">Cargando...</span>
          </div>
        </div>
      }
    >
      <ConfiguradorContent />
    </Suspense>
  )
}
