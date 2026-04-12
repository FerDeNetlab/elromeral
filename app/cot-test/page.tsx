"use client"

import { Suspense } from "react"
import { ConfiguradorContent } from "@/app/configurador/ConfiguradorContent"

// Datos pre-llenados para testing — edita aquí para cambiar los valores de prueba
const TEST_DATA = {
  nombresNovios: "María & Pedro",
  tipoEvento: "cena",
  numInvitados: 120,
  fechaEvento: "2026-10-17",
  email: "test@elromeral.com",
  telefono: "3310000000",
}

export default function CotTestPage() {
  return (
    <>
      {/* Banner de modo test — visible solo aquí */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-400 text-amber-900 text-xs text-center py-1.5 font-medium tracking-widest uppercase">
        ⚠ Modo Test — No se envían correos ni se guarda en producción
      </div>

      <div className="pt-6">
        <Suspense
          fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          }
        >
          <ConfiguradorContent overrideData={TEST_DATA} overrideStep={2} />
        </Suspense>
      </div>
    </>
  )
}
