import { HospitalisationContent } from "@/src/components/reception/hospitalisation-content"
import {
  fetchHospitalizations,
  fetchPatients,
  fetchServices,
  fetchRoomsWithBeds,
  fetchDoctors,
} from "@/src/lib/supabase/queries"

export default async function HospitalisationPage() {
  const [hospitalizations, patients, services, rooms, doctors] =
    await Promise.all([
      fetchHospitalizations(),
      fetchPatients(),
      fetchServices(),
      fetchRoomsWithBeds(),
      fetchDoctors(),
    ])

  return (
    <HospitalisationContent
      initialHospitalizations={hospitalizations}
      patients={patients}
      services={services}
      rooms={rooms}
      doctors={doctors}
    />
  )
}
