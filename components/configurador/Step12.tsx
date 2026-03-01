"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Users, Utensils, Coffee, Sparkles, Clock, X, Eye } from "lucide-react"
import type { ConfiguradorData } from "@/app/configurador/types"
import { EXTRAS_CATEGORIAS } from "@/app/configurador/constants"
import type { JSX } from "react/jsx-runtime"
import TotalFlotante from "./TotalFlotante"
import { ImageModal } from "./ImageModal"

const IMAGEN_ILUMINACION = "/images/40-20iluminaciones-20-281-29.jpeg"
const IMAGEN_ARBOL_GIGANTE = "/images/er-46.jpg"

interface Step12Props {
  data: ConfiguradorData
  onContinue: (updates: Partial<ConfiguradorData>) => void
  onChange?: (updates: Partial<ConfiguradorData>) => void
}

interface ExtraItem {
  id: string
  nombre: string
  precio: number
  porPersona: boolean
  nota?: string
  detalles?: string[]
  requiereTipoComida?: "menu3tiempos" | "parrillada"
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

function DetallesModal({
  isOpen,
  onClose,
  nombre,
  detalles,
}: {
  isOpen: boolean
  onClose: () => void
  nombre: string
  detalles: string[]
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900">
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-serif text-lg mb-4">{nombre}</h3>
        <ul className="space-y-2">
          {detalles.map((detalle, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-neutral-600">
              <span className="text-neutral-400 mt-1">•</span>
              <span>{detalle}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-neutral-900 text-white text-xs tracking-widest uppercase hover:bg-neutral-800 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default function Step12({ data, onContinue, onChange }: Step12Props) {
  const initialExtras = (data.extrasSeleccionados || []).reduce(
    (acc, id) => {
      acc[id] = true
      return acc
    },
    {} as Record<string, boolean>,
  )

  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>(initialExtras)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState("")
  const [currentImageTitle, setCurrentImageTitle] = useState("")
  const [detallesModal, setDetallesModal] = useState<{ isOpen: boolean; nombre: string; detalles: string[] }>({
    isOpen: false,
    nombre: "",
    detalles: [],
  })

  const toggleExtra = (extraId: string) => {
    const newExtras = { ...selectedExtras }
    newExtras[extraId] = !newExtras[extraId]
    setSelectedExtras(newExtras)

    const extrasArray = Object.keys(newExtras).filter((id) => newExtras[id])

    if (onChange) {
      onChange({ extrasSeleccionados: extrasArray })
    }
  }

  const calcularTotalExtras = () => {
    let total = 0
    Object.values(EXTRAS_CATEGORIAS).forEach((categoria) => {
      categoria.items.forEach((item) => {
        if (selectedExtras[item.id]) {
          total += item.porPersona ? item.precio * data.numInvitados : item.precio
        }
      })
    })
    return total
  }

  const handleContinuar = () => {
    const extrasArray = Object.keys(selectedExtras).filter((id) => selectedExtras[id])
    onContinue({ extrasSeleccionados: extrasArray })
  }

  const filtrarExtrasPorTipoComida = (items: ExtraItem[]) => {
    return items.filter((item) => {
      if (!item.requiereTipoComida) return true
      return item.requiereTipoComida === data.tipoComida
    })
  }

  return (
    <div className="space-y-6 pb-32">
      <TotalFlotante data={data} currentStep={12} totalSteps={13} />

      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={currentImageUrl}
        title={currentImageTitle}
      />

      <DetallesModal
        isOpen={detallesModal.isOpen}
        onClose={() => setDetallesModal({ isOpen: false, nombre: "", detalles: [] })}
        nombre={detallesModal.nombre}
        detalles={detallesModal.detalles}
      />

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-muted-foreground tracking-wide text-sm leading-relaxed max-w-2xl mx-auto">
            Estos elementos completan cada momento de su celebración. Desde la bienvenida hasta el último baile, cada uno aporta algo especial a la experiencia de sus invitados.
          </p>
        </div>

        <Accordion type="multiple" defaultValue={["coordinacion", "alimentos", "bebidas", "decoracion", "tiempo"]}>
          {Object.entries(EXTRAS_CATEGORIAS).map(([key, categoria]) => {
            const itemsFiltrados = filtrarExtrasPorTipoComida(categoria.items as ExtraItem[])

            if (itemsFiltrados.length === 0) return null

            return (
              <AccordionItem key={key} value={key} className="border-b border-neutral-200">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    {getIconForCategory(categoria.icono)}
                    <span className="font-semibold text-neutral-900">{categoria.titulo}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-2">
                    {key === "alimentos" ? (
                      <>
                        {/* Momento: En la recepción */}
                        {itemsFiltrados.filter((item: ExtraItem) => item.nota === "recepcion").length > 0 && (
                          <div>
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-neutral-900 tracking-wide uppercase mb-1">
                                En la Recepción
                              </h4>
                              <p className="text-xs text-neutral-600 leading-relaxed">
                                Durante el cóctel de bienvenida, cuando sus invitados llegan y comienzan a disfrutar el
                                ambiente antes de la cena.
                              </p>
                            </div>
                            <div className="space-y-3">
                              {itemsFiltrados
                                .filter((item: ExtraItem) => item.nota === "recepcion")
                                .map((item: ExtraItem) => {
                                  const precioTotal = item.porPersona ? item.precio * data.numInvitados : item.precio
                                  const tieneDetalles = item.detalles && item.detalles.length > 0
                                  const isSelected = !!selectedExtras[item.id]

                                  return (
                                    <div
                                      key={item.id}
                                      className={`flex items-center justify-between p-4 border transition-all ${
                                        isSelected
                                          ? "border-neutral-900 bg-neutral-50"
                                          : "border-neutral-200 hover:border-neutral-400"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={item.id}
                                          checked={isSelected}
                                          onChange={() => toggleExtra(item.id)}
                                          className="w-4 h-4"
                                        />
                                        <label htmlFor={item.id} className="text-sm cursor-pointer">
                                          {item.nombre}
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {tieneDetalles && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault()
                                              setDetallesModal({
                                                isOpen: true,
                                                nombre: item.nombre,
                                                detalles: item.detalles || [],
                                              })
                                            }}
                                            className="px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[10px] tracking-widest uppercase border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-300 whitespace-nowrap"
                                          >
                                            <span className="hidden sm:inline">VER DETALLES</span>
                                            <span className="sm:hidden">VER</span>
                                          </button>
                                        )}
                                        <div className="text-right min-w-[70px] md:min-w-[90px]">
                                          <p className="font-serif text-sm md:text-base">
                                            ${precioTotal.toLocaleString("es-MX")}
                                          </p>
                                          {item.porPersona && (
                                            <p className="text-[9px] md:text-[10px] text-neutral-500">
                                              para su número de invitados
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        )}

                        {/* Momento: Durante la fiesta */}
                        {itemsFiltrados.filter((item: ExtraItem) => item.nota === "fiesta").length > 0 && (
                          <div>
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-neutral-900 tracking-wide uppercase mb-1">
                                Durante la Fiesta
                              </h4>
                              <p className="text-xs text-neutral-600 leading-relaxed">
                                Cuando la pista está animada y el ambiente llega a su punto más alto de energía y
                                diversión.
                              </p>
                            </div>
                            <div className="space-y-3">
                              {itemsFiltrados
                                .filter((item: ExtraItem) => item.nota === "fiesta")
                                .map((item: ExtraItem) => {
                                  const precioTotal = item.porPersona ? item.precio * data.numInvitados : item.precio
                                  const tieneDetalles = item.detalles && item.detalles.length > 0
                                  const isSelected = !!selectedExtras[item.id]

                                  return (
                                    <div
                                      key={item.id}
                                      className={`flex items-center justify-between p-4 border transition-all ${
                                        isSelected
                                          ? "border-neutral-900 bg-neutral-50"
                                          : "border-neutral-200 hover:border-neutral-400"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={item.id}
                                          checked={isSelected}
                                          onChange={() => toggleExtra(item.id)}
                                          className="w-4 h-4"
                                        />
                                        <label htmlFor={item.id} className="text-sm cursor-pointer">
                                          {item.nombre}
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {tieneDetalles && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault()
                                              setDetallesModal({
                                                isOpen: true,
                                                nombre: item.nombre,
                                                detalles: item.detalles || [],
                                              })
                                            }}
                                            className="px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[10px] tracking-widest uppercase border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-300 whitespace-nowrap"
                                          >
                                            <span className="hidden sm:inline">VER DETALLES</span>
                                            <span className="sm:hidden">VER</span>
                                          </button>
                                        )}
                                        <div className="text-right min-w-[70px] md:min-w-[90px]">
                                          <p className="font-serif text-sm md:text-base">
                                            ${precioTotal.toLocaleString("es-MX")}
                                          </p>
                                          {item.porPersona && (
                                            <p className="text-[9px] md:text-[10px] text-neutral-500">
                                              para su número de invitados
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        )}

                        {/* Momento: Para los desvelados */}
                        {itemsFiltrados.filter((item: ExtraItem) => item.nota === "desvelados").length > 0 && (
                          <div>
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-neutral-900 tracking-wide uppercase mb-1">
                                Para los Desvelados
                              </h4>
                              <p className="text-xs text-neutral-600 leading-relaxed">
                                Al final del evento, cuando sus invitados más cercanos continúan la celebración y
                                necesitan recargar energía.
                              </p>
                            </div>
                            <div className="space-y-3">
                              {itemsFiltrados
                                .filter((item: ExtraItem) => item.nota === "desvelados")
                                .map((item: ExtraItem) => {
                                  const precioTotal = item.porPersona ? item.precio * data.numInvitados : item.precio
                                  const tieneDetalles = item.detalles && item.detalles.length > 0
                                  const isSelected = !!selectedExtras[item.id]

                                  return (
                                    <div
                                      key={item.id}
                                      className={`flex items-center justify-between p-4 border transition-all ${
                                        isSelected
                                          ? "border-neutral-900 bg-neutral-50"
                                          : "border-neutral-200 hover:border-neutral-400"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={item.id}
                                          checked={isSelected}
                                          onChange={() => toggleExtra(item.id)}
                                          className="w-4 h-4"
                                        />
                                        <label htmlFor={item.id} className="text-sm cursor-pointer">
                                          {item.nombre}
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {tieneDetalles && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault()
                                              setDetallesModal({
                                                isOpen: true,
                                                nombre: item.nombre,
                                                detalles: item.detalles || [],
                                              })
                                            }}
                                            className="px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[10px] tracking-widest uppercase border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-300 whitespace-nowrap"
                                          >
                                            <span className="hidden sm:inline">VER DETALLES</span>
                                            <span className="sm:hidden">VER</span>
                                          </button>
                                        )}
                                        <div className="text-right min-w-[70px] md:min-w-[90px]">
                                          <p className="font-serif text-sm md:text-base">
                                            ${precioTotal.toLocaleString("es-MX")}
                                          </p>
                                          {item.porPersona && (
                                            <p className="text-[9px] md:text-[10px] text-neutral-500">
                                              para su número de invitados
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        {itemsFiltrados.map((item) => {
                          const precioTotal = item.porPersona ? item.precio * data.numInvitados : item.precio
                          const esIluminacion = item.id === "iluminacion_jardines"
                          const esArbolGigante = item.id === "arbol-gigante"
                          const tieneDetalles = item.detalles && item.detalles.length > 0
                          const isSelected = !!selectedExtras[item.id]

                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between p-4 border transition-all ${
                                isSelected
                                  ? "border-neutral-900 bg-neutral-50"
                                  : "border-neutral-200 hover:border-neutral-400"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={item.id}
                                  checked={isSelected}
                                  onChange={() => toggleExtra(item.id)}
                                  className="w-4 h-4"
                                />
                                <label htmlFor={item.id} className="text-sm cursor-pointer">
                                  {item.nombre}
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                {esIluminacion && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setShowImageModal(true)
                                      setCurrentImageUrl(IMAGEN_ILUMINACION)
                                      setCurrentImageTitle("Iluminación arquitectónica de árbol")
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[10px] tracking-widest uppercase border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-300 whitespace-nowrap"
                                  >
                                    <Eye className="w-3 h-3 flex-shrink-0" />
                                    <span className="hidden sm:inline">Ver ejemplo</span>
                                    <span className="sm:hidden">Ver</span>
                                  </button>
                                )}
                                {esArbolGigante && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setShowImageModal(true)
                                      setCurrentImageUrl(IMAGEN_ARBOL_GIGANTE)
                                      setCurrentImageTitle("Árbol gigante decorativo")
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[10px] tracking-widest uppercase border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-300 whitespace-nowrap"
                                  >
                                    <Eye className="w-3 h-3 flex-shrink-0" />
                                    <span className="hidden sm:inline">Ver ejemplo</span>
                                    <span className="sm:hidden">Ver</span>
                                  </button>
                                )}
                                {tieneDetalles && !esIluminacion && !esArbolGigante && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setDetallesModal({
                                        isOpen: true,
                                        nombre: item.nombre,
                                        detalles: item.detalles || [],
                                      })
                                    }}
                                    className="px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[10px] tracking-widest uppercase border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-300 whitespace-nowrap"
                                  >
                                    <span className="hidden sm:inline">VER DETALLES</span>
                                    <span className="sm:hidden">VER</span>
                                  </button>
                                )}
                                <div className="text-right min-w-[70px] md:min-w-[90px]">
                                  <p className="font-serif text-sm md:text-base">${precioTotal.toLocaleString("es-MX")}</p>
                                  {item.porPersona && (
                                    <p className="text-[9px] md:text-[10px] text-neutral-500">
                                      para su número de invitados
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        {/* Note box */}
        <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200">
          <p className="text-sm text-neutral-600 leading-relaxed">
            Durante su visita a El Romeral, podrán agregar tantos extras y elementos de decoración como deseen de
            nuestro amplio catálogo de opciones, personalizando la cotización final de su boda según su visualización.
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
