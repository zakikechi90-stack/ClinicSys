import { ReceptionDashboardContent } from "@/src/components/reception/dashboard-content"
import { fetchReceptionStats, getAuthenticatedUser } from "@/src/lib/supabase/queries"

export const dynamic = "force-dynamic";

export default async function ReceptionDashboardPage() {
  const [authUser, stats] = await Promise.all([
    getAuthenticatedUser(),
    fetchReceptionStats(),
  ])

  return (
    <ReceptionDashboardContent
      stats={stats}
      userName={authUser?.profile?.full_name ?? "Reception"}
    />
  )
}
