"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, X } from "lucide-react"
import Image from "next/image"
import type { StepProps } from "@/app/configurador/types"
import { scrollToBottom } from "@/lib/scroll-utils"

const MESA_NOVIOS_IMAGE = "/images/er29nov25-25.jpg"

export default function Step5({
  data,
  onChange,
  onContinue,
}: StepProps & { onChange?: (updates: Partial<typeof data>) => void }) {
  const [incluyeMesaNovios, setIncluyeMesaNovios] = useState<boolean | null>(data.incluyeMesaNovios ?? null)
  const [showModal, setShowModal] = useState(false)

  const handleSelection = (value: boolean) => {
    setIncluyeMesaNovios(value)
    const updates = {
      incluyeMesaNovios: value,
      tipoMesaNovios: "",
      tipoAsientoNovios: "",
    }
    if (onChange) onChange(updates)
    scrollToBottom(150)
  }

  const handleContinue = () => {
    onContinue({
      incluyeMesaNovios,
      tipoMesaNovios: "",
      tipoAsientoNovios: "",
    })
  }

  const isValid = incluyeMesaNovios !== null

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center mb-12">
        <p className="text-muted-foreground text-sm tracking-wide leading-relaxed max-w-2xl mx-auto">
          Algunos novios prefieren un espacio propio, elevado y enmarcado con luz, donde todos puedan verlos. Otros eligen integrarse entre sus invitados desde el primer momento. Ambas decisiones son válidas—elijan la que refleje cómo desean vivir su celebración.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* OPCIÓN 01: Sin mesa de novios */}
        <button
          onClick={() => handleSelection(false)}
          className={`relative p-6 sm:p-8 rounded border-2 transition-all text-left group ${
            incluyeMesaNovios === false
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground/40"
          }`}
        >
          <span className="text-[10px] tracking-widest uppercase text-inherit opacity-60 block mb-4">Opción 01</span>

          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-light mb-4 sm:mb-6">Entre sus invitados</h3>

          <div className="text-xs sm:text-sm font-light space-y-3 opacity-80 leading-relaxed">
            <p>Ustedes se integran en las mesas junto a sus seres queridos, compartiendo la experiencia sin separaciones ni tarimas. La celebración fluye naturalmente.</p>
          </div>
        </button>

        {/* OPCIÓN 02: Con mesa de novios */}
        <button
          onClick={() => handleSelection(true)}
          className={`relative p-6 sm:p-8 rounded border-2 transition-all text-left group ${
            incluyeMesaNovios === true
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground/40"
          }`}
        >
          <div
            className="absolute top-4 right-4 z-10"
            onClick={(e) => {
              e.stopPropagation()
              setShowModal(true)
            }}
          >
            <span
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-all cursor-pointer ${
                incluyeMesaNovios === true
                  ? "border-background/30 hover:bg-background/10"
                  : "border-foreground/20 hover:border-foreground/40"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Ver ejemplo
            </span>
          </div>

          <span className="text-[10px] tracking-widest uppercase text-inherit opacity-60 block mb-4">Opción 02</span>

          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-light mb-4 sm:mb-6">Su escenario propio</h3>

          <p className="font-serif text-xl sm:text-2xl font-light mb-4 sm:mb-6">$26,050</p>

          <ul className="text-xs sm:text-sm font-light space-y-2 opacity-80 leading-relaxed">
            <li>• Su mesa en el estilo que elijan</li>
            <li>• Sillones o sillas que los destaquen</li>
            <li>• Tarima elevada para visibilidad perfecta</li>
            <li>• Decoración de mesa pensada para ustedes</li>
            <li>• Arreglo floral que enmarque su momento</li>
            <li>• Iluminación dedicada que los resalta toda la noche</li>
          </ul>
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground italic leading-relaxed max-w-xl mx-auto">
        La imagen muestra una mesa de novios de referencia. El back floral se diseña de forma independiente según su visión y estilo personal.
      </p>

      <div id="btn-continuar" className="flex justify-center pt-8">
        <Button onClick={handleContinue} disabled={!isValid} size="lg" className="min-w-[200px]">
          CONTINUAR
        </Button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-50"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-center text-lg tracking-[0.2em] uppercase font-extralight mb-6">
              Mesa de Novios
            </h3>

            <div className="relative aspect-[3/4] w-full max-h-[70vh] rounded-lg overflow-hidden bg-neutral-900">
              <Image
                src={MESA_NOVIOS_IMAGE || "/placeholder.svg"}
                alt="Mesa de Novios - Referencia"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={90}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
