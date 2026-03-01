"use client"

import { useState } from "react"
import type { ConfiguradorData } from "@/app/configurador/types"
import { PRECIO_VINOS_LICORES } from "@/app/configurador/constants"
import { scrollToBottom } from "@/lib/scroll-utils"

interface Step3Props {
  data: ConfiguradorData
  onChange?: (updates: Partial<ConfiguradorData>) => void
  onContinue: (updates: Partial<ConfiguradorData>) => void
}

export default function Step3({ data, onChange, onContinue }: Step3Props) {
  const [seleccion, setSeleccion] = useState<boolean | null>(data.incluyeVinosLicores)

  const handleSeleccion = (incluye: boolean) => {
    setSeleccion(incluye)
    if (onChange) {
      onChange({ incluyeVinosLicores: incluye })
    }
    scrollToBottom(150)
  }

  const handleContinue = () => {
    if (seleccion === null) return
    onContinue({ incluyeVinosLicores: seleccion })
  }

  const bebidas = [
    { categoria: "Vinos", items: ["Vino Blanco", "Vino Tinto"] },
    { categoria: "Tequilas", items: ["Herradura Reposado", "7 Leguas Blanco"] },
    { categoria: "Whisky", items: ["Buchanan's 12 años", "Jack Daniel's"] },
    { categoria: "Ron", items: ["Bacardí Blanco", "Appleton State"] },
    { categoria: "Vodka", items: ["Absolut Azul", "Absolut Mandarine", "Smirnoff"] },
    { categoria: "Otros", items: ["Brandy Torres X", "Coñac Courvoisier V.S.", "Baileys", "Licor 43"] },
  ]

  const bebidasSinAlcohol = [
    "Fábrica de hielo",
    "Cristalería",
    "Coca Cola y Coca Cola de dieta",
    "Squirt",
    "Agua mineral",
    "Agua Quina",
    "Jugos de uva, piña, naranja y arándano",
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-center text-muted-foreground text-sm mb-12 max-w-2xl mx-auto leading-relaxed">
        Los brindis y celebraciones marcan los momentos más emotivos. Elijan cómo desean que fluyan las bebidas durante su evento, sabiendo que cada opción está pensada para complementar la experiencia de sus invitados.
      </p>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* No incluir vinos/licores - solo bebidas sin alcohol */}
        <button
          onClick={() => handleSeleccion(false)}
          className={`group text-left p-8 md:p-10 border transition-all duration-300 ${
            seleccion === false
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground"
          }`}
        >
          <div className="space-y-6">
            <div>
              <span
                className={`text-[10px] tracking-widest uppercase block mb-3 ${seleccion === false ? "text-background/60" : "text-muted-foreground"}`}
              >
                Opción 01
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-light">Bebidas refrescantes</h3>
              <p className={`text-sm mt-2 ${seleccion === false ? "text-background/80" : "text-muted-foreground"}`}>
                Una selección completa de bebidas sin alcohol para disfrutar toda la noche
              </p>
            </div>

            <div className="pt-6 border-t border-current/20 space-y-3">
              <span
                className={`text-[10px] tracking-widest uppercase block ${seleccion === false ? "text-background/60" : "text-muted-foreground"}`}
              >
                Incluye
              </span>
              <ul className="space-y-2">
                {bebidasSinAlcohol.map((bebida, i) => (
                  <li key={i} className="text-xs font-light flex items-start">
                    <span className="mr-2">•</span>
                    <span>{bebida}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </button>

        {/* Sí incluir */}
        <button
          onClick={() => handleSeleccion(true)}
          className={`group text-left p-8 md:p-10 border transition-all duration-300 ${
            seleccion === true
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground"
          }`}
        >
          <div className="space-y-6">
            <div>
              <span
                className={`text-[10px] tracking-widest uppercase block mb-3 ${seleccion === true ? "text-background/60" : "text-muted-foreground"}`}
              >
                Opción 02
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-light">Brindis ilimitados</h3>
              <p className={`text-sm mt-2 ${seleccion === true ? "text-background/80" : "text-muted-foreground"}`}>
                Vinos premium y licores selectos durante 5 horas para celebrar sin límites
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {bebidas.map((grupo, i) => (
                <div key={i}>
                  <span
                    className={`text-[10px] tracking-widest uppercase block mb-2 ${seleccion === true ? "text-background/60" : "text-muted-foreground"}`}
                  >
                    {grupo.categoria}
                  </span>
                  <ul className="space-y-1">
                    {grupo.items.map((item, j) => (
                      <li key={j} className="text-xs font-light">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={`pt-6 border-t space-y-2 ${seleccion === true ? "border-background/20" : "border-border"}`}>
              <div className="flex justify-between items-baseline">
                <span
                  className={`text-xs tracking-wider ${seleccion === true ? "text-background/60" : "text-muted-foreground"}`}
                >
                  Por persona
                </span>
                <span className="font-serif text-lg">${PRECIO_VINOS_LICORES.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span
                  className={`text-xs tracking-wider ${seleccion === true ? "text-background/60" : "text-muted-foreground"}`}
                >
                  Total para {data.numInvitados} invitados
                </span>
                <span className="font-serif text-2xl font-light">
                  ${(PRECIO_VINOS_LICORES * data.numInvitados).toLocaleString()} MXN
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {seleccion !== null && (
        <div id="btn-continuar" className="mt-12 text-center">
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
