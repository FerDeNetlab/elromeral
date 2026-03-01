"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Loader2, Shield } from "lucide-react"

export default function AdminSetupPage() {
  const [secretKey, setSecretKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const createAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          details: data,
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Error al crear usuario",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Error de conexión",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Configuración Inicial</CardTitle>
          <CardDescription>Crear usuario administrador para El Romeral</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Clave de configuración</label>
            <Input
              type="password"
              placeholder="Ingresa la clave secreta"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Clave: romeral-setup-2024</p>
          </div>

          <Button onClick={createAdmin} disabled={loading || !secretKey} className="w-full bg-black hover:bg-black/90">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando usuario...
              </>
            ) : (
              "Crear Usuario Admin"
            )}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                    {result.message}
                  </p>
                  {result.success && result.details && (
                    <div className="mt-2 text-sm text-green-700 space-y-1">
                      <p>
                        <strong>Email:</strong> {result.details.email}
                      </p>
                      {result.details.tempPassword && (
                        <p>
                          <strong>Contraseña temporal:</strong> {result.details.tempPassword}
                        </p>
                      )}
                      <p className="text-xs mt-2 text-green-600">Ahora puedes ir a /admin/login para iniciar sesión</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
