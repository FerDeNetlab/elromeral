"use client"

import { calcularPrecioTotal } from "@/lib/calcular-precio"
import type { ConfiguradorData } from "@/app/configurador/types"

interface TotalFlotanteProps {
  data: ConfiguradorData
  paso: number
}

export default function TotalFlotante({ data, paso }: TotalFlotanteProps) {
  // No mostrar en el paso 1 o paso 13 (resumen final)
  if (paso === 1 || paso === 13) return null

  const total = calcularPrecioTotal(data)

  return (
    <div className="fixed bottom-0 left-0 lg:left-40 xl:left-48 right-0 z-40">
      {/* Línea decorativa superior con gradiente */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="bg-gradient-to-r from-primary via-primary to-primary/95 text-primary-foreground backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-center">
          {/* Total estimado centrado */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] sm:text-[8px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-extralight text-primary-foreground/60">
                Total estimado
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.12em] sm:tracking-[0.15em] uppercase font-extralight text-primary-foreground/40">
                Antes de IVA
              </span>
            </div>
            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="font-serif text-xl sm:text-2xl md:text-3xl font-extralight tracking-wide">
                ${total.toLocaleString()}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.2em] uppercase font-extralight text-primary-foreground/60">
                MXN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
