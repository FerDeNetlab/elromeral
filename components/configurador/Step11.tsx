"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import type { ConfiguradorData } from "@/app/configurador/types"
import { PRECIO_CAPILLA } from "@/app/configurador/constants"
import { ImageModal } from "./ImageModal"
import { scrollToBottom } from "@/lib/scroll-utils"

interface Step11Props {
  data: ConfiguradorData
  onContinue: (updates: Partial<ConfiguradorData>) => void
  onChange?: (updates: Partial<ConfiguradorData>) => void
}

export default function Step11({ data, onContinue, onChange }: Step11Props) {
  const [capillaSeleccionada, setCapillaSeleccionada] = useState<boolean | null>(
    data.incluyeCapilla === false ? false : data.incluyeCapilla === true ? true : null,
  )
  const [showCapillaGallery, setShowCapillaGallery] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const capillaImages = [
    "/images/romeral1-20-282-29.jpg",
    "/images/er-36-20-281-29.jpg",
    "/images/romeral4oct25-32-20-281-29.jpg",
    "/images/er-34.jpg",
    "/images/9bc7747c-8dd6-4dc6-8bd8-07ec028b1314-20-283-29.jpeg",
    "/images/img-1077-281-29-20-281-29.png",
  ]

  const handleCapillaChange = (incluye: boolean) => {
    setCapillaSeleccionada(incluye)
    if (onChange) {
      onChange({ incluyeCapilla: incluye })
    }
    // Scroll hacia el botón continuar
    setTimeout(() => scrollToBottom(), 100)
  }

  const handleContinuar = () => {
    if (capillaSeleccionada !== null) {
      onContinue({ incluyeCapilla: capillaSeleccionada })
    }
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % capillaImages.length)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + capillaImages.length) % capillaImages.length)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-sm tracking-wide text-muted-foreground/90 mb-4 leading-relaxed max-w-2xl mx-auto">
          Cuando la ceremonia y la recepción fluyen en un mismo espacio, todo cobra sentido. Sus invitados disfrutan sin traslados ni tiempos muertos, ustedes viven cada momento con tranquilidad, y su celebración transcurre con la naturalidad que siempre imaginaron.
        </p>
        <p className="text-xs tracking-wider text-muted-foreground/70 uppercase">
          ¿Desean celebrar su ceremonia en El Romeral?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Sin Capilla */}
        <div
          onClick={() => handleCapillaChange(false)}
          className={`cursor-pointer transition-all border-2 p-8 ${
            capillaSeleccionada === false
              ? "border-foreground bg-foreground text-background"
              : "border-neutral-200 hover:border-neutral-400"
          }`}
        >
          <span
            className={`text-[10px] tracking-widest uppercase block mb-3 ${
              capillaSeleccionada === false ? "text-background/60" : "text-muted-foreground"
            }`}
          >
            Opción 01
          </span>

          <h3
            className={`font-serif text-2xl md:text-3xl font-light mb-6 ${capillaSeleccionada === false ? "text-background" : ""}`}
          >
            Sin Capilla
          </h3>

          <p
            className={`text-sm font-light mt-6 leading-relaxed ${capillaSeleccionada === false ? "text-background/80" : "text-neutral-600"}`}
          >
            Su ceremonia será en otro espacio. Aquí celebraremos únicamente la recepción, donde el jardín se transformará para recibir a sus invitados.
          </p>
        </div>

        {/* Con Capilla */}
        <div
          onClick={() => handleCapillaChange(true)}
          className={`cursor-pointer transition-all border-2 p-8 relative ${
            capillaSeleccionada === true
              ? "border-foreground bg-foreground text-background"
              : "border-neutral-200 hover:border-neutral-400"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowCapillaGallery(true)
              setCurrentImageIndex(0)
            }}
            className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 text-xs border transition-all duration-300 ${
              capillaSeleccionada === true
                ? "border-background/30 text-background hover:bg-background/10"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="tracking-wide">Ver ejemplo</span>
          </button>

          <span
            className={`text-[10px] tracking-widest uppercase block mb-3 ${
              capillaSeleccionada === true ? "text-background/60" : "text-muted-foreground"
            }`}
          >
            Opción 02
          </span>

          <h3
            className={`font-serif text-2xl md:text-3xl font-light mb-6 ${capillaSeleccionada === true ? "text-background" : ""}`}
          >
            Capilla Cristo del Romeral
          </h3>

          <a
            href="https://www.arquidiocesisgdl.org/busqueda_directorio_templos.php"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`block p-4 mb-6 transition-opacity hover:opacity-80 ${
              capillaSeleccionada === true ? "bg-background/10" : "bg-neutral-100"
            }`}
          >
            <p className={`text-sm font-medium tracking-wide ${capillaSeleccionada === true ? "text-background" : ""}`}>
              Capilla Consagrada
            </p>
            <p
              className={`text-xs mt-1 underline ${capillaSeleccionada === true ? "text-background/70" : "text-neutral-600"}`}
            >
              Para consulta en la Arquidiócesis de GDL da click
            </p>
            <p
              className={`text-[10px] mt-2 italic ${capillaSeleccionada === true ? "text-background/60" : "text-neutral-500"}`}
            >
              Buscar como: Cristo del Romeral
            </p>
          </a>

          <div
            className={`font-serif text-2xl font-light mb-8 ${capillaSeleccionada === true ? "text-background" : ""}`}
          >
            ${PRECIO_CAPILLA.toLocaleString("es-MX")}
          </div>

          <div className={`mb-6 p-4 text-sm leading-relaxed ${capillaSeleccionada === true ? "bg-background/5 text-background/80" : "bg-neutral-50 text-neutral-700"}`}>
            <p className="mb-3">
              <span className="font-medium">Todo fluye en un mismo lugar.</span> Sin traslados, sin prisas, sin estrés logístico. Sus invitados pasan de la emoción de la ceremonia a la celebración del jardín de manera natural, mientras ustedes disfrutan cada momento con la certeza de que todo está bajo control.
            </p>
          </div>
          
          <p className={`text-xs uppercase tracking-wider mb-3 ${capillaSeleccionada === true ? "text-background/60" : "text-neutral-500"}`}>Incluye en la ceremonia</p>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${capillaSeleccionada === true ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={capillaSeleccionada === true ? "text-background/80" : "text-neutral-600"}>
                Coordinación profesional en ceremonia religiosa
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${capillaSeleccionada === true ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={capillaSeleccionada === true ? "text-background/80" : "text-neutral-600"}>
                Alfombra (roja, azul o ivory) e iluminación
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${capillaSeleccionada === true ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={capillaSeleccionada === true ? "text-background/80" : "text-neutral-600"}>
                Coro Amadeus con 7 elementos
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${capillaSeleccionada === true ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={capillaSeleccionada === true ? "text-background/80" : "text-neutral-600"}>
                Floristería completa personalizada
              </span>
            </li>
          </ul>

          <div
            className={`mt-6 pt-4 border-t text-[10px] italic ${
              capillaSeleccionada === true
                ? "border-background/20 text-background/60"
                : "border-neutral-200 text-neutral-500"
            }`}
          >
            * Las imágenes son ejemplos de referencia de la capilla. La decoración se personalizará según su evento.
          </div>
        </div>
      </div>

      <button
        onClick={handleContinuar}
        disabled={capillaSeleccionada === null}
        className={`w-full mt-16 py-5 border text-xs tracking-widest uppercase transition-all duration-300 ${
          capillaSeleccionada !== null
            ? "border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground"
            : "border-neutral-300 text-neutral-400 cursor-not-allowed"
        }`}
      >
        Continuar
      </button>

      <ImageModal
        isOpen={showCapillaGallery}
        onClose={() => setShowCapillaGallery(false)}
        imageSrc={capillaImages[currentImageIndex]}
        title="Capilla Cristo del Romeral"
        showNavigation={true}
        currentIndex={currentImageIndex}
        totalImages={capillaImages.length}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
    </div>
  )
}
