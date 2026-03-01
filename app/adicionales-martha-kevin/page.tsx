"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Heart, Save, FileDown, Minus, Plus, MapPin, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"

interface ItemAdicional {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOriginal?: number
  descuento?: number
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

// Arrays de datos - Declarados antes del componente
const categorias: CategoriaAdicionales[] = [
  {
    id: "mesa-novios",
    nombre: "Mesa de Novios",
    icono: "💍",
    items: [
      {
        id: "back-mesa-novios",
        nombre: "Back de mesa de novios (3 pantallas de tela a desnivel)",
        descripcion: "$1,450 c/u",
        precio: 4350,
        esAcordado: true,
      },
    ],
  },
  {
    id: "diseno-mesas",
    nombre: "Diseño de Mesas",
    icono: "🪑",
    items: [
      {
        id: "mesas-shabby-12pax",
        nombre: "6 Mesas shabby para 12 pax",
        descripcion: "",
        precio: 21300,
        esAcordado: true,
      },
      {
        id: "arreglos-mesa-imperial",
        nombre: "4 Arreglos para mesa imperial",
        descripcion: "",
        precio: 14200,
        esAcordado: true,
      },
      {
        id: "mesas-cuadradas-imperial",
        nombre: "4 Mesas cuadrada y mantelerías para mesa imperial",
        descripcion: "$450 c/u",
        precio: 1800,
        esAcordado: true,
      },
      {
        id: "platos-base",
        nombre: "250 Platos base",
        descripcion: "",
        precio: 9500,
        esAcordado: true,
      },
      {
        id: "copas-color",
        nombre: "150 Copas de color",
        descripcion: "",
        precio: 3450,
        esAcordado: true,
      },
    ],
  },
  {
    id: "iluminacion-efecto-pista",
    nombre: "Iluminación / Efecto Pista",
    icono: "💡",
    items: [
      {
        id: "kineticas-lampara",
        nombre: "Set de 16 cinéticas con forma de lámpara",
        descripcion: "",
        precio: 44000,
        esAcordado: true,
      },
      {
        id: "leekos",
        nombre: "Leekos (sugerencia 13)",
        descripcion: "$950 c/u",
        precio: 950,
        cantidad: 13,
        esAcordado: true,
      },
      {
        id: "vapores-sodio",
        nombre: "Vapores de sodio (sugerencia 25)",
        descripcion: "$700 c/u",
        precio: 700,
        cantidad: 25,
        esAcordado: true,
        nota: "Ya se tienen contratados 15 vapores de sodio",
      },
    ],
  },
  {
    id: "iluminacion-aereos",
    nombre: "Iluminación + Aéreos",
    icono: "🪩",
    items: [
      {
        id: "pantallas-tela",
        nombre: "18 Pantallas de tela escenográficas",
        descripcion: "$1,450 c/u · Móviles y fijas",
        precio: 26100,
        esAcordado: true,
      },
    ],
  },
  {
    id: "recepcion-cocteleria",
    nombre: "Recepción / Coctelería",
    icono: "🍸",
    items: [
      {
        id: "cocteleria",
        nombre: "Coctelería (base 250 invitados)",
        descripcion: "",
        precio: 35625,
        esAcordado: true,
      },
      {
        id: "mesa-quesos",
        nombre: "Mesa de quesos (base 250 invitados)",
        descripcion: "",
        precio: 48750,
        esAcordado: true,
      },
    ],
  },
  {
    id: "ceremonia",
    nombre: "Ceremonia",
    icono: "⛪",
    items: [
      {
        id: "coro-iglesia",
        nombre: "Coro para iglesia",
        descripcion: "",
        precio: 9500,
        esAcordado: true,
      },
      {
        id: "bastones-flor-capilla",
        nombre: "Bastones de flor para capilla",
        descripcion: "$590 c/u",
        precio: 590,
        cantidad: 8,
        esAcordado: true,
      },
      {
        id: "chisperos-capilla",
        nombre: "Chisperos salida capilla (sugerencia 8)",
        descripcion: "$520 c/u",
        precio: 520,
        cantidad: 8,
        esAcordado: true,
      },
      {
        id: "sillas-exteriores",
        nombre: "50 Sillas exteriores capilla",
        descripcion: "",
        precio: 3250,
        esAcordado: true,
      },
      {
        id: "bocina-exterior",
        nombre: "Bocina exterior capilla",
        descripcion: "",
        precio: 1500,
        esAcordado: true,
      },
    ],
  },
  {
    id: "momentos-especiales",
    nombre: "Momentos Especiales",
    icono: "🎆",
    items: [
      {
        id: "pirotecnia-champagne",
        nombre: "Pirotecnia momento champaña",
        descripcion: "",
        precio: 6800,
        esAcordado: true,
      },
      {
        id: "pistolas-co2",
        nombre: "2 Pistolas CO2 con luz happening",
        descripcion: "",
        precio: 5700,
        esAcordado: true,
      },
      {
        id: "mesa-fuente-champagne",
        nombre: "Mesa fuente de chapaña + arreglo floral base mesa",
        descripcion: "",
        precio: 4750,
        esAcordado: true,
      },
    ],
  },
  {
    id: "montaje-decoracion",
    nombre: "Montaje / Decoración Principal",
    icono: "🌿",
    items: [
      {
        id: "tarimado-completo",
        nombre: "Propuesta de tarimado completo",
        descripcion: "",
        precio: 87360,
        precioOriginal: 105000,
        descuento: 17640,
        esAcordado: true,
        nota: "El descuento corresponde al precio de la pista ya contratada",
      },
      {
        id: "entelado-salon",
        nombre: "Entelado de salón",
        descripcion: "",
        precio: 34500,
        esAcordado: true,
      },
      {
        id: "floristeria-escalinata",
        nombre: "Floristería para escalinata (sugerencia 8)",
        descripcion: "$1,450 c/u",
        precio: 1450,
        cantidad: 8,
        esAcordado: true,
      },
      {
        id: "cortinas-construccion",
        nombre: "Cortinas para tapar construcción",
        descripcion: "",
        precio: 4850,
        esAcordado: true,
      },
      {
        id: "cortinas-cruzadas",
        nombre: "Set de cortinas cruzadas para salón",
        descripcion: "",
        precio: 8500,
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
        id: "espejo-arreglo-sombrilla",
        nombre: "Espejo con arreglo y sombrilla",
        descripcion: "",
        precio: 7930,
        esAcordado: true,
      },
      {
        id: "set-fotos-insta",
        nombre: "Set de mesa + 100 fotos insta + sobres + cuadro decorativo",
        descripcion: "",
        precio: 4550,
        esAcordado: true,
      },
    ],
  },
  {
    id: "coordinacion",
    nombre: "Coordinación",
    icono: "👰",
    items: [
      {
        id: "asistente-novia",
        nombre: "Asistente de novia",
        descripcion: "",
        precio: 10000,
        esAcordado: true,
      },
      {
        id: "hostess-extra",
        nombre: "Hostess extra",
        descripcion: "",
        precio: 1400,
        esAcordado: true,
      },
    ],
  },
]

export default function AdicionalesMarthaKevinPage() {
  const [itemsSeleccionados, setItemsSeleccionados] = useState<Record<string, boolean>>(() => {
    const inicial: Record<string, boolean> = {}
    categorias.forEach((cat) => {
      cat.items.forEach((item) => {
        inicial[item.id] = true
      })
    })
    return inicial
  })

  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const [mostrarMapa, setMostrarMapa] = useState(false)

  const calcularTotal = useMemo(() => {
    let total = 0

    categorias.forEach((cat) => {
      cat.items.forEach((item) => {
        if (itemsSeleccionados[item.id]) {
          const cantidad = cantidades[item.id] || item.cantidad || 1
          total += item.precio * cantidad
        }
      })
    })

    return total
  }, [itemsSeleccionados, cantidades])

  const actualizarCantidad = (itemId: string, cantidad: number) => {
    if (cantidad >= 1 && cantidad <= 500) {
      setCantidades((prev) => ({
        ...prev,
        [itemId]: cantidad,
      }))
    }
  }

  const toggleItem = (itemId: string) => {
    setItemsSeleccionados((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const obtenerItemsSeleccionados = () => {
    const items: Array<{ nombre: string; precio: number; cantidad: number }> = []

    categorias.forEach((cat) => {
      cat.items.forEach((item) => {
        if (itemsSeleccionados[item.id]) {
          const cantidad = cantidades[item.id] || item.cantidad || 1
          items.push({
            nombre: item.nombre,
            precio: item.precio * cantidad,
            cantidad: cantidad,
          })
        }
      })
    })

    return items
  }

  const [descargandoPDF, setDescargandoPDF] = useState(false)

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
      doc.text("COTIZACIÓN DE ADICIONALES", pageWidth / 2, 33, { align: "center" })

      doc.setFontSize(14)
      doc.setTextColor(80, 80, 80)
      doc.text("Martha & Kevin", pageWidth / 2, 45, { align: "center" })
      doc.setFontSize(10)
      doc.text("10 de Octubre 2026", pageWidth / 2, 52, { align: "center" })

      let yPos = 70

      categorias.forEach((categoria) => {
        const itemsCategoria = categoria.items.filter((item) => itemsSeleccionados[item.id])
        if (itemsCategoria.length === 0) return

        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(10)
        doc.setTextColor(74, 80, 67)
        doc.text(categoria.nombre.toUpperCase(), 20, yPos)
        yPos += 3
        doc.setDrawColor(74, 80, 67)
        doc.setLineWidth(0.3)
        doc.line(20, yPos, pageWidth - 20, yPos)
        yPos += 7

        itemsCategoria.forEach((item) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          const cantidad = cantidades[item.id] || item.cantidad || 1
          const precioTotal = item.precio * cantidad
          doc.setFontSize(9)
          doc.setTextColor(40, 40, 40)
          const nombreCorto = item.nombre.length > 60 ? item.nombre.substring(0, 60) + "..." : item.nombre
          doc.text(nombreCorto, 25, yPos)
          doc.text(`$${precioTotal.toLocaleString("es-MX")}`, pageWidth - 20, yPos, { align: "right" })
          yPos += 6
        })

        yPos += 6
      })

      yPos += 5
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }
      doc.setFillColor(74, 80, 67)
      doc.rect(20, yPos, pageWidth - 40, 15, "F")
      yPos += 10
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      doc.text("TOTAL SELECCIONADO", 25, yPos)
      doc.text(`$${calcularTotal.toLocaleString("es-MX")} MXN`, pageWidth - 25, yPos, { align: "right" })

      yPos += 25
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text("Precios en moneda nacional - No incluye I.V.A.", pageWidth / 2, yPos, { align: "center" })
      doc.text(`Generado el ${new Date().toLocaleDateString("es-MX")}`, pageWidth / 2, yPos + 5, { align: "center" })

      doc.save("cotizacion-adicionales-martha-kevin.pdf")
    } catch (error) {
      console.error("Error al generar PDF:", error)
    } finally {
      setDescargandoPDF(false)
    }
  }

