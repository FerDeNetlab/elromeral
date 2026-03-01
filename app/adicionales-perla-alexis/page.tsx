"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Calendar, Heart, Save, FileDown } from "lucide-react"
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
}

interface CategoriaAdicionales {
  id: string
  nombre: string
  icono: string
  items: ItemAdicional[]
}

export default function AdicionalesPerlaAlexisPage() {
  // Estado para controlar qué items están seleccionados
  const [itemsSeleccionados, setItemsSeleccionados] = useState<Record<string, boolean>>(() => {
    // Inicialmente todos los items están seleccionados
    const inicial: Record<string, boolean> = {}
    categorias.forEach((cat) => {
      cat.items.forEach((item) => {
        inicial[item.id] = true
      })
    })
    return inicial
  })

  // Estado para las cantidades variables de horas
  const [cantidades, setCantidades] = useState<Record<string, number>>({
    "hora-extra-servicio": 3,
    "hora-extra-locacion": 3,
  })

  // Calcular total en tiempo real
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
    return total
  }, [itemsSeleccionados, cantidades])

  const toggleItem = (itemId: string) => {
    setItemsSeleccionados((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const actualizarCantidad = (itemId: string, cantidad: number) => {
    if (cantidad >= 1 && cantidad <= 10) {
      setCantidades((prev) => ({
        ...prev,
        [itemId]: cantidad,
      }))
    }
  }

  const [guardando, setGuardando] = useState(false)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)
  const [descargandoPDF, setDescargandoPDF] = useState(false)

  // Obtener items seleccionados para el resumen
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
    return items
  }

  const guardarCotizacion = async () => {
    setGuardando(true)
    // Simular guardado (en producción se enviaría a una API/base de datos)
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

      // Logo y encabezado
      doc.setFontSize(24)
      doc.setTextColor(60, 60, 60)
      doc.text("EL ROMERAL", pageWidth / 2, 25, { align: "center" })
      doc.setFontSize(10)
      doc.setTextColor(120, 120, 120)
      doc.text("COTIZACIÓN DE ADICIONALES", pageWidth / 2, 33, { align: "center" })

      // Info del evento
      doc.setFontSize(12)
      doc.setTextColor(80, 80, 80)
      doc.text("Boda de Perla & Alexis", pageWidth / 2, 45, { align: "center" })
      doc.setFontSize(10)
      doc.text("14 de marzo de 2026", pageWidth / 2, 52, { align: "center" })

      let yPos = 70

      // Items seleccionados
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

      // Total
      yPos += 10
      doc.setFillColor(60, 60, 60)
      doc.rect(20, yPos, pageWidth - 40, 15, "F")
      yPos += 10
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      doc.text("TOTAL SELECCIONADO", 25, yPos)
      doc.text(`$${totalSeleccionado.toLocaleString("es-MX")} MXN`, pageWidth - 25, yPos, { align: "right" })

      // Pie de página
      yPos += 25
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text("Precios en moneda nacional • No incluye I.V.A.", pageWidth / 2, yPos, { align: "center" })
      doc.text(`Generado el ${new Date().toLocaleDateString("es-MX")}`, pageWidth / 2, yPos + 5, { align: "center" })

      doc.save("cotizacion-adicionales-perla-alexis.pdf")
    } catch (error) {
      console.error("Error al generar PDF:", error)
    } finally {
      setDescargandoPDF(false)
    }
  }

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
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Cotización Adicionales</p>
            <p className="text-sm font-light">Perla & Alexis</p>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70 mb-2 font-light">
            Cotización de Adicionales
          </p>
          <h1 className="text-4xl md:text-6xl tracking-[0.12em] uppercase font-light mb-6">Perla & Alexis</h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Sábado 14 de marzo de 2026</span>
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
                  "Acordado" en cada categoría).
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground mb-3">2. Rubros sugeridos</h3>
                <p className="leading-relaxed">
                  El resto de los conceptos incluidos se presentan como sugerencias cotizadas (marcados como
                  "Sugerencia"), para ampliar opciones de experiencia, ambientación y servicio.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground mb-3">
                  3. Música en recepción – pendiente de definición
                </h3>
                <p className="leading-relaxed">
                  Queda pendiente definir el tipo de música para la recepción (ambiental, sax en vivo o DJ), con el fin
                  de cotizar correctamente este rubro una vez que confirmen su preferencia.
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

      {/* Categorías de adicionales */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
                <span className="text-2xl">{categoria.icono}</span>
                <h2 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light">{categoria.nombre}</h2>
              </div>

              <div className="space-y-4">
                {categoria.items.map((item) => (
                  <div
                    key={item.id}
                    className={`border bg-background p-6 transition-all ${
                      itemsSeleccionados[item.id]
                        ? "border-foreground/20 shadow-sm"
                        : "border-foreground/10 opacity-60"
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
                            <label
                              htmlFor={item.id}
                              className="text-base md:text-lg font-light tracking-wide cursor-pointer"
                            >
                              {item.nombre}
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.esAcordado ? "✓ Acordado" : "• Sugerencia"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl md:text-2xl font-light">
                              ${(item.precio * (cantidades[item.id] || item.cantidad || 1)).toLocaleString("es-MX")}
                            </p>
                            {((cantidades[item.id] && cantidades[item.id] > 1) ||
                              (item.cantidad && item.cantidad > 1)) && (
                              <p className="text-xs text-muted-foreground">
                                ${item.precio.toLocaleString("es-MX")} × {cantidades[item.id] || item.cantidad}
                              </p>
                            )}
                            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                          </div>
                        </div>

                        {/* Selector de cantidad para horas */}
                        {(item.id === "hora-extra-servicio" || item.id === "hora-extra-locacion") && (
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-foreground/10">
                            <label className="text-sm text-muted-foreground">Cantidad de horas:</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => actualizarCantidad(item.id, (cantidades[item.id] || 3) - 1)}
                                disabled={!itemsSeleccionados[item.id] || (cantidades[item.id] || 3) <= 1}
                                className="w-8 h-8 rounded border border-foreground/20 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={cantidades[item.id] || 3}
                                onChange={(e) => actualizarCantidad(item.id, Number.parseInt(e.target.value) || 1)}
                                disabled={!itemsSeleccionados[item.id]}
                                className="w-16 h-8 text-center border border-foreground/20 rounded bg-background disabled:opacity-50"
                              />
                              <button
                                onClick={() => actualizarCantidad(item.id, (cantidades[item.id] || 3) + 1)}
                                disabled={!itemsSeleccionados[item.id] || (cantidades[item.id] || 3) >= 10}
                                className="w-8 h-8 rounded border border-foreground/20 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}

                        {item.descripcion && (
                          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
              Precios en moneda nacional • No incluye I.V.A.
            </p>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button
                size="lg"
                variant="outline"
                className="gap-3 px-8 py-6 text-sm tracking-widest uppercase bg-transparent"
                onClick={guardarCotizacion}
                disabled={guardando}
              >
                <Save className="w-5 h-5" />
                {guardando ? "Guardando..." : guardadoExitoso ? "Guardado" : "Guardar Cotización"}
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

            {guardadoExitoso && (
              <p className="text-sm text-green-600 mt-4">Cotización guardada exitosamente</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-6">
            ¿Listo para confirmar?
          </h2>
          <p className="text-sm text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
            Escríbenos por WhatsApp y nuestro equipo te acompañará para finalizar los detalles de tu celebración.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg" className="px-10 py-6 text-sm tracking-widest uppercase">
              <Link
                href="https://wa.me/3338708159?text=Hola,%20me%20interesa%20confirmar%20los%20adicionales%20para%20la%20boda%20de%20Perla%20y%20Alexis"
                target="_blank"
                rel="noopener noreferrer"
              >
                Escríbenos por WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

// Datos de las categorías y adicionales
const categorias: CategoriaAdicionales[] = [
  {
    id: "ceremonia-civil",
    nombre: "Ceremonia Civil",
    icono: "🕊️",
    items: [
      {
        id: "sillas-ceremonia",
        nombre: "50 sillas para ceremonia civil",
        descripcion: "",
        precio: 4000,
        esAcordado: true,
      },
      {
        id: "camino-petalos",
        nombre: "Camino de pétalos para pasillo en ceremonia civil",
        descripcion: "Entre dos grupos de sillas",
        precio: 650,
        esAcordado: false,
      },
      {
        id: "bazucas-mariposas-civil",
        nombre: "8 bazucas de mariposas para ceremonia civil",
        descripcion: "",
        precio: 2240,
        esAcordado: true,
      },
      {
        id: "arreglos-bouquet-civil",
        nombre: "2 arreglos tipo bouquet para sillas de ceremonia civil",
        descripcion: "",
        precio: 2350,
        esAcordado: true,
      },
      {
        id: "bombas-humo",
        nombre: "12 bombas de humo de color",
        descripcion: "Según inspiración presentada, colocadas detrás de los novios durante la ceremonia civil",
        precio: 29000,
        esAcordado: true,
      },
    ],
  },
  {
    id: "ceremonia-religiosa",
    nombre: "Ceremonia Religiosa",
    icono: "✝️",
    items: [
      {
        id: "arco-floral",
        nombre: "Arco floral para ceremonia religiosa",
        descripcion: "Flor artificial con follaje natural",
        precio: 32000,
        esAcordado: false,
      },
      {
        id: "bazucas-mariposas-religiosa",
        nombre: "8 bazucas de mariposas para salida de ceremonia religiosa",
        descripcion: "",
        precio: 2240,
        esAcordado: false,
      },
    ],
  },
  {
    id: "momentos-wow",
    nombre: "Momentos WOW",
    icono: "✨",
    items: [
      {
        id: "pantalla-led",
        nombre: "Pantalla LED suspendida para transmisión de video",
        descripcion: "Medidas: 6 m × 3 m",
        precio: 28000,
        esAcordado: true,
      },
    ],
  },
  {
    id: "alimentos",
    nombre: "Alimentos",
    icono: "🍽️",
    items: [
      {
        id: "carrito-nieves",
        nombre: "Carrito de nieves",
        descripcion: "Precio calculado para 200 personas",
        precio: 19000,
        esAcordado: true,
      },
      {
        id: "mesa-quesos",
        nombre: "Mesa de quesos",
        descripcion: "Precio calculado para 200 personas",
        precio: 39000,
        esAcordado: true,
      },
      {
        id: "salty-bar",
        nombre: "Salty Bar",
        descripcion:
          "Mesa de salados que incluye papas, churros, tostilokos, dulces enchilados, jícama, pepino, cueritos y botanas variadas. Precio calculado para 200 personas",
        precio: 31000,
        esAcordado: false,
      },
      {
        id: "mesa-pastel",
        nombre: "Mesa para pastel",
        descripcion: "",
        precio: 650,
        esAcordado: true,
      },
      {
        id: "tercer-tiempo",
        nombre: "Tercer tiempo – postre",
        descripcion: "Precio calculado para 200 personas",
        precio: 32000,
        esAcordado: true,
      },
      {
        id: "barra-cafe",
        nombre: "Barra de café – servicio por 2 horas",
        descripcion:
          "Incluye frappuccino, capuchino, moka, latte, americano, espresso, café irlandés y carajillos",
        precio: 19600,
        esAcordado: false,
      },
    ],
  },
  {
    id: "recepcion",
    nombre: "Recepción",
    icono: "🍺",
    items: [
      {
        id: "cerveza-ampolleta",
        nombre: "4 cartones de cerveza tipo ampolleta",
        descripcion: "Incluye servicio, hielo y hieleras",
        precio: 483.75,
        cantidad: 4,
        esAcordado: true,
      },
    ],
  },
  {
    id: "decoracion",
    nombre: "Decoración",
    icono: "🎨",
    items: [
      {
        id: "telas-escalinatas",
        nombre: "Decoración con telas en escalinatas",
        descripcion: "",
        precio: 3800,
        esAcordado: true,
      },
      {
        id: "cortinas-salon",
        nombre: "Cortinas decorativas para salón",
        descripcion: "",
        precio: 6500,
        esAcordado: false,
      },
      {
        id: "lamparas-henequen",
        nombre: "4 lámparas de henequén",
        descripcion: "Diámetro aproximado de 120 cm",
        precio: 9800,
        esAcordado: true,
      },
      {
        id: "leekos-iluminacion",
        nombre: "2 leekos para iluminación de mesa de novios",
        descripcion: "",
        precio: 1650,
        cantidad: 2,
        esAcordado: true,
      },
    ],
  },
  {
    id: "mobiliario",
    nombre: "Mobiliario y Montajes",
    icono: "🪑",
    items: [
      {
        id: "upgrade-mesas-parota",
        nombre: "Upgrade de 4 mesas tipo Shabby a mesas Parota",
        descripcion: "",
        precio: 5200,
        esAcordado: true,
      },
      {
        id: "credenza-libro",
        nombre: "Credenza para libro de firmas",
        descripcion: "",
        precio: 650,
        esAcordado: true,
      },
      {
        id: "tela-sol",
        nombre: "Tela para sol (sombra decorativa)",
        descripcion:
          "Instalación pensada para bodas de día, diseñada para proteger suavemente de la luz solar. Se coloca del toldo hacia la alberca, entre el salón y la barra de trago largo, cubriendo las escaleras hacia los sanitarios, integrándose estéticamente al montaje general.",
        precio: 950,
        esAcordado: false,
      },
      {
        id: "platos-copas-color",
        nombre: "152 Plato blanco y dorado y copa color",
        descripcion: "Para 200 personas",
        precio: 53,
        cantidad: 152,
        esAcordado: true,
      },
    ],
  },
  {
    id: "tiempos-extensiones",
    nombre: "Tiempos y Extensiones",
    icono: "⏱️",
    items: [
      {
        id: "hora-extra-servicio",
        nombre: "Hora extra de servicio + DJ",
        descripcion: "$3,000 por hora",
        precio: 3000,
        cantidad: 3,
        esAcordado: true,
      },
      {
        id: "hora-extra-locacion",
        nombre: "Hora extra de locación",
        descripcion: "$10,800 por hora",
        precio: 10800,
        cantidad: 3,
        esAcordado: true,
      },
      {
        id: "upgrade-instalaciones",
        nombre: "Upgrade renta de instalaciones de 201 a 250 invitados",
        descripcion: "",
        precio: 10000,
        esAcordado: true,
      },
    ],
  },
]
