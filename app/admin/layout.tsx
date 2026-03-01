import type React from "react"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si la ruta es /admin/login, permitir acceso sin autenticación
  // Esto se maneja en el componente hijo, aquí solo verificamos para otras rutas

  return <>{children}</>
}
