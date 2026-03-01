"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Check, ChevronDown } from "lucide-react"
import { calcularPrecioInstalaciones, formatearPrecio } from "@/app/configurador/utils"
import type { ConfiguradorData } from "@/app/configurador/types"
import { createBrowserClient } from "@/lib/supabase/client"

const CODIGOS_PAIS = [
  { codigo: "+52", pais: "México", bandera: "🇲🇽" },
  { codigo: "+1", pais: "Estados Unidos", bandera: "🇺🇸" },
  { codigo: "+1", pais: "Canadá", bandera: "🇨🇦" },
  { codigo: "+34", pais: "España", bandera: "🇪🇸" },
  { codigo: "+57", pais: "Colombia", bandera: "🇨🇴" },
  { codigo: "+54", pais: "Argentina", bandera: "🇦🇷" },
  { codigo: "+56", pais: "Chile", bandera: "🇨🇱" },
  { codigo: "+51", pais: "Perú", bandera: "🇵🇪" },
  { codigo: "+58", pais: "Venezuela", bandera: "🇻🇪" },
  { codigo: "+593", pais: "Ecuador", bandera: "🇪🇨" },
  { codigo: "+502", pais: "Guatemala", bandera: "🇬🇹" },
  { codigo: "+503", pais: "El Salvador", bandera: "🇸🇻" },
  { codigo: "+504", pais: "Honduras", bandera: "🇭🇳" },
  { codigo: "+505", pais: "Nicaragua", bandera: "🇳🇮" },
  { codigo: "+506", pais: "Costa Rica", bandera: "🇨🇷" },
  { codigo: "+507", pais: "Panamá", bandera: "🇵🇦" },
]

interface Step1Props {
  data: ConfiguradorData
  onContinue: (data: Partial<ConfiguradorData>) => void
  onChange?: (data: Partial<ConfiguradorData>) => void
}

const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const extraerCodigoPais = (telefono: string): { codigo: string; numero: string } => {
  for (const pais of CODIGOS_PAIS) {
    if (telefono.startsWith(pais.codigo)) {
      return {
        codigo: pais.codigo,
        numero: telefono.slice(pais.codigo.length).trim(),
      }
    }
  }
  return { codigo: "+52", numero: telefono.replace(/^\+\d+\s*/, "") }
}

