import { AppointmentsContent } from "@/src/components/reception/appointments-content"
import {
  fetchAppointments,
  fetchPatients,
  fetchServices,
  fetchDoctors,
  fetchDoctorSchedules,
} from "@/src/lib/supabase/queries"

export default async function AppointmentsPage() {
  const [appointments, patients, services, doctors, schedules] = await Promise.all([
    fetchAppointments(),
    fetchPatients(),
    fetchServices(),
    fetchDoctors(),
    fetchDoctorSchedules(),
  ])

  return (
    <AppointmentsContent
      initialAppointments={appointments}
      patients={patients}
      services={services}
      doctors={doctors}
      schedules={schedules}
    />
  )
}
