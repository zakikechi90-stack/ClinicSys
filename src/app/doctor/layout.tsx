import { DoctorLayoutClient } from "@/src/components/doctor/doctor-layout-client"
import { getAuthenticatedUser, fetchNotifications } from "@/src/lib/supabase/queries"

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getAuthenticatedUser()
  const notifications = authUser ? await fetchNotifications(authUser.user.id) : []
  const isChef = authUser?.profile?.role === "chef"

  return (
    <DoctorLayoutClient
      userName={authUser?.profile?.full_name ?? "Docteur"}
      isChef={isChef}
      notifications={notifications}
    >
      {children}
    </DoctorLayoutClient>
  )
}
