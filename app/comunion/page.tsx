"use client"

import { Button } from "@/components/ui/button"
import { Download, Calendar, Users, Church, Gift, ChevronDown, ChevronUp, FileText, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function CotizacionDiurnaPage() {
  const [descargandoPDF, setDescargandoPDF] = useState(false)
  const [imagenModal, setImagenModal] = useState<string | null>(null)
  const [mostrarDetallesMontaje, setMostrarDetallesMontaje] = useState(false)
  const [mostrarDetallesInstalaciones, setMostrarDetallesInstalaciones] = useState(false)

  const descargarPDF = async () => {
    setDescargandoPDF(true)
    try {
      const response = await fetch("/api/export-pdf-diurno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoEvento: "Primera Comunión",
          fecha: "Sábado 28 de marzo de 2026",
          personas: 70,
          capacidadMaxima: 100,
          vigencia: "1 semana",
        }),
      })

      if (!response.ok) throw new Error("Error al generar PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Cotizacion-Primera-Comunion-El-Romeral.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error al descargar PDF:", error)
      alert("Error al descargar PDF")
    } finally {
      setDescargandoPDF(false)
    }
  }

  const partidas = [
    {
      categoria: "Locación - El Romeral",
      inversion: 119000,
      descripcion:
        "Renta de instalaciones con uso exclusivo del espacio por 6 horas de instalaciones y 5 horas de evento, considerando un aforo máximo de 100 personas.",
      detalles: [
        "Planta de luz para garantizar el uso de las áreas generales de El Romeral",
        "Estacionamiento bardeado e iluminado para 350 autos",
        "Servicio de valet parking",
        "Uso de bote y remos para sesión fotográfica",
      ],
    },
    {
      categoria: "Ceremonia religiosa y ambientación en capilla",
      inversion: 22000,
      descripcion:
        "Ambientación integral de la capilla que incluye alfombra a elegir (roja, azul o ivory), iluminación arquitectónica interior y exterior, telas cubre reclinatorios, banca doble para celebrantes y sillón para sacerdote tejido en tule.",
    },
    {
      categoria: "Banquete - Menú a 2 tiempos",
      inversion: 74200,
      personas: 70,
      descripcion:
        "Menú a 2 tiempos: Entrada (crema o ensalada) + plato fuerte + postre. El cliente elige 2 tiempos del menú propuesto. Incluye mobiliario completo, servicio de meseros, sillas, mantelería y cubiertos. Plato fuerte con proteína a elegir: pollo, cerdo o pescado.",
      montaje: [
        "Mesa: Redonda/cuadrada",
        "Silla inyectada",
        "Mantel tergal catalán en cualquier color",
        "Cubre mantel organza liso",
        "Servilleta de tela",
      ],
    },
    {
      categoria: "Barra de bebidas sin alcohol",
      inversion: 6300,
      descripcion:
        "Barra de bebidas sin alcohol que incluye mobiliario de barra, hielo, cristalería, refrescos, aguas y jugos, con bartender incluido (1 por cada 100 personas).",
    },
    {
      categoria: "Floristería - Centros de mesa",
      inversion: 10150,
      cantidad: 7,
      descripcion:
        "Centros de mesa florales tipo bouquet de 45 cm de diámetro, elaborados con flor natural de temporada para mesas de invitados.",
    },
    {
      categoria: "Audio y ambientación",
      inversion: 14500,
      descripcion:
        "Sistema de sonido ambiental instalado en el salón, con reproducción musical continua mediante playlist proporcionada por el cliente.",
    },
    {
      categoria: "Entretenimiento infantil",
      inversion: 2900,
      descripcion:
        "Brincolín infantil con capacidad de hasta 20 niños, ideal para acompañar el desarrollo del evento y brindar comodidad a las familias.",
      imagen: "/images/entretenimiento-infantil.jpeg",
    },
  ]

  const total = partidas.reduce((sum, p) => sum + p.inversion, 0)

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
          <Button onClick={descargarPDF} disabled={descargandoPDF} size="sm" className="gap-2">
            {descargandoPDF ? (
              <>
                <Download className="w-4 h-4 animate-bounce" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70 mb-2 font-light">
            Estimada
          </p>
          <h2 className="text-2xl md:text-3xl tracking-[0.1em] font-light mb-6">Sra. Graciela</h2>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-light">
            Experiencia Integral
          </p>
          <h1 className="text-4xl md:text-6xl tracking-[0.12em] uppercase font-light mb-6">Primera Comunión</h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Sábado 28 de marzo de 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>70 personas (máx. 100)</span>
            </div>
            <div className="flex items-center gap-2">
              <Church className="w-4 h-4" />
              <span>Con ceremonia religiosa</span>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted-foreground italic">Vigencia: 1 semana</p>
        </div>
      </section>

      {/* Desglose de inversión */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl tracking-[0.12em] uppercase font-light mb-4">
              Desglose de la Experiencia
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Cada elemento ha sido cuidadosamente seleccionado para crear una celebración memorable, donde cada detalle
              contribuye a la experiencia completa de tu evento.
            </p>
          </div>

          <div className="space-y-6">
            {partidas.map((partida, index) => (
              <div
                key={index}
                className="border border-foreground/10 bg-background p-6 md:p-8 hover:border-foreground/20 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-light tracking-wide mb-2">{partida.categoria}</h3>
                    {(partida.personas || partida.cantidad) && (
                      <p className="text-xs text-muted-foreground">
                        {partida.personas && `${partida.personas} personas`}
                        {partida.cantidad && `${partida.cantidad} centros de mesa`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl md:text-3xl font-light">
                      ${partida.inversion.toLocaleString("es-MX")}
                    </p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{partida.descripcion}</p>

                {/* Botón para ver foto de referencia */}
                {partida.imagen && (
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 bg-transparent"
                      onClick={() => setImagenModal(partida.imagen!)}
                    >
                      <Eye className="w-5 h-5" />
                      Ver foto de referencia
                    </Button>
                  </div>
                )}

                {/* Detalles de instalaciones */}
                {partida.detalles && (
                  <div className="mt-4 pt-4 border-t border-foreground/10">
                    <button
                      onClick={() => setMostrarDetallesInstalaciones(!mostrarDetallesInstalaciones)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {mostrarDetallesInstalaciones ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      Ver detalles incluidos
                    </button>
                    {mostrarDetallesInstalaciones && (
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {partida.detalles.map((detalle, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-foreground/50 mt-1">•</span>
                            <span>{detalle}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Montaje de banquete */}
                {partida.montaje && (
                  <div className="mt-4 pt-4 border-t border-foreground/10">
                    <button
                      onClick={() => setMostrarDetallesMontaje(!mostrarDetallesMontaje)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {mostrarDetallesMontaje ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      Ver detalles del montaje
                    </button>
                    {mostrarDetallesMontaje && (
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {partida.montaje.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-foreground/50 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-12 border-2 border-foreground/20 bg-muted/30 p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                  Inversión Total
                </p>
                <h3 className="text-3xl md:text-5xl font-light tracking-wide">Experiencia Integral</h3>
              </div>
              <div className="text-right">
                <p className="text-4xl md:text-6xl font-light">${total.toLocaleString("es-MX")}</p>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">MXN</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios adicionales cotizados */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl tracking-[0.12em] uppercase font-light mb-4">
              Servicios Adicionales Cotizados
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Elementos complementarios que pueden sumarse a tu experiencia según tu preferencia
            </p>
          </div>

          <div className="space-y-8">
            {/* A. Mobiliario y decoración especial */}
            <div>
              <h3 className="text-sm tracking-[0.15em] uppercase font-light mb-4 text-foreground/70">
                A. Mobiliario y decoración especial
              </h3>
              <div className="space-y-4">
                <div className="border border-foreground/10 bg-background p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-light tracking-wide mb-2">Mesa Rey Arturo</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Cantidad: 2 • Capacidad: hasta 16 personas por mesa
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-light">$4,600</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </div>

                <div className="border border-foreground/10 bg-background p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-light tracking-wide mb-2">
                        Árboles gigantes decorativos con arreglo artificial
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Centro de mesa Rey Arturo • Cantidad: 2
                      </p>
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 bg-transparent"
                        onClick={() => setImagenModal("/images/arboles-gigantes-decorativos.jpeg")}
                      >
                        <Eye className="w-5 h-5" />
                        Ver foto de referencia
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-light">$43,700</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* B. Toldos, telas y montajes decorativos */}
            <div>
              <h3 className="text-sm tracking-[0.15em] uppercase font-light mb-4 text-foreground/70">
                B. Toldos, telas y montajes decorativos
              </h3>
              <div className="space-y-4">
                <div className="border border-foreground/10 bg-background p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-light tracking-wide mb-2">
                        Telas en estructura metálica sobre jardín
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4">Dos tonos claros</p>
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 bg-transparent"
                        onClick={() => setImagenModal("/images/telas-estructura-jardin.jpeg")}
                      >
                        <Eye className="w-5 h-5" />
                        Ver foto de referencia
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-light">$26,800</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </div>

                <div className="border border-foreground/10 bg-background p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-light tracking-wide mb-2">Telar decorativo en techo</h4>
                      <p className="text-xs text-muted-foreground mb-4">Color ivory con juego de cortinas en salón</p>
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 bg-transparent"
                        onClick={() => setImagenModal("/images/telar-decorativo-techo.jpeg")}
                      >
                        <Eye className="w-5 h-5" />
                        Ver foto de referencia
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-light">$29,600</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* C. Floristería y elementos colgantes */}
            <div>
              <h3 className="text-sm tracking-[0.15em] uppercase font-light mb-4 text-foreground/70">
                C. Floristería y elementos colgantes
              </h3>
              <div className="space-y-4">
                <div className="border border-foreground/10 bg-background p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-light tracking-wide mb-2">Arco floral tipo nube o gypsophila</h4>
                      <p className="text-xs text-muted-foreground">5 metros de ancho por 4 metros de alto</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-light">$32,600</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </div>

                <div className="border border-foreground/10 bg-background p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-light tracking-wide mb-2">Colgantes florales tipo nube o gypsophila</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        12 metros de largo cada uno, colocados a 4 metros de altura • Cantidad: 2
                      </p>
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 bg-transparent"
                        onClick={() => setImagenModal("/images/colgantes-florales-gypsophila.jpeg")}
                      >
                        <Eye className="w-5 h-5" />
                        Ver foto de referencia
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-light">$34,400</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* D. Ceremonia religiosa – música */}
            <div>
              <h3 className="text-sm tracking-[0.15em] uppercase font-light mb-4 text-foreground/70">
                D. Ceremonia religiosa – música
              </h3>
              <div className="border border-foreground/10 bg-background p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-light tracking-wide mb-2">Coro de niños</h4>
                    <p className="text-xs text-muted-foreground">
                      Angeles de Dios Coro infantil San Luis Gonzaga • Consta de 14 elementos y un teclado
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl md:text-3xl font-light">$13,000</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                  </div>
                </div>
              </div>
            </div>

            {/* E. Tiempos extra y servicios operativos */}
            <div>
              <h3 className="text-sm tracking-[0.15em] uppercase font-light mb-4 text-foreground/70">
                E. Tiempos extra y servicios operativos
              </h3>
              <div className="space-y-4">
                <div className="border border-foreground/10 bg-background p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-light tracking-wide mb-2">
                        Hora extra de insumos y bebidas sin vinos ni licores
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-light">$3,150</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </div>

                <div className="border border-foreground/10 bg-background p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-light tracking-wide mb-2">Hora extra de locación + servicio</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-light">$8,200</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </div>

                <div className="border border-foreground/10 bg-background p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-light tracking-wide mb-2">Tiempo extra de alimentos</h4>
                      <p className="text-xs text-muted-foreground">$160 por persona • 70 invitados</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-light">$11,200</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* F. Coctelería en alberca */}
            <div>
              <h3 className="text-sm tracking-[0.15em] uppercase font-light mb-4 text-foreground/70">
                F. Coctelería en alberca
              </h3>
              <div className="border border-foreground/10 bg-background p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-light tracking-wide mb-2">Coctelería en alberca</h4>
                    <p className="text-xs text-muted-foreground">105 copas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl md:text-3xl font-light">$12,110</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">MXN</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>
                    <strong className="text-foreground">Incluye:</strong> Selección de 4 sabores de un menú de 12
                    cocteles.
                  </p>
                  <p>
                    <strong className="text-foreground">Mobiliario:</strong> escritorio, 3 sillones, toldo de organza, 4
                    sofás love seat, 8 bancos, 2 mesas de centro, 3 periqueras con 9 bancos, 5 sombrillas, 2 mesas teka,
                    10 plazas y 2 camastros.
                  </p>
                  <p className="text-xs italic">
                    Sugerencias de complemento (no incluidas): canapés, mesa de quesos, conjunto de jazz o sax.
                  </p>
                </div>
              </div>
            </div>

            {/* Total de adicionales */}
            <div className="border-t-2 border-foreground/20 pt-8 mt-8">
              <div className="bg-muted/50 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                      Total Servicios Adicionales
                    </p>
                    <h3 className="text-2xl md:text-4xl font-light tracking-wide">Complementos Opcionales</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl md:text-5xl font-light">$219,360</p>
                    <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">MXN</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total general con adicionales */}
            <div className="bg-foreground text-background p-6 md:p-8 mt-4">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase opacity-70 mb-2">Inversión Total General</p>
                  <h3 className="text-2xl md:text-4xl font-light tracking-wide">Con Servicios Adicionales</h3>
                </div>
                <div className="text-right">
                  <p className="text-4xl md:text-6xl font-light">$468,410</p>
                  <p className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">MXN</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Condiciones comerciales */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl tracking-[0.12em] uppercase font-light mb-4">
              Términos Comerciales
            </h2>
            <p className="text-sm text-muted-foreground">Experiencia Integral</p>
          </div>

          <div className="space-y-6">
            {/* Nota de fechas importantes */}
            <div className="bg-foreground text-background p-6 space-y-3">
              <p className="text-[10px] tracking-[0.3em] uppercase opacity-70 mb-2">Fechas importantes</p>
              <div className="space-y-2 text-sm leading-relaxed">
                <p>
                  <strong className="font-medium">07 de febrero:</strong> Firma de contrato y entrega del anticipo del
                  35% del presupuesto elegido
                </p>
                <p>
                  <strong className="font-medium">28 de febrero:</strong> Liquidación del total restante del presupuesto
                  elegido
                </p>
              </div>
            </div>

            {/* Nota importante sobre servicios */}
            <div className="border-2 border-foreground/20 bg-background p-6 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                <strong className="font-medium">**</strong> Todos los servicios deberán contratarse con El Romeral
                para poder aplicar el precio preferencial en la renta de instalaciones y cortesías de la "Experiencia
                Integral".
              </p>
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-foreground/10">
                <p className="font-medium text-foreground">Con excepción de:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Vinos y licores en botella cerrada (No servicios a proveedores externos de barras)</li>
                  <li>• Fotógrafo y video</li>
                  <li>• Mariachi</li>
                  <li>• Souvenirs (Cilindros, pantunflas, etc)</li>
                  <li>
                    • Grupo Musical (Se rentará con El Romeral la planta de luz para grupo musical y/o tarimas)
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-foreground/10 bg-background p-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>Precios en moneda nacional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>No incluye I.V.A.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>Bloqueo de fecha con $25,000 pesos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>Pago del 35% del total del evento al mes para congelar los precios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>
                    Beneficio de pagos en mensualidades sin intereses, pago de última mensualidad un mes antes de la
                    fecha del evento
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>Pagos extemporáneos se les aplicará el 10% por pago extemporáneo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>
                    <strong className="text-foreground">CAMBIOS DE FECHA:</strong> Aplica únicamente cuando por
                    disposición gubernamental no se puedan realizar eventos, el evento se programará a la próxima fecha
                    disponible dentro de los 365 días a la fecha del evento previamente pactado. En cambios de fecha
                    posteriores a 365 días de la fecha previamente pactada aplicará ajuste de precios en alimentos,
                    bebidas y floristería
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>
                    Cancelaciones mayores a 181 días previos al evento se retendrá el 60% del precio pactado por
                    concepto de daños y perjuicios
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>
                    Cancelaciones entre 1 día y 180 días previos al evento deberá liquidar en su totalidad el precio
                    pactado por concepto de daños y perjuicios
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground/50 mt-1">•</span>
                  <span>
                    Depósito en garantía en efectivo un mes antes del evento, el cual se regresará 8 días posteriores
                    al evento
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cortesías */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Gift className="w-12 h-12 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl md:text-4xl tracking-[0.12em] uppercase font-light mb-4">Cortesías Incluidas</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Como parte de nuestra experiencia integral, incluimos los siguientes detalles de cortesía
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                titulo: "Plano de mesas numerado",
                descripcion: "Diseño y elaboración del plano de distribución de mesas con numeración personalizada",
              },
              {
                titulo: "Menús de mesa impresos",
                descripcion: "Menús impresos para cada mesa con el detalle de los platillos que se servirán",
              },
              {
                titulo: "Numeración de mesas",
                descripcion: "Totem de madera o color plata con numeración para identificación de mesas",
              },
              {
                titulo: "Coordinador de evento",
                descripcion: "Coordinador dedicado que acompañará el desarrollo del evento",
              },
            ].map((cortesia, index) => (
              <div key={index} className="border border-foreground/10 bg-background p-6">
                <h4 className="text-sm tracking-[0.15em] uppercase font-light mb-3">{cortesia.titulo}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{cortesia.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-6">
            Para apartar tu fecha
          </h2>
          <p className="text-sm text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
            Escríbenos por WhatsApp y nuestro equipo te acompañará en cada detalle de tu celebración.
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="px-10 py-6 text-sm tracking-widest uppercase"
            >
              <Link href="https://wa.me/3338708159?text=Hola,%20me%20interesa%20apartar%20una%20fecha%20para%20Primera%20Comunión" target="_blank" rel="noopener noreferrer">
                Escríbenos por WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            El Romeral - Jardín para Eventos · Zapopan, Jalisco · contacto@elromeral.com.mx
          </p>
        </div>
      </footer>

      {/* Modal de imagen */}
      {imagenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImagenModal(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <button
              onClick={() => setImagenModal(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-4xl">×</span>
            </button>
            <div className="relative w-full h-[80vh]">
              <Image
                src={imagenModal || "/placeholder.svg"}
                alt="Foto de referencia"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
