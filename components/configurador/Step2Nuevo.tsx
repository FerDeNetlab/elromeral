"use client"

import { useState } from "react"
import type { ConfiguradorData } from "@/app/configurador/types"

interface Step2Props {
  data: ConfiguradorData
  onContinue: (data: Partial<ConfiguradorData>) => void
  onChange?: (data: Partial<ConfiguradorData>) => void
}

export default function Step2Nuevo({ data, onContinue, onChange }: Step2Props) {
  const [tipoEvento, setTipoEvento] = useState<"comida" | "cena" | "">(data.tipoEvento || "")

  const handleTipoEventoChange = (tipo: "comida" | "cena") => {
    setTipoEvento(tipo)
    if (onChange) {
      onChange({ tipoEvento: tipo })
    }
  }

  const handleContinuar = () => {
    if (!tipoEvento) {
      alert("Por favor seleccionen una opción")
      return
    }
    onContinue({ tipoEvento })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-12">
        {/* Pregunta */}
        <div className="text-center space-y-4">
          <p className="font-serif text-2xl font-light text-foreground">¿Prefieren comida o cena?</p>
          <p className="text-sm text-muted-foreground font-light">
            Esta preferencia nos ayudará a personalizar mejor su experiencia
          </p>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTipoEventoChange("comida")}
            className={`relative p-8 border transition-all duration-300 text-center ${
              tipoEvento === "comida"
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground/50"
            }`}
          >
            <span className="font-serif text-2xl font-light">Comida</span>
            <span className="block text-xs tracking-wider mt-2 opacity-60">Evento diurno</span>
          </button>
          <button
            onClick={() => handleTipoEventoChange("cena")}
            className={`relative p-8 border transition-all duration-300 text-center ${
              tipoEvento === "cena"
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground/50"
            }`}
          >
            <span className="font-serif text-2xl font-light">Cena</span>
            <span className="block text-xs tracking-wider mt-2 opacity-60">Evento nocturno</span>
          </button>
        </div>

        {/* Botón Continuar */}
        <button
          onClick={handleContinuar}
          disabled={!tipoEvento}
          className="w-full p-5 border border-foreground bg-foreground text-background text-xs tracking-widest uppercase hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
