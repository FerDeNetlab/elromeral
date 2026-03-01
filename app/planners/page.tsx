"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Check,
  AlertCircle,
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronUp,
  Download,
  Mail,
  Phone,
  User,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"

const countryCodes = [
  { code: "+52", country: "MX", flag: "🇲🇽", name: "México" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "Estados Unidos" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "España" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+51", country: "PE", flag: "🇵🇪", name: "Perú" },
  { code: "+58", country: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "+502", country: "GT", flag: "🇬🇹", name: "Guatemala" },
]

interface FechaBloqueada {
  id: string
  date: string
  reason?: string
}

interface DatosPlanner {
  nombre: string
  email: string
  countryCode: string
  telefono: string
}

export default function PlannersPage() {
  const [datosPlanner, setDatosPlanner] = useState<DatosPlanner>({
    nombre: "",
    email: "",
    countryCode: "+52",
    telefono: "",
  })
  const [plannerId, setPlannerId] = useState<string | null>(null)
  const [plannerRegistrado, setPlannerRegistrado] = useState(false)
  const [errores, setErrores] = useState<{ email?: string; telefono?: string; nombre?: string }>({})
  const [guardandoPlanner, setGuardandoPlanner] = useState(false)

  // Initialize states once
  const [fechasBloqueadas, setFechasBloqueadas] = useState<string[]>([])
  const [fechasCompletas, setFechasCompletas] = useState<FechaBloqueada[]>([])
  const [cargando, setCargando] = useState(true)
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null)
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear())
  const [numeroInvitados, setNumeroInvitados] = useState<number>(50)
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>("")
  const [fechaConsultada, setFechaConsultada] = useState<Date | null>(null)
  const [resultadoConsulta, setResultadoConsulta] = useState<{
    disponible: boolean
    mensaje: string
    precio?: {
      precio: number
      horaExtra: number
      esFinDeSemana: boolean
      descuento: boolean
    }
  } | null>(null)
  const [condicionesAbiertas, setCondicionesAbiertas] = useState(false)
  const [incluyeAbierto, setIncluyeAbierto] = useState(false)
  const [cortesiasAbiertas, setCortesiasAbiertas] = useState(false)
  const [terminosAceptados, setTerminosAceptados] = useState(false)

  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validarTelefono = (telefono: string): boolean => {
    const soloNumeros = telefono.replace(/\D/g, "")
    return soloNumeros.length >= 10
  }

  const handleRegistrarPlanner = async () => {
    const nuevosErrores: { email?: string; telefono?: string; nombre?: string } = {}

    if (!datosPlanner.nombre.trim()) {
      nuevosErrores.nombre = "Por favor ingresa tu nombre"
    }

    if (!datosPlanner.email.trim()) {
      nuevosErrores.email = "Por favor ingresa tu correo electrónico"
    } else if (!validarEmail(datosPlanner.email)) {
      nuevosErrores.email = "Por favor ingresa un correo electrónico válido"
    }

    if (!datosPlanner.telefono.trim()) {
      nuevosErrores.telefono = "Por favor ingresa tu número de WhatsApp"
    } else if (!validarTelefono(datosPlanner.telefono)) {
      nuevosErrores.telefono = "El número debe tener al menos 10 dígitos"
    }

    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length === 0) {
      setGuardandoPlanner(true)
      try {
        const supabase = createBrowserClient()
        const telefonoCompleto = `${datosPlanner.countryCode} ${datosPlanner.telefono}`

        // Verificar si el planner ya existe por email
        const { data: existingPlanner } = await supabase
          .from("planners")
          .select("id")
          .eq("email", datosPlanner.email.toLowerCase())
          .single()

        if (existingPlanner) {
          // Actualizar datos del planner existente
          const { error: updateError } = await supabase
            .from("planners")
            .update({
              nombre: datosPlanner.nombre,
              telefono: telefonoCompleto,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingPlanner.id)

          if (updateError) throw updateError
          setPlannerId(existingPlanner.id)
        } else {
          // Crear nuevo planner
          const { data: newPlanner, error: insertError } = await supabase
            .from("planners")
            .insert({
              nombre: datosPlanner.nombre,
              email: datosPlanner.email.toLowerCase(),
              telefono: telefonoCompleto,
            })
            .select("id")
            .single()

          if (insertError) throw insertError
          if (newPlanner) setPlannerId(newPlanner.id)
        }

        setPlannerRegistrado(true)
      } catch (error) {
        console.error("Error guardando planner:", error)
        // Aun así permitir continuar si hay error de BD
        setPlannerRegistrado(true)
      } finally {
        setGuardandoPlanner(false)
      }
    }
  }

  const mesesDisponibles = [
    { numero: 1, nombre: "Enero" },
    { numero: 6, nombre: "Junio" },
    { numero: 7, nombre: "Julio" },
    { numero: 8, nombre: "Agosto" },
    { numero: 9, nombre: "Septiembre" },
    { numero: 12, nombre: "Diciembre" },
  ]

  const tablaPreciosBase = [
    { personas: 50, precio: 109000 },
    { personas: 100, precio: 139000 },
    { personas: 150, precio: 169000 },
    { personas: 200, precio: 179000 },
    { personas: 250, precio: 189000 },
    { personas: 300, precio: 199000 },
    { personas: 350, precio: 209000 },
    { personas: 400, precio: 219000 },
  ]

  const tablaPreciosConHoraExtra = [
    { personas: 50, precio: 109000, horaExtra: 7700 },
    { personas: 100, precio: 139000, horaExtra: 8200 },
    { personas: 150, precio: 169000, horaExtra: 8900 },
    { personas: 200, precio: 179000, horaExtra: 9400 },
    { personas: 250, precio: 189000, horaExtra: 10500 },
    { personas: 300, precio: 199000, horaExtra: 11500 },
    { personas: 350, precio: 209000, horaExtra: 12900 },
    { personas: 400, precio: 219000, horaExtra: 13500 },
  ]

  const calcularPrecioInstalaciones = (fecha: Date, numInvitados: number) => {
    const precioInfo = tablaPreciosConHoraExtra.find((t) => t.personas === numInvitados)
    if (!precioInfo) return null

    const diaSemana = fecha.getDay()
    const esFinDeSemana = diaSemana === 5 || diaSemana === 6

    const precioFinal = esFinDeSemana ? precioInfo.precio : Math.round(precioInfo.precio * 0.9)
    const horaExtraFinal = esFinDeSemana ? precioInfo.horaExtra : Math.round(precioInfo.horaExtra * 0.9)

    return {
      precio: precioFinal,
      horaExtra: horaExtraFinal,
      esFinDeSemana,
      descuento: !esFinDeSemana,
    }
  }

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  useEffect(() => {
    const cargarFechasBloqueadas = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: fechas, error } = await supabase
          .from("blocked_dates")
          .select("*")
          .order("date", { ascending: true })

        if (error) {
          console.error("Error cargando fechas bloqueadas:", error)
          return
        }

        if (fechas) {
          setFechasCompletas(fechas)

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
        console.error("Error al cargar fechas bloqueadas:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarFechasBloqueadas()
  }, [])

  const años = [2026, 2027]

  const consultarDisponibilidad = async () => {
    if (!mesSeleccionado || !diaSeleccionado || !añoSeleccionado) {
      return
    }

    const dia = Number.parseInt(diaSeleccionado)
    if (isNaN(dia) || dia < 1 || dia > 31) {
      setResultadoConsulta({
        disponible: false,
        mensaje: "Por favor ingresen un día válido (1-31)",
      })
      return
    }

    const fecha = new Date(añoSeleccionado, mesSeleccionado - 1, dia)
    if (fecha.getMonth() !== mesSeleccionado - 1) {
      setResultadoConsulta({
        disponible: false,
        mensaje: "El mes seleccionado no tiene " + dia + " días",
      })
      return
    }

    setFechaConsultada(fecha)

    const fechaStr = fecha.toISOString().split("T")[0]
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    if (fecha < hoy) {
      setResultadoConsulta({
        disponible: false,
        mensaje: "La fecha ya pasó. Por favor seleccionen una fecha futura.",
      })
      return
    }

    const estaDisponible = !fechasBloqueadas.includes(fechaStr)

    // Registrar la consulta en la base de datos
    if (plannerId) {
      try {
        const supabase = createBrowserClient()
        await supabase
          .from("planners")
          .update({
            ultima_consulta: new Date().toISOString(),
            consultas_count: supabase.rpc ? undefined : 1, // Incrementar contador si es posible
          })
          .eq("id", plannerId)

        // Intentar incrementar el contador de consultas
        await supabase.rpc("increment_planner_consultas", { planner_id: plannerId }).catch(() => {
          // Si la función RPC no existe, ignorar
        })
      } catch (error) {
        console.error("Error registrando consulta:", error)
      }
    }

    if (estaDisponible) {
      const precioCalculado = calcularPrecioInstalaciones(fecha, numeroInvitados)
      if (!precioCalculado) return

      setResultadoConsulta({
        disponible: true,
        mensaje: "¡Fecha disponible! Pueden continuar con la reservación.",
        precio: precioCalculado,
      })
    } else {
      const esFechaBloqueadaOriginal = fechasCompletas.some((f) => f.date === fechaStr)
      if (esFechaBloqueadaOriginal) {
        setResultadoConsulta({
          disponible: false,
          mensaje: "Esta fecha ya tiene un evento confirmado.",
        })
      } else {
        setResultadoConsulta({
          disponible: false,
          mensaje: "Esta fecha se encuentra en periodo de separación (6 días antes o 1 día después de un evento).",
        })
      }
    }
  }

  const descargarReglamento = () => {
    window.open("/api/generar-reglamento-pdf", "_blank")
  }

  const renderFormularioPlanner = () => {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <User className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
          <h2 className="font-serif text-3xl font-light mb-4">Datos del Planner</h2>
          <p className="text-sm text-muted-foreground">
            Antes de consultar disponibilidad, necesitamos algunos datos de contacto
          </p>
        </div>

        <div className="space-y-8">
          {/* Nombre */}
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">
              Nombre del Planner
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={datosPlanner.nombre}
                onChange={(e) => {
                  setDatosPlanner({ ...datosPlanner, nombre: e.target.value })
                  if (errores.nombre) setErrores({ ...errores, nombre: undefined })
                }}
                placeholder="Tu nombre completo"
                className={`w-full pl-12 pr-4 py-4 border bg-transparent font-light transition-colors ${
                  errores.nombre ? "border-red-500" : "border-border focus:border-foreground"
                }`}
              />
            </div>
            {errores.nombre && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errores.nombre}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={datosPlanner.email}
                onChange={(e) => {
                  setDatosPlanner({ ...datosPlanner, email: e.target.value })
                  if (errores.email) setErrores({ ...errores, email: undefined })
                }}
                placeholder="correo@ejemplo.com"
                className={`w-full pl-12 pr-4 py-4 border bg-transparent font-light transition-colors ${
                  errores.email ? "border-red-500" : "border-border focus:border-foreground"
                }`}
              />
            </div>
            {errores.email && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errores.email}
              </p>
            )}
          </div>

          {/* WhatsApp con selector de país */}
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">WhatsApp</label>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={datosPlanner.countryCode}
                  onChange={(e) => setDatosPlanner({ ...datosPlanner, countryCode: e.target.value })}
                  className="appearance-none w-28 sm:w-32 px-3 py-4 border border-border bg-transparent font-light cursor-pointer focus:border-foreground transition-colors"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={datosPlanner.telefono}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d\s-]/g, "")
                    setDatosPlanner({ ...datosPlanner, telefono: valor })
                    if (errores.telefono) setErrores({ ...errores, telefono: undefined })
                  }}
                  placeholder="33 1234 5678"
                  className={`w-full pl-12 pr-4 py-4 border bg-transparent font-light transition-colors ${
                    errores.telefono ? "border-red-500" : "border-border focus:border-foreground"
                  }`}
                />
              </div>
            </div>
            {errores.telefono && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errores.telefono}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Selecciona tu código de país y escribe el número sin el código
            </p>
          </div>

          {/* Botón continuar */}
          <button
            onClick={handleRegistrarPlanner}
            className="w-full px-8 py-5 border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-all text-sm tracking-widest uppercase font-semibold"
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  const renderMesNoSeleccionado = () => {
    return (
      <div className="text-center py-32 border border-border">
        <Calendar className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
        <p className="font-serif text-2xl font-light mb-2">Seleccionen un mes para consultar disponibilidad</p>
        <p className="text-sm text-muted-foreground">
          Solo se muestran los meses disponibles para eventos con planners
        </p>
      </div>
    )
  }

  const renderNoDisponible = () => {
    if (!resultadoConsulta) return null
    return (
      <div className="bg-destructive/5 border border-destructive/20 p-8 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
        <p className="font-serif text-2xl font-light mb-4 text-destructive">No Disponible</p>
        <p className="text-sm text-muted-foreground">{resultadoConsulta.mensaje}</p>
      </div>
    )
  }

  const renderDisponible = () => {
    if (!resultadoConsulta || !fechaConsultada) return null
    return (
      <div className="bg-green-500/5 border border-green-500/20 p-8 text-center">
        <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <p className="font-serif text-2xl font-light mb-4 text-green-600">{resultadoConsulta.mensaje}</p>
        <p className="text-sm text-muted-foreground mb-6">
          {fechaConsultada.toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="bg-foreground/5 border border-foreground/20 p-6 mt-6">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Renta de instalaciones</p>
          <p className="font-serif text-4xl font-light mb-1">
            {formatearPrecio(resultadoConsulta.precio?.precio || 0)}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Hora extra: {formatearPrecio(resultadoConsulta.precio?.horaExtra || 0)}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
            <span className="text-muted-foreground">{numeroInvitados} personas</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {resultadoConsulta.precio?.esFinDeSemana ? "Viernes o Sábado" : "Entre semana"}
            </span>
          </div>
          {resultadoConsulta.precio?.descuento && (
            <div className="mt-4 pt-4 border-t border-foreground/10">
              <p className="text-sm text-green-600">✓ Precio con 10% de descuento aplicado (día entre semana)</p>
            </div>
          )}
        </div>

        <div className="bg-foreground/5 border border-foreground/20 p-4 mt-4 text-left">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Planner</p>
          <p className="font-semibold">{datosPlanner.nombre}</p>
          <p className="text-sm text-muted-foreground">{datosPlanner.email}</p>
          <p className="text-sm text-muted-foreground">
            {datosPlanner.countryCode} {datosPlanner.telefono}
          </p>
        </div>

        <div className="mt-8 space-y-4 text-left">
          <div className="border border-border">
            <button
              onClick={() => setIncluyeAbierto(!incluyeAbierto)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors"
            >
              <span className="text-xs tracking-widest uppercase font-semibold">La renta incluye</span>
              {incluyeAbierto ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {incluyeAbierto && (
              <div className="px-6 pb-6 space-y-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">INCLUYE</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 6 Horas de renta de las instalaciones de El Romeral.</li>
                    <li>• Toldo panorámico blanco o negro a partir de 101 invitados.</li>
                    <li>• Planta de luz Para garantizar el uso de las áreas generales de El Romeral.</li>
                    <li>• Estacionamiento Bardeado e iluminado para 250 autos.</li>
                    <li>• Personal de valet en sanitarios y valet parking.</li>
                    <li>• Personal de seguridad.</li>
                    <li className="text-xs italic mt-2">*Domingo en puente se toma a precio de sábado</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="border border-border">
            <button
              onClick={() => setCortesiasAbiertas(!cortesiasAbiertas)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors"
            >
              <span className="text-xs tracking-widest uppercase font-semibold">Cortesías</span>
              {cortesiasAbiertas ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {cortesiasAbiertas && (
              <div className="px-6 pb-6 space-y-2 text-sm text-muted-foreground">
                <p>
                  • <strong>Bride room.</strong> Disponible durante las horas del evento.
                </p>
                <p>
                  • <strong>Fogata decorativa en el lago.</strong> Ideal para iluminar su camino hacia la recepción.
                </p>
                <p>
                  • <strong>Valet parking.</strong>
                </p>
              </div>
            )}
          </div>

          <div className="border border-border">
            <button
              onClick={() => setCondicionesAbiertas(!condicionesAbiertas)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors"
            >
              <span className="text-xs tracking-widest uppercase font-semibold">Condiciones comerciales</span>
              {condicionesAbiertas ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {condicionesAbiertas && (
              <div className="px-6 pb-6 space-y-2 text-sm text-muted-foreground">
                <p>• Bloqueo de fecha con el 50% de anticipo.</p>
                <p>• 50% del finiquito 2 meses previos a la fecha de su evento.</p>
                <p>• Pagos extemporáneos se les aplicará el 10% por pago tardío.</p>
                <p>
                  • CAMBIOS DE FECHA aplica únicamente cuando por disposición gubernamental no se puedan realizar
                  eventos, el evento se programará a la próxima fecha disponible dentro de los 365 días a la fecha del
                  evento previamente pactado.
                </p>
                <p>
                  • Cancelaciones entre 1 día 180 días previos al evento deberá liquidar en su totalidad el precio
                  pactado por concepto de daños y perjuicios.
                </p>
                <p>
                  • Cancelaciones mayores a 181 días previos al evento se retendrá el 50% del precio pactado concepto de
                  daños y perjuicios.
                </p>
                <p>• No incluye I.V.A.</p>
                <p>
                  • Depósito en garantía, en efectivo un mes antes del evento el cual se regresará 8 días posteriores al
                  evento.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-border space-y-6">
            <button
              onClick={descargarReglamento}
              className="w-full px-8 py-4 border-2 border-foreground/30 hover:border-foreground hover:bg-foreground/5 flex items-center justify-center gap-3 transition-all"
            >
              <Download className="w-5 h-5" />
              <span className="text-sm tracking-widest uppercase font-semibold">Descargar Reglamento</span>
            </button>

            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={terminosAceptados}
                onChange={(e) => setTerminosAceptados(e.target.checked)}
                className="mt-1 w-5 h-5 border-2 border-foreground/30 rounded-sm checked:bg-foreground checked:border-foreground cursor-pointer transition-all"
              />
              <span className="text-sm leading-relaxed group-hover:text-foreground transition-colors">
                Confirmo que he leído las{" "}
                <button type="button" onClick={() => setCondicionesAbiertas(true)} className="underline font-semibold">
                  condiciones comerciales
                </button>{" "}
                y{" "}
                <button type="button" onClick={descargarReglamento} className="underline font-semibold">
                  reglamento
                </button>{" "}
                de El Romeral.
              </span>
            </label>

            <Link
              href="/configurador"
              className={`w-full px-8 py-5 border-2 flex items-center justify-center gap-3 transition-all text-center ${
                terminosAceptados
                  ? "border-foreground bg-foreground text-background hover:bg-background hover:text-foreground"
                  : "border-foreground/20 bg-foreground/5 text-foreground/30 cursor-not-allowed pointer-events-none"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm tracking-widest uppercase font-semibold">Agendar Visita</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">Portal Planners</h1>
            <p className="text-sm text-muted-foreground">Consulta disponibilidad en tiempo real</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs tracking-widest uppercase border border-border px-4 py-3 hover:border-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {cargando ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">Cargando disponibilidad...</p>
            </div>
          </div>
        ) : !plannerRegistrado ? (
          renderFormularioPlanner()
        ) : (
          <div>
            <div className="mb-8 p-4 bg-green-500/5 border border-green-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-green-600" />
                <span className="text-sm">
                  <strong>{datosPlanner.nombre}</strong> · {datosPlanner.email}
                </span>
              </div>
              <button
                onClick={() => setPlannerRegistrado(false)}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Cambiar datos
              </button>
            </div>

            <div className="mb-12">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Paso 1: Número de invitados
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {tablaPreciosBase.map((opcion) => (
                  <button
                    key={opcion.personas}
                    onClick={() => setNumeroInvitados(opcion.personas)}
                    className={`p-4 border transition-all duration-300 text-center ${
                      numeroInvitados === opcion.personas
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <span className="font-serif text-xl font-light">{opcion.personas}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-4">
                Paso 2: Seleccionen el año
              </label>
              <div className="flex gap-4">
                {años.map((año) => (
                  <button
                    key={año}
                    onClick={() => {
                      setAñoSeleccionado(año)
                      setMesSeleccionado(null)
                      setDiaSeleccionado("")
                      setResultadoConsulta(null)
                      setFechaConsultada(null)
                    }}
                    className={`px-8 py-4 border transition-all duration-300 ${
                      añoSeleccionado === año
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <span className="font-serif text-2xl font-light">{año}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-4">
                Paso 3: Seleccionen el mes disponible
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {mesesDisponibles.map((mes) => (
                  <button
                    key={mes.numero}
                    onClick={() => {
                      setMesSeleccionado(mes.numero)
                      setDiaSeleccionado("")
                      setResultadoConsulta(null)
                      setFechaConsultada(null)
                    }}
                    className={`px-6 py-4 border transition-all duration-300 ${
                      mesSeleccionado === mes.numero
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <span className="font-serif text-lg font-light">{mes.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {mesSeleccionado ? (
              <div className="mb-12">
                <label className="text-[10px] tracking-widest uppercase text-muted-foreground block mb-4">
                  Paso 4: Ingresen el día
                </label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 max-w-xs">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={diaSeleccionado}
                      onChange={(e) => {
                        setDiaSeleccionado(e.target.value)
                        setResultadoConsulta(null)
                        setFechaConsultada(null)
                      }}
                      placeholder="Día (1-31)"
                      className="w-full px-6 py-4 border border-border bg-transparent font-serif text-xl font-light text-center focus:border-foreground transition-colors"
                    />
                  </div>
                  <button
                    onClick={consultarDisponibilidad}
                    disabled={!diaSeleccionado}
                    className={`px-8 py-4 border transition-all duration-300 ${
                      diaSeleccionado
                        ? "border-foreground bg-foreground text-background hover:bg-background hover:text-foreground"
                        : "border-border text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    <span className="text-sm tracking-widest uppercase">Consultar</span>
                  </button>
                </div>

                <div className="mt-8">
                  {resultadoConsulta ? (
                    resultadoConsulta.disponible ? (
                      renderDisponible()
                    ) : (
                      renderNoDisponible()
                    )
                  ) : (
                    <div className="text-center py-16 border border-border">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Ingresen un día y presionen &quot;Consultar&quot; para verificar disponibilidad
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              renderMesNoSeleccionado()
            )}
          </div>
        )}
      </div>
    </div>
  )
}
