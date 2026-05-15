import { AmbulanceContent } from "@/src/components/reception/ambulance-content"
import { fetchAmbulanceRequests, fetchPatients } from "@/src/lib/supabase/queries"

export default async function AmbulancePage() {
  const [requests, patients] = await Promise.all([
    fetchAmbulanceRequests(),
    fetchPatients(),
  ])

  return <AmbulanceContent initialRequests={requests} patients={patients} />
}
