import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    // Actualizar sesión de Supabase
    const response = await updateSession(request)

    // Proteger rutas admin (excepto login y setup)
    const { pathname } = request.nextUrl
    const isAdminRoute = pathname.startsWith("/admin")
    const isAdminLogin = pathname === "/admin/login"
    const isAdminSetup = pathname === "/admin/setup"
    const isAdminAPI = pathname.startsWith("/api/admin")

    if (isAdminRoute && !isAdminLogin && !isAdminSetup) {
        // Verificar si el usuario tiene sesión a nivel de cookies
        const supabaseAuthCookie = request.cookies.getAll().find(
            (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
        )

        if (!supabaseAuthCookie) {
            const loginUrl = new URL("/admin/login", request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Proteger API routes de admin
    if (isAdminAPI) {
        const supabaseAuthCookie = request.cookies.getAll().find(
            (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
        )

        // Permitir create-user solo con ADMIN_SETUP_KEY (se valida en la propia ruta)
        if (pathname === "/api/admin/create-user") {
            return response
        }

        if (!supabaseAuthCookie) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }
    }

    return response
}

export const config = {
    matcher: [
        // Proteger rutas admin
        "/admin/:path*",
        "/api/admin/:path*",
        // Actualizar sesión en todas las rutas (excepto estáticas)
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
