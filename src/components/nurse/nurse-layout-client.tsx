"use client"

import { NurseLanguageProvider } from "@/src/lib/nurse-language-context"
import { NurseSidebar } from "@/src/components/nurse/nurse-sidebar"
import { NurseHeader } from "@/src/components/nurse/nurse-header"

export function NurseLayoutClient({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <NurseLanguageProvider>
      <div className="min-h-screen bg-background">
        <NurseSidebar />
        <div className="ml-64">
          <NurseHeader userName={userName} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </NurseLanguageProvider>
  )
}
