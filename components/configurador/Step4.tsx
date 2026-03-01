"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Eye } from "lucide-react"
import {
  PRECIOS_MESAS,
  LIMITE_MESA_SHABBY_CHIC,
  LIMITE_MESA_MARMOL,
  LIMITE_MESA_REY_ARTURO,
  LIMITE_MESA_CRISTAL,
  LIMITE_MESA_PAROTA,
} from "@/app/configurador/constants"
import type { ConfiguradorData } from "@/app/configurador/types"
import { ImageModal } from "./ImageModal"

interface Step4Props {
  data: ConfiguradorData
  onContinue: (updates: Partial<ConfiguradorData>) => void
  onChange?: (updates: Partial<ConfiguradorData>) => void
}

const MESA_IMAGES = {
  default: "/images/mesas/mesa-manteleria-fina.jpg",
  shabbyChic: "/images/mesas/mesa-shabby-chic.jpg",
  marmol: "/images/mesas/mesa-tipo-marmol.jpg",
  reyArturo: "/images/mesas/mesa-rey-arturo.jpg",
  cristal: "/images/mesas/mesa-de-cristal.jpg",
  parota: "/images/mesas/mesa-parota.jpg",
}

export default function Step4({ data, onContinue, onChange }: Step4Props) {
  const mesasNecesarias = Math.ceil(data.numInvitados / 10)

  const [mesasDefault, setMesasDefault] = useState(data.mesasDefault || mesasNecesarias)
  const [mesasShabbyChic, setMesasShabbyChic] = useState(data.mesasShabbyChic || 0)
  const [mesasMarmol, setMesasMarmol] = useState(data.mesasMarmol || 0)
  const [mesasReyArturo, setMesasReyArturo] = useState(data.mesasReyArturo || 0)
  const [mesasCristal, setMesasCristal] = useState(data.mesasCristal || 0)
  const [mesasParota, setMesasParota] = useState(data.mesasParota || 0)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalImage, setModalImage] = useState({ src: "", title: "" })

  const totalSeleccionado = mesasDefault + mesasShabbyChic + mesasMarmol + mesasReyArturo + mesasCristal + mesasParota

  useEffect(() => {
    const otrasSeleccionadas = mesasShabbyChic + mesasMarmol + mesasReyArturo + mesasCristal + mesasParota
    const defaultNecesarias = Math.max(0, mesasNecesarias - otrasSeleccionadas)
    setMesasDefault(defaultNecesarias)
  }, [mesasShabbyChic, mesasMarmol, mesasReyArturo, mesasCristal, mesasParota, mesasNecesarias])

  const calcularPrecioMesas = () => {
    return (
      mesasShabbyChic * PRECIOS_MESAS.shabbyChic +
      mesasMarmol * PRECIOS_MESAS.marmol +
      mesasReyArturo * PRECIOS_MESAS.reyArturo +
      mesasCristal * PRECIOS_MESAS.cristal +
      mesasParota * PRECIOS_MESAS.parota
    )
  }

  const handleContinuar = () => {
    if (totalSeleccionado !== mesasNecesarias) {
      alert(`Debes seleccionar exactamente ${mesasNecesarias} mesas`)
      return
    }

    onContinue({
      mesasDefault,
      mesasShabbyChic,
      mesasMarmol,
      mesasReyArturo,
      mesasCristal,
      mesasParota,
      mesasSeleccionadas: {
        default: mesasDefault,
        shabbyChic: mesasShabbyChic,
        marmol: mesasMarmol,
        reyArturo: mesasReyArturo,
        cristal: mesasCristal,
        parota: mesasParota,
      },
    })
  }

  const handleMesaChange = (setter: (val: number) => void, value: number, tipoMesa: string) => {
    setter(value)
    if (onChange) {
      const updates: Partial<ConfiguradorData> = {}
      if (tipoMesa === "shabbyChic") updates.mesasShabbyChic = value
      if (tipoMesa === "marmol") updates.mesasMarmol = value
      if (tipoMesa === "reyArturo") updates.mesasReyArturo = value
      if (tipoMesa === "cristal") updates.mesasCristal = value
      if (tipoMesa === "parota") updates.mesasParota = value
      onChange(updates)
    }
  }

  const handleVerEjemplo = (imageSrc: string, title: string) => {
    setModalImage({ src: imageSrc, title })
    setModalOpen(true)
  }

  const MesaControl = ({
    nombre,
    precio,
    cantidad,
    onChange: onChangeLocal,
    max,
    tipoMesa,
    imageSrc,
  }: {
    nombre: string
    precio: number
    cantidad: number
    onChange: (val: number) => void
    max?: number
    tipoMesa?: string
    imageSrc?: string
  }) => (
    <div className="flex items-center justify-between py-6 border-b border-neutral-200 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <p className="font-serif text-lg tracking-wide">{nombre}</p>
          {imageSrc && (
            <button
              type="button"
              onClick={() => handleVerEjemplo(imageSrc, nombre)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider uppercase border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 transition-all group"
              aria-label={`Ver ejemplo de ${nombre}`}
            >
              <Eye className="h-3.5 w-3.5 text-neutral-500 group-hover:text-neutral-900 transition-colors" />
              <span className="text-neutral-600 group-hover:text-neutral-900 transition-colors">Ver ejemplo</span>
            </button>
          )}
        </div>
        <p className="text-sm text-neutral-500 tracking-wide mt-1">
          {precio === 0 ? "Incluida" : `$${precio.toLocaleString("es-MX")} por mesa`}
        </p>
        {max && <p className="text-xs text-amber-700 mt-1 tracking-wide">Máximo: {max} mesas</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChangeLocal(Math.max(0, cantidad - 1))}
          disabled={cantidad === 0}
          className="w-10 h-10 border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center font-serif text-xl">{cantidad}</span>
        <button
          type="button"
          onClick={() => onChangeLocal(cantidad + 1)}
          disabled={max !== undefined && cantidad >= max}
          className="w-10 h-10 border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-4">
          <div className="mb-8 text-center">
            <p className="text-muted-foreground text-sm tracking-wide leading-relaxed max-w-2xl mx-auto">
              Cada mesa cuenta parte de la historia de su celebración. Desde el mobiliario clásico incluido hasta piezas únicas como el cristal o la madera parota, cada estilo aporta personalidad y define el ambiente. Pueden combinar diferentes tipos para crear profundidad visual en su espacio.
            </p>
          </div>
          <div className="mb-8 text-center">
            <p className="text-muted-foreground tracking-wide">
              Para {data.numInvitados} invitados necesitan <span className="font-medium">{mesasNecesarias} mesas</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Seleccionadas: {totalSeleccionado} / {mesasNecesarias}
            </p>
            <div className="mt-4 mx-auto max-w-2xl">
              <div className="bg-amber-50 border border-amber-200 rounded-sm px-5 py-4">
                <p className="text-sm text-amber-900 tracking-wide leading-relaxed">
                  <span className="font-medium">La magia de mezclar estilos:</span> Combinar diferentes mesas crea profundidad visual y personalidad en su espacio. Imaginen {Math.floor(mesasNecesarias / 2)} mesas Shabby Chic cerca de la pista donde la celebración será más animada, y {Math.ceil(mesasNecesarias / 2)} de Mantelería Fina junto al jardín para conversaciones íntimas. Cada combinación cuenta una historia diferente. Ustedes necesitan {mesasNecesarias} mesas en total—elijan la mezcla que refleje su visión.
                </p>
              </div>
            </div>
          </div>

          <MesaControl
            nombre="Mesa Mantelería Fina"
            precio={0}
            cantidad={mesasDefault}
            onChange={setMesasDefault}
            imageSrc={MESA_IMAGES.default}
          />
          <MesaControl
            nombre="Mesa Shabby Chic"
            precio={PRECIOS_MESAS.shabbyChic}
            cantidad={mesasShabbyChic}
            onChange={(val) => handleMesaChange(setMesasShabbyChic, val, "shabbyChic")}
            max={LIMITE_MESA_SHABBY_CHIC}
            tipoMesa="shabbyChic"
            imageSrc={MESA_IMAGES.shabbyChic}
          />
          <MesaControl
            nombre="Mesa Rey Arturo"
            precio={PRECIOS_MESAS.reyArturo}
            cantidad={mesasReyArturo}
            onChange={(val) => handleMesaChange(setMesasReyArturo, val, "reyArturo")}
            max={LIMITE_MESA_REY_ARTURO}
            tipoMesa="reyArturo"
            imageSrc={MESA_IMAGES.reyArturo}
          />
          <MesaControl
            nombre="Mesa Tipo Mármol"
            precio={PRECIOS_MESAS.marmol}
            cantidad={mesasMarmol}
            onChange={(val) => handleMesaChange(setMesasMarmol, val, "marmol")}
            max={LIMITE_MESA_MARMOL}
            tipoMesa="marmol"
            imageSrc={MESA_IMAGES.marmol}
          />
          <MesaControl
            nombre="Mesa de Cristal"
            precio={PRECIOS_MESAS.cristal}
            cantidad={mesasCristal}
            onChange={(val) => handleMesaChange(setMesasCristal, val, "cristal")}
            max={LIMITE_MESA_CRISTAL}
            tipoMesa="cristal"
            imageSrc={MESA_IMAGES.cristal}
          />
          <MesaControl
            nombre="Mesa Parota"
            precio={PRECIOS_MESAS.parota}
            cantidad={mesasParota}
            onChange={(val) => handleMesaChange(setMesasParota, val, "parota")}
            max={LIMITE_MESA_PAROTA}
            tipoMesa="parota"
            imageSrc={MESA_IMAGES.parota}
          />
        </div>

        {/* Total */}
        <div className="border-t border-b border-foreground py-6 sm:py-8 mb-8 sm:mb-12">
          <div className="flex justify-between items-center gap-4">
            <span className="font-serif text-lg sm:text-xl tracking-wide">Total Mobiliario</span>
            <span className="font-serif text-2xl sm:text-3xl">${calcularPrecioMesas().toLocaleString("es-MX")}</span>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinuar}
          disabled={totalSeleccionado !== mesasNecesarias}
          className="w-full py-5 sm:py-6 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.25em] uppercase font-light border border-foreground hover:bg-foreground hover:text-background transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>

      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        imageSrc={modalImage.src}
        title={modalImage.title}
      />
    </div>
  )
}
