"use client"

import type React from "react"
import { useState } from "react"
import { Eye } from "lucide-react"
import type { ConfiguradorData } from "@/app/configurador/types"
import { PRECIO_PISTA_ILUMINADA, PRECIOS_PISTA_PINTADA } from "@/app/configurador/constants"
import { ImageModal } from "./ImageModal"
import { scrollToBottom } from "@/lib/scroll-utils"

interface Step10Props {
  data: ConfiguradorData
  onContinue: (updates: Partial<ConfiguradorData>) => void
  onChange?: (updates: Partial<ConfiguradorData>) => void
}

function calcularPrecioPintada(numInvitados: number): number {
  for (const rango of PRECIOS_PISTA_PINTADA) {
    if (numInvitados >= rango.min && numInvitados <= rango.max) {
      return rango.precio
    }
  }
  return PRECIOS_PISTA_PINTADA[PRECIOS_PISTA_PINTADA.length - 1].precio
}

function obtenerTamanoPista(numInvitados: number): string {
  for (const rango of PRECIOS_PISTA_PINTADA) {
    if (numInvitados >= rango.min && numInvitados <= rango.max) {
      return rango.medida
    }
  }
  return "7 x 7"
}

export default function Step10({ data, onContinue, onChange }: Step10Props) {
  const [tipoPistaSeleccionada, setTipoPistaSeleccionada] = useState<"iluminada" | "pintada" | "">(data.tipoPista || "")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImage, setModalImage] = useState("")
  const [modalTitle, setModalTitle] = useState("")

  const handlePistaChange = (tipo: "iluminada" | "pintada") => {
    setTipoPistaSeleccionada(tipo)
    if (onChange) {
      onChange({ tipoPista: tipo })
    }
    setTimeout(() => scrollToBottom(), 100)
  }

  const precioPistaPintada = calcularPrecioPintada(data.numInvitados)
  const tamanoPista = obtenerTamanoPista(data.numInvitados)

  const handleContinuar = () => {
    if (tipoPistaSeleccionada) {
      onContinue({ tipoPista: tipoPistaSeleccionada })
    }
  }

  const handleVerEjemplo = (tipo: "iluminada" | "pintada", e: React.MouseEvent) => {
    e.stopPropagation()
    if (tipo === "iluminada") {
      setModalImage("/images/pistas/pista-iluminada-led.jpg")
      setModalTitle("Pista Iluminada LED")
    } else {
      setModalImage("/images/pistas/pista-pintada-a-mano.jpg")
      setModalTitle("Pista Pintada a Mano")
    }
    setModalOpen(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-muted-foreground tracking-wide leading-relaxed max-w-2xl mx-auto">
          La pista es el corazón de la fiesta. Una pista iluminada LED crea espectáculo visual y modernidad. Una pista pintada a mano aporta exclusividad artesanal única para su celebración. Ambas invitan a bailar desde el primer momento.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pista Iluminada LED */}
        <div
          onClick={() => handlePistaChange("iluminada")}
          className={`cursor-pointer transition-all border-2 p-8 relative ${
            tipoPistaSeleccionada === "iluminada"
              ? "border-foreground bg-foreground text-background"
              : "border-neutral-200 hover:border-neutral-400"
          }`}
        >
          <span
            className={`text-[10px] tracking-widest uppercase block mb-3 ${
              tipoPistaSeleccionada === "iluminada" ? "text-background/60" : "text-muted-foreground"
            }`}
          >
            Opción 01
          </span>

          <button
            onClick={(e) => handleVerEjemplo("iluminada", e)}
            className={`absolute top-8 right-8 px-3 py-1.5 text-[10px] tracking-wider uppercase flex items-center gap-1.5 border transition-all ${
              tipoPistaSeleccionada === "iluminada"
                ? "border-background/20 text-background/70 hover:bg-background/10"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-500"
            }`}
          >
            <Eye className="w-3 h-3" />
            Ver ejemplo
          </button>

          <h3
            className={`font-serif text-2xl md:text-3xl font-light mb-6 ${tipoPistaSeleccionada === "iluminada" ? "text-background" : ""}`}
          >
            Pista Iluminada LED
          </h3>

          <div
            className={`font-serif text-2xl font-light mb-8 ${tipoPistaSeleccionada === "iluminada" ? "text-background" : ""}`}
          >
            ${PRECIO_PISTA_ILUMINADA.toLocaleString("es-MX")}
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${tipoPistaSeleccionada === "iluminada" ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={tipoPistaSeleccionada === "iluminada" ? "text-background/80" : "text-neutral-600"}>
                LED cálido
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${tipoPistaSeleccionada === "iluminada" ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={tipoPistaSeleccionada === "iluminada" ? "text-background/80" : "text-neutral-600"}>
                Focos Edison
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${tipoPistaSeleccionada === "iluminada" ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={tipoPistaSeleccionada === "iluminada" ? "text-background/80" : "text-neutral-600"}>
                Iluminación ambiental
              </span>
            </li>
          </ul>
        </div>

        {/* Pista Pintada a Mano */}
        <div
          onClick={() => handlePistaChange("pintada")}
          className={`cursor-pointer transition-all border-2 p-8 relative ${
            tipoPistaSeleccionada === "pintada"
              ? "border-foreground bg-foreground text-background"
              : "border-neutral-200 hover:border-neutral-400"
          }`}
        >
          <span
            className={`text-[10px] tracking-widest uppercase block mb-3 ${
              tipoPistaSeleccionada === "pintada" ? "text-background/60" : "text-muted-foreground"
            }`}
          >
            Opción 02
          </span>

          <button
            onClick={(e) => handleVerEjemplo("pintada", e)}
            className={`absolute top-8 right-8 px-3 py-1.5 text-[10px] tracking-wider uppercase flex items-center gap-1.5 border transition-all ${
              tipoPistaSeleccionada === "pintada"
                ? "border-background/20 text-background/70 hover:bg-background/10"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-500"
            }`}
          >
            <Eye className="w-3 h-3" />
            Ver ejemplo
          </button>

          <h3
            className={`font-serif text-2xl md:text-3xl font-light mb-6 ${tipoPistaSeleccionada === "pintada" ? "text-background" : ""}`}
          >
            Pista Pintada a Mano
          </h3>

          <div
            className={`font-serif text-2xl font-light mb-8 ${tipoPistaSeleccionada === "pintada" ? "text-background" : ""}`}
          >
            ${precioPistaPintada.toLocaleString("es-MX")}
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${tipoPistaSeleccionada === "pintada" ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={tipoPistaSeleccionada === "pintada" ? "text-background/80" : "text-neutral-600"}>
                Pintada a mano rectangular
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${tipoPistaSeleccionada === "pintada" ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={tipoPistaSeleccionada === "pintada" ? "text-background/80" : "text-neutral-600"}>
                Tamaño: {tamanoPista} metros
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm font-light">
              <span
                className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${tipoPistaSeleccionada === "pintada" ? "bg-background/60" : "bg-neutral-400"}`}
              />
              <span className={tipoPistaSeleccionada === "pintada" ? "text-background/80" : "text-neutral-600"}>
                Sugerida para {data.numInvitados} personas
              </span>
            </li>
          </ul>
        </div>
      </div>

      <button
        onClick={handleContinuar}
        disabled={!tipoPistaSeleccionada}
        className={`w-full mt-16 py-5 border text-xs tracking-widest uppercase transition-all duration-300 ${
          tipoPistaSeleccionada
            ? "border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground"
            : "border-neutral-300 text-neutral-400 cursor-not-allowed"
        }`}
      >
        Continuar
      </button>

      <ImageModal isOpen={modalOpen} onClose={() => setModalOpen(false)} imageSrc={modalImage} title={modalTitle} />
    </div>
  )
}
