"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { LogOut, LayoutDashboard, Users, Kanban, Calendar } from "lucide-react"

interface AdminHeaderProps {
  currentPage?: "dashboard" | "crm" | "clientes" | "fechas"
}

export function AdminHeader({ currentPage }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { id: "crm", label: "CRM", href: "/admin/crm", icon: Kanban },
    { id: "clientes", label: "Clientes", href: "/admin/clientes", icon: Users },
    { id: "fechas", label: "Fechas", href: "/admin/fechas-bloqueadas", icon: Calendar },
  ]

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin">
              <Image
                src="/images/el-romeral-logo-nuevo.png"
                alt="El Romeral"
                width={120}
                height={40}
                className="invert dark:invert-0"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden border-t border-border px-4 py-2 flex gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
