import { PlanningContent } from "@/src/components/doctor/planning-content"
import { fetchDoctorSchedules, fetchDoctors } from "@/src/lib/supabase/queries"

export default async function PlanningPage() {
  const [schedules, doctors] = await Promise.all([
    fetchDoctorSchedules(),
    fetchDoctors(),
  ])

  return <PlanningContent initialSchedules={schedules} doctors={doctors} />
}
