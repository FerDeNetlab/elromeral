"use client"

import { Suspense } from "react"
import { ConfiguradorContent } from "./ConfiguradorContent"

export default function ConfiguradorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground font-extralight tracking-wide">Cargando...</span>
          </div>
        </div>
      }
    >
      <ConfiguradorContent />
    </Suspense>
  )
}
