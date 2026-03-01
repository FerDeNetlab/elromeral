// Script para crear usuario administrador
// Ejecutar una sola vez para crear el usuario admin

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  const email = "admin@elromeral.com.mx"
  const password = "ElRomeral2024!" // Cambiar después del primer login

  console.log("Creando usuario administrador...")

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirmar email automáticamente
    user_metadata: {
      role: "admin",
      name: "Administrador El Romeral",
    },
  })

  if (error) {
    console.error("Error al crear usuario:", error.message)
    return
  }

  console.log("Usuario administrador creado exitosamente!")
  console.log("Email:", email)
  console.log("Password temporal:", password)
  console.log("IMPORTANTE: Cambiar la contraseña después del primer login")
}

createAdminUser()
