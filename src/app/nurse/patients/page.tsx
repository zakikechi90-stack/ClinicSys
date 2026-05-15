import { NursePatientsContent } from "@/src/components/nurse/patients-content"
import { fetchHospitalizedPatientsForNurse } from "@/src/lib/supabase/queries"

export default async function NursePatientsPage() {
  const hospitalizations = await fetchHospitalizedPatientsForNurse()
  return <NursePatientsContent initialHospitalizations={hospitalizations} />
}
