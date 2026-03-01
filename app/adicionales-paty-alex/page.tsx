"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Heart, Save, FileDown, Minus, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"

interface ItemAdicional {
  id: string
  nombre: string
  descripcion: string
  precio: number
  cantidad?: number
  esAcordado: boolean
  nota?: string
}

interface CategoriaAdicionales {
  id: string
  nombre: string
  icono: string
  items: ItemAdicional[]
  nota?: string
}

type OpcionIluminacion = "A" | "B"
type OpcionMontaje = "A" | "B"

// Arrays de datos - Declarados antes del componente
const categorias: CategoriaAdicionales[] = [
  {
    id: "mesa-novios",
    nombre: "Mesa de Novios",
    icono: "💍",
    items: [
      {
        id: "tarima-mesa-novios",
        nombre: "Tarima 1 nivel para mesa de novios",
        descripcion: "Tarima elevada de un nivel para mesa principal",
        precio: 4300,
        esAcordado: true,
      },
      {
        id: "back-luces-vintage",
        nombre: "Back de 3 series de luces vintage",
        descripcion: "Fondo decorativo con 3 series de luces vintage",
        precio: 4650,
        esAcordado: true,
      },
    ],
  },

  {
    id: "spot-fotos",
    nombre: "Spot de Fotos",
    icono: "📸",
    items: [
      {
        id: "espejos-rotulados-led",
        nombre: "2 Espejos rotulados con iluminacion LED integrada",
        descripcion: "",
        precio: 5600,
        esAcordado: true,
      },
    ],
  },
  {
    id: "recepcion",
    nombre: "Recepcion",
    icono: "🍺",
    items: [
      {
        id: "cerveza-ampolleta",
        nombre: "4 cartones de cerveza Pacifico tipo ampolleta",
        descripcion: "Incluye servicio, hielo y hieleras",
        precio: 483.75,
        cantidad: 4,
        esAcordado: true,
      },
    ],
  },
  {
    id: "alimentos-desvelados",
    nombre: "Alimentos - Desvelados",
    icono: "🍔",
    items: [
      {
        id: "hamburguesas-desvelados",
        nombre: "Hamburguesas de desvelados (150 piezas en envoltura individual)",
        descripcion: "Entrega en pista y en mesas para cada invitado. $98 c/u",
        precio: 98,
        cantidad: 150,
        esAcordado: true,
      },
    ],
  },
  {
    id: "musica",
    nombre: "Musica",
    icono: "🎵",
    items: [
      {
        id: "hora-extra-dj-cocteleria",
        nombre: "Hora extra DJ en cocteleria",
        descripcion: "",
        precio: 2500,
        esAcordado: true,
      },
    ],
  },
  {
    id: "iluminacion-efecto-pista",
    nombre: "Iluminacion / Efecto Pista",
    icono: "💡",
    items: [
      {
        id: "pista-edison",
        nombre: "Pista Edison",
        descripcion: "",
        precio: 4000,
        esAcordado: true,
      },
      {
        id: "leekos",
        nombre: "Leekos (sugerencia 10)",
        descripcion: "$1,450 c/u",
        precio: 1450,
        cantidad: 10,
        esAcordado: true,
      },
    ],
  },
]

// Montaje Opcion A (Olivos)
const montajeOpcionAItems: ItemAdicional[] = [
  {
    id: "montA-olivos-mesas-rey-arturo",
    nombre: "Propuesta con 2 Olivos naturales + 2 mesas Rey Arturo",
    descripcion: "",
    precio: 22600,
    esAcordado: true,
    nota: "Se colocan 2 olivos naturales, otorgando en cortesia el costo de uno de ellos. El precio reflejado considera unicamente el cobro de 1 olivo mas las 2 mesas Rey Arturo.",
  },
]

