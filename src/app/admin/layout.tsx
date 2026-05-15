import { AdminLayoutClient } from "@/src/components/admin/admin-layout-client"
import { getAuthenticatedUser } from "@/src/lib/supabase/queries"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getAuthenticatedUser()
  return <AdminLayoutClient userName={authUser?.profile?.full_name ?? "Admin"}>{children}</AdminLayoutClient>
}
