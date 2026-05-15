import { ReceptionLayoutClient } from "@/src/components/reception/reception-layout-client"
import { getAuthenticatedUser } from "@/src/lib/supabase/queries"

export default async function ReceptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authUser = await getAuthenticatedUser()

  return (
    <ReceptionLayoutClient userName={authUser?.profile?.full_name ?? "Reception"}>
      {children}
    </ReceptionLayoutClient>
  )
}
