import { NurseDashboardContent } from "@/src/components/nurse/dashboard-content"
import { fetchNurseStats } from "@/src/lib/supabase/queries"

export default async function NurseDashboardPage() {
  const stats = await fetchNurseStats()
  return <NurseDashboardContent totalHospitalized={stats.total_hospitalized} />
}
