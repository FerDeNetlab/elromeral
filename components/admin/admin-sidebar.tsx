"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { LogOut, LayoutDashboard, Users, Kanban, Calendar, ChevronRight, Bell, Menu, X, Briefcase, ClipboardList, Package, Wand2 } from "lucide-react"

interface AdminSidebarProps {
  currentPage?: "dashboard" | "crm" | "clientes" | "fechas" | "alertas" | "planners" | "encuestas" | "productos" | "personalizacion" | "settings"
}

export function AdminSidebar({ currentPage }: AdminSidebarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { id: "crm", label: "CRM", href: "/admin/crm", icon: Kanban },
    { id: "clientes", label: "Clientes", href: "/admin/clientes", icon: Users },
    { id: "planners", label: "Planners", href: "/admin/planners", icon: Briefcase },
    { id: "fechas", label: "Fechas", href: "/admin/fechas-bloqueadas", icon: Calendar },
    { id: "alertas", label: "Alertas", href: "/admin/alertas", icon: Bell },
    { id: "encuestas", label: "Encuestas", href: "/admin/encuestas", icon: ClipboardList },
    { id: "productos", label: "Productos", href: "/admin/productos", icon: Package },
    { id: "personalizacion", label: "Personalización", href: "/admin/personalizacion", icon: Wand2 },
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a1a] text-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      <aside
        className={`
        fixed left-0 top-0 h-full w-64 bg-[#1a1a1a] text-white flex flex-col z-50
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 text-white/70 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="block" onClick={() => setIsOpen(false)}>
            <Image
              src="/images/el-romeral-logo-nuevo.png"
              alt="El Romeral"
              width={140}
              height={45}
              className="brightness-0 invert"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive
                    ? "bg-white text-[#1a1a1a] font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}
