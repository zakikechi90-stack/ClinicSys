import { DoctorDashboardContent } from "@/src/components/doctor/dashboard-content"
import { getAuthenticatedUser, fetchDoctorByProfileId, fetchDoctorStats, fetchTodayAppointmentsForDoctor } from "@/src/lib/supabase/queries"
import { redirect } from "next/navigation"

export default async function DoctorDashboardPage() {
  const authUser = await getAuthenticatedUser()
  if (!authUser) redirect("/login")

  const doctor = await fetchDoctorByProfileId(authUser.user.id)
  const [stats, todayAppointments] = await Promise.all([
    doctor ? fetchDoctorStats(doctor.id) : Promise.resolve({ total_patients: 0, total_consultations: 0, today_appointments: 0 }),
    doctor ? fetchTodayAppointmentsForDoctor(doctor.id) : Promise.resolve([]),
  ])

  return (
    <DoctorDashboardContent
      stats={stats}
      doctorName={authUser.profile?.full_name ?? "Docteur"}
      todayAppointments={todayAppointments}
    />
  )
}
