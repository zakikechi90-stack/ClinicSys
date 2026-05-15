"use client"

import { ReceptionLanguageProvider } from "@/src/lib/reception-language-context"
import { ReceptionSidebar } from "@/src/components/reception/reception-sidebar"
import { ReceptionHeader } from "@/src/components/reception/reception-header"

interface ReceptionLayoutClientProps {
  children: React.ReactNode
  userName: string
}

export function ReceptionLayoutClient({ children, userName }: ReceptionLayoutClientProps) {
  return (
    <ReceptionLanguageProvider>
      <div className="min-h-screen bg-background">
        <ReceptionSidebar />
        <div className="ml-64">
          <ReceptionHeader userName={userName} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ReceptionLanguageProvider>
  )
}