  const renderItem = (item: ItemAdicional) => {
    const cantidad = cantidades[item.id] || item.cantidad || 1
    const precioTotal = item.precio * cantidad

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

            {item.esAcordado && (
              <span className="inline-block text-xs tracking-wider uppercase bg-primary/10 text-primary px-3 py-1 mb-3">
                Acordado
              </span>
            )}

          {item.descripcion && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.descripcion}</p>
          )}

          {(item.id === "leekos" ||
            item.id === "vapores-sodio" ||
            item.id === "bastones-flor-capilla" ||
            item.id === "chisperos-capilla" ||
            item.id === "floristeria-escalinata") && (
            <div className="flex items-center gap-4 mt-4">
              <p className="text-sm text-muted-foreground">Cantidad:</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    const cantidadActual = cantidades[item.id] || item.cantidad || 1
                    actualizarCantidad(item.id, cantidadActual - 1)
                  }}
                  className="w-8 h-8 flex items-center justify-center border border-foreground/20 hover:bg-muted transition-colors"
                  disabled={((cantidades[item.id] || item.cantidad || 1) <= 1)}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-12 text-center text-lg font-light">
                  {cantidades[item.id] || item.cantidad || 1}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    const cantidadActual = cantidades[item.id] || item.cantidad || 1
                    actualizarCantidad(item.id, cantidadActual + 1)
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

          <div className="text-right flex-shrink-0">
            {item.precioOriginal && item.descuento ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground line-through">
                  ${item.precioOriginal.toLocaleString("es-MX")}
                </p>
                <p className="text-sm text-destructive">
                  -${item.descuento.toLocaleString("es-MX")}
                </p>
                <p className="text-2xl md:text-3xl font-extralight tracking-wide">
                  ${precioTotal.toLocaleString("es-MX")}
                </p>
                <p className="text-xs tracking-widest uppercase text-muted-foreground">MXN</p>
              </div>
            ) : (
              <>
                <p className="text-2xl md:text-3xl font-extralight tracking-wide">
                  ${precioTotal.toLocaleString("es-MX")}
                </p>
                <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">MXN</p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="relative py-16 md:py-24 px-6 text-center border-b border-foreground/10">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-muted-foreground font-light">
            Cotización de Adicionales
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.15em] uppercase font-extralight leading-tight">
            Martha & Kevin
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm md:text-base text-foreground/80 font-light">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <p>10 de Octubre 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <p>El Romeral</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notas Generales de Alcance */}
      <section className="py-12 md:py-16 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="border border-foreground/10 p-8 md:p-12 bg-background">
          <h2 className="text-xl md:text-2xl tracking-[0.15em] uppercase font-light mb-8">
            Notas Generales de Alcance
          </h2>
          
          <div className="space-y-6 text-foreground/80">
            <div>
              <h3 className="font-medium mb-3">1. Rubros acordados por cotizar</h3>
              <p className="text-sm leading-relaxed">
                Los siguientes conceptos corresponden a lo previamente acordado para ser cotizados (marcados como "Acordado" en cada categoría).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="py-16 md:py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="space-y-16">
          {/* Categorías */}
          {categorias.map((categoria) => (
            <div key={categoria.id} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
                <span className="text-2xl">{categoria.icono}</span>
                <h2 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light">
                  {categoria.nombre}
                </h2>
              </div>

              {categoria.nota && (
                <p className="text-sm text-muted-foreground italic px-6 py-3 bg-muted/30 border-l-2 border-primary/30">
                  {categoria.nota}
                </p>
              )}

              <div className="space-y-4">
                {categoria.items.map((item) => renderItem(item))}
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
              ${calcularTotal.toLocaleString("es-MX")}
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

            <Link
              href="https://wa.me/3338708159?text=Hola,%20me%20interesa%20la%20cotizacion%20de%20adicionales%20para%20Martha%20y%20Kevin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="gap-1.5 px-3">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mapa de mesas */}
      <section className="py-12 px-6 md:px-12 max-w-5xl mx-auto">
        <button
          onClick={() => setMostrarMapa(true)}
          className="w-full border border-foreground/15 p-6 flex items-center justify-between hover:bg-muted/40 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm tracking-[0.15em] uppercase font-light">Mapa de mesas</p>
              <p className="text-xs text-muted-foreground mt-0.5">Referencia visual del acomodo de decoración e invitados</p>
            </div>
          </div>
          <span className="text-xs tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors">
            Ver mapa
          </span>
        </button>
      </section>

      {/* Modal del mapa */}
      {mostrarMapa && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setMostrarMapa(false)}
        >
          <div
            className="relative bg-background max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10">
              <div>
                <p className="text-sm tracking-[0.15em] uppercase font-light">Mapa de mesas</p>
                <p className="text-xs text-muted-foreground mt-0.5">Boda Martha y Kevin · 10 Octubre 2026 · 250 personas</p>
              </div>
              <button
                onClick={() => setMostrarMapa(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <Image
                src="/mapa-mesas-martha-kevin.jpeg"
                alt="Mapa de mesas - Boda Martha y Kevin, El Romeral, 10 Octubre 2026"
                width={1200}
                height={900}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Espaciador para el total flotante + safe-area */}
      <div className="h-24 sm:h-20" />
    </div>
  )
}
