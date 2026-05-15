import { Suspense } from "react"
import { ConsultationContent } from "@/src/components/doctor/consultation-content"
import { getAuthenticatedUser, fetchDoctorByProfileId, fetchPatients } from "@/src/lib/supabase/queries"
import { redirect } from "next/navigation"

export default async function ConsultationPage() {
  const authUser = await getAuthenticatedUser()
  if (!authUser) redirect("/login")

  const doctor = await fetchDoctorByProfileId(authUser.user.id)
  const patients = doctor
    ? await fetchPatients({ doctorId: doctor.id })
    : []

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultationContent
        patients={patients}
        doctorId={doctor?.id ?? ""}
      />
    </Suspense>
  )
}
