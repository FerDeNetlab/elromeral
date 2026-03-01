"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        // Ya está autenticado, redirigir al dashboard
        window.location.href = "/admin"
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [supabase.auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        window.location.href = "/admin"
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Credenciales inválidas")
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando sesión...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/images/el-romeral-logo-nuevo.png"
            alt="El Romeral"
            width={180}
            height={60}
            className="mx-auto mb-6 invert dark:invert-0"
          />
          <h1 className="text-2xl font-light tracking-wide text-foreground">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@elromeral.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full h-12 text-sm tracking-wide" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Acceso exclusivo para administradores de El Romeral
        </p>
      </div>
    </div>
  )
}
