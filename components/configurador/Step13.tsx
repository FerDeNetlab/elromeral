"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Download,
  MessageCircle,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  LinkIcon,
  Loader2,
  Heart,
  Users,
  Utensils,
  Wine,
  Armchair,
  Flower2,
  Tent,
  Music,
  Circle,
  Church,
  Sparkles,
  Pencil,
  Minus,
  Plus,
  Gift,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import type { ConfiguradorData } from "@/app/configurador/types"
import {
  TABULADOR_INSTALACIONES,
  PRECIOS_COMIDA,
  PRECIO_VINOS_LICORES,
  PRECIOS_MESAS,
  PRECIOS_ARREGLOS_FLORALES,
  PRECIO_TOLDO_ALEMAN,
  PRECIO_TOLDO_PERSONALIZADO,
  COSTOS_DJ,
  PRECIO_PLANTA_LUZ,
  PRECIO_PISTA_ILUMINADA,
  PRECIOS_PISTA_PINTADA,
  PRECIO_CAPILLA,
  EXTRAS_CATEGORIAS,
  PRECIO_MESA_NOVIOS,
} from "@/app/configurador/constants"
import React from "react"

interface Step13Props {
  data: ConfiguradorData
  onGoToStep?: (step: number) => void
  onCambiarInvitados?: (nuevoNumero: number) => void
  onNuevaCotizacion?: () => void
}

