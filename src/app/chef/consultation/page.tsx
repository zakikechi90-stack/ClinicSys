import { Suspense } from "react"
import { ChefConsultationContent } from "@/src/components/chef/chef-consultation-content"
import { getAuthenticatedUser, fetchDoctorByProfileId, fetchPatients } from "@/src/lib/supabase/queries"
import { redirect } from "next/navigation"

export default async function ChefConsultationPage() {
  const authUser = await getAuthenticatedUser()
  if (!authUser) redirect("/login")

  const doctor = await fetchDoctorByProfileId(authUser.user.id)
  const patients = await fetchPatients()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChefConsultationContent patients={patients} doctorId={doctor?.id ?? ""} />
    </Suspense>
  )
}
