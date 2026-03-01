"use client"

import React from "react"

import { Check } from "lucide-react"
import type { ConfiguradorData } from "@/app/configurador/types"
import { PRECIO_MENU_3_TIEMPOS, PRECIO_PARRILLADA } from "@/app/configurador/constants"

interface Step2Props {
  data: ConfiguradorData
  onChange?: (updates: Partial<ConfiguradorData>) => void
  onContinue: (updates: Partial<ConfiguradorData>) => void
}

export default function Step2({ data, onChange, onContinue }: Step2Props) {
  const [seleccion, setSeleccion] = React.useState<"menu3tiempos" | "parrillada" | null>(data.tipoComida || null)

  const handleSeleccion = (tipo: "menu3tiempos" | "parrillada") => {
    setSeleccion(tipo)
    if (onChange) {
      onChange({ tipoComida: tipo })
    }
  }

  const handleContinue = () => {
    if (seleccion) {
      onContinue({ tipoComida: seleccion })
    }
  }

  const cocteleriaPara = Math.ceil(data.numInvitados * 1.5)

  const menu3TiemposFeatures = [
    "Más de 100 platillos artesanales con proteínas selectas",
    "Mobiliario completo: mesas con mantelería fina, cristalería de calidad",
    "Equipo de meseros y bartenders dedicados a su evento",
    "Bebidas refrescantes ilimitadas durante toda la celebración",
    `${cocteleriaPara} cócteles de autor en cuatro sabores que ustedes eligen`,
    "Mobiliario lounge junto a la alberca para el cóctel de bienvenida",
  ]

  const parrilladaFeatures = [
    "4 cortes premium al grill: Rib eye, Vacío, Arrachera, Diezmillo, más chistorra, chorizo artesanal y verduras a la parrilla",
    "Tortillas hechas a mano al momento, ensaladas frescas y complementos tradicionales preparados con recetas auténticas",
    "Mobiliario completo con cristalería y vajilla elegante",
    "Equipo de meseros y bartenders dedicados a su celebración",
    "Bebidas refrescantes sin límite durante todo el evento",
    `${cocteleriaPara} cócteles preparados con ingredientes premium`,
    "Espacios lounge para disfrutar el cóctel junto a la alberca",
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <p className="text-muted-foreground text-sm tracking-wide leading-relaxed max-w-2xl mx-auto">
          La comida es uno de los recuerdos más vívidos de cualquier celebración. Un menú de tres tiempos ofrece versatilidad clásica con más de 100 opciones refinadas. La parrillada argentina aporta calidez, autenticidad y el ritual de compartir alrededor del fuego. Ambas experiencias deleitarán a sus invitados.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
        {/* Menú 3 Tiempos */}
        <button
          onClick={() => handleSeleccion("menu3tiempos")}
          className={`text-left p-6 sm:p-8 md:p-10 border transition-all duration-300 ${
            seleccion === "menu3tiempos"
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground"
          }`}
        >
          <div className="space-y-6">
            <div>
              <span
                className={`text-[10px] tracking-widest uppercase block mb-3 ${
                  seleccion === "menu3tiempos" ? "text-background/60" : "text-muted-foreground"
                }`}
              >
                Opción 01
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-light">Menú de 3 Tiempos</h3>
              <p
                className={`text-sm mt-2 ${
                  seleccion === "menu3tiempos" ? "text-background/80" : "text-muted-foreground"
                }`}
              >
                Escojan de entre más de 100 opciones de platillos
              </p>
            </div>

            <div className="space-y-3">
              {menu3TiemposFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      seleccion === "menu3tiempos" ? "text-background/60" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-light leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <div
              className={`pt-6 border-t space-y-2 ${
                seleccion === "menu3tiempos" ? "border-background/20" : "border-border"
              }`}
            >
              <div className="flex justify-between items-baseline">
                <span
                  className={`text-xs tracking-wider ${
                    seleccion === "menu3tiempos" ? "text-background/60" : "text-muted-foreground"
                  }`}
                >
                  Por persona
                </span>
                <span className="font-serif text-lg">${PRECIO_MENU_3_TIEMPOS.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span
                  className={`text-xs tracking-wider ${
                    seleccion === "menu3tiempos" ? "text-background/60" : "text-muted-foreground"
                  }`}
                >
                  Total para {data.numInvitados} invitados
                </span>
                <span className="font-serif text-2xl font-light">
                  ${(PRECIO_MENU_3_TIEMPOS * data.numInvitados).toLocaleString()} MXN
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Parrillada */}
        <button
          onClick={() => handleSeleccion("parrillada")}
          className={`text-left p-8 md:p-10 border transition-all duration-300 ${
            seleccion === "parrillada"
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground"
          }`}
        >
          <div className="space-y-6">
            <div>
              <span
                className={`text-[10px] tracking-widest uppercase block mb-3 ${
                  seleccion === "parrillada" ? "text-background/60" : "text-muted-foreground"
                }`}
              >
                Opción 02
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-light">Parrillada de Cortes</h3>
              <p
                className={`text-sm mt-2 ${
                  seleccion === "parrillada" ? "text-background/80" : "text-muted-foreground"
                }`}
              >
                4 cortes premium + guarniciones
              </p>
            </div>

            <div className="space-y-3">
              {parrilladaFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      seleccion === "parrillada" ? "text-background/60" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-light leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <div
              className={`pt-6 border-t space-y-2 ${
                seleccion === "parrillada" ? "border-background/20" : "border-border"
              }`}
            >
              <div className="flex justify-between items-baseline">
                <span
                  className={`text-xs tracking-wider ${
                    seleccion === "parrillada" ? "text-background/60" : "text-muted-foreground"
                  }`}
                >
                  Por persona
                </span>
                <span className="font-serif text-lg">${PRECIO_PARRILLADA.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span
                  className={`text-xs tracking-wider ${
                    seleccion === "parrillada" ? "text-background/60" : "text-muted-foreground"
                  }`}
                >
                  Total para {data.numInvitados} invitados
                </span>
                <span className="font-serif text-2xl font-light">
                  ${(PRECIO_PARRILLADA * data.numInvitados).toLocaleString()} MXN
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {seleccion && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleContinue}
            className="px-12 py-5 border border-foreground bg-foreground text-background text-xs tracking-widest uppercase hover:bg-transparent hover:text-foreground transition-all duration-300"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  )
}
