"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useChefLanguage } from "@/src/lib/chef-language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

type ScheduleRow = Tables<"doctor_schedules"> & {
  doctors: { id: string; profile_id: string; profiles: { full_name: string } | null } | null
}
type DoctorRow = { id: string; profiles: { full_name: string; email: string } | null;[key: string]: unknown }

interface ChefPlanningContentProps {
  initialSchedules: ScheduleRow[]
  doctors: DoctorRow[]
}

export function ChefPlanningContent({ initialSchedules, doctors }: ChefPlanningContentProps) {
  const { t } = useChefLanguage()
  const router = useRouter()
  const supabase = createClient()
  const [schedules, setSchedules] = useState(initialSchedules)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleRow | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ doctorId: "", date: "", startTime: "", endTime: "" })
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDayObj, setSelectedDayObj] = useState<{ day: number, month: number, year: number, dbDay: number } | null>(null)
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // 0 is Monday, 6 is Sunday
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  
  const days = []
  for (let i = 0; i < firstDayIndex; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  const remainingDays = 7 - (days.length % 7)
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) days.push(null)
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const daysArr = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
  const dayLabels: Record<string, string> = { monday: t.monday, tuesday: t.tuesday, wednesday: t.wednesday, thursday: t.thursday, friday: t.friday, saturday: t.saturday, sunday: t.sunday }
  const resetForm = () => setFormData({ doctorId: "", date: "", startTime: "", endTime: "" })

  const handleAdd = async () => {
    if (!formData.doctorId || !formData.date) return
    try {
      const dateObj = new Date(formData.date + "T00:00:00")
      // day_of_week: 0=Sunday...6=Saturday (matches DB check constraint 0-6)
      const dayOfWeek = dateObj.getDay()
      await supabase.from("doctor_schedules").insert({ 
        doctor_id: formData.doctorId, 
        day_of_week: dayOfWeek, 
        schedule_date: formData.date, 
        start_time: formData.startTime, 
        end_time: formData.endTime 
      } as any)
      resetForm()
      setIsAddDialogOpen(false)
      if (selectedDayObj) {
        setIsDayModalOpen(true)
      }
      router.refresh()
      const { data } = await supabase.from("doctor_schedules").select("*, doctors:doctor_id(id, profile_id, profiles:profile_id(full_name))").order("day_of_week").order("start_time")
      if (data) setSchedules(data as ScheduleRow[])
    } catch (err) { console.error(err) }
  }

  const handleEdit = async () => {
    if (!editingSchedule) return
    try {
      const dateObj = new Date(formData.date + "T00:00:00")
      // day_of_week: 0=Sunday...6=Saturday (matches DB check constraint 0-6)
      const dayOfWeek = dateObj.getDay()
      await supabase.from("doctor_schedules").update({ 
        doctor_id: formData.doctorId, 
        day_of_week: dayOfWeek, 
        schedule_date: formData.date, 
        start_time: formData.startTime, 
        end_time: formData.endTime 
      } as any).eq("id", editingSchedule.id)
      resetForm()
      setEditingSchedule(null)
      setIsEditDialogOpen(false)
      router.refresh()
      const { data } = await supabase.from("doctor_schedules").select("*, doctors:doctor_id(id, profile_id, profiles:profile_id(full_name))").order("day_of_week").order("start_time")
      if (data) setSchedules(data as ScheduleRow[])
    } catch (err) { console.error(err) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from("doctor_schedules").delete().eq("id", deleteId)
    setSchedules(schedules.filter((s) => s.id !== deleteId))
    setDeleteId(null)
    setIsDeleteDialogOpen(false)
    router.refresh()
  }

  const openEditDialog = (schedule: ScheduleRow) => {
    setEditingSchedule(schedule)
    setFormData({ doctorId: schedule.doctor_id, date: schedule.schedule_date || "", startTime: schedule.start_time, endTime: schedule.end_time })
    setIsEditDialogOpen(true)
  }

  const renderFormFields = (isDaySpecific = false) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2"><Label>{t.doctor}</Label><Select value={formData.doctorId} onValueChange={(v) => setFormData({ ...formData, doctorId: v })}><SelectTrigger><SelectValue placeholder={t.selectDoctor} /></SelectTrigger><SelectContent>{doctors.map((d) => (<SelectItem key={d.id} value={d.id}>{d.profiles?.full_name ?? d.id}</SelectItem>))}</SelectContent></Select></div>
      {!isDaySpecific && (
        <div className="space-y-2">
          <Label>Date</Label>
          <Input 
            type="date" 
            min={new Date().toLocaleDateString('en-CA')} 
            value={formData.date} 
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>{t.startTime}</Label><Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} /></div>
        <div className="space-y-2"><Label>{t.endTime}</Label><Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} /></div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t.planning}</CardTitle>
        <Button onClick={() => { resetForm(); setSelectedDayObj(null); setIsAddDialogOpen(true) }}><Plus className="w-4 h-4 mr-2" />{t.addSchedule}</Button>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold capitalize">
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((dayName) => (
              <div key={dayName} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground border-r last:border-r-0">
                {dayName}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 bg-muted gap-px">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="bg-background min-h-[120px] p-2" />
              }

              const jsDay = new Date(year, month, day).getDay()
              // Store dbDay as 0-6 to match DB constraint
              const dbDay = jsDay
              
              // Filter and sort schedules for this exact date
              const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const daySchedules = schedules
                .filter((s) => s.schedule_date === currentDateStr)
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                
              const cellDate = new Date(year, month, day)
              cellDate.setHours(0, 0, 0, 0)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const isPast = cellDate < today
              
              const isToday = 
                day === new Date().getDate() && 
                month === new Date().getMonth() && 
                year === new Date().getFullYear()

              const MAX_DISPLAY = 2;
              const displayedSchedules = daySchedules.slice(0, MAX_DISPLAY);
              const extraCount = daySchedules.length - MAX_DISPLAY;

              return (
                <div 
                  key={day} 
                  className={`bg-background min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 flex flex-col gap-1 transition-all duration-200 cursor-pointer ${isPast ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50 hover:shadow-md'}`}
                  onClick={() => {
                    setSelectedDayObj({ day, month, year, dbDay })
                    setIsDayModalOpen(true)
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                      {day}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 overflow-hidden flex-1">
                    {displayedSchedules.map((schedule) => (
                      <div 
                        key={`${day}-${schedule.id}`} 
                        className="text-[10px] sm:text-xs bg-primary/10 text-primary p-1.5 rounded border border-primary/20 flex flex-col"
                      >
                        <span className="font-semibold truncate" title={schedule.doctors?.profiles?.full_name ?? "—"}>
                          {schedule.doctors?.profiles?.full_name ?? "—"}
                        </span>
                        <span className="opacity-80">
                          {schedule.start_time.slice(0, 5)} &rarr; {schedule.end_time.slice(0, 5)}
                        </span>
                      </div>
                    ))}
                    {extraCount > 0 && (
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-medium text-center mt-auto pt-1">
                        +{extraCount} autres
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
      
      {/* Day Details Modal */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedDayObj ? `Planning du ${selectedDayObj.day} ${monthNames[selectedDayObj.month]} ${selectedDayObj.year}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isSelectedPast = selectedDayObj ? new Date(selectedDayObj.year, selectedDayObj.month, selectedDayObj.day) < today : false;
              
              return (
                <>
                  {isSelectedPast && (
                    <div className="bg-muted p-3 rounded-md mb-4 text-center">
                      <p className="text-sm font-medium text-muted-foreground">Ce relevé de planning est historique et ne peut pas être modifié.</p>
                    </div>
                  )}
                  {selectedDayObj && (
                    schedules
                      .filter(s => s.schedule_date === `${selectedDayObj.year}-${String(selectedDayObj.month + 1).padStart(2, '0')}-${String(selectedDayObj.day).padStart(2, '0')}`)
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map(schedule => (
                        <div key={schedule.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                          <div className="flex flex-col">
                            <span className="font-semibold">{schedule.doctors?.profiles?.full_name ?? "—"}</span>
                            <span className="text-sm font-medium text-muted-foreground">
                              {schedule.start_time.slice(0, 5)} &rarr; {schedule.end_time.slice(0, 5)}
                            </span>
                          </div>
                          {!isSelectedPast && (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(schedule)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { setDeleteId(schedule.id); setIsDeleteDialogOpen(true); }}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                  {selectedDayObj && schedules.filter(s => s.schedule_date === `${selectedDayObj.year}-${String(selectedDayObj.month + 1).padStart(2, '0')}-${String(selectedDayObj.day).padStart(2, '0')}`).length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">Aucun médecin assigné ce jour</p>
                  )}
                </>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDayModalOpen(false)}>{t.cancel}</Button>
            {selectedDayObj && (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isSelectedPast = new Date(selectedDayObj.year, selectedDayObj.month, selectedDayObj.day) < today;
              if (isSelectedPast) return null;
              return (
                <Button onClick={() => {
                  const dateStr = `${selectedDayObj.year}-${String(selectedDayObj.month + 1).padStart(2, '0')}-${String(selectedDayObj.day).padStart(2, '0')}`
                  setFormData({ ...formData, doctorId: "", date: dateStr, startTime: "", endTime: "" })
                  setIsDayModalOpen(false)
                  setIsAddDialogOpen(true)
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addSchedule}
                </Button>
              );
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>{t.addSchedule}</DialogTitle></DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {renderFormFields(!!selectedDayObj)}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t.cancel}</Button><Button onClick={handleAdd}>{t.confirm}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>{t.editSchedule}</DialogTitle></DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {renderFormFields(false)}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t.cancel}</Button><Button onClick={handleEdit}>{t.confirm}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t.deleteSchedule}</AlertDialogTitle><AlertDialogDescription>{t.deleteScheduleConfirm}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>{t.confirm}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </Card>
  )
}
