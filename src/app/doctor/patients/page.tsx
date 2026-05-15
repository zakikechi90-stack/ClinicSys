import { PatientsContent } from "@/src/components/doctor/patients-content"
import { getAuthenticatedUser, fetchDoctorByProfileId } from "@/src/lib/supabase/queries"
import { redirect } from "next/navigation"

export default async function PatientsPage() {
  const authUser = await getAuthenticatedUser()
  if (!authUser) redirect("/login")

  const doctor = await fetchDoctorByProfileId(authUser.user.id)
  if (!doctor) redirect("/login")

  return <PatientsContent doctorId={doctor.id} />
}
