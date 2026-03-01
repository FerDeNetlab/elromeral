"use client"

import { useState } from "react"
import { Music, Sparkles } from "lucide-react"
import {
  PRECIO_DJ_GRUPO_RESET,
  PRECIO_EQUIPO_SONIDO,
  PRECIO_ILUMINACION_ARQUITECTONICA,
  PRECIO_LUCES_ROBOTICAS,
  PRECIO_PLANTA_LUZ_GRUPO,
} from "@/app/configurador/constants"
import type { ConfiguradorData } from "@/app/configurador/types"
import { scrollToBottom } from "@/lib/scroll-utils"

interface Step9Props {
  data: ConfiguradorData
  onContinue: (updates: Partial<ConfiguradorData>) => void
  onChange?: (updates: Partial<ConfiguradorData>) => void
}

export default function Step9({ data, onContinue, onChange }: Step9Props) {
  const [musicaSeleccionada, setMusicaSeleccionada] = useState<"dj" | "grupo" | "">(data.tipoMusica || "")
  const [mostrarDescripcionEquipo, setMostrarDescripcionEquipo] = useState(false)
  const [mostrarDescripcionIluminacion, setMostrarDescripcionIluminacion] = useState(false)

  const esCena = data.tipoEvento === "cena"

  const costosDJBase = [
    { nombre: "DJ Romeral (5 horas)", precio: PRECIO_DJ_GRUPO_RESET },
    {
      nombre: "Equipo de sonido Bose profesional",
      precio: PRECIO_EQUIPO_SONIDO,
      tieneDescripcion: true,
      tipo: "equipo",
    },
  ]

  const costosDJCena = [
    { nombre: "Iluminación arquitectónica de jardines", precio: PRECIO_ILUMINACION_ARQUITECTONICA },
    {
      nombre: "Iluminación profesional de pista",
      precio: PRECIO_LUCES_ROBOTICAS,
      tieneDescripcion: true,
      tipo: "iluminacion",
    },
  ]

  const costosDJ = esCena ? [...costosDJBase, ...costosDJCena] : costosDJBase
  const totalDJ = costosDJ.reduce((sum, item) => sum + item.precio, 0)

  const handleMusicaChange = (tipo: "dj" | "grupo") => {
    setMusicaSeleccionada(tipo)
    if (onChange) {
      onChange({ tipoMusica: tipo })
    }
    // Scroll hacia el botón continuar
    setTimeout(() => scrollToBottom(), 100)
  }

  const handleContinuar = () => {
    if (!musicaSeleccionada) return
    onContinue({ tipoMusica: musicaSeleccionada })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-muted-foreground tracking-wide leading-relaxed max-w-2xl mx-auto">
            La música define el ritmo de su celebración. Un DJ profesional ofrece versatilidad infinita y control preciso del ambiente. Un grupo musical aporta calidez humana y presencia escénica. Ambas opciones transforman momentos en recuerdos imborrables.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* OPCIÓN 01 - DJ Profesional */}
          <div
            onClick={() => handleMusicaChange("dj")}
            className={`cursor-pointer transition-all border-2 p-8 ${
              musicaSeleccionada === "dj"
                ? "border-foreground bg-foreground text-background"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            <span
              className={`text-[10px] tracking-widest uppercase block mb-3 ${
                musicaSeleccionada === "dj" ? "text-background/60" : "text-muted-foreground"
              }`}
            >
              Opción 01
            </span>

            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-12 h-12 flex items-center justify-center ${musicaSeleccionada === "dj" ? "bg-background" : "bg-neutral-900"}`}
              >
                <Music className={`w-6 h-6 ${musicaSeleccionada === "dj" ? "text-foreground" : "text-white"}`} />
              </div>
              <div>
                <h3
                  className={`font-serif text-xl tracking-wide ${musicaSeleccionada === "dj" ? "text-background" : ""}`}
                >
                  Experiencia DJ Premium
                </h3>
                <p
                  className={`text-xs mt-1 ${musicaSeleccionada === "dj" ? "text-background/60" : "text-neutral-500"}`}
                >
                  Audio, iluminación y ambientación completa
                </p>
              </div>
            </div>

            <div className={`font-serif text-3xl mb-8 ${musicaSeleccionada === "dj" ? "text-background" : ""}`}>
              ${totalDJ.toLocaleString("es-MX")}
            </div>

            <div className="space-y-4 text-sm">
              {costosDJ.map((item, idx) => (
                <div
                  key={idx}
                  className={`pb-4 border-b last:border-0 ${musicaSeleccionada === "dj" ? "border-background/20" : "border-neutral-200"}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className={musicaSeleccionada === "dj" ? "text-background/80" : "text-neutral-600"}>
                      {item.nombre}
                    </span>
                    <span
                      className={`font-medium whitespace-nowrap ${musicaSeleccionada === "dj" ? "text-background" : ""}`}
                    >
                      ${item.precio.toLocaleString("es-MX")}
                    </span>
                  </div>
                  {item.tieneDescripcion && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (item.tipo === "equipo") {
                          setMostrarDescripcionEquipo(true)
                        } else if (item.tipo === "iluminacion") {
                          setMostrarDescripcionIluminacion(true)
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-sm inline-flex items-center gap-1.5 transition-all ${
                        musicaSeleccionada === "dj"
                          ? "bg-background/10 text-background/90 hover:bg-background/20 border border-background/20"
                          : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Ver descripción
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!esCena && (
              <p
                className={`text-xs mt-6 p-3 ${musicaSeleccionada === "dj" ? "text-background/70 bg-background/10" : "text-amber-700 bg-amber-50"}`}
              >
                Nota: La iluminación arquitectónica y luces robóticas solo se incluyen para eventos de cena
              </p>
            )}
          </div>

          {/* OPCIÓN 02 - Grupo Musical */}
          <div
            onClick={() => handleMusicaChange("grupo")}
            className={`cursor-pointer transition-all border-2 p-8 ${
              musicaSeleccionada === "grupo"
                ? "border-foreground bg-foreground text-background"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            <span
              className={`text-[10px] tracking-widest uppercase block mb-3 ${
                musicaSeleccionada === "grupo" ? "text-background/60" : "text-muted-foreground"
              }`}
            >
              Opción 02
            </span>

            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-12 h-12 flex items-center justify-center ${musicaSeleccionada === "grupo" ? "bg-background" : "bg-neutral-900"}`}
              >
                <Music className={`w-6 h-6 ${musicaSeleccionada === "grupo" ? "text-foreground" : "text-white"}`} />
              </div>
              <div>
                <h3
                  className={`font-serif text-xl tracking-wide ${musicaSeleccionada === "grupo" ? "text-background" : ""}`}
                >
                  Grupo Musical
                </h3>
                <p
                  className={`text-xs mt-1 ${musicaSeleccionada === "grupo" ? "text-background/60" : "text-neutral-500"}`}
                >
                  Trae tu grupo favorito
                </p>
              </div>
            </div>

            <div className={`font-serif text-3xl mb-8 ${musicaSeleccionada === "grupo" ? "text-background" : ""}`}>
              ${PRECIO_PLANTA_LUZ_GRUPO.toLocaleString("es-MX")}
            </div>

            <p className={`text-sm mb-6 ${musicaSeleccionada === "grupo" ? "text-background/80" : "text-neutral-600"}`}>
              Contrata tu grupo musical favorito. El Romeral proporciona únicamente la planta de luz para el área de
              música.
            </p>

            <div
              className={`flex justify-between items-start gap-2 text-sm pb-3 border-b ${musicaSeleccionada === "grupo" ? "border-background/20" : "border-neutral-200"}`}
            >
              <span className={musicaSeleccionada === "grupo" ? "text-background/80" : "text-neutral-600"}>
                Planta de luz dedicada
              </span>
              <span className={`font-medium ${musicaSeleccionada === "grupo" ? "text-background" : ""}`}>
                ${PRECIO_PLANTA_LUZ_GRUPO.toLocaleString("es-MX")}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleContinuar}
          disabled={!musicaSeleccionada}
          className="w-full mt-16 py-5 border border-foreground bg-foreground text-background text-xs tracking-widest uppercase hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>

      {/* Modal de descripción de equipo de sonido */}
      {mostrarDescripcionEquipo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setMostrarDescripcionEquipo(false)}
        >
          <div
            className="bg-white max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMostrarDescripcionEquipo(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-serif text-2xl mb-6 pr-8">Equipo de sonido Bose profesional</h3>

            <div className="space-y-6 text-sm">
              {/* Descripción de Audio */}
              <div>
                <h4 className="font-semibold text-base mb-3">Descripción de Audio</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li>• Planta de luz dedicada para sonido e iluminación en área de pista</li>
                  <li>• Controlador Pioneer DDJ-1000</li>
                  <li>• Mezcladora de audio de 12 canales</li>
                </ul>
              </div>

              {/* Cabina de DJ */}
              <div>
                <h4 className="font-semibold text-base mb-3">Cabina de DJ</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li>• Cabina de madera tipo parota para DJ</li>
                  <li>• DJ profesional (Social DJ)</li>
                  <li>• Computadora profesional para DJ y reproducción musical</li>
                </ul>
              </div>

              {/* Sistema de sonido – Área cóctel */}
              <div>
                <h4 className="font-semibold text-base mb-3">Sistema de sonido – Área cóctel</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li>• 2 bocinas Bose Panaray MA12</li>
                  <li>• 1 amplificador de sonido para área cóctel</li>
                  <li>• 3 subwoofers Bose de 12" para área cóctel</li>
                  <li>• 1 amplificador dedicado para subwoofers de cóctel</li>
                </ul>
              </div>

              {/* Sistema de sonido – Salón */}
              <div>
                <h4 className="font-semibold text-base mb-3">Sistema de sonido – Salón</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li>• 6 bocinas Bose Panaray 402 IV</li>
                  <li>• 2 amplificadores para bocinas del salón</li>
                  <li>• 2 amplificadores para subwoofers del salón</li>
                </ul>
              </div>

              {/* Sistema de sonido – Jardín */}
              <div>
                <h4 className="font-semibold text-base mb-3">Sistema de sonido – Jardín</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li>• 6 cajones con subwoofer JBL de 18"</li>
                  <li>• 4 bocinas Bose Panaray 402 IV</li>
                  <li>• 1 amplificador para bocinas en jardín</li>
                  <li>• 2 cajones con subwoofer JBL de 18" adicionales</li>
                </ul>
              </div>

              {/* Equipo técnico */}
              <div>
                <h4 className="font-semibold text-base mb-3">Equipo técnico</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li>• Rack de amplificadores</li>
                  <li>• Juego completo de cableado profesional para sonido</li>
                  <li>• Ingeniero de audio</li>
                  <li>• 2 sistemas de microfonía</li>
                </ul>
              </div>

              {/* Ambientación */}
              <div>
                <h4 className="font-semibold text-base mb-3">Ambientación</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li>• Bazuca de mariposas para Vals</li>
                  <li>• 8 chisperos en pista de baile</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setMostrarDescripcionEquipo(false)}
              className="w-full mt-8 py-3 border border-foreground text-foreground text-xs tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de descripción de iluminación profesional */}
      {mostrarDescripcionIluminacion && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setMostrarDescripcionIluminacion(false)}
        >
          <div
            className="bg-white max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMostrarDescripcionIluminacion(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-serif text-2xl mb-6 pr-8">Iluminación profesional de pista</h3>

            <div className="space-y-6 text-sm">
              {/* Descripción de Iluminación en Pista */}
              <div>
                <h4 className="font-semibold text-base mb-3">Descripción de Iluminación en Pista</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li>• 8 luces Beam 7R Sharpy</li>
                  <li>• 4 Par LED</li>
                  <li>• 4 cañones 40x3 con controlador Exact 2000 DMX Steelpro</li>
                  <li>• Set completo de cableado profesional para iluminación</li>
                  <li>• 2 estructuras para anclaje y sujeción de iluminación a toldo</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setMostrarDescripcionIluminacion(false)}
              className="w-full mt-8 py-3 border border-foreground text-foreground text-xs tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
