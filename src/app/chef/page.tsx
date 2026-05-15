import { ChefDashboardContent } from "@/src/components/chef/chef-dashboard-content"
import { getAuthenticatedUser, fetchChefStats, fetchDoctorByProfileId, fetchTodayAppointmentsForDoctor } from "@/src/lib/supabase/queries"
import { redirect } from "next/navigation"

export default async function ChefDashboardPage() {
  const authUser = await getAuthenticatedUser()
  if (!authUser) redirect("/login")

  const doctor = await fetchDoctorByProfileId(authUser.user.id)
  const [stats, todayAppointments] = await Promise.all([
    fetchChefStats(),
    doctor ? fetchTodayAppointmentsForDoctor(doctor.id) : Promise.resolve([]),
  ])

  return (
    <ChefDashboardContent
      stats={stats}
      userName={authUser.profile?.full_name ?? "Médecin Chef"}
      todayAppointments={todayAppointments}
    />
  )
}
