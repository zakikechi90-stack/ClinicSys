"use client"

import { LanguageProvider } from "@/src/lib/language-context"
import { AdminSidebar } from "@/src/components/admin/admin-sidebar"
import { AdminHeader } from "@/src/components/admin/admin-header"

export function AdminLayoutClient({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="ml-64">
          <AdminHeader userName={userName} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  )
}