// Montaje Opcion B (Shabby Chic)
const montajeOpcionBItems: ItemAdicional[] = [
  {
    id: "montB-4-mesas-shabby",
    nombre: "4 mesas shabby chic",
    descripcion: "",
    precio: 5400,
    esAcordado: true,
  },
  {
    id: "montB-arreglos-2do-rango-shabby",
    nombre: "4 arreglos 2do rango para mesas shabby",
    descripcion: "",
    precio: 11120,
    esAcordado: true,
  },
]

// Iluminacion Opcion A
const opcionAItems: ItemAdicional[] = [
  {
    id: "opA-bolas-kineticas",
    nombre: "Set de 16 Bolas Kineticas + DJ Lighting",
    descripcion: "",
    precio: 42600,
    esAcordado: true,
  },
  {
    id: "opA-lamparas-henequen",
    nombre: "4 lamparas de Henequen (luz calida en toldo aleman)",
    descripcion: "",
    precio: 14000,
    esAcordado: true,
  },
  {
    id: "opA-velas-colgantes-toldo",
    nombre: "Velas colgantes en toldo aleman",
    descripcion: "",
    precio: 16800,
    esAcordado: true,
  },
]

// Iluminacion Opcion B
const opcionBItems: ItemAdicional[] = [
  {
    id: "opB-bolas-kineticas",
    nombre: "Set de 16 Bolas Kineticas + DJ Lighting",
    descripcion: "",
    precio: 42600,
    esAcordado: true,
  },
  {
    id: "opB-aro-follaje",
    nombre: "Aro de follaje colgante sobre pista (6 mts diametro)",
    descripcion: "",
    precio: 28000,
    esAcordado: true,
  },
  {
    id: "opB-velas-colgantes-toldo",
    nombre: "Velas colgantes en toldo aleman",
    descripcion: "",
    precio: 16800,
    esAcordado: true,
  },
]

// Decoracion Ambiental
const decoracionAmbientalItems: ItemAdicional[] = [
  {
    id: "camino-escalinata-velas",
    nombre: "Camino escalinata con velas flotantes o gotas con velas",
    descripcion: "Sugerencia 36 colgantes",
    precio: 6840,
    esAcordado: true,
  },
  {
    id: "velas-colgantes-camino-capilla",
    nombre: "Velas colgantes camino capilla a area de cocktail",
    descripcion: "",
    precio: 8000,
    esAcordado: true,
  },
  {
    id: "cortinas-cubrir-salon",
    nombre: "Cortinas para cubrir el salon (15 mts lineales)",
    descripcion: "",
    precio: 8600,
    esAcordado: true,
  },
]

