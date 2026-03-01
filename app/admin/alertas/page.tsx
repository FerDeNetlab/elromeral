"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Plus, Trash2, Check, X, Loader2, Bell } from "lucide-react"

interface AlertEmail {
  id: string
  email: string
  nombre: string | null
  activo: boolean
  created_at: string
}

function AlertasContent() {
  const [emails, setEmails] = useState<AlertEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevoEmail, setNuevoEmail] = useState("")
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [agregando, setAgregando] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  useEffect(() => {
    cargarEmails()
  }, [])

  const cargarEmails = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("alert_emails").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setEmails(data)
    }
    setLoading(false)
  }

  const agregarEmail = async () => {
    if (!nuevoEmail.trim()) {
      setError("Ingresa un correo electrónico")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(nuevoEmail)) {
      setError("El formato del correo no es válido")
      return
    }

    setAgregando(true)
    setError("")

    const { error: dbError } = await supabase.from("alert_emails").insert({
      email: nuevoEmail.trim().toLowerCase(),
      nombre: nuevoNombre.trim() || null,
      activo: true,
    })

    if (dbError) {
      if (dbError.code === "23505") {
        setError("Este correo ya está registrado")
      } else {
        setError("Error al agregar el correo")
      }
    } else {
      setNuevoEmail("")
      setNuevoNombre("")
      cargarEmails()
    }

    setAgregando(false)
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase.from("alert_emails").update({ activo: !activo }).eq("id", id)

    cargarEmails()
  }

  const eliminarEmail = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este correo?")) return

    await supabase.from("alert_emails").delete().eq("id", id)

    cargarEmails()
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Correos de Alerta</h1>
          <p className="text-neutral-500">
            Administra los correos que recibirán notificaciones cuando se genere una nueva cotización.
          </p>
        </div>

        {/* Agregar nuevo email */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar nuevo correo
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-neutral-500 mb-1">Nombre (opcional)</label>
              <Input
                placeholder="Ej: Juan Pérez"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-neutral-500 mb-1">Correo electrónico</label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={nuevoEmail}
                onChange={(e) => {
                  setNuevoEmail(e.target.value)
                  setError("")
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={agregarEmail}
                disabled={agregando}
                className="bg-neutral-900 hover:bg-neutral-800 w-full sm:w-auto"
              >
                {agregando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {/* Lista de emails */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50">
            <h2 className="font-medium text-neutral-900 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Correos registrados
              <span className="text-sm text-neutral-500 font-normal">
                ({emails.filter((e) => e.activo).length} activos)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400" />
            </div>
          ) : emails.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">No hay correos registrados</p>
              <p className="text-neutral-400 text-sm">Agrega correos para recibir alertas de nuevas cotizaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    !email.activo ? "bg-neutral-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        email.activo ? "bg-green-100" : "bg-neutral-200"
                      }`}
                    >
                      <Mail className={`w-5 h-5 ${email.activo ? "text-green-600" : "text-neutral-400"}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${email.activo ? "text-neutral-900" : "text-neutral-400"}`}>
                        {email.nombre || email.email}
                      </p>
                      {email.nombre && <p className="text-sm text-neutral-500">{email.email}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActivo(email.id, email.activo)}
                      className={email.activo ? "text-green-600" : "text-neutral-400"}
                    >
                      {email.activo ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Inactivo
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarEmail(email.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AlertasPage() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <AlertasContent />
      </Suspense>
    </AuthGuard>
  )
}
