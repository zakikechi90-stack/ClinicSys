import { ChefHistoryContent } from "@/src/components/chef/chef-history-content"
import { getAuthenticatedUser, fetchDoctorByProfileId, fetchConsultationsByDoctor } from "@/src/lib/supabase/queries"
import { redirect } from "next/navigation"

export default async function ChefHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>
}) {
  const authUser = await getAuthenticatedUser()
  if (!authUser) redirect("/login")

  const doctor = await fetchDoctorByProfileId(authUser.user.id)
  let consultations = doctor ? await fetchConsultationsByDoctor(doctor.id) : []

  const params = await searchParams
  if (params.patientId) {
    consultations = consultations.filter(c => c.patient_id === params.patientId)
  }

  return <ChefHistoryContent consultations={consultations} />
}
