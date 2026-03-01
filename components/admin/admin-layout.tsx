"use client"

import type React from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AuthGuard } from "./auth-guard"

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage?: "dashboard" | "crm" | "clientes" | "fechas" | "alertas" | "settings"
}

export function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f8f8f6]">
        <AdminSidebar currentPage={currentPage} />
        <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">{children}</main>
      </div>
    </AuthGuard>
  )
}
