import { ChefLayoutClient } from "@/src/components/chef/chef-layout-client"
import { getAuthenticatedUser, fetchNotifications } from "@/src/lib/supabase/queries"

export default async function ChefLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getAuthenticatedUser()
  const notifications = authUser ? await fetchNotifications(authUser.user.id) : []

  return (
    <ChefLayoutClient userName={authUser?.profile?.full_name ?? "Médecin Chef"} notifications={notifications}>
      {children}
    </ChefLayoutClient>
  )
}
