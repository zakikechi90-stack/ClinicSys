import { DashboardContent } from "@/src/components/admin/dashboard-content"
import { fetchAdminStats } from "@/src/lib/supabase/queries"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const stats = await fetchAdminStats()
  return <DashboardContent stats={stats as any} />
}
