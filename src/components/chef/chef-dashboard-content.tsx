"use client"

import { Users, Stethoscope, CalendarClock } from "lucide-react"
import { useChefLanguage } from "@/src/lib/chef-language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

interface ChefStats {
  total_patients: number
  total_doctors: number
}

interface TodayAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  reason: string | null
  patients: { id: string; first_name: string; last_name: string } | null
  services: { id: string; name: string } | null
}

interface ChefDashboardContentProps {
  stats: ChefStats
  userName: string
  todayAppointments: TodayAppointment[]
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
}

export function ChefDashboardContent({ stats, userName, todayAppointments }: ChefDashboardContentProps) {
  const { t } = useChefLanguage()

  const statCards = [
    { label: t.totalPatients, value: stats.total_patients, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: t.totalDoctors, value: stats.total_doctors, icon: Stethoscope, color: "bg-green-500/10 text-green-600" },
    { label: t.todayAppointments, value: todayAppointments.length, icon: CalendarClock, color: "bg-purple-500/10 text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t.welcome}, {userName} (Médecin Chef)
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Today's Appointments Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CalendarClock className="w-5 h-5" />
            {t.todayAppointments}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noAppointmentsToday}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.appointmentTime}</TableHead>
                  <TableHead>{t.appointmentPatient}</TableHead>
                  <TableHead>{t.appointmentService}</TableHead>
                  <TableHead>{t.appointmentStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">
                      {appt.appointment_time?.slice(0, 5)}
                    </TableCell>
                    <TableCell>
                      {appt.patients
                        ? `${appt.patients.first_name} ${appt.patients.last_name}`
                        : "—"}
                    </TableCell>
                    <TableCell>{appt.services?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={appt.status === 'completed' 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : appt.status === 'cancelled'
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"}>
                        {appt.status === 'completed' ? "Terminé" : appt.status === 'cancelled' ? "Annulé" : "À venir"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
