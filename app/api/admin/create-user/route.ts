import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { secretKey, email, password } = await request.json()

    // Verificar clave secreta para evitar acceso no autorizado
    if (!process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "Configuración del servidor incompleta" }, { status: 500 })
    }

    if (secretKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "Service role key no configurada" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verificar si el usuario ya existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const userExists = existingUsers?.users?.some((u) => u.email === email)

    if (userExists) {
      return NextResponse.json({
        message: "El usuario admin ya existe",
        email,
      })
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        name: "Administrador El Romeral",
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: "Usuario admin creado exitosamente",
      email,
      note: "Cambiar la contraseña después del primer login",
    })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
