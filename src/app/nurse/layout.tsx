import { NurseLayoutClient } from "@/src/components/nurse/nurse-layout-client"
import { getAuthenticatedUser } from "@/src/lib/supabase/queries"

export default async function NurseLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getAuthenticatedUser()
  return <NurseLayoutClient userName={authUser?.profile?.full_name ?? "Infirmier"}>{children}</NurseLayoutClient>
}
