"use client"

import { DoctorLanguageProvider } from "@/src/lib/doctor-language-context"
import { DoctorSidebar } from "@/src/components/doctor/doctor-sidebar"
import { DoctorHeader } from "@/src/components/doctor/doctor-header"

interface DoctorLayoutClientProps {
  children: React.ReactNode
  userName: string
  isChef: boolean
  notifications: Array<{
    id: string
    message: string
    is_read: boolean
    related_patient_id: string | null
    patients: { first_name: string; last_name: string } | null
    [key: string]: unknown
  }>
}

export function DoctorLayoutClient({ children, userName, isChef, notifications }: DoctorLayoutClientProps) {
  return (
    <DoctorLanguageProvider>
      <div className="min-h-screen bg-background">
        <DoctorSidebar />
        <div className="ml-64">
          <DoctorHeader userName={userName} isChef={isChef} initialNotifications={notifications} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </DoctorLanguageProvider>
  )
}
