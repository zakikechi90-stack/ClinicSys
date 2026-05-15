import { Suspense } from "react"
import { NurseTreatmentContent } from "@/src/components/nurse/treatment-content"
import { fetchHospitalizedPatientsForNurse } from "@/src/lib/supabase/queries"

export default async function TreatmentPage() {
  const hospitalizations = await fetchHospitalizedPatientsForNurse()
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NurseTreatmentContent initialHospitalizations={hospitalizations} />
    </Suspense>
  )
}