export default function Step13({ data, onGoToStep, onCambiarInvitados, onNuevaCotizacion }: Step13Props) {
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [slug, setSlug] = useState("")
  const [error, setError] = useState("")
  const [copiado, setCopiado] = useState(false)
  const [editandoInvitados, setEditandoInvitados] = useState(false)
  const [invitadosTemp, setInvitadosTemp] = useState(data.numInvitados)
  const [showServiciosExternos, setShowServiciosExternos] = useState(false)
  const [showServiciosExternosDireccion, setShowServiciosExternosDireccion] = useState(false)
  const [showDireccionDetalle, setShowDireccionDetalle] = React.useState(false) // Moved state to top level
  const [showCondiciones, setShowCondiciones] = useState(false)
  const [checkVision, setCheckVision] = useState(false)
  const [checkPresupuesto, setCheckPresupuesto] = useState(false)
  const todosChecksMarcados = checkVision && checkPresupuesto

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const precioInstalaciones = useMemo(() => {
    const invitados = data.numInvitados || 0
    const entrada = TABULADOR_INSTALACIONES.find((t) => invitados >= t.min && invitados <= t.max)
    return entrada?.precio || 0
  }, [data.numInvitados])

  const precioComida = useMemo(() => {
    const invitados = data.numInvitados || 0
    if (data.tipoComida === "menu3tiempos") {
      return invitados * PRECIOS_COMIDA.tresTiempos
    } else if (data.tipoComida === "parrillada") {
      return invitados * PRECIOS_COMIDA.parrillada
    }
    return 0
  }, [data.numInvitados, data.tipoComida])

  const precioBebidas = useMemo(() => {
    if (data.incluyeVinosLicores) {
      return (data.numInvitados || 0) * PRECIO_VINOS_LICORES
    }
    return 0
  }, [data.numInvitados, data.incluyeVinosLicores])

  const precioMesas = useMemo(() => {
    if (!data.mesasSeleccionadas) return 0
    let total = 0
    const mesas = data.mesasSeleccionadas

    if (mesas.default > 0) total += PRECIOS_MESAS.default * mesas.default
    if (mesas.shabbyChic > 0) total += PRECIOS_MESAS.shabbyChic * mesas.shabbyChic
    if (mesas.marmol > 0) total += PRECIOS_MESAS.marmol * mesas.marmol
    if (mesas.reyArturo > 0) total += PRECIOS_MESAS.reyArturo * mesas.reyArturo
    if (mesas.cristal > 0) total += PRECIOS_MESAS.cristal * mesas.cristal
    if (mesas.parota > 0) total += PRECIOS_MESAS.parota * mesas.parota

    return total
  }, [data.mesasSeleccionadas])

  const precioMesaNovios = useMemo(() => {
    if (data.incluyeMesaNovios) return PRECIO_MESA_NOVIOS
    return 0
  }, [data.incluyeMesaNovios])

  const precioFlores = useMemo(() => {
    if (!data.arreglosFlorales || !Array.isArray(data.arreglosFlorales)) return 0
    let total = 0
    for (const arreglo of data.arreglosFlorales) {
      if (arreglo.rango) {
        const precio = PRECIOS_ARREGLOS_FLORALES[arreglo.rango as keyof typeof PRECIOS_ARREGLOS_FLORALES] || 0
        total += precio
      }
    }
    return total
  }, [data.arreglosFlorales])

  const precioToldo = useMemo(() => {
    if (data.tipoToldo === "aleman") return PRECIO_TOLDO_ALEMAN
    if (data.tipoToldo === "personalizado") return PRECIO_TOLDO_PERSONALIZADO
    return 0
  }, [data.tipoToldo])

  const precioMusica = useMemo(() => {
    if (data.tipoMusica === "dj") {
      let total = COSTOS_DJ.grupoReset + COSTOS_DJ.equipoSonido + COSTOS_DJ.cabinaDJ
      if (data.tipoEvento === "cena") {
        total += COSTOS_DJ.iluminacionArquitectonica + COSTOS_DJ.lucesRoboticas
      }
      return total
    } else if (data.tipoMusica === "grupo") {
      return PRECIO_PLANTA_LUZ
    }
    return 0
  }, [data.tipoMusica, data.tipoEvento])

  const precioPista = useMemo(() => {
    if (data.tipoPista === "iluminada") return PRECIO_PISTA_ILUMINADA
    if (data.tipoPista === "pintada") {
      const invitados = data.numInvitados || 0
      const entrada = PRECIOS_PISTA_PINTADA.find((p) => invitados >= p.min && invitados <= p.max)
      return entrada?.precio || 0
    }
    return 0
  }, [data.tipoPista, data.numInvitados])

  const precioCapilla = useMemo(() => {
    if (data.incluyeCapilla) return PRECIO_CAPILLA
    return 0
  }, [data.incluyeCapilla])

  const precioExtras = useMemo(() => {
    if (!data.extrasSeleccionados || data.extrasSeleccionados.length === 0) {
      return 0
    }
    let total = 0
    const invitados = data.numInvitados || 0

    for (const categoria of Object.values(EXTRAS_CATEGORIAS)) {
      for (const extra of categoria.items) {
        if (data.extrasSeleccionados.includes(extra.id)) {
          const precioExtra = extra.porPersona ? extra.precio * invitados : extra.precio
          total += precioExtra
        }
      }
    }

    return total
  }, [data.extrasSeleccionados, data.numInvitados])

  const total = useMemo(() => {
    return (
      precioInstalaciones +
      precioComida +
      precioBebidas +
      precioMesas +
      precioMesaNovios +
      precioFlores +
      precioToldo +
      precioMusica +
      precioPista +
      precioCapilla +
      precioExtras
    )
  }, [
    precioInstalaciones,
    precioComida,
    precioBebidas,
    precioMesas,
    precioMesaNovios,
    precioFlores,
    precioToldo,
    precioMusica,
    precioPista,
    precioCapilla,
    precioExtras,
  ])

  const generarPartidasDetalle = useCallback(() => {
    const partidas: Array<{
      categoria: string
      items: Array<{
        descripcion: string
        cantidad: number
        precioUnitario: number
        total: number
      }>
    }> = []

    // Instalaciones
    if (precioInstalaciones > 0) {
      partidas.push({
        categoria: "Instalaciones",
        items: [
          {
            descripcion: `Renta de instalaciones para ${data.numInvitados} invitados`,
            cantidad: 1,
            precioUnitario: precioInstalaciones,
            total: precioInstalaciones,
          },
        ],
      })
    }

    // Comida
    if (precioComida > 0) {
      const precioUnitario = data.tipoComida === "menu3tiempos" ? PRECIOS_COMIDA.tresTiempos : PRECIOS_COMIDA.parrillada
      partidas.push({
        categoria: "Alimentos",
        items: [
          {
            descripcion: data.tipoComida === "menu3tiempos" ? "Menú 3 Tiempos" : "Parrillada Argentina Premium",
            cantidad: data.numInvitados || 0,
            precioUnitario,
            total: precioComida,
          },
        ],
      })
    }

    // Bebidas
    if (precioBebidas > 0) {
      partidas.push({
        categoria: "Bebidas",
        items: [
          {
            descripcion: "Barra de Vinos y Licores Premium",
            cantidad: data.numInvitados || 0,
            precioUnitario: PRECIO_VINOS_LICORES,
            total: precioBebidas,
          },
        ],
      })
    }

    // Mobiliario
    if (precioMesas > 0 && data.mesasSeleccionadas) {
      const items: Array<{ descripcion: string; cantidad: number; precioUnitario: number; total: number }> = []
      const mesas = data.mesasSeleccionadas

      if (mesas.default > 0)
        items.push({
          descripcion: "Mesa Default",
          cantidad: mesas.default,
          precioUnitario: PRECIOS_MESAS.default,
          total: PRECIOS_MESAS.default * mesas.default,
        })
      if (mesas.shabbyChic > 0)
        items.push({
          descripcion: "Mesa Shabby Chic",
          cantidad: mesas.shabbyChic,
          precioUnitario: PRECIOS_MESAS.shabbyChic,
          total: PRECIOS_MESAS.shabbyChic * mesas.shabbyChic,
        })
      if (mesas.marmol > 0)
        items.push({
          descripcion: "Mesa Mármol",
          cantidad: mesas.marmol,
          precioUnitario: PRECIOS_MESAS.marmol,
          total: PRECIOS_MESAS.marmol * mesas.marmol,
        })
      if (mesas.reyArturo > 0)
        items.push({
          descripcion: "Mesa Rey Arturo",
          cantidad: mesas.reyArturo,
          precioUnitario: PRECIOS_MESAS.reyArturo,
          total: PRECIOS_MESAS.reyArturo * mesas.reyArturo,
        })
      if (mesas.cristal > 0)
        items.push({
          descripcion: "Mesa Cristal",
          cantidad: mesas.cristal,
          precioUnitario: PRECIOS_MESAS.cristal,
          total: PRECIOS_MESAS.cristal * mesas.cristal,
        })
      if (mesas.parota > 0)
        items.push({
          descripcion: "Mesa Parota",
          cantidad: mesas.parota,
          precioUnitario: PRECIOS_MESAS.parota,
          total: PRECIOS_MESAS.parota * mesas.parota,
        })

      if (items.length > 0) {
        partidas.push({ categoria: "Mobiliario", items })
      }
    }

    // Mesa de Novios
    if (precioMesaNovios > 0) {
      partidas.push({
        categoria: "Mobiliario",
        items: [
          {
            descripcion: "Mesa de Novios (con tarima y decoración)",
            cantidad: 1,
            precioUnitario: precioMesaNovios,
            total: precioMesaNovios,
          },
        ],
      })
    }

    // Flores
    if (precioFlores > 0 && data.arreglosFlorales && Array.isArray(data.arreglosFlorales)) {
      const conteoFlores: Record<string, { cantidad: number; precio: number }> = {}
      for (const arreglo of data.arreglosFlorales) {
        if (arreglo.rango) {
          const precio = PRECIOS_ARREGLOS_FLORALES[arreglo.rango as keyof typeof PRECIOS_ARREGLOS_FLORALES] || 0
          if (!conteoFlores[arreglo.rango]) {
            conteoFlores[arreglo.rango] = { cantidad: 0, precio }
          }
          conteoFlores[arreglo.rango].cantidad++
        }
      }

      const items = Object.entries(conteoFlores).map(([rango, { cantidad, precio }]) => ({
        descripcion: `Arreglo Floral ${rango}`,
        cantidad,
        precioUnitario: precio,
        total: precio * cantidad,
      }))

      if (items.length > 0) {
        partidas.push({ categoria: "Florales", items })
      }
    }

    // Toldo
    if (precioToldo > 0) {
      partidas.push({
        categoria: "Estructura",
        items: [
          {
            descripcion: data.tipoToldo === "aleman" ? "Toldo Alemán" : "Toldo Personalizado",
            cantidad: 1,
            precioUnitario: precioToldo,
            total: precioToldo,
          },
        ],
      })
    }

    // Música
    if (precioMusica > 0) {
      if (data.tipoMusica === "dj") {
        const items = [
          {
            descripcion: "DJ Romeral (5 horas)",
            cantidad: 1,
            precioUnitario: COSTOS_DJ.grupoReset,
            total: COSTOS_DJ.grupoReset,
          },
          {
            descripcion: "Equipo de Sonido Bose Romeral",
            cantidad: 1,
            precioUnitario: COSTOS_DJ.equipoSonido,
            total: COSTOS_DJ.equipoSonido,
          },
          {
            descripcion: "Cabina DJ con subwoofers y bocinas perimetrales",
            cantidad: 1,
            precioUnitario: COSTOS_DJ.cabinaDJ,
            total: COSTOS_DJ.cabinaDJ,
          },
        ]

        if (data.tipoEvento === "cena") {
          items.push(
            {
              descripcion: "Iluminación Arquitectónica de Jardines",
              cantidad: 1,
              precioUnitario: COSTOS_DJ.iluminacionArquitectonica,
              total: COSTOS_DJ.iluminacionArquitectonica,
            },
            {
              descripcion: "8 Luces Robóticas y 4 Par LED DJ Light",
              cantidad: 1,
              precioUnitario: COSTOS_DJ.lucesRoboticas,
              total: COSTOS_DJ.lucesRoboticas,
            },
          )
        }

        partidas.push({ categoria: "Música y Audio", items })
      } else {
        partidas.push({
          categoria: "Música y Audio",
          items: [
            {
              descripcion: "Planta de Luz para Grupo Musical",
              cantidad: 1,
              precioUnitario: PRECIO_PLANTA_LUZ,
              total: PRECIO_PLANTA_LUZ,
            },
          ],
        })
      }
    }

    // Pista
    if (precioPista > 0) {
      partidas.push({
        categoria: "Pista de Baile",
        items: [
          {
            descripcion:
              data.tipoPista === "iluminada" ? "Pista Iluminada LED con Focos Edison" : "Pista Pintada a Mano",
            cantidad: 1,
            precioUnitario: precioPista,
            total: precioPista,
          },
        ],
      })
    }

    // Capilla
    if (precioCapilla > 0) {
      partidas.push({
        categoria: "Ceremonia Religiosa",
        items: [
          {
            descripcion: "Capilla Cristo del Romeral (Consagrada) con coordinación, coro y floristería",
            cantidad: 1,
            precioUnitario: precioCapilla,
            total: precioCapilla,
          },
        ],
      })
    }

    // Extras
    if (precioExtras > 0 && data.extrasSeleccionados) {
      const items: Array<{ descripcion: string; cantidad: number; precioUnitario: number; total: number }> = []
      const invitados = data.numInvitados || 0

      for (const categoria of Object.values(EXTRAS_CATEGORIAS)) {
        for (const extra of categoria.items) {
          if (data.extrasSeleccionados.includes(extra.id)) {
            const cantidad = extra.porPersona ? invitados : 1
            const totalExtra = extra.porPersona ? extra.precio * invitados : extra.precio
            items.push({
              descripcion: extra.nombre,
              cantidad,
              precioUnitario: extra.precio,
              total: totalExtra,
            })
          }
        }
      }

      if (items.length > 0) {
        partidas.push({ categoria: "Extras y Servicios Adicionales", items })
      }
    }

    return partidas
  }, [
    data,
    precioInstalaciones,
    precioComida,
    precioBebidas,
    precioMesas,
    precioMesaNovios,
    precioFlores,
    precioToldo,
    precioMusica,
    precioPista,
    precioCapilla,
    precioExtras,
  ])

  const generarSlug = () => {
    const nombres =
      data.nombresNovios
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || "cotizacion"
    const fecha = data.fechaEvento?.replace(/-/g, "") || Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8)
    return `${nombres}-${fecha}-${random}`
  }

  const guardarCotizacion = async () => {
    setGuardando(true)
    setError("")

    try {
      const totalValidado = typeof total === "number" && !isNaN(total) && total > 0 ? total : 0

      if (totalValidado === 0) {
        throw new Error("No se pudo calcular el precio total de la cotización. Por favor revisa las selecciones.")
      }



      const nuevoSlug = slug || generarSlug()


      // Verificar si ya existe una cotización con este slug
      let existingQuote = null
      let shouldSendEmails = true

      if (slug) {

        const { data: existing } = await supabase
          .from("quotes")
          .select("email_sent, slug")
          .eq("slug", slug)
          .maybeSingle()

        if (existing) {
          existingQuote = existing
          shouldSendEmails = !existing.email_sent

        }
      }
      const partidasDetalle = generarPartidasDetalle()


      const quoteData = {
        slug: nuevoSlug,
        nombres: data.nombresNovios || "",
        email: data.email || "",
        telefono: data.telefono || "",
        fecha_evento: data.fechaEvento || null,
        num_invitados: data.numInvitados || 0,
        tipo_ceremonia: data.incluyeCapilla ? "capilla" : "civil",
        menu: data.tipoComida || "",
        barra: data.incluyeVinosLicores ? "premium" : "ninguna",
        decoracion: data.tipoToldo || "",
        servicios_adicionales: data.extrasSeleccionados || [],
        partidas_detalle: partidasDetalle,
        precio_total: totalValidado,
        configuracion_completa: data,
        is_complete: true,
        current_step: 13,
        status: "cotizacion_completa",
        email_sent: existingQuote?.email_sent || false,
      }

      let dbError = null

      if (existingQuote) {
        // Actualizar cotización existente

        const { error } = await supabase
          .from("quotes")
          .update(quoteData)
          .eq("slug", nuevoSlug)
        dbError = error
      } else {
        // Crear nueva cotización

        const { error } = await supabase
          .from("quotes")
          .insert(quoteData)
        dbError = error
      }

      if (dbError) {

        throw dbError
      }


      setSlug(nuevoSlug)
      setGuardado(true)

      // Solo enviar correos si no se han enviado antes
      if (shouldSendEmails) {


        try {

          await fetch("/api/send-quote-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: data.email,
              quoteName: data.nombresNovios || "Estimados novios",
              quoteSlug: nuevoSlug,
              quoteTotal: totalValidado,
              quoteDate: data.fechaEvento,
              numInvitados: data.numInvitados || 0,
            }),
          })

        } catch (emailError) {
          console.error("[v0] Error enviando correo al cliente:", emailError)
        }

        try {
          const detallesCotizacion = partidasDetalle.flatMap((p) =>
            p.items.map((item) => `${item.descripcion} - $${item.total.toLocaleString("es-MX")}`),
          )

          await fetch("/api/send-lead-alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombres: data.nombresNovios || "Sin nombre",
              email: data.email || "",
              telefono: data.telefono || "",
              fechaEvento: data.fechaEvento,
              numInvitados: data.numInvitados || 0,
              tipoEvento: data.tipoEvento,
              paso: 13,
              cotizacionCompleta: true,
              detallesCotizacion: detallesCotizacion,
              totalFormateado: `$${totalValidado.toLocaleString("es-MX")}`,
              slug: nuevoSlug,
            }),
          })

        } catch (alertError) {
          console.error("[v0] Error enviando alertas:", alertError)
        }
      } else {

      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(`Hubo un error al guardar la cotización: ${errorMessage}. Por favor intenta de nuevo.`)
    } finally {

      setGuardando(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    if (!fecha) return ""
    const date = new Date(fecha + "T00:00:00")
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDescripcionMesas = () => {
    if (!data.mesasSeleccionadas) return ""
    const mesas = data.mesasSeleccionadas
    const descripciones: string[] = []

    if (mesas.default > 0) descripciones.push(`${mesas.default} Default`)
    if (mesas.shabbyChic > 0) descripciones.push(`${mesas.shabbyChic} Shabby Chic`)
    if (mesas.marmol > 0) descripciones.push(`${mesas.marmol} Mármol`)
    if (mesas.reyArturo > 0) descripciones.push(`${mesas.reyArturo} Rey Arturo`)
    if (mesas.cristal > 0) descripciones.push(`${mesas.cristal} Cristal`)
    if (mesas.parota > 0) descripciones.push(`${mesas.parota} Parota`)

    return descripciones.join(", ")
  }

  const getDescripcionFlores = () => {
    if (!data.arreglosFlorales || data.arreglosFlorales.length === 0) return ""
    const conteo: Record<string, number> = {}

    for (const arreglo of data.arreglosFlorales) {
      if (arreglo.rango) {
        conteo[arreglo.rango] = (conteo[arreglo.rango] || 0) + 1
      }
    }

    // Convertir "rango1" -> "Rango 1", "rango2" -> "Rango 2", etc.
    return Object.entries(conteo)
      .map(([rango, cantidad]) => {
        const rangoFormateado = rango.replace(/rango(\d+)/i, "Rango $1")
        return `${cantidad} ${rangoFormateado}`
      })
      .join(", ")
  }

  const confirmarCambioInvitados = () => {
    if (onCambiarInvitados && invitadosTemp !== data.numInvitados) {
      onCambiarInvitados(invitadosTemp)
    }
    setEditandoInvitados(false)
  }

  const BotonEditar = ({ paso, label }: { paso: number; label: string }) => (
    <button
      onClick={() => {

        if (onGoToStep) {
          onGoToStep(paso)
        }
      }}
      className="flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
      title={`Editar ${label}`}
    >
      <Pencil className="w-3.5 h-3.5" />
      <span className="text-[10px] uppercase tracking-wider">Editar</span>
    </button>
  )



  useEffect(() => {
    // Solo ejecutar si no se ha guardado aún y no se está guardando
    if (!guardado && !guardando) {
      guardarCotizacion()
    }
  }, []) // Array vacío para ejecutar solo al montar

  useEffect(() => {
    setInvitadosTemp(data.numInvitados)
  }, [data.numInvitados])

  const copiarLink = () => {
    const url = `${window.location.origin}/cotizacion/${slug}`
    navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const descargarPDF = () => {
    window.open(`/api/generar-pdf?slug=${slug}`, "_blank")
  }

  const abrirWhatsApp = () => {
    const mensaje = encodeURIComponent(
      `Hola El Romeral! Me interesa la cotización para ${data.nombresNovios || "mi evento"}.\n\nFecha: ${formatearFecha(data.fechaEvento || "")}\nInvitados: ${data.numInvitados}\n\nEnlace: ${cotizacionUrl}`,
    )
    window.open(`http://wa.me/3338708159?text=${mensaje}`, "_blank")
  }

  const enviarCorreo = () => {
    const asunto = encodeURIComponent(`Cotización - ${data.nombresNovios || "Evento"}`)
    const cuerpo = encodeURIComponent(
      `Hola,\n\nMe interesa la cotización para mi evento.\n\nFecha: ${formatearFecha(data.fechaEvento || "")}\nInvitados: ${data.numInvitados}\n\nPueden consultar los detalles aquí: ${cotizacionUrl}\n\nSaludos`,
    )
    window.location.href = `mailto:eventos@elromeral.mx?subject=${asunto}&body=${cuerpo}`
  }

  const agendarCita = () => {
    window.open("https://cal.com/ricardo-heredia-jxuu3m/presencial", "_blank")
  }

  const agendarVideollamada = () => {
    window.open("https://cal.com/ricardo-heredia-jxuu3m/video-llamada", "_blank")
  }

  const cotizacionUrl = typeof window !== "undefined" ? `${window.location.origin}/cotizacion/${slug}` : ""

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {guardando && !guardado && (
        <div className="border border-border bg-muted p-12 text-center space-y-6">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <div>
            <h3 className="font-serif text-xl text-foreground mb-2">Preparando su experiencia</h3>
            <p className="text-muted-foreground text-sm">Generando su enlace personalizado...</p>
          </div>
        </div>
      )}

      {error && !guardando && (
        <div className="border border-destructive/20 bg-destructive/5 p-8 text-center space-y-6">
          <div className="text-destructive">{error}</div>
          <Button
            onClick={guardarCotizacion}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-sm tracking-[0.2em] uppercase rounded-none"
          >
            Reintentar
          </Button>
        </div>
      )}

      {guardado && (
        <>
          {/* Header con información de novios */}
          <div className="bg-neutral-50 p-8 md:p-12 border border-neutral-200">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <Heart className="w-8 h-8 text-neutral-400 mx-auto" />
              <h2 className="font-serif text-2xl md:text-3xl text-neutral-800">{data.nombresNovios || "Los Novios"}</h2>
              <div className="w-12 h-px bg-neutral-300 mx-auto" />
              <div className="space-y-2 text-neutral-600">
                <p className="text-lg">{formatearFecha(data.fechaEvento || "")}</p>
                <p className="text-sm tracking-wide uppercase">
                  {data.tipoEvento === "comida" ? "Evento de Comida" : "Evento de Cena"}
                </p>
                {editandoInvitados ? (
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <button
                      onClick={() => setInvitadosTemp(Math.max(50, invitadosTemp - 10))}
                      className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={invitadosTemp}
                      onChange={(e) =>
                        setInvitadosTemp(Math.max(50, Math.min(500, Number.parseInt(e.target.value) || 50)))
                      }
                      className="w-20 text-center border border-neutral-300 rounded px-2 py-1 text-lg font-light"
                      min={50}
                      max={500}
                    />
                    <button
                      onClick={() => setInvitadosTemp(Math.min(500, invitadosTemp + 10))}
                      className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={confirmarCambioInvitados}
                      className="ml-2 px-4 py-1.5 bg-neutral-900 text-white text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors"
                    >
                      Aplicar
                    </button>
                    <button
                      onClick={() => {
                        setInvitadosTemp(data.numInvitados)
                        setEditandoInvitados(false)
                      }}
                      className="px-3 py-1.5 border border-neutral-300 text-xs tracking-wider uppercase hover:bg-neutral-100 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditandoInvitados(true)}
                    className="text-sm flex items-center justify-center gap-2 mx-auto hover:text-neutral-900 transition-colors group"
                  >
                    <span>{data.numInvitados} invitados</span>
                    <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desglose de inversión */}
          <div className="space-y-8">
            <h3 className="font-serif text-xl text-neutral-800 text-center tracking-wide">Desglose de Inversión</h3>

            <div className="border border-neutral-200 divide-y divide-neutral-200">
              {/* Renta de Instalaciones - Paso 1 */}
              <div className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4 flex-1">
                    <Users className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-neutral-800">Renta de Instalaciones</p>
                      <p className="text-xs text-neutral-500">{data.numInvitados} invitados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-neutral-400">
                        <span className="line-through">${(precioInstalaciones + 20000).toLocaleString("es-MX")}</span>
                        <span className="ml-1 text-xs">Precio regular</span>
                      </p>
                      <p className="font-light text-neutral-800">${precioInstalaciones.toLocaleString("es-MX")}</p>
                    </div>
                    <BotonEditar paso={1} label="Instalaciones" />
                  </div>
                </div>

                {/* Nota y servicios externos para Renta */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    * Beneficio de $20,000 MXN aplicable al contratar todos los servicios seleccionados y adicionales
                    con El Romeral para su Boda. Esto garantiza la calidad del servicio y una coordinación efectiva
                    durante todo el proceso de su evento.
                  </p>

                  <button
                    onClick={() => setShowServiciosExternos(!showServiciosExternos)}
                    className="mt-2 text-xs text-primary flex items-center gap-1 hover:underline transition-all"
                  >
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-300 ${showServiciosExternos ? "rotate-180" : ""}`}
                    />
                    {showServiciosExternos ? "Ocultar" : "Ver"} servicios permitidos con externos
                  </button>

                  {showServiciosExternos && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded text-xs text-neutral-600 animate-in fade-in slide-in-from-top-2 duration-300">
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Vinos y licores</strong>{" "}
                            <em className="text-neutral-400">(en botella cerrada, no servicios de barras)</em>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Fotógrafo y video</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Mariachi</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Social DJ</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Souvenirs</strong>{" "}
                            <em className="text-neutral-400">(cilindros, pantuflas, etc.)</em>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Grupo musical</strong>{" "}
                            <em className="text-neutral-400">(planta de luz se renta con El Romeral)</em>
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Dirección Integral del Evento - Paso como concepto independiente */}
              <div className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <Gift className="w-5 h-5 text-neutral-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-neutral-800">Dirección Integral del Evento</p>
                        <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                          Cortesía
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        El Romeral no solo es un venue, contamos con todos los servicios in house para que su evento
                        fluya con orden y tranquilidad.
                      </p>

                      {/* Botón ver detalle */}
                      <button
                        onClick={() => setShowDireccionDetalle(!showDireccionDetalle)}
                        className="mt-2 text-xs text-primary flex items-center gap-1 hover:underline transition-all"
                      >
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-300 ${showDireccionDetalle ? "rotate-180" : ""}`}
                        />
                        {showDireccionDetalle ? "Ocultar detalle" : "Ver detalle"}
                      </button>

                      {showDireccionDetalle && (
                        <div className="mt-3 text-xs text-neutral-600 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Incluye:</p>
                          <ul className="space-y-1">
                            <li className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              Producción creativa del evento
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              Coordinación operativa (minuto a minuto)
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              Coordinación con fotógrafo, video, grupos musicales y DJ
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              Coordinación de vinos y licores en botella cerrada
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-400">
                      <span className="line-through">$40,500</span>
                      <span className="ml-1 text-xs">Valor real</span>
                    </p>
                    <p className="font-light text-primary">$0</p>
                  </div>
                </div>

                {/* Nota y servicios externos para Dirección Integral */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    * Esta cortesía es aplicable al contratar todos los servicios seleccionados y adicionales con El
                    Romeral para su Boda. Esto garantiza la calidad del servicio y una coordinación efectiva durante
                    todo el proceso de su evento.
                  </p>

                  <button
                    onClick={() => setShowServiciosExternosDireccion(!showServiciosExternosDireccion)}
                    className="mt-2 text-xs text-primary flex items-center gap-1 hover:underline transition-all"
                  >
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-300 ${showServiciosExternosDireccion ? "rotate-180" : ""}`}
                    />
                    {showServiciosExternosDireccion ? "Ocultar" : "Ver"} servicios permitidos con externos
                  </button>

                  {showServiciosExternosDireccion && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded text-xs text-neutral-600 animate-in fade-in slide-in-from-top-2 duration-300">
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Vinos y licores</strong>{" "}
                            <em className="text-neutral-400">(en botella cerrada, no servicios de barras)</em>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Fotógrafo y video</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Mariachi</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Social DJ</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Souvenirs</strong>{" "}
                            <em className="text-neutral-400">(cilindros, pantuflas, etc.)</em>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Grupo musical</strong>{" "}
                            <em className="text-neutral-400">(planta de luz se renta con El Romeral)</em>
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Menú - Paso 2 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Utensils className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">
                      {data.tipoComida === "menu3tiempos" ? "Menú 3 Tiempos" : "Parrillada Argentina"}
                    </p>
                    <p className="text-xs text-neutral-500">{data.numInvitados} personas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">${precioComida.toLocaleString("es-MX")}</span>
                  <BotonEditar paso={3} label="Menú" />
                </div>
              </div>

              {/* Vinos y Licores - Paso 3 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Wine className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">Vinos y Licores</p>
                    <p className="text-xs text-neutral-500">
                      {data.incluyeVinosLicores ? `${data.numInvitados} personas` : "No incluido"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">
                    {precioBebidas > 0 ? `$${precioBebidas.toLocaleString("es-MX")}` : "—"}
                  </span>
                  <BotonEditar paso={4} label="Bebidas" />
                </div>
              </div>

              {/* Mobiliario - Paso 4 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Armchair className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">Mobiliario</p>
                    <p className="text-xs text-neutral-500">{getDescripcionMesas() || "No configurado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">
                    {precioMesas > 0 ? `$${precioMesas.toLocaleString("es-MX")}` : "—"}
                  </span>
                  <BotonEditar paso={5} label="Mobiliario" />
                </div>
              </div>

              {/* Mesa de Novios - Paso 5 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Heart className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">Mesa de Novios</p>
                    <p className="text-xs text-neutral-500">
                      {data.incluyeMesaNovios ? "Con tarima y decoración" : "No incluida"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">
                    {precioMesaNovios > 0 ? `$${precioMesaNovios.toLocaleString("es-MX")}` : "—"}
                  </span>
                  <BotonEditar paso={6} label="Mesa de Novios" />
                </div>
              </div>

              {/* Arreglos Florales - Paso 6 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Flower2 className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">Arreglos Florales</p>
                    <p className="text-xs text-neutral-500">{getDescripcionFlores() || "No incluidos"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">
                    {precioFlores > 0 ? `$${precioFlores.toLocaleString("es-MX")}` : "—"}
                  </span>
                  <BotonEditar paso={7} label="Flores" />
                </div>
              </div>

              {/* Toldo - Paso 7 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Tent className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">Toldo</p>
                    <p className="text-xs text-neutral-500">
                      {data.tipoToldo === "aleman"
                        ? "Toldo Alemán"
                        : data.tipoToldo === "personalizado"
                          ? "Toldo Personalizado"
                          : "No incluido"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">
                    {precioToldo > 0 ? `$${precioToldo.toLocaleString("es-MX")}` : "—"}
                  </span>
                  <BotonEditar paso={8} label="Toldo" />
                </div>
              </div>

              {/* Música - Paso 9 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Music className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">Música y Sonido</p>
                    <p className="text-xs text-neutral-500">
                      {data.tipoMusica === "dj"
                        ? "DJ y Equipo de Sonido"
                        : data.tipoMusica === "grupo"
                          ? "Planta de Luz"
                          : "No incluido"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">
                    {precioMusica > 0 ? `$${precioMusica.toLocaleString("es-MX")}` : "—"}
                  </span>
                  <BotonEditar paso={9} label="Música" />
                </div>
              </div>

              {/* Pista - Paso 10 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Circle className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">Pista de Baile</p>
                    <p className="text-xs text-neutral-500">
                      {data.tipoPista === "iluminada"
                        ? "Pista Iluminada LED"
                        : data.tipoPista === "pintada"
                          ? "Pista Pintada a Mano"
                          : "No incluida"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">
                    {precioPista > 0 ? `$${precioPista.toLocaleString("es-MX")}` : "—"}
                  </span>
                  <BotonEditar paso={10} label="Pista" />
                </div>
              </div>

              {/* Capilla - Paso 11 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Church className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">Capilla Cristo del Romeral</p>
                    <p className="text-xs text-neutral-500">{data.incluyeCapilla ? "Capilla consagrada" : "No incluida"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">
                    {precioCapilla > 0 ? `$${precioCapilla.toLocaleString("es-MX")}` : "—"}
                  </span>
                  <BotonEditar paso={11} label="Capilla" />
                </div>
              </div>

              {/* Extras - Paso 12 */}
              <div className="flex justify-between items-center p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Sparkles className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-neutral-800">Extras y Servicios Adicionales</p>
                    <p className="text-xs text-neutral-500">{data.extrasSeleccionados?.length} servicios</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-light text-neutral-800">
                    {precioExtras > 0 ? `$${precioExtras.toLocaleString("es-MX")}` : "—"}
                  </span>
                  <BotonEditar paso={12} label="Extras" />
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-8 bg-neutral-900 text-white">
                <div>
                  <p className="text-xs tracking-[0.2em] text-neutral-400 uppercase mb-1">Su Celebración</p>
                  <p className="text-sm text-neutral-300">Inversión total antes de IVA</p>
                </div>
                <span className="font-serif text-3xl md:text-4xl">
                  ${total.toLocaleString("es-MX")} <span className="text-lg">MXN</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={descargarPDF}
              className="flex flex-col items-center gap-2 p-6 h-auto border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 rounded-none transition-all bg-transparent"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs tracking-wide uppercase">Descargar PDF</span>
            </Button>
            <Button
              variant="outline"
              onClick={abrirWhatsApp}
              className="flex flex-col items-center gap-2 p-6 h-auto border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 rounded-none transition-all bg-transparent"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs tracking-wide uppercase">WhatsApp</span>
            </Button>
          </div>

          {/* Link section - Su cotización está lista */}
          <div className="border border-neutral-200 bg-neutral-50 p-8 space-y-6">
            <div className="flex items-center justify-center gap-3 text-neutral-800">
              <Check className="w-5 h-5" />
              <h4 className="font-serif text-lg">Su experiencia está diseñada</h4>
            </div>

            <p className="text-neutral-600 text-center text-sm max-w-lg mx-auto">
              Guarden este enlace para revisar cada detalle cuando lo necesiten y compartirlo con quienes los acompañarán en este proceso.
            </p>

            <div className="flex items-center gap-3 bg-white p-4 border border-neutral-200 max-w-xl mx-auto">
              <LinkIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span className="text-sm text-neutral-700 truncate flex-1">{cotizacionUrl}</span>
              <Button variant="ghost" size="sm" onClick={copiarLink} className="hover:bg-neutral-100 rounded-none">
                {copiado ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex justify-center">
              {slug ? (
                <Link href={`/cotizacion/${slug}`} target="_blank">
                  <Button
                    variant="outline"
                    className="bg-transparent border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white px-8 py-5 text-sm tracking-[0.15em] uppercase transition-all rounded-none"
                  >
                    <ExternalLink className="w-4 h-4 mr-3" />
                    Ver Cotización Completa
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="bg-transparent border-neutral-300 text-neutral-400 px-8 py-5 text-sm tracking-[0.15em] uppercase rounded-none cursor-not-allowed"
                >
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                  Generando enlace...
                </Button>
              )}
            </div>
          </div>

          {/* ============================================================================ */}
          {/* SECCIÓN DE CHECKBOXES TEMPORALMENTE DESHABILITADA (17 ENERO 2026) */}
          {/* SE VOLVERÁ A HABILITAR EN APROXIMADAMENTE 2 SEMANAS */}
          {/* ============================================================================ */}
          {/* <div className="border border-neutral-200 bg-white p-8 md:p-12 space-y-8">
            <div className="text-center space-y-3">
              <h4 className="font-serif text-xl md:text-2xl text-neutral-800">Antes de agendar su visita</h4>
              <p className="text-neutral-500 text-sm">
                Es un momento para conectar, para confirmar que podemos hacer de su boda un día verdaderamente inolvidable en sus vidas.
              </p>
            </div>

            <div className="w-12 h-px bg-neutral-200 mx-auto" />

            <div className="space-y-6 max-w-2xl mx-auto">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={checkVision}
                    onChange={(e) => setCheckVision(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded-sm transition-all duration-300 flex items-center justify-center ${
                      checkVision
                        ? "bg-neutral-900 border-neutral-900"
                        : "border-neutral-300 group-hover:border-neutral-400"
                    }`}
                  >
                    {checkVision && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-neutral-600 leading-relaxed">
                  Lo que acabamos de configurar refleja lo que estamos buscando para nuestra boda, y sentimos que El
                  Romeral puede hacer de este día algo verdaderamente especial.
                </span>
              </label>

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={checkPresupuesto}
                    onChange={(e) => setCheckPresupuesto(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded-sm transition-all duration-300 flex items-center justify-center ${
                      checkPresupuesto
                        ? "bg-neutral-900 border-neutral-900"
                        : "border-neutral-300 group-hover:border-neutral-400"
                    }`}
                  >
                    {checkPresupuesto && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-neutral-600 leading-relaxed">
                  Entendemos la inversión aproximada y nos sentimos cómodos con este nivel de presupuesto para nuestro
                  evento.
                </span>
              </label>
            </div>

            <div className="w-12 h-px bg-neutral-200 mx-auto" />

            <div className="text-center space-y-6">
              {todosChecksMarcados && (
                <p className="text-sm text-neutral-700 font-medium animate-in fade-in duration-500">
                  ¡Perfecto! Estaremos encantados de recibirlos en El Romeral.
                </p>
              )} */}
          {/* ============================================================================ */}

          <div className="text-center space-y-6 border border-neutral-200 bg-white p-8 md:p-12">
            {/* Copy introductorio */}
            <p className="text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
              ¿Tienen dudas sobre su experiencia o quisieran información adicional?
            </p>

            {/* Botón Agendar Videollamada */}
            <Button
              onClick={agendarVideollamada}
              className="w-full sm:w-auto px-10 py-5 text-sm tracking-[0.2em] uppercase rounded-none transition-all duration-300 border-2 border-neutral-900 bg-transparent text-neutral-900 hover:bg-neutral-900 hover:text-white cursor-pointer"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Agendar Videollamada
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-neutral-500 tracking-wider">o</span>
              </div>
            </div>

            {/* Botón Agendar Visita */}
            <Button
              onClick={agendarCita}
              className="w-full sm:w-auto px-12 py-6 text-sm tracking-[0.2em] uppercase rounded-none transition-all duration-300 bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Agendar Visita Presencial
            </Button>

            {/* Texto fijo debajo de los botones */}
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Las citas no representan un compromiso de contratación.
              <br />
              Son un momento para conectar y confirmar que podemos hacer de su celebración un día verdaderamente
              inolvidable.
            </p>

            {/* Botón para crear nueva experiencia */}
            <div className="pt-6 border-t border-neutral-200">
              <button
                onClick={() => {
                  if (window.confirm('¿Desean comenzar una nueva experiencia? Los cambios actuales no se guardarán.')) {
                    window.location.href = '/configurador'
                  }
                }}
                className="text-xs tracking-[0.15em] uppercase text-neutral-500 hover:text-neutral-800 transition-colors underline underline-offset-4"
              >
                Diseñar una nueva experiencia
              </button>
            </div>
          </div>

          {/* Condiciones comerciales */}
          <div className="border-t border-neutral-200 pt-12 space-y-6">
            <button
              onClick={() => setShowCondiciones(!showCondiciones)}
              className="w-full flex items-center justify-center gap-2 font-serif text-lg text-neutral-800 hover:text-neutral-600 transition-colors"
            >
              <span>Condiciones Comerciales</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showCondiciones ? "rotate-180" : ""}`} />
            </button>

            {showCondiciones && (
              <div className="prose prose-sm prose-neutral max-w-none text-neutral-600 space-y-4 text-sm leading-relaxed">
                <p>
                  Esta propuesta es válida únicamente a la fecha de su emisión. Transcurrida la fecha, los precios y
                  condiciones podrán modificarse sin previo aviso. La propuesta será vinculante únicamente una vez
                  aceptada por escrito por ambas partes.
                </p>
                <p>
                  Todos los servicios incluidos en esta propuesta están sujetos a disponibilidad y fechas hasta la firma
                  del contrato y el bloqueo de 25k MXN.
                </p>
                <p>
                  A los 30 días de realizar el bloqueo de fecha, deberá llevar a cabo el pago del 30% del total del
                  proyecto para congelar los precios estipulados en la propuesta. El resto de los pagos será a meses sin
                  intereses hasta un mes antes del evento estar liquidado en su totalidad.
                </p>
                <p className="font-medium">Precios antes de IVA</p>
                <p>
                  Cancelaciones mayores a 181 días previos al evento se deberá liquidar el 60% del precio pactado por
                  daños y perjuicios.
                </p>
                <p>
                  Cancelaciones entre 1 y 180 días previos al evento deberá liquidar el 100% del precio pactado por
                  concepto de daños y perjuicios.
                </p>
                <p>
                  Para llevar a cabo una experiencia integral con Romeral todos los servicios de su boda deberán ser
                  contratados con El Romeral. (A excepción de Fotógrafo, videógrafo, grupos versátiles, souvenirs y
                  social DJ).
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