export default function AdicionalesPatyAlexPage() {
  const [opcionIluminacion, setOpcionIluminacion] = useState<OpcionIluminacion>("A")
  const [opcionMontaje, setOpcionMontaje] = useState<OpcionMontaje>("A")

  const [itemsSeleccionados, setItemsSeleccionados] = useState<Record<string, boolean>>(() => {
    const inicial: Record<string, boolean> = {}
    categorias.forEach((cat) => {
      cat.items.forEach((item) => {
        inicial[item.id] = true
      })
    })
    // Montaje opciones - activar opcion A por defecto
    montajeOpcionAItems.forEach((item) => {
      inicial[item.id] = true
    })
    montajeOpcionBItems.forEach((item) => {
      inicial[item.id] = false
    })
    // Iluminacion opciones - activar opcion A por defecto
    opcionAItems.forEach((item) => {
      inicial[item.id] = true
    })
    opcionBItems.forEach((item) => {
      inicial[item.id] = false
    })
    // Decoracion ambiental
    decoracionAmbientalItems.forEach((item) => {
      inicial[item.id] = true
    })
    return inicial
  })

  const [cantidades, setCantidades] = useState<Record<string, number>>({})

  const totalSeleccionado = useMemo(() => {
    let total = 0
    categorias.forEach((cat) => {
      cat.items.forEach((item) => {
        if (itemsSeleccionados[item.id]) {
          const cantidad = cantidades[item.id] || item.cantidad || 1
          total += item.precio * cantidad
        }
      })
    })
    // Montaje segun opcion seleccionada
    const montajeItems = opcionMontaje === "A" ? montajeOpcionAItems : montajeOpcionBItems
    montajeItems.forEach((item) => {
      if (itemsSeleccionados[item.id]) {
        total += item.precio * (item.cantidad || 1)
      }
    })
    // Iluminacion segun opcion seleccionada
    const ilumItems = opcionIluminacion === "A" ? opcionAItems : opcionBItems
    ilumItems.forEach((item) => {
      if (itemsSeleccionados[item.id]) {
        total += item.precio * (item.cantidad || 1)
      }
    })
    // Decoracion ambiental
    decoracionAmbientalItems.forEach((item) => {
      if (itemsSeleccionados[item.id]) {
        total += item.precio * (item.cantidad || 1)
      }
    })
    return total
  }, [itemsSeleccionados, cantidades, opcionIluminacion, opcionMontaje])

  const toggleItem = (itemId: string) => {
    setItemsSeleccionados((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const actualizarCantidad = (itemId: string, cantidad: number) => {
    if (cantidad >= 1 && cantidad <= 500) {
      setCantidades((prev) => ({
        ...prev,
        [itemId]: cantidad,
      }))
    }
  }

  const seleccionarOpcionMontaje = (opcion: OpcionMontaje) => {
    setOpcionMontaje(opcion)
    const activar = opcion === "A" ? montajeOpcionAItems : montajeOpcionBItems
    const desactivar = opcion === "A" ? montajeOpcionBItems : montajeOpcionAItems
    setItemsSeleccionados((prev) => {
      const nuevo = { ...prev }
      activar.forEach((item) => {
        nuevo[item.id] = true
      })
      desactivar.forEach((item) => {
        nuevo[item.id] = false
      })
      return nuevo
    })
  }

  const seleccionarOpcion = (opcion: OpcionIluminacion) => {
    setOpcionIluminacion(opcion)
    // Activar items de la opcion seleccionada, desactivar los de la otra
    const activar = opcion === "A" ? opcionAItems : opcionBItems
    const desactivar = opcion === "A" ? opcionBItems : opcionAItems
    setItemsSeleccionados((prev) => {
      const nuevo = { ...prev }
      activar.forEach((item) => {
        nuevo[item.id] = true
      })
      desactivar.forEach((item) => {
        nuevo[item.id] = false
      })
      return nuevo
    })
  }

  const [guardando, setGuardando] = useState(false)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)
  const [descargandoPDF, setDescargandoPDF] = useState(false)

  const obtenerItemsSeleccionados = () => {
    const items: { nombre: string; precio: number; cantidad: number }[] = []
    categorias.forEach((cat) => {
      cat.items.forEach((item) => {
        if (itemsSeleccionados[item.id]) {
          const cantidad = cantidades[item.id] || item.cantidad || 1
          items.push({
            nombre: item.nombre,
            precio: item.precio * cantidad,
            cantidad,
          })
        }
      })
    })
    const montajeItems = opcionMontaje === "A" ? montajeOpcionAItems : montajeOpcionBItems
    montajeItems.forEach((item) => {
      if (itemsSeleccionados[item.id]) {
        items.push({
          nombre: item.nombre,
          precio: item.precio * (item.cantidad || 1),
          cantidad: item.cantidad || 1,
        })
      }
    })
    const ilumItems = opcionIluminacion === "A" ? opcionAItems : opcionBItems
    ilumItems.forEach((item) => {
      if (itemsSeleccionados[item.id]) {
        items.push({
          nombre: item.nombre,
          precio: item.precio * (item.cantidad || 1),
          cantidad: item.cantidad || 1,
        })
      }
    })
    decoracionAmbientalItems.forEach((item) => {
      if (itemsSeleccionados[item.id]) {
        items.push({
          nombre: item.nombre,
          precio: item.precio * (item.cantidad || 1),
          cantidad: item.cantidad || 1,
        })
      }
    })
    return items
  }

  const guardarCotizacion = async () => {
    setGuardando(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setGuardando(false)
    setGuardadoExitoso(true)
    setTimeout(() => setGuardadoExitoso(false), 3000)
  }

  const descargarPDF = async () => {
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
      doc.text("COTIZACION DE ADICIONALES", pageWidth / 2, 33, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(80, 80, 80)
      doc.text("Boda de Paty & Alex", pageWidth / 2, 45, { align: "center" })
      doc.setFontSize(10)
      doc.text("11 de abril de 2026", pageWidth / 2, 52, { align: "center" })

      let yPos = 70

      doc.setFontSize(11)
      doc.setTextColor(60, 60, 60)
      doc.text("SERVICIOS SELECCIONADOS", 20, yPos)
      yPos += 10

      const itemsSelec = obtenerItemsSeleccionados()
      itemsSelec.forEach((item) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.setFontSize(10)
        doc.setTextColor(40, 40, 40)
        const nombreCorto = item.nombre.length > 50 ? item.nombre.substring(0, 50) + "..." : item.nombre
        doc.text(nombreCorto, 20, yPos)
        doc.text(`$${item.precio.toLocaleString("es-MX")}`, pageWidth - 20, yPos, { align: "right" })
        yPos += 7
      })

      yPos += 10
      doc.setFillColor(60, 60, 60)
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

      doc.save("cotizacion-adicionales-paty-alex.pdf")
    } catch (error) {
      console.error("Error al generar PDF:", error)
    } finally {
      setDescargandoPDF(false)
    }
  }

  const renderItem = (item: ItemAdicional) => (
    <div
      key={item.id}
      className={`border bg-background p-6 transition-all ${
        itemsSeleccionados[item.id] ? "border-foreground/20 shadow-sm" : "border-foreground/10 opacity-60"
      }`}
    >
      <div className="flex items-start gap-4">
        <Checkbox
          id={item.id}
          checked={itemsSeleccionados[item.id]}
          onCheckedChange={() => toggleItem(item.id)}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
            <div className="flex-1">
              <label htmlFor={item.id} className="text-base md:text-lg font-light tracking-wide cursor-pointer">
                {item.nombre}
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                {item.esAcordado ? "Acordado" : "Sugerencia"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl md:text-2xl font-light">
                ${(item.precio * (cantidades[item.id] || item.cantidad || 1)).toLocaleString("es-MX")}
              </p>
              {((cantidades[item.id] && cantidades[item.id] > 1) || (item.cantidad && item.cantidad > 1)) && (
                <p className="text-xs text-muted-foreground">
                  ${item.precio.toLocaleString("es-MX")} x {cantidades[item.id] || item.cantidad}
                </p>
              )}
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
            </div>
          </div>

          {item.descripcion && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.descripcion}</p>
          )}

          {(item.id === "leekos" || item.id === "hamburguesas-desvelados" || item.id === "cerveza-ampolleta") && (
            <div className="flex items-center gap-4 mt-4">
              <p className="text-sm text-muted-foreground">Cantidad:</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    const incremento = item.id === "hamburguesas-desvelados" ? 10 : 1
                    const cantidadActual = cantidades[item.id] || item.cantidad || 1
                    actualizarCantidad(item.id, cantidadActual - incremento)
                  }}
                  className="w-8 h-8 flex items-center justify-center border border-foreground/20 hover:bg-muted transition-colors"
                  disabled={((cantidades[item.id] || item.cantidad || 1) <= (item.id === "hamburguesas-desvelados" ? 10 : 1))}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-12 text-center text-lg font-light">
                  {cantidades[item.id] || item.cantidad || 1}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    const incremento = item.id === "hamburguesas-desvelados" ? 10 : 1
                    const cantidadActual = cantidades[item.id] || item.cantidad || 1
                    actualizarCantidad(item.id, cantidadActual + incremento)
                  }}
                  className="w-8 h-8 flex items-center justify-center border border-foreground/20 hover:bg-muted transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {item.nota && (
            <p className="text-sm text-primary/80 leading-relaxed mt-3 italic border-l-2 border-primary/20 pl-3">
              {item.nota}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header con logo */}
      <header className="border-b border-foreground/10 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/el-romeral-logo-nuevo.png"
              alt="El Romeral"
              width={150}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Cotizacion Adicionales</p>
            <p className="text-sm font-light">Paty & Alex</p>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70 mb-2 font-light">
            Cotizacion de Adicionales
          </p>
          <h1 className="text-4xl md:text-6xl tracking-[0.12em] uppercase font-light mb-6">Paty & Alex</h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>11 de abril de 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>El Romeral</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notas generales de alcance */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="border border-foreground/10 bg-background p-6 md:p-8">
            <h2 className="text-xl md:text-2xl tracking-[0.12em] uppercase font-light mb-6">
              Notas Generales de Alcance
            </h2>

            <div className="space-y-6 text-sm text-muted-foreground">
              <div>
                <h3 className="text-base font-medium text-foreground mb-3">1. Rubros acordados por cotizar</h3>
                <p className="leading-relaxed">
                  Los siguientes conceptos corresponden a lo previamente acordado para ser cotizados (marcados como
                  "Acordado" en cada categoria).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Total flotante */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-foreground text-background px-6 py-4 rounded-lg shadow-2xl border border-background/20">
          <p className="text-xs tracking-widest uppercase mb-1 opacity-80">Total Seleccionado</p>
          <p className="text-3xl font-light tracking-wide">${totalSeleccionado.toLocaleString("es-MX")}</p>
          <p className="text-[10px] tracking-wider uppercase opacity-70 mt-1">MXN</p>
        </div>
      </div>

      {/* Categorias de adicionales */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
                <span className="text-2xl">{categoria.icono}</span>
                <h2 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light">{categoria.nombre}</h2>
              </div>

              <div className="space-y-4">
                {categoria.items.map((item) => renderItem(item))}
              </div>

              {categoria.nota && (
                <div className="bg-muted/40 border border-foreground/10 p-5">
                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                    <span className="font-medium not-italic">Nota importante: </span>
                    {categoria.nota}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Seccion especial: Montaje / Decoracion Principal */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
              <span className="text-2xl">{"🌿"}</span>
              <h2 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light">
                {"Montaje / Decoracion Principal"}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground italic">Seleccionar una opcion:</p>

            {/* Selector de opcion */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => seleccionarOpcionMontaje("A")}
                className={`border p-5 text-left transition-all ${
                  opcionMontaje === "A"
                    ? "border-foreground/30 bg-muted/30 shadow-sm"
                    : "border-foreground/10 opacity-60 hover:opacity-80"
                }`}
              >
                <p className="text-lg font-light tracking-wide mb-1">Opcion A</p>
                <p className="text-xs text-muted-foreground">Olivos + Mesas Rey Arturo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Subtotal: $
                  {montajeOpcionAItems
                    .reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0)
                    .toLocaleString("es-MX")}{" "}
                  MXN
                </p>
              </button>
              <button
                onClick={() => seleccionarOpcionMontaje("B")}
                className={`border p-5 text-left transition-all ${
                  opcionMontaje === "B"
                    ? "border-foreground/30 bg-muted/30 shadow-sm"
                    : "border-foreground/10 opacity-60 hover:opacity-80"
                }`}
              >
                <p className="text-lg font-light tracking-wide mb-1">Opcion B</p>
                <p className="text-xs text-muted-foreground">Shabby Chic + Arreglos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Subtotal: $
                  {montajeOpcionBItems
                    .reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0)
                    .toLocaleString("es-MX")}{" "}
                  MXN
                </p>
              </button>
            </div>

            {/* Items de la opcion seleccionada */}
            <div className="space-y-4">
              {opcionMontaje === "A" && montajeOpcionAItems.map((item) => renderItem(item))}
              {opcionMontaje === "B" && montajeOpcionBItems.map((item) => renderItem(item))}
            </div>
          </div>

          {/* Seccion especial: Iluminacion + Aereos */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
              <span className="text-2xl">{"🪩"}</span>
              <h2 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light">
                {"Iluminacion + Aereos"}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground italic">Seleccionar una opcion:</p>

            {/* Selector de opcion */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => seleccionarOpcion("A")}
                className={`border p-5 text-left transition-all ${
                  opcionIluminacion === "A"
                    ? "border-foreground/30 bg-muted/30 shadow-sm"
                    : "border-foreground/10 opacity-60 hover:opacity-80"
                }`}
              >
                <p className="text-lg font-light tracking-wide mb-1">Opcion A</p>
                <p className="text-xs text-muted-foreground">
                  Subtotal: $
                  {opcionAItems
                    .reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0)
                    .toLocaleString("es-MX")}{" "}
                  MXN
                </p>
              </button>
              <button
                onClick={() => seleccionarOpcion("B")}
                className={`border p-5 text-left transition-all ${
                  opcionIluminacion === "B"
                    ? "border-foreground/30 bg-muted/30 shadow-sm"
                    : "border-foreground/10 opacity-60 hover:opacity-80"
                }`}
              >
                <p className="text-lg font-light tracking-wide mb-1">Opcion B</p>
                <p className="text-xs text-muted-foreground">
                  Subtotal: $
                  {opcionBItems
                    .reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0)
                    .toLocaleString("es-MX")}{" "}
                  MXN
                </p>
              </button>
            </div>

            {/* Items de la opcion seleccionada */}
            <div className="space-y-4">
              {opcionIluminacion === "A" && opcionAItems.map((item) => renderItem(item))}
              {opcionIluminacion === "B" && opcionBItems.map((item) => renderItem(item))}
            </div>

            {/* Decoracion Ambiental (siempre visible) */}
            <div className="mt-8">
              <div className="flex items-center gap-3 border-b border-foreground/10 pb-4 mb-6">
                <span className="text-2xl">{"🕯️"}</span>
                <h3 className="text-xl md:text-2xl tracking-[0.12em] uppercase font-light">
                  {"Decoracion Ambiental"}
                </h3>
              </div>
              <div className="space-y-4">
                {decoracionAmbientalItems.map((item) => renderItem(item))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resumen total */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-foreground/20 bg-background p-8 text-center">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">Total de Adicionales</p>
            <p className="text-5xl md:text-6xl font-light tracking-wide mb-2">
              ${totalSeleccionado.toLocaleString("es-MX")}
            </p>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">MXN</p>
            <p className="text-xs text-muted-foreground italic mt-6">
              Precios en moneda nacional - No incluye I.V.A.
            </p>

            {/* Botones de accion */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button
                size="lg"
                variant="outline"
                className="gap-3 px-8 py-6 text-sm tracking-widest uppercase bg-transparent"
                onClick={guardarCotizacion}
                disabled={guardando}
              >
                <Save className="w-5 h-5" />
                {guardando ? "Guardando..." : guardadoExitoso ? "Guardado" : "Guardar Cotizacion"}
              </Button>
              <Button
                size="lg"
                className="gap-3 px-8 py-6 text-sm tracking-widest uppercase"
                onClick={descargarPDF}
                disabled={descargandoPDF}
              >
                <FileDown className="w-5 h-5" />
                {descargandoPDF ? "Generando..." : "Descargar PDF"}
              </Button>
            </div>

            {guardadoExitoso && <p className="text-sm text-green-600 mt-4">Cotizacion guardada exitosamente</p>}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-6">
            {"Listo para confirmar?"}
          </h2>
          <p className="text-sm text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
            Escribenos por WhatsApp y nuestro equipo te acompanara para finalizar los detalles de tu celebracion.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg" className="px-10 py-6 text-sm tracking-widest uppercase">
              <Link
                href="https://wa.me/3338708159?text=Hola,%20me%20interesa%20confirmar%20los%20adicionales%20para%20la%20boda%20de%20Paty%20y%20Alex"
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribenos por WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
