"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Clock, AlertCircle, Trash2 } from "lucide-react"
import { useReceptionLanguage } from "@/src/lib/reception-language-context"
import { toast } from "sonner"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Label } from "@/src/components/ui/label"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

type AppointmentRow = Tables<"appointments"> & {
  patients: { id: string; first_name: string; last_name: string } | null
  doctors: {
    id: string
    profile_id: string
    profiles: { full_name: string } | null
  } | null
  services: { id: string; name: string } | null
}

type DoctorRow = {
  id: string
  profile_id: string
  service_id: string | null
  profiles: { full_name: string; email: string } | null
  services: { id: string; name: string } | null
  [key: string]: unknown
}

type ScheduleRow = {
  id: string
  doctor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  [key: string]: unknown
}

interface AppointmentsContentProps {
  initialAppointments: AppointmentRow[]
  patients: Tables<"patients">[]
  services: Tables<"services">[]
  doctors: DoctorRow[]
  schedules: ScheduleRow[]
}

// Generate 30-minute slots between start and end time
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)
  let current = startH * 60 + startM
  const end = endH * 60 + endM
  while (current < end) {
    const h = Math.floor(current / 60)
    const m = current % 60
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    current += 30
  }
  return slots
}

const dayNames: Record<number, string> = {
  0: "Dimanche", 1: "Lundi", 2: "Mardi", 3: "Mercredi",
  4: "Jeudi", 5: "Vendredi", 6: "Samedi",
}

