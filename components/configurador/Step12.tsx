"use client"

import { Users, Utensils, Coffee, Sparkles, Clock } from "lucide-react"
import type { ConfiguradorData } from "@/app/configurador/types"
import { EXTRAS_CATEGORIAS } from "@/app/configurador/constants"
import type { JSX } from "react/jsx-runtime"

interface Step12Props {
  data: ConfiguradorData
  onContinue: (updates: Partial<ConfiguradorData>) => void
  onChange?: (updates: Partial<ConfiguradorData>) => void
}

const getIconForCategory = (iconKey: string) => {
  const iconMap: Record<string, JSX.Element> = {
    coordinacion: <Users className="w-5 h-5" />,
    alimentos: <Utensils className="w-5 h-5" />,
    bebidas: <Coffee className="w-5 h-5" />,
    decoracion: <Sparkles className="w-5 h-5" />,
    tiempo: <Clock className="w-5 h-5" />,
  }
  return iconMap[iconKey] || <Sparkles className="w-5 h-5" />
}

export default function Step12({ data, onContinue }: Step12Props) {
  const handleContinuar = () => {
    onContinue({ extrasSeleccionados: [] })
  }

  const filtrarExtrasPorTipoComida = (items: { id: string; nombre: string; requiereTipoComida?: string }[]) => {
    return items.filter((item) => {
      if (!item.requiereTipoComida) return true
      return item.requiereTipoComida === data.tipoComida
    })
  }

  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-muted-foreground tracking-wide text-sm leading-relaxed max-w-2xl mx-auto">
            Estos elementos completan cada momento de su celebración. Desde la bienvenida hasta el último baile, cada uno aporta algo especial a la experiencia de sus invitados.
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(EXTRAS_CATEGORIAS).map(([key, categoria]) => {
            const itemsFiltrados = filtrarExtrasPorTipoComida(categoria.items)

            if (itemsFiltrados.length === 0) return null

            return (
              <div key={key} className="border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-neutral-400">
                    {getIconForCategory(categoria.icono)}
                  </div>
                  <h3 className="font-semibold text-neutral-900">{categoria.titulo}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {itemsFiltrados.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 text-sm text-neutral-600 py-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-neutral-400 mt-2 flex-shrink-0" />
                      <span className="font-light">{item.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Note box */}
        <div className="mt-8 p-6 bg-neutral-50 border border-neutral-200 text-center">
          <p className="font-serif text-lg text-neutral-800 mb-2">
            ¿Les interesa alguno de estos servicios?
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Todos estos extras y muchas más opciones de personalización se cotizan el día de su demo en El Romeral. Nuestro equipo les ayudará a elegir los que mejor complementen su celebración.
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinuar}
          className="w-full mt-8 py-5 bg-foreground text-background border border-foreground text-xs tracking-widest uppercase hover:bg-transparent hover:text-foreground transition-all duration-300"
        >
          Ver Resumen Final
        </button>
      </div>
    </div>
  )
}
