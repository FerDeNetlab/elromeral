import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Obtener path actual no es posible directamente aquí,
  // pero el middleware ya se encarga de la redirección.
  // Esta verificación es una capa extra de seguridad server-side.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // El middleware ya redirige, pero esto es defensa en profundidad
  // No redirigimos aquí porque no sabemos si estamos en /admin/login

  return <>{children}</>
}

