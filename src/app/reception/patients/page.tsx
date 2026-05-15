import { PatientsContent } from "@/src/components/reception/patients-content"
import { fetchPatients } from "@/src/lib/supabase/queries"

export default async function PatientsPage() {
  const patients = await fetchPatients()

  return <PatientsContent initialPatients={patients} />
}