export default function Step1({ data, onContinue, onChange }: Step1Props) {
  const [nombresNovios, setNombresNovios] = useState(data.nombresNovios || "")
  const [numInvitados, setNumInvitados] = useState(data.numInvitados || 0)
  const [numInvitadosInput, setNumInvitadosInput] = useState(data.numInvitados ? String(data.numInvitados) : "")
  const [fechaEvento, setFechaEvento] = useState(data.fechaEvento || "")
  const [email, setEmail] = useState(data.email || "")

  const telefonoExtraido = extraerCodigoPais(data.telefono || "")
  const [codigoPais, setCodigoPais] = useState(telefonoExtraido.codigo)
  const [numeroTelefono, setNumeroTelefono] = useState(telefonoExtraido.numero)
  const [showCodigoDropdown, setShowCodigoDropdown] = useState(false)

  const [emailTouched, setEmailTouched] = useState(false)
  const [telefonoTouched, setTelefonoTouched] = useState(false)

  const [fechasBloqueadas, setFechasBloqueadas] = useState<string[]>([])
  const [cargandoFechas, setCargandoFechas] = useState(true)

  const excedidoCapacidad = numInvitados > 400
  const precioInstalaciones = numInvitados > 0 ? calcularPrecioInstalaciones(numInvitados) : 0

  const emailValido = validarEmail(email)
  const telefonoValido = numeroTelefono.replace(/\D/g, "").length >= 10

  useEffect(() => {
    const cargarFechasBloqueadas = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: fechas, error } = await supabase
          .from("blocked_dates")
          .select("date")
          .order("date", { ascending: true })

        if (error) {
          console.error("[v0] Error cargando fechas bloqueadas:", error)
          return
        }

        if (fechas) {
          const fechasExpandidas: string[] = []

          fechas.forEach((f) => {
            const fechaBloqueada = new Date(f.date + "T00:00:00")

            for (let i = 6; i >= 1; i--) {
              const fechaAnterior = new Date(fechaBloqueada)
              fechaAnterior.setDate(fechaBloqueada.getDate() - i)
              fechasExpandidas.push(fechaAnterior.toISOString().split("T")[0])
            }

            fechasExpandidas.push(f.date)

            const fechaPosterior = new Date(fechaBloqueada)
            fechaPosterior.setDate(fechaBloqueada.getDate() + 1)
            fechasExpandidas.push(fechaPosterior.toISOString().split("T")[0])
          })

          const fechasUnicas = [...new Set(fechasExpandidas)]
          setFechasBloqueadas(fechasUnicas)
        }
      } catch (error) {
        console.error("[v0] Error al cargar fechas bloqueadas:", error)
      } finally {
        setCargandoFechas(false)
      }
    }

    cargarFechasBloqueadas()
  }, [])

  const fechaEstaBloqueada = fechasBloqueadas.includes(fechaEvento)

  const telefonoCompleto = `${codigoPais} ${numeroTelefono}`.trim()

  const handleContinuar = () => {
    if (!nombresNovios || !numInvitados || !fechaEvento || !email || !numeroTelefono) {
      alert("Por favor completen todos los campos")
      return
    }
    if (!emailValido) {
      alert("Por favor ingrese un correo electrónico válido")
      return
    }
    if (!telefonoValido) {
      alert("Por favor ingrese un número de WhatsApp válido (mínimo 10 dígitos)")
      return
    }
    if (excedidoCapacidad) {
      return
    }
    if (fechaEstaBloqueada) {
      alert("La fecha seleccionada no está disponible. Por favor elijan otra fecha.")
      return
    }
    onContinue({ nombresNovios, numInvitados, fechaEvento, email, telefono: telefonoCompleto })
  }

  const handleNumInvitadosInputChange = (inputValue: string) => {
    const sanitized = inputValue.replace(/\D/g, "")
    setNumInvitadosInput(sanitized)

    const value = Number.parseInt(sanitized, 10) || 0
    setNumInvitados(value)

    if (onChange && value > 0 && value <= 400) {
      onChange({ numInvitados: value })
    }
  }

  const handleTelefonoChange = (value: string) => {
    const sanitized = value.replace(/[^\d\s]/g, "")
    setNumeroTelefono(sanitized)
    if (onChange) {
      onChange({ telefono: `${codigoPais} ${sanitized}`.trim() })
    }
  }

  const inclusiones = [
    "6 horas de renta de instalaciones",
    "Valet parking",
    "Planta de luz para áreas generales",
    "Estacionamiento para 250 autos",
    "Staff en sanitarios e insumos",
  ]

  // Fecha mínima: 15 días a partir de hoy para dar tiempo de planeación
  const fechaMinima = (() => {
    const hoy = new Date()
    hoy.setDate(hoy.getDate() + 15) // Agregar 15 días
    return hoy.toISOString().split("T")[0]
  })()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-12">
        {/* Nombre de los Novios */}
        <div>
          <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-4">
            Los protagonistas de esta historia
          </label>
          <input
            type="text"
            value={nombresNovios}
            onChange={(e) => {
              setNombresNovios(e.target.value)
              if (onChange) {
                onChange({ nombresNovios: e.target.value })
              }
            }}
            placeholder="María & Juan"
            className="w-full p-4 border border-border bg-transparent font-serif text-xl font-light placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        {/* Número de Invitados */}
        <div>
          <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-4">
            ¿Cuántos seres queridos los acompañarán?
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={numInvitadosInput}
            onChange={(e) => handleNumInvitadosInputChange(e.target.value)}
            placeholder="100"
            className="w-full p-4 border border-border bg-transparent font-serif text-xl font-light placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
          />
          {excedidoCapacidad && (
            <div className="mt-4 flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">El Romeral puede recibir hasta 400 invitados cómodamente. Contáctennos para eventos más grandes.</span>
            </div>
          )}
        </div>

        {/* Fecha del Evento */}
        <div>
          <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-4">
            El día que lo cambiará todo
          </label>
          <input
            type="date"
            value={fechaEvento}
            onChange={(e) => {
              setFechaEvento(e.target.value)
              if (onChange) {
                onChange({ fechaEvento: e.target.value })
              }
            }}
            min={fechaMinima}
            disabled={cargandoFechas}
            className="w-full p-4 border border-border bg-transparent font-serif text-xl font-light focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
          />
          {fechaEstaBloqueada && (
            <div className="mt-4 flex items-center gap-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Esta fecha no está disponible. Por favor seleccionen otra fecha.</span>
            </div>
          )}
          {cargandoFechas && <p className="mt-2 text-xs text-muted-foreground">Verificando disponibilidad...</p>}
        </div>

        {/* Email - Con validación */}
        <div>
          <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-4">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (onChange) {
                onChange({ email: e.target.value })
              }
            }}
            onBlur={() => setEmailTouched(true)}
            placeholder="correo@ejemplo.com"
            className={`w-full p-4 border bg-transparent text-lg font-light placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${
              emailTouched && email && !emailValido
                ? "border-destructive focus:border-destructive"
                : "border-border focus:border-foreground"
            }`}
          />
          {emailTouched && email && !emailValido && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Por favor ingrese un correo electrónico válido</span>
            </div>
          )}
        </div>

        {/* WhatsApp - Con selector de código de país */}
        <div>
          <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-4">WhatsApp</label>
          <div className="flex gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCodigoDropdown(!showCodigoDropdown)}
                className="h-full px-3 sm:px-4 border border-border bg-transparent flex items-center gap-1 sm:gap-2 hover:border-foreground/50 transition-colors min-w-[90px] sm:min-w-[110px]"
              >
                <span className="text-lg">{CODIGOS_PAIS.find((p) => p.codigo === codigoPais)?.bandera || "🌎"}</span>
                <span className="text-sm sm:text-base font-light">{codigoPais}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {showCodigoDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 sm:w-56 max-h-60 overflow-y-auto bg-background border border-border shadow-lg z-50">
                  {CODIGOS_PAIS.map((pais, index) => (
                    <button
                      key={`${pais.codigo}-${index}`}
                      type="button"
                      onClick={() => {
                        setCodigoPais(pais.codigo)
                        setShowCodigoDropdown(false)
                        if (onChange) {
                          onChange({ telefono: `${pais.codigo} ${numeroTelefono}`.trim() })
                        }
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 text-sm"
                    >
                      <span className="text-lg">{pais.bandera}</span>
                      <span className="font-medium">{pais.codigo}</span>
                      <span className="text-muted-foreground">{pais.pais}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="tel"
              inputMode="numeric"
              value={numeroTelefono}
              onChange={(e) => handleTelefonoChange(e.target.value)}
              onBlur={() => setTelefonoTouched(true)}
              placeholder="33 1234 5678"
              className={`flex-1 p-4 border bg-transparent text-lg font-light placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${
                telefonoTouched && numeroTelefono && !telefonoValido
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-foreground"
              }`}
            />
          </div>
          {telefonoTouched && numeroTelefono && !telefonoValido && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>El número debe tener al menos 10 dígitos</span>
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Selecciona tu país e ingresa tu número sin el código de país
          </p>
        </div>

        {/* Resumen de Precio */}
        {numInvitados > 0 && numInvitados <= 400 && fechaEvento && (
          <div className="border-t border-b border-border py-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-2">
                  Renta de Instalaciones
                </span>
                <span className="font-serif text-4xl font-light">{formatearPrecio(precioInstalaciones)}</span>
              </div>
              <span className="text-xs tracking-wider text-muted-foreground">Para {numInvitados} invitados</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inclusiones.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón Continuar */}
        <button
          onClick={handleContinuar}
          disabled={excedidoCapacidad || fechaEstaBloqueada || cargandoFechas}
          className="w-full p-5 border border-foreground bg-foreground text-background text-xs tracking-widest uppercase hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
