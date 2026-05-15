"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { CalendarClock, CalendarDays, Clock, Sun } from "lucide-react"
import type { Tables } from "@/src/lib/supabase/types"

type ScheduleRow = Tables<"doctor_schedules">

interface MonPlanningContentProps {
  schedules: ScheduleRow[]
}

// Timezone-safe: parse YYYY-MM-DD without UTC shift
function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatShiftDate(dateStr: string): string {
  return parseDateLocal(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function getDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, "0")}`
}

function ShiftCard({ shift, isToday }: { shift: ScheduleRow; isToday: boolean }) {
  const duration = getDurationMinutes(shift.start_time, shift.end_time)

  return (
    <div
      className={`
        group relative flex items-center gap-4 p-4 rounded-xl border bg-card
        transition-all duration-200 hover:shadow-md hover:-translate-y-px
        ${isToday
          ? "border-primary/30 bg-primary/5 hover:border-primary/50"
          : "border-border hover:border-primary/30"
        }
      `}
    >
      {/* Color strip */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${isToday ? "bg-primary" : "bg-muted-foreground/30 group-hover:bg-primary/50"} transition-colors`}
      />

      {/* Clock icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 ${isToday ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        <Clock className="w-5 h-5" />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold capitalize text-sm leading-tight truncate ${isToday ? "text-foreground" : "text-foreground"}`}>
          {formatShiftDate(shift.schedule_date!)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Durée : {formatDuration(duration)}
        </p>
      </div>

      {/* Time badge */}
      <div className="flex-shrink-0 text-right">
        <span className={`text-base font-bold tabular-nums ${isToday ? "text-primary" : "text-foreground"}`}>
          {shift.start_time.slice(0, 5)}
        </span>
        <span className="text-muted-foreground mx-1 text-sm">→</span>
        <span className={`text-base font-bold tabular-nums ${isToday ? "text-primary" : "text-foreground"}`}>
          {shift.end_time.slice(0, 5)}
        </span>
      </div>
    </div>
  )
}

export function MonPlanningContent({ schedules }: MonPlanningContentProps) {
  // Timezone-safe today string
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  // Sort by date then start time
  const sorted = [...schedules]
    .filter(s => s.schedule_date != null)
    .sort((a, b) => {
      const da = `${a.schedule_date}${a.start_time}`
      const db = `${b.schedule_date}${b.start_time}`
      return da.localeCompare(db)
    })

  // Keep only today and future
  const relevant = sorted.filter(s => s.schedule_date! >= todayStr)

  const todaysShifts = relevant.filter(s => s.schedule_date === todayStr)
  const upcomingShifts = relevant.filter(s => s.schedule_date! > todayStr)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Mon Planning</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Aujourd'hui ── */}
        <Card className="border-primary/20 shadow-sm flex flex-col">
          <CardHeader className="bg-primary/5 pb-4 border-b rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sun className="w-5 h-5" />
                Aujourd&apos;hui
              </CardTitle>
              {todaysShifts.length > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {todaysShifts.length} shift{todaysShifts.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {parseDateLocal(todayStr).toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </CardHeader>
          <CardContent className="p-4">
            {todaysShifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <CalendarClock className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">Aucun planning aujourd&apos;hui</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {todaysShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} isToday={true} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Shifts à venir ── */}
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader className="bg-muted/30 pb-4 border-b rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                Shifts à venir
              </CardTitle>
              {upcomingShifts.length > 0 && (
                <Badge variant="secondary">
                  {upcomingShifts.length} shift{upcomingShifts.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Plannings futurs
            </p>
          </CardHeader>
          <CardContent className="p-4">
            {upcomingShifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <CalendarDays className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">Aucun planning à venir</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {upcomingShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} isToday={false} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
