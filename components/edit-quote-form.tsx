"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface PartidaItem {
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
}

interface CategoriaDetalle {
  categoria: string
  items: PartidaItem[]
}

interface Quote {
  id: string
  slug: string
  nombres: string
  email: string
  telefono: string
  fecha_evento: string
  num_invitados: number
  precio_total: number
  partidas_detalle: CategoriaDetalle[]
}

export default function EditQuoteForm({ quote }: { quote: Quote }) {
  const router = useRouter()
  const [partidas, setPartidas] = useState<CategoriaDetalle[]>(quote.partidas_detalle || [])
  const [isSaving, setIsSaving] = useState(false)

  const handleCantidadChange = (categoriaIdx: number, itemIdx: number, nuevaCantidad: number) => {
    const nuevasPartidas = [...partidas]
    const item = nuevasPartidas[categoriaIdx].items[itemIdx]
    item.cantidad = nuevaCantidad
    item.total = item.cantidad * item.precioUnitario
    setPartidas(nuevasPartidas)
  }

  const handleEliminarItem = (categoriaIdx: number, itemIdx: number) => {
    const nuevasPartidas = [...partidas]
    nuevasPartidas[categoriaIdx].items.splice(itemIdx, 1)

    // Eliminar categoría si queda vacía
    if (nuevasPartidas[categoriaIdx].items.length === 0) {
      nuevasPartidas.splice(categoriaIdx, 1)
    }

    setPartidas(nuevasPartidas)
  }

  const calcularTotal = () => {
    const total = partidas.reduce((total, categoria) => {
      const subtotal = categoria.items.reduce((sum, item) => {
        const cantidad = Number(item.cantidad) || 0
        const precioUnitario = Number(item.precioUnitario) || 0
        const itemTotal = cantidad * precioUnitario
        return sum + itemTotal
      }, 0)
      return total + subtotal
    }, 0)
    return total
  }

  const handleGuardar = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const nuevoTotal = calcularTotal()

      const { error } = await supabase
        .from("quotes")
        .update({
          partidas_detalle: partidas,
          precio_total: nuevoTotal,
        })
        .eq("id", quote.id)

      if (error) throw error

      router.push(`/cotizacion/${quote.slug}`)
      router.refresh()
    } catch (error) {
      console.error("Error al guardar:", error)
      alert("Error al guardar los cambios")
    } finally {
      setIsSaving(false)
    }
  }

  const totalGeneral = calcularTotal()

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex justify-between items-center">
          <Link href={`/cotizacion/${quote.slug}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </Link>
          <Button onClick={handleGuardar} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>

        <Card className="p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-3xl font-serif">{quote.nombres}</CardTitle>
            <p className="text-muted-foreground">
              {quote.num_invitados} invitados • {new Date(quote.fecha_evento).toLocaleDateString("es-MX")}
            </p>
          </CardHeader>

          <CardContent className="px-0 space-y-8">
            {partidas.map((categoria, catIdx) => (
              <div key={catIdx} className="space-y-4">
                <h3 className="text-lg font-bold text-primary uppercase border-b border-primary/30 pb-2">
                  {categoria.categoria}
                </h3>

                <div className="space-y-3">
                  {categoria.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex flex-col md:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.descripcion}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.precioUnitario.toLocaleString("es-MX")} c/u
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium whitespace-nowrap">Cantidad:</label>
                          <Input
                            type="number"
                            min="0"
                            value={item.cantidad}
                            onChange={(e) =>
                              handleCantidadChange(catIdx, itemIdx, Number.parseInt(e.target.value) || 0)
                            }
                            className="w-24"
                          />
                        </div>

                        <div className="text-right min-w-[120px]">
                          <p className="text-sm text-muted-foreground">Total:</p>
                          <p className="font-bold text-lg">${item.total.toLocaleString("es-MX")}</p>
                        </div>

                        <Button variant="destructive" size="icon" onClick={() => handleEliminarItem(catIdx, itemIdx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-primary text-primary-foreground p-6 rounded-lg mt-8">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">TOTAL Experiencia Integral</span>
                <span className="text-3xl font-bold">${totalGeneral.toLocaleString("es-MX")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
