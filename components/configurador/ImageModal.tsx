"use client"

import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  title: string
  showNavigation?: boolean
  currentIndex?: number
  totalImages?: number
  onNext?: () => void
  onPrev?: () => void
}

export default function ImageModal({
  isOpen,
  onClose,
  imageSrc,
  title,
  showNavigation = false,
  currentIndex = 0,
  totalImages = 1,
  onNext,
  onPrev,
}: ImageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !showNavigation) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && onPrev) {
        onPrev()
      } else if (e.key === "ArrowRight" && onNext) {
        onNext()
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, showNavigation, onNext, onPrev, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors z-10"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6 text-background" />
      </button>

      <div className="relative max-w-5xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-4">
          <h3 className="text-background text-xl font-light tracking-wide uppercase">{title}</h3>
          {showNavigation && totalImages > 1 && (
            <p className="text-background/60 text-sm mt-1">
              {currentIndex + 1} / {totalImages}
            </p>
          )}
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={title}
            fill
            className="object-contain"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />

          {showNavigation && totalImages > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPrev?.()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 hover:bg-background transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNext?.()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 hover:bg-background transition-colors"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { ImageModal }
