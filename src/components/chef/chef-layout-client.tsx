"use client"

import { ChefLanguageProvider } from "@/src/lib/chef-language-context"
import { ChefSidebar } from "@/src/components/chef/chef-sidebar"
import { ChefHeader } from "@/src/components/chef/chef-header"

interface ChefLayoutClientProps {
  children: React.ReactNode
  userName: string
  notifications: Array<{ id: string; message: string; is_read: boolean; patients: { first_name: string; last_name: string } | null;[key: string]: unknown }>
}

export function ChefLayoutClient({ children, userName, notifications }: ChefLayoutClientProps) {
  return (
    <ChefLanguageProvider>
      <div className="min-h-screen bg-background">
        <ChefSidebar />
        <div className="ml-64">
          <ChefHeader userName={userName} initialNotifications={notifications} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ChefLanguageProvider>
  )
}
