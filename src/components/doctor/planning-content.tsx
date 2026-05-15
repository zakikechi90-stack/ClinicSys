"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useDoctorLanguage } from "@/src/lib/doctor-language-context"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

type ScheduleRow = Tables<"doctor_schedules"> & {
  doctors: { id: string; profile_id: string; profiles: { full_name: string } | null } | null
}
type DoctorRow = { id: string; profiles: { full_name: string; email: string } | null;[key: string]: unknown }

interface PlanningContentProps {
  initialSchedules: ScheduleRow[]
  doctors: DoctorRow[]
}

export function PlanningContent({ initialSchedules, doctors }: PlanningContentProps) {
  const { t } = useDoctorLanguage()
  const router = useRouter()
  const supabase = createClient()
  const [schedules, setSchedules] = useState(initialSchedules)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleRow | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ doctorId: "", day: "", startTime: "", endTime: "" })

  const days = [
    { value: "monday", label: t.monday }, { value: "tuesday", label: t.tuesday },
    { value: "wednesday", label: t.wednesday }, { value: "thursday", label: t.thursday },
    { value: "friday", label: t.friday }, { value: "saturday", label: t.saturday },
    { value: "sunday", label: t.sunday },
  ]
  const getDayLabel = (day: string) => days.find((d) => d.value === day)?.label ?? day

  const openAddDialog = () => { setEditingSchedule(null); setFormData({ doctorId: "", day: "", startTime: "", endTime: "" }); setIsDialogOpen(true) }
  const openEditDialog = (schedule: ScheduleRow) => { setEditingSchedule(schedule); setFormData({ doctorId: schedule.doctor_id, day: schedule.day_of_week, startTime: schedule.start_time, endTime: schedule.end_time }); setIsDialogOpen(true) }

  const handleSave = async () => {
    if (!formData.doctorId) return
    try {
      if (editingSchedule) {
        await supabase.from("doctor_schedules").update({ doctor_id: formData.doctorId, day_of_week: formData.day, start_time: formData.startTime, end_time: formData.endTime }).eq("id", editingSchedule.id)
      } else {
        await supabase.from("doctor_schedules").insert({ doctor_id: formData.doctorId, day_of_week: formData.day, start_time: formData.startTime, end_time: formData.endTime })
      }
      setIsDialogOpen(false)
      router.refresh()
      const { data } = await supabase.from("doctor_schedules").select("*, doctors:doctor_id(id, profile_id, profiles:profile_id(full_name))").order("day_of_week").order("start_time")
      if (data) setSchedules(data as ScheduleRow[])
    } catch (err) { console.error(err) }
  }

  const handleDelete = async () => {
    if (deleteId) {
      await supabase.from("doctor_schedules").delete().eq("id", deleteId)
      setSchedules(schedules.filter((s) => s.id !== deleteId))
      setDeleteId(null)
      router.refresh()
    }
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.planning}</h1>
        <Button onClick={openAddDialog} className="gap-2"><Plus className="w-4 h-4" />{t.addSchedule}</Button>
      </div>
      <div className="border border-border rounded-lg bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>{t.doctor}</TableHead><TableHead>{t.day}</TableHead><TableHead>{t.time}</TableHead><TableHead className="text-right">{t.actions}</TableHead></TableRow></TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">{schedule.doctors?.profiles?.full_name ?? "—"}</TableCell>
                <TableCell>{getDayLabel(schedule.day_of_week)}</TableCell>
                <TableCell>{schedule.start_time} - {schedule.end_time}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(schedule)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setDeleteId(schedule.id); setIsDeleteDialogOpen(true) }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSchedule ? t.editSchedule : t.addSchedule}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>{t.doctor}</Label><Select value={formData.doctorId} onValueChange={(v) => setFormData({ ...formData, doctorId: v })}><SelectTrigger><SelectValue placeholder={t.selectDoctor} /></SelectTrigger><SelectContent>{doctors.map((d) => (<SelectItem key={d.id} value={d.id}>{d.profiles?.full_name ?? d.id}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{t.day}</Label><Select value={formData.day} onValueChange={(v) => setFormData({ ...formData, day: v })}><SelectTrigger><SelectValue placeholder={t.selectDay} /></SelectTrigger><SelectContent>{days.map((d) => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t.startTime}</Label><Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t.endTime}</Label><Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button><Button onClick={handleSave}>{t.save}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t.deleteSchedule}</AlertDialogTitle><AlertDialogDescription>{t.deleteScheduleConfirm}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>{t.confirm}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