export function AppointmentsContent({
  initialAppointments,
  patients,
  services,
  doctors,
  schedules,
}: AppointmentsContentProps) {
  const { t } = useReceptionLanguage()
  const router = useRouter()
  const supabase = createClient()

  // Track current time to automatically refresh statuses without hard reload
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // We rely strictly on database status now
  const isAppointmentPast = useCallback((date: string, time: string | null) => {
    if (!date || !time) return false;
    const apptDateTime = new Date(`${date}T${time}`);
    return apptDateTime < currentTime;
  }, [currentTime]);

  const [appointments, setAppointments] = useState(initialAppointments)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentRow | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    serviceId: "",
    doctorId: "",
    date: "",
    time: "",
  })
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const availableDoctors = formData.serviceId
    ? doctors.filter((d) => d.service_id === formData.serviceId)
    : doctors

  // Get the selected doctor's schedule for the selected date
  const getAvailableSlots = useCallback(() => {
    if (!formData.doctorId || !formData.date) return { slots: [], scheduleForDay: [] }

    const todayDate = new Date()
    const todayStr = todayDate.toISOString().split("T")[0]

    // Block past dates
    if (formData.date < todayStr) {
      return { slots: [], scheduleForDay: [] }
    }

    const dateObj = new Date(formData.date + "T00:00:00")
    const dayOfWeek = dateObj.getDay()

    // Find schedules for this doctor on this day
    const doctorSchedulesForDay = schedules.filter(
      (s) => s.doctor_id === formData.doctorId && s.day_of_week === dayOfWeek && s.is_active
    )

    if (doctorSchedulesForDay.length === 0) {
      return { slots: [], scheduleForDay: [] }
    }

    // Generate all time slots from all schedule blocks
    const allSlots: string[] = []
    for (const sched of doctorSchedulesForDay) {
      allSlots.push(...generateTimeSlots(sched.start_time, sched.end_time))
    }

    const currentHour = todayDate.getHours();
    const currentMinute = todayDate.getMinutes();
    const isToday = formData.date === todayStr;

    // Filter out already booked times and past times if today
    const available = allSlots.filter((slot) => {
      if (bookedTimes.includes(slot)) return false;
      if (isToday) {
        const [h, m] = slot.split(":").map(Number);
        if (h < currentHour || (h === currentHour && m < currentMinute)) {
          return false;
        }
      }
      return true;
    })

    return { slots: available, scheduleForDay: doctorSchedulesForDay }
  }, [formData.doctorId, formData.date, schedules, bookedTimes])

  // Fetch booked appointments when doctor + date changes
  useEffect(() => {
    if (!formData.doctorId || !formData.date) {
      setBookedTimes([])
      return
    }

    const fetchBooked = async () => {
      setLoadingSlots(true)
      const { data } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("doctor_id", formData.doctorId)
        .eq("appointment_date", formData.date)

      const booked = (data as any[] ?? []).map((a: any) => a.appointment_time?.slice(0, 5))
      // If editing, don't count the current appointment's time as booked
      if (editingAppointment && editingAppointment.doctor_id === formData.doctorId && editingAppointment.appointment_date === formData.date) {
        const editTime = editingAppointment.appointment_time?.slice(0, 5)
        setBookedTimes(booked.filter((t: string) => t !== editTime))
      } else {
        setBookedTimes(booked)
      }
      setLoadingSlots(false)
    }

    fetchBooked()
  }, [formData.doctorId, formData.date, editingAppointment, supabase])

  const { slots: availableSlots, scheduleForDay } = getAvailableSlots()

  const handleOpenDialog = (appointment?: AppointmentRow) => {
    if (appointment) {
      setEditingAppointment(appointment)
      setFormData({
        patientId: appointment.patient_id,
        serviceId: appointment.service_id || "",
        doctorId: appointment.doctor_id,
        date: appointment.appointment_date,
        time: appointment.appointment_time?.slice(0, 5) || "",
      })
    } else {
      setEditingAppointment(null)
      setFormData({ patientId: "", serviceId: "", doctorId: "", date: "", time: "" })
    }
    setIsDialogOpen(true)
  }

  const handleOpenDeleteDialog = (appointment: AppointmentRow) => {
    setAppointmentToDelete(appointment)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!appointmentToDelete) return
    setIsDeleting(true)
    try {
      const { error, data } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentToDelete.id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error("Impossible de supprimer le rendez-vous. Vérifiez vos permissions.")
      }

      setAppointments(appointments.filter((a) => a.id !== appointmentToDelete.id))
      setIsDeleteDialogOpen(false)
      setAppointmentToDelete(null)
      toast.success("Rendez-vous supprimé avec succès")
      router.refresh()
    } catch (err: any) {
      console.error("Error deleting appointment:", err)
      toast.error(err.message || "Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) return

    const selectedDate = new Date(formData.date);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (selectedDate < todayDate) {
      toast.error("Impossible de créer un rendez-vous dans le passé.");
      return;
    }

    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    if (formData.date === todayStr) {
      const [h, m] = formData.time.split(":").map(Number);
      const currentH = new Date().getHours();
      const currentM = new Date().getMinutes();
      if (h < currentH || (h === currentH && m < currentM)) {
        toast.error("Impossible de créer un rendez-vous à une heure passée.");
        return;
      }
    }

    setIsSaving(true)

    try {
      const payload = {
        patient_id: formData.patientId,
        doctor_id: formData.doctorId,
        service_id: formData.serviceId || null,
        appointment_date: formData.date,
        appointment_time: formData.time,
      }

      if (editingAppointment) {
        await supabase
          .from("appointments")
          .update(payload as never)
          .eq("id", editingAppointment.id)
      } else {
        await supabase.from("appointments").insert(payload as never)
      }

      // Update the patient's primary_doctor_id so the patient
      // appears in the doctor's "Mes Patients" list
      await supabase
        .from("patients")
        .update({ primary_doctor_id: formData.doctorId } as never)
        .eq("id", formData.patientId)

      setIsDialogOpen(false)
      router.refresh()
      // Refetch
      const { data: fresh } = await supabase
        .from("appointments")
        .select(
          `*, patients:patient_id(id, first_name, last_name), doctors:doctor_id(id, profile_id, profiles:profile_id(full_name)), services:service_id(id, name)`
        )
        .order("appointment_date", { ascending: true })
      if (fresh) setAppointments(fresh as AppointmentRow[])
    } catch (err) {
      console.error("Error saving appointment:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleServiceChange = (serviceId: string) => {
    setFormData({ ...formData, serviceId, doctorId: "", time: "" })
  }

  const handleDoctorChange = (doctorId: string) => {
    setFormData({ ...formData, doctorId, time: "" })
  }

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, time: "" })
  }

  const getPatientName = (appt: AppointmentRow) =>
    appt.patients
      ? `${appt.patients.first_name} ${appt.patients.last_name}`
      : "—"

  const getDoctorName = (appt: AppointmentRow) =>
    appt.doctors?.profiles?.full_name ?? "—"

  const getServiceName = (appt: AppointmentRow) =>
    appt.services?.name ?? "—"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.appointments}</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.addAppointment}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.appointments}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.patient}</TableHead>
                <TableHead>{t.service}</TableHead>
                <TableHead>{t.doctor}</TableHead>
                <TableHead>{t.date}</TableHead>
                <TableHead>{t.time}</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucun rendez-vous
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => {
                  const isCompletedByStatus = appointment.status === "completed"
                  const isCancelled = appointment.status === "cancelled"
                  const past = isAppointmentPast(appointment.appointment_date, appointment.appointment_time)
                  
                  const isEffectivelyCompleted = isCompletedByStatus || (!isCancelled && past)

                  return (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{getPatientName(appointment)}</TableCell>
                      <TableCell>{getServiceName(appointment)}</TableCell>
                      <TableCell>{getDoctorName(appointment)}</TableCell>
                      <TableCell>{appointment.appointment_date}</TableCell>
                      <TableCell>{appointment.appointment_time?.slice(0, 5)}</TableCell>
                      <TableCell>
                        {isEffectivelyCompleted ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Terminé</Badge>
                        ) : isCancelled ? (
                          <Badge variant="destructive">Annulé</Badge>
                        ) : (
                          <Badge variant="default" className="bg-blue-500/10 text-blue-600 border-blue-500/20">À venir</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(appointment)}
                            disabled={isEffectivelyCompleted}
                          >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(appointment)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? t.editAppointment : t.addAppointment}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label>{t.patient}</Label>
              <Select
                value={formData.patientId}
                onValueChange={(v) => setFormData({ ...formData, patientId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectPatient} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.service}</Label>
              <Select value={formData.serviceId} onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectService} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.doctor}</Label>
              <Select
                value={formData.doctorId}
                onValueChange={handleDoctorChange}
                disabled={availableDoctors.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={availableDoctors.length === 0 ? "Aucun médecin disponible" : t.selectDoctor} />
                </SelectTrigger>
                <SelectContent>
                  {availableDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.profiles?.full_name ?? doctor.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.date}</Label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            {/* Available Time Slots */}
            {formData.doctorId && formData.date && (() => {
              const todayStr = new Date().toISOString().split("T")[0]
              const isPastDate = formData.date < todayStr

              return (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horaires disponibles
                  </Label>
                  {isPastDate ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p className="text-sm font-medium">Impossible de prendre un rendez-vous dans une date passée.</p>
                    </div>
                  ) : loadingSlots ? (
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                  ) : scheduleForDay.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p className="text-sm">
                        Ce médecin ne travaille pas le{" "}
                        <strong>{dayNames[new Date(formData.date + "T00:00:00").getDay()]}</strong>.
                        Veuillez choisir un autre jour.
                      </p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p className="text-sm">Tous les créneaux sont réservés pour ce jour.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          size="sm"
                          variant={formData.time === slot ? "default" : "outline"}
                          className={`min-w-[70px] ${formData.time === slot ? "ring-2 ring-primary/30" : ""}`}
                          onClick={() => setFormData({ ...formData, time: slot })}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  )}
                  {!isPastDate && scheduleForDay.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Horaire du médecin : {scheduleForDay.map((s) => `${s.start_time.slice(0, 5)}-${s.end_time.slice(0, 5)}`).join(", ")}
                    </p>
                  )}
                </div>
              )
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.time}>
              {isSaving ? "..." : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le rendez-vous</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action le retirera également de l'agenda du médecin.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
