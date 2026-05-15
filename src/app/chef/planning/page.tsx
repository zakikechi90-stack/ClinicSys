import { ChefPlanningContent } from "@/src/components/chef/chef-planning-content"
import { fetchDoctorSchedules, fetchDoctors } from "@/src/lib/supabase/queries"

export default async function ChefPlanningPage() {
  const [schedules, doctors] = await Promise.all([fetchDoctorSchedules(), fetchDoctors()])
  return <ChefPlanningContent initialSchedules={schedules} doctors={doctors} />
}
