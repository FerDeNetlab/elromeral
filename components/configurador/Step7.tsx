"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import { PRECIO_TOLDO_ALEMAN, PRECIO_TOLDO_PERSONALIZADO } from "@/app/configurador/constants"
import type { ConfiguradorData } from "@/app/configurador/types"
import ImageModal from "./ImageModal"
import { scrollToBottom } from "@/lib/scroll-utils"

interface Step7Props {
  data: ConfiguradorData
  onContinue: (updates: Partial<ConfiguradorData>) => void
  onChange?: (updates: Partial<ConfiguradorData>) => void
}

export default function Step7({ data, onContinue, onChange }: Step7Props) {
  const [toldoSeleccionado, setToldoSeleccionado] = useState<"default" | "aleman" | "personalizado" | "">(
    data.tipoToldo || "",
  )
  const [modalAbierto, setModalAbierto] = useState(false)
  const [imagenActual, setImagenActual] = useState<string>("")
  const [tituloModal, setTituloModal] = useState<string>("")
  const [imagenesGaleria, setImagenesGaleria] = useState<string[]>([])
  const [indiceGaleria, setIndiceGaleria] = useState(0)

  const handleToldoChange = (tipo: "default" | "aleman" | "personalizado") => {
    setToldoSeleccionado(tipo)
    if (onChange) {
      onChange({ tipoToldo: tipo })
    }
    scrollToBottom(150)
  }

  const handleContinuar = () => {
    if (!toldoSeleccionado) return
    onContinue({ tipoToldo: toldoSeleccionado })
  }

  const abrirModal = (titulo: string, imagenes: string[]) => {
    setTituloModal(titulo)
    setImagenesGaleria(imagenes)
    setIndiceGaleria(0)
    setImagenActual(imagenes[0])
    setModalAbierto(true)
  }

  const navegarGaleria = (direccion: "prev" | "next") => {
    const nuevoIndice =
      direccion === "next"
        ? (indiceGaleria + 1) % imagenesGaleria.length
        : (indiceGaleria - 1 + imagenesGaleria.length) % imagenesGaleria.length
    setIndiceGaleria(nuevoIndice)
    setImagenActual(imagenesGaleria[nuevoIndice])
  }

  const opciones = [
    {
      id: "default" as const,
      nombre: "Toldo Panorámico",
      precio: 0,
      caracteristicas: ["Protección elegante en blanco o negro", "Altura perfecta a 5 metros", "Iluminación cálida que realza el ambiente"],
      imagenes: ["/images/toldos/toldo-panoramico.png"],
    },
    {
      id: "aleman" as const,
      nombre: "Toldo Alemán",
      precio: PRECIO_TOLDO_ALEMAN,
      caracteristicas: ["Entelado plisado sofisticado en negro o flecos ivory", "Altura majestuosa de 9.5 metros", "Iluminación diseñada para crear intimidad"],
      imagenes: ["/images/toldos/toldo-aleman-1.png", "/images/toldos/toldo-aleman-2.png"],
    },
    {
      id: "personalizado" as const,
      nombre: "Toldo Personalizado",
      precio: PRECIO_TOLDO_PERSONALIZADO,
      caracteristicas: [
        "Telas y colores que reflejan su estilo único",
        "Altura imponente de 9.5 metros",
        "Diseñado exclusivamente para su celebración",
        "Sin límites creativos",
      ],
      imagenes: ["/images/toldos/toldo-personalizado.png"],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-muted-foreground tracking-wide leading-relaxed max-w-2xl mx-auto">
            El toldo define la atmósfera de su celebración. Desde la protección funcional hasta la elegancia de las telas personalizadas, cada opción transforma el jardín de forma diferente. Elijan el nivel de sofisticación que refleje su visión.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-4 max-w-2xl mx-auto">
            Las imágenes son referencias visuales. La decoración y ambientación se diseñarán específicamente para su celebración.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {opciones.map((opcion, index) => (
            <div
              key={opcion.id}
              className={`relative cursor-pointer transition-all border-2 p-6 sm:p-8 overflow-hidden ${
                toldoSeleccionado === opcion.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <span
                className={`text-[10px] tracking-widest uppercase block mb-3 ${
                  toldoSeleccionado === opcion.id ? "text-background/60" : "text-muted-foreground"
                }`}
              >
                Opción {String(index + 1).padStart(2, "0")}
              </span>

              <div onClick={() => handleToldoChange(opcion.id)}>
                <div className="mb-6">
                  <h3
                    className={`font-serif text-xl tracking-wide mb-4 ${toldoSeleccionado === opcion.id ? "text-background" : ""}`}
                  >
                    {opcion.nombre}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      abrirModal(opcion.nombre, opcion.imagenes)
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-wider uppercase transition-all ${
                      toldoSeleccionado === opcion.id
                        ? "border border-background/30 hover:border-background/60 text-background/80 hover:text-background"
                        : "border border-neutral-300 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                    title="Ver ejemplo"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver ejemplo</span>
                  </button>
                </div>

                <div className={`font-serif text-3xl mb-8 ${toldoSeleccionado === opcion.id ? "text-background" : ""}`}>
                  {opcion.precio === 0 ? "Incluido" : `$${opcion.precio.toLocaleString("es-MX")}`}
                </div>

                <ul className="space-y-3">
                  {opcion.caracteristicas.map((car, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span
                        className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${toldoSeleccionado === opcion.id ? "bg-background/60" : "bg-neutral-400"}`}
                      />
                      <span className={toldoSeleccionado === opcion.id ? "text-background/80" : "text-neutral-600"}>
                        {car}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <button
          id="btn-continuar"
          onClick={handleContinuar}
          disabled={!toldoSeleccionado}
          className="w-full mt-16 py-5 border border-foreground bg-foreground text-background text-xs tracking-widest uppercase hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>

      {modalAbierto && (
        <ImageModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          imageSrc={imagenActual}
          title={tituloModal}
          showNavigation={imagenesGaleria.length > 1}
          currentIndex={indiceGaleria}
          totalImages={imagenesGaleria.length}
          onNext={() => navegarGaleria("next")}
          onPrev={() => navegarGaleria("prev")}
        />
      )}
    </div>
  )
}
