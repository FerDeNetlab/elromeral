"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"

interface ExportPdfButtonProps {
  quoteId: string
  slug: string
}

export default function ExportPdfButton({ quoteId, slug }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const formData = new FormData()
      formData.append("quoteId", quoteId)
      formData.append("slug", slug)

      const response = await fetch("/api/export-pdf", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const html = await response.text()
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          newWindow.document.write(html)
          newWindow.document.close()
          // Esperar a que cargue y luego mostrar diálogo de impresión
          setTimeout(() => {
            newWindow.print()
          }, 500)
        }
      } else {
        alert("Error al generar el PDF. Por favor intente de nuevo.")
      }
    } catch (error) {
      console.error("[v0] Error al exportar PDF:", error)
      alert("Error al generar el PDF. Por favor intente de nuevo.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting} className="w-full flex-1" size="lg">
      <Download className="w-5 h-5 mr-2" />
      {isExporting ? "Generando..." : "Exportar PDF"}
    </Button>
  )
}
