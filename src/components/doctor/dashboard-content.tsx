"use client"

import { Users, CalendarClock } from "lucide-react"
import { useDoctorLanguage } from "@/src/lib/doctor-language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

interface DoctorStats {
  total_patients: number
  total_consultations: number
  today_appointments: number
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

interface DoctorDashboardContentProps {
  stats: DoctorStats
  doctorName: string
  todayAppointments: TodayAppointment[]
}


export function DoctorDashboardContent({ stats, doctorName, todayAppointments }: DoctorDashboardContentProps) {
  const { t } = useDoctorLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t.welcome}, {doctorName}
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.totalMyPatients}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.total_patients}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.todayAppointments}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.today_appointments}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <CalendarClock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
