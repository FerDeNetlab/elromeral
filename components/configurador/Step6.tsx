"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PRECIOS_ARREGLOS_FLORALES, COMPATIBILIDAD_MESAS_FLORES } from "@/app/configurador/constants"
import type { StepProps } from "@/app/configurador/types"
import { Eye, X, Info } from "lucide-react"
import Image from "next/image"

interface GrupoMesas {
  tipo: string
  cantidad: number
  rangoSeleccionado: string
}

const IMAGENES_RANGOS: Record<string, string> = {
  rango1: "/images/rango-201.jpg",
  rango2: "/images/rango-202.jpeg",
  rango3: "/images/rango-203.jpg",
  rango4: "/images/rango-204.jpg",
}

export default function Step6({ data, onContinue, onChange }: StepProps) {
  const [modalRango, setModalRango] = useState<string | null>(null)

  const gruposMesas: GrupoMesas[] = []

  if (data.mesasDefault > 0) gruposMesas.push({ tipo: "default", cantidad: data.mesasDefault, rangoSeleccionado: "" })
  if (data.mesasShabbyChic > 0)
    gruposMesas.push({ tipo: "shabbyChic", cantidad: data.mesasShabbyChic, rangoSeleccionado: "" })
  if (data.mesasMarmol > 0) gruposMesas.push({ tipo: "marmol", cantidad: data.mesasMarmol, rangoSeleccionado: "" })
  if (data.mesasReyArturo > 0)
    gruposMesas.push({ tipo: "reyArturo", cantidad: data.mesasReyArturo, rangoSeleccionado: "" })
  if (data.mesasCristal > 0) gruposMesas.push({ tipo: "cristal", cantidad: data.mesasCristal, rangoSeleccionado: "" })
  if (data.mesasParota > 0) gruposMesas.push({ tipo: "parota", cantidad: data.mesasParota, rangoSeleccionado: "" })

  const [grupos, setGrupos] = useState<GrupoMesas[]>(() => {
    if (data.arreglosFlorales && data.arreglosFlorales.length > 0) {
      const gruposMap = new Map<string, string>()
      data.arreglosFlorales.forEach((arreglo) => {
        if (arreglo.rango) {
          gruposMap.set(arreglo.tipoMesa, arreglo.rango)
        }
      })

      return gruposMesas.map((grupo) => ({
        ...grupo,
        rangoSeleccionado: gruposMap.get(grupo.tipo) || "",
      }))
    }

    return gruposMesas
  })

  useEffect(() => {
    if (gruposMesas.length > 0 && grupos.length === 0) {
      setGrupos(gruposMesas)
    }
  }, [gruposMesas.length])

  const calcularTotalFlores = () => {
    return grupos.reduce((total, grupo) => {
      if (!grupo.rangoSeleccionado) return total
      const precioPorMesa = PRECIOS_ARREGLOS_FLORALES[grupo.rangoSeleccionado as keyof typeof PRECIOS_ARREGLOS_FLORALES]
      return total + precioPorMesa * grupo.cantidad
    }, 0)
  }

  const handleArregloChange = (index: number, rango: string) => {
    const nuevosGrupos = [...grupos]
    nuevosGrupos[index] = { ...nuevosGrupos[index], rangoSeleccionado: rango }
    setGrupos(nuevosGrupos)

    const arreglosIndividuales: Array<{ tipoMesa: string; rango: string }> = []
    nuevosGrupos.forEach((grupo) => {
      for (let i = 0; i < grupo.cantidad; i++) {
        arreglosIndividuales.push({ tipoMesa: grupo.tipo, rango: grupo.rangoSeleccionado })
      }
    })

    if (onChange) {
      onChange({ arreglosFlorales: arreglosIndividuales })
    }
  }

  const handleContinuar = () => {
    const todosSeleccionados = grupos.every((g) => g.rangoSeleccionado !== "")
    if (!todosSeleccionados) {
      alert("Debes seleccionar un arreglo floral para cada tipo de mesa")
      return
    }

    const arreglosIndividuales: Array<{ tipoMesa: string; rango: string }> = []
    grupos.forEach((grupo) => {
      for (let i = 0; i < grupo.cantidad; i++) {
        arreglosIndividuales.push({ tipoMesa: grupo.tipo, rango: grupo.rangoSeleccionado })
      }
    })

    onContinue({ arreglosFlorales: arreglosIndividuales })
  }

  const getNombreTipo = (tipo: string) => {
    const nombres: Record<string, string> = {
      default: "Mesa Mantelería Fina",
      shabbyChic: "Shabby Chic",
      marmol: "Mármol",
      reyArturo: "Rey Arturo",
      cristal: "Cristal",
      parota: "Parota",
    }
    return nombres[tipo] || tipo
  }

  const getNombreRango = (rango: string) => {
    const nombres: Record<string, string> = {
      rango1: "1er rango: Flor y follaje natural - Diámetro 45 cm",
      rango2: "2do rango: Flor y follaje natural - Diámetro 60 cm o altura 90 cm",
      rango3: "3er rango: Flor y follaje natural - Diámetro 60 cm + 2 arreglos laterales de 25 cm",
      rango4: "4to rango: Flor y follaje natural - Diámetro 80 cm",
      rango5: "5to rango: Flor y follaje natural - Diámetro 110 cm",
    }
    return nombres[rango] || rango
  }

  const getNombreRangoCorto = (rango: string) => {
    const nombres: Record<string, string> = {
      rango1: "1er Rango - Diámetro 45 cm",
      rango2: "2do Rango - Diámetro 60 cm",
      rango3: "3er Rango - Diámetro 60 cm + laterales",
      rango4: "4to Rango - Diámetro 80 cm",
    }
    return nombres[rango] || rango
  }

  const todosSeleccionados = grupos.every((g) => g.rangoSeleccionado !== "")

  const rangosConImagen = ["rango1", "rango2", "rango3", "rango4"]

  return (
    <div className="space-y-6 md:space-y-8 pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-sm tracking-wide leading-relaxed max-w-2xl mx-auto">
            Las flores transforman cada mesa en un punto focal visual. Desde arreglos altos que crean drama vertical hasta composiciones bajas que facilitan la conversación, cada estilo define la atmósfera. Pueden elegir un solo tipo para uniformidad o combinar diferentes arreglos para crear dinamismo en el espacio.
          </p>
        </div>

        <div className="mx-4 p-4 bg-[#f5f5f0] border border-[#e0e0d8] rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#8b7355] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#6b6b6b] text-left">
              <span className="font-medium text-[#4a4a4a]">Nota importante:</span> No todos los arreglos florales son
              compatibles con todos los tipos de mesa. Las opciones disponibles para cada mesa se muestran según su
              compatibilidad de tamaño y diseño.
            </p>
          </div>
        </div>

        <div className="mb-8 p-6 bg-neutral-50 border border-neutral-200">
          <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4 text-center">
            Ver ejemplos de arreglos florales
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {rangosConImagen.map((rango) => (
              <button
                key={rango}
                onClick={() => setModalRango(rango)}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 text-sm hover:bg-neutral-100 transition-colors duration-300"
              >
                <Eye className="w-4 h-4" />
                <span>
                  {rango === "rango1"
                    ? "1er Rango"
                    : rango === "rango2"
                      ? "2do Rango"
                      : rango === "rango3"
                        ? "3er Rango"
                        : "4to Rango"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: Cards layout */}
        <div className="md:hidden space-y-4 mb-8">
          {grupos.map((grupo, index) => {
            const rangosCompatibles = COMPATIBILIDAD_MESAS_FLORES[grupo.tipo] || []
            const rangoSeleccionado = grupo.rangoSeleccionado
            const precioPorMesa = rangoSeleccionado
              ? PRECIOS_ARREGLOS_FLORALES[rangoSeleccionado as keyof typeof PRECIOS_ARREGLOS_FLORALES]
              : 0
            const subtotal = precioPorMesa * grupo.cantidad

            return (
              <div key={grupo.tipo} className="border border-neutral-200 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{getNombreTipo(grupo.tipo)}</span>
                  <span className="text-sm text-neutral-500">{grupo.cantidad} mesas</span>
                </div>
                <Select value={rangoSeleccionado} onValueChange={(val) => handleArregloChange(index, val)}>
                  <SelectTrigger className="w-full border-neutral-300">
                    <SelectValue placeholder="Seleccionar arreglo" />
                  </SelectTrigger>
                  <SelectContent>
                    {rangosCompatibles.map((rango) => (
                      <SelectItem key={rango} value={rango}>
                        {getNombreRango(rango)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {rangoSeleccionado && (
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">${subtotal.toLocaleString("es-MX")}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[1.5fr_1fr_2.5fr_1fr_1fr] gap-4 pb-4 border-b border-neutral-900 mb-4">
            <span className="text-xs tracking-[0.2em] uppercase text-neutral-500">Tipo de Mesa</span>
            <span className="text-xs tracking-[0.2em] uppercase text-neutral-500 text-center">Cantidad</span>
            <span className="text-xs tracking-[0.2em] uppercase text-neutral-500">Arreglo Floral</span>
            <span className="text-xs tracking-[0.2em] uppercase text-neutral-500 text-right">Precio c/u</span>
            <span className="text-xs tracking-[0.2em] uppercase text-neutral-500 text-right">Subtotal</span>
          </div>

          <div className="space-y-0 mb-12">
            {grupos.map((grupo, index) => {
              const rangosCompatibles = COMPATIBILIDAD_MESAS_FLORES[grupo.tipo] || []
              const rangoSeleccionado = grupo.rangoSeleccionado
              const precioPorMesa = rangoSeleccionado
                ? PRECIOS_ARREGLOS_FLORALES[rangoSeleccionado as keyof typeof PRECIOS_ARREGLOS_FLORALES]
                : 0
              const subtotal = precioPorMesa * grupo.cantidad

              return (
                <div
                  key={grupo.tipo}
                  className="grid grid-cols-[1.5fr_1fr_2.5fr_1fr_1fr] gap-4 py-4 border-b border-neutral-200 items-center"
                >
                  <span className="text-sm text-neutral-900 font-medium">{getNombreTipo(grupo.tipo)}</span>
                  <span className="text-sm text-neutral-600 text-center font-serif">{grupo.cantidad} mesas</span>
                  <Select value={rangoSeleccionado} onValueChange={(val) => handleArregloChange(index, val)}>
                    <SelectTrigger className="border-neutral-300 rounded-none">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {rangosCompatibles.map((rango) => (
                        <SelectItem key={rango} value={rango}>
                          {getNombreRango(rango)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-right font-serif text-sm">
                    {rangoSeleccionado ? `$${precioPorMesa.toLocaleString("es-MX")}` : "-"}
                  </span>
                  <span className="text-right font-serif font-medium">
                    {rangoSeleccionado ? `$${subtotal.toLocaleString("es-MX")}` : "-"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-b border-neutral-900 py-8 mb-8">
          <div className="flex justify-between items-center">
            <span className="font-serif text-xl tracking-wide">Total Floristería</span>
            <span className="font-serif text-3xl">${calcularTotalFlores().toLocaleString("es-MX")}</span>
          </div>
        </div>

        <p className="text-center text-sm text-neutral-500 italic mb-8">
          * Los arreglos florales pueden variar según el diseño personalizado de su evento.
        </p>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button onClick={handleContinuar} disabled={!todosSeleccionados} size="lg" className="min-w-[200px]">
            CONTINUAR
          </Button>
        </div>
      </div>

      {modalRango && IMAGENES_RANGOS[modalRango] && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setModalRango(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-neutral-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-neutral-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-serif text-lg tracking-wide">{getNombreRangoCorto(modalRango)}</h3>
              <button onClick={() => setModalRango(null)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative aspect-[4/3] w-full">
              <Image
                src={IMAGENES_RANGOS[modalRango] || "/placeholder.svg"}
                alt={`Ejemplo de ${getNombreRangoCorto(modalRango)}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={85}
              />
            </div>

            <div className="bg-neutral-800 px-6 py-4 flex items-center justify-center gap-3">
              {rangosConImagen.map((rango) => (
                <button
                  key={rango}
                  onClick={() => setModalRango(rango)}
                  className={`px-3 py-1 text-sm transition-colors ${
                    modalRango === rango
                      ? "bg-white text-neutral-900"
                      : "bg-neutral-700 text-white hover:bg-neutral-600"
                  }`}
                >
                  {rango === "rango1" ? "1er" : rango === "rango2" ? "2do" : rango === "rango3" ? "3er" : "4to"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
