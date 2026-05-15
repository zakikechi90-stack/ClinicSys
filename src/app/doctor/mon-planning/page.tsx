import { MonPlanningContent } from "@/src/components/shared/mon-planning-content"
import { getAuthenticatedUser, fetchDoctorByProfileId, fetchDoctorSchedules } from "@/src/lib/supabase/queries"
import { redirect } from "next/navigation"

export default async function MonPlanningPage() {
  const authUser = await getAuthenticatedUser()
  if (!authUser) redirect("/login")

  const doctor = await fetchDoctorByProfileId(authUser.user.id)
  if (!doctor) return <div className="p-8">Aucun docteur associé à ce compte.</div>

  const schedules = await fetchDoctorSchedules(doctor.id)

  return <MonPlanningContent schedules={schedules} />
}
