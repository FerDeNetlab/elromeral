"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, X, Loader2, Check } from "lucide-react"

interface EnviarEmailModalProps {
  isOpen: boolean
  onClose: () => void
  clientEmail: string
  quoteName: string
  quoteSlug: string
  quoteTotal: number
  quoteDate: string
  numInvitados: number
}

export function EnviarEmailModal({
  isOpen,
  onClose,
  clientEmail,
  quoteName,
  quoteSlug,
  quoteTotal,
  quoteDate,
  numInvitados,
}: EnviarEmailModalProps) {
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const enviarEmail = async () => {
    setEnviando(true)
    setError("")

    try {
      const response = await fetch("/api/send-quote-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: clientEmail,
          quoteName,
          quoteSlug,
          quoteTotal,
          quoteDate,
          numInvitados,
          isAlert: false,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error enviando email")
      }

      setEnviado(true)
      setTimeout(() => {
        onClose()
        setEnviado(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-neutral-600" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Enviar Cotización</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {enviado ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-neutral-900 mb-2">¡Correo enviado!</p>
              <p className="text-neutral-500 text-sm">La cotización ha sido enviada a {clientEmail}</p>
            </div>
          ) : (
            <>
              <p className="text-neutral-600 mb-6">
                Se enviará la cotización completa al siguiente correo electrónico:
              </p>

              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-neutral-500 mb-1">Correo del cliente</p>
                <p className="text-neutral-900 font-medium">{clientEmail}</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose} disabled={enviando}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800"
                  onClick={enviarEmail}
                  disabled={enviando}
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
