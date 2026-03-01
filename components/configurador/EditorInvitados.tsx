"use client"

import { useState } from "react"
import { Users, Minus, Plus, X, Check } from "lucide-react"

interface EditorInvitadosProps {
  numInvitados: number
  onCambiar: (nuevoNumero: number) => void
}

export default function EditorInvitados({ numInvitados, onCambiar }: EditorInvitadosProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempValue, setTempValue] = useState(numInvitados || 100)

  const handleOpen = () => {
    setTempValue(numInvitados || 100)
    setIsOpen(true)
  }

  const handleConfirm = () => {
    if (tempValue >= 50 && tempValue <= 500) {
      onCambiar(tempValue)
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    setTempValue(numInvitados || 100)
    setIsOpen(false)
  }

  const increment = () => {
    setTempValue((prev) => Math.min(500, prev + 10))
  }

  const decrement = () => {
    setTempValue((prev) => Math.max(50, prev - 10))
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-24 left-4 sm:left-6 lg:left-[calc(10rem+1.5rem)] xl:left-[calc(12rem+1.5rem)] z-40 
          flex items-center gap-2 sm:gap-4 
          px-3 sm:px-5 py-2 sm:py-4 
          bg-background/90 backdrop-blur-xl border border-primary/10 hover:border-primary/30 
          text-foreground transition-all duration-700 shadow-lg hover:shadow-xl group rounded-full sm:rounded-none"
        title="Cambiar número de invitados"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-500">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/60 group-hover:text-primary transition-colors duration-500" />
        </div>
        <div className="flex flex-col items-start">
          <span className="hidden sm:block text-[8px] tracking-[0.25em] uppercase text-muted-foreground font-extralight">
            Modificar invitados
          </span>
          <span className="font-serif text-lg sm:text-xl font-extralight tracking-wide">{numInvitados}</span>
        </div>
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 sm:hidden" onClick={handleCancel} />

      <div className="fixed bottom-24 left-4 right-4 sm:left-6 sm:right-auto lg:left-[calc(10rem+1.5rem)] xl:left-[calc(12rem+1.5rem)] z-40 bg-background/95 backdrop-blur-xl border border-primary/10 shadow-2xl sm:min-w-[280px] rounded-lg sm:rounded-none">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b border-primary/5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/5 flex items-center justify-center">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/60" />
            </div>
            <span className="text-[9px] tracking-[0.3em] uppercase font-extralight">Invitados</span>
          </div>
          <button
            onClick={handleCancel}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={decrement}
              disabled={tempValue <= 50}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-primary/10 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-500 rounded-md sm:rounded-none"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="number"
              value={tempValue}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value) || 50
                setTempValue(Math.min(500, Math.max(50, val)))
              }}
              className="w-24 sm:w-28 h-14 sm:h-16 text-center font-serif text-3xl sm:text-4xl font-extralight border border-primary/10 focus:border-primary/30 focus:outline-none bg-transparent transition-all duration-500 rounded-md sm:rounded-none"
              min={50}
              max={500}
            />

            <button
              onClick={increment}
              disabled={tempValue >= 500}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-primary/10 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-500 rounded-md sm:rounded-none"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[8px] tracking-[0.2em] text-muted-foreground text-center mb-4 sm:mb-6 font-extralight uppercase">
            Mínimo 50 · Máximo 500 personas
          </p>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 sm:py-4 text-[9px] tracking-[0.25em] uppercase font-extralight border border-primary/10 hover:border-primary/30 transition-all duration-500 rounded-md sm:rounded-none"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 sm:py-4 text-[9px] tracking-[0.25em] uppercase font-extralight bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-500 flex items-center justify-center gap-2 rounded-md sm:rounded-none"
            >
              <Check className="w-3 h-3" />
              Aplicar
            </button>
          </div>

          {tempValue !== numInvitados && (
            <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-primary/5">
              <p className="text-[9px] tracking-[0.15em] text-primary/70 text-center font-extralight">
                Los precios se actualizarán automáticamente
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
