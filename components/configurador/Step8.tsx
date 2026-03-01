"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import { PRECIO_ENTARIMADO } from "@/app/configurador/constants"
import type { ConfiguradorData } from "@/app/configurador/types"
import { ImageModal } from "./ImageModal"
import { scrollToBottom } from "@/lib/scroll-utils"

interface Step8Props {
  data: ConfiguradorData
  onContinue: (updates: Partial<ConfiguradorData>) => void
  onChange?: (updates: Partial<ConfiguradorData>) => void
}

export default function Step8({ data, onContinue, onChange }: Step8Props) {
  const [superficieSeleccionada, setSuperficieSeleccionada] = useState<"pasto" | "entarimado" | "">(
    data.tipoSuperficie || "",
  )
  const [imagenModal, setImagenModal] = useState<string | null>(null)

  const handleSuperficieChange = (tipo: "pasto" | "entarimado") => {
    setSuperficieSeleccionada(tipo)
    if (onChange) {
      onChange({ tipoSuperficie: tipo })
    }
    scrollToBottom(150)
  }

  const opciones = [
    {
      id: "pasto" as const,
      nombre: "Sobre Pasto",
      precio: 0,
      caracteristicas: ["Conexión auténtica con el jardín", "Atmósfera natural y orgánica", "Incluido en su experiencia"],
      imagen: "/images/piso/sin-tarima.jpg",
    },
    {
      id: "entarimado" as const,
      nombre: "Entarimado",
      precio: PRECIO_ENTARIMADO,
      caracteristicas: ["Tarima pintada en tono elegante", "Superficie perfectamente nivelada de 16 x 22 metros", "Facilita el desplazamiento de todos sus invitados"],
      imagen: "/images/piso/tarimado.jpg",
    },
  ]

  const handleContinuar = () => {
    if (!superficieSeleccionada) return
    onContinue({ tipoSuperficie: superficieSeleccionada })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-muted-foreground tracking-wide leading-relaxed max-w-2xl mx-auto">
            La superficie define la sensación del espacio. El pasto natural ofrece autenticidad y conexión con el jardín. El entarimado proporciona elegancia uniforme y facilita el movimiento de todos sus invitados. Ambas opciones crean experiencias memorables.
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-4 max-w-2xl mx-auto">
            Las imágenes son referencias visuales. El alfombrado decorativo en la opción de entarimado se personaliza según su evento y tiene costo adicional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {opciones.map((opcion, index) => (
            <div
              key={opcion.id}
              onClick={() => handleSuperficieChange(opcion.id)}
              className={`cursor-pointer transition-all border-2 p-8 ${
                superficieSeleccionada === opcion.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <span
                className={`text-[10px] tracking-widest uppercase block mb-3 ${
                  superficieSeleccionada === opcion.id ? "text-background/60" : "text-muted-foreground"
                }`}
              >
                Opción {String(index + 1).padStart(2, "0")}
              </span>

              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`font-serif text-2xl md:text-3xl font-light ${superficieSeleccionada === opcion.id ? "text-background" : ""}`}
                >
                  {opcion.nombre}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setImagenModal(opcion.imagen)
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-wider uppercase transition-all ${
                    superficieSeleccionada === opcion.id
                      ? "border border-background/30 hover:border-background/60 text-background/80 hover:text-background"
                      : "border border-neutral-300 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                  title="Ver ejemplo"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver ejemplo</span>
                </button>
              </div>

              <div
                className={`font-serif text-2xl font-light mb-8 ${superficieSeleccionada === opcion.id ? "text-background" : ""}`}
              >
                {opcion.precio === 0 ? "Incluido" : `$${opcion.precio.toLocaleString("es-MX")}`}
              </div>

              <ul className="space-y-3">
                {opcion.caracteristicas.map((car, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-light">
                    <span
                      className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${superficieSeleccionada === opcion.id ? "bg-background/60" : "bg-neutral-400"}`}
                    />
                    <span className={superficieSeleccionada === opcion.id ? "text-background/80" : "text-neutral-600"}>
                      {car}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <button
          id="btn-continuar"
          onClick={handleContinuar}
          disabled={!superficieSeleccionada}
          className="w-full mt-16 py-5 border border-foreground bg-foreground text-background text-xs tracking-widest uppercase hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>

      {imagenModal && (
        <ImageModal
          isOpen={!!imagenModal}
          onClose={() => setImagenModal(null)}
          imageSrc={imagenModal}
          title={opciones.find((o) => o.imagen === imagenModal)?.nombre || ""}
        />
      )}
    </div>
  )
}
