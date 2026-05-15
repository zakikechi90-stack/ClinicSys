"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Pencil } from "lucide-react"
import { useReceptionLanguage } from "@/src/lib/reception-language-context"
import { toast } from "sonner"
import { Button } from "@/src/components/ui/button"
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

type RoomWithBeds = Tables<"rooms"> & {
  services: { id: string; name: string } | null
  beds: { id: string; bed_number: number; status: string }[]
  total_beds: number
  occupied_beds: number
  available_beds: number
}

type HospitalizationRow = Tables<"hospitalizations"> & {
  patients: { id: string; first_name: string; last_name: string } | null
  doctors: { id: string; profiles: { full_name: string } | null } | null
  rooms: { id: string; room_number: string } | null
  beds: { id: string; bed_number: number } | null
  services: { id: string; name: string } | null
}

type DoctorRow = {
  id: string
  profiles: { full_name: string; email: string } | null
  services: { id: string; name: string } | null
  [key: string]: unknown
}

interface HospitalisationContentProps {
  initialHospitalizations: HospitalizationRow[]
  patients: Tables<"patients">[]
  services: Tables<"services">[]
  rooms: RoomWithBeds[]
  doctors: DoctorRow[]
}

export function HospitalisationContent({
  initialHospitalizations,
  patients,
  services,
  rooms,
  doctors,
}: HospitalisationContentProps) {
  const { t } = useReceptionLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [hospitalizations, setHospitalizations] = useState(initialHospitalizations)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    serviceId: "",
    roomId: "",
    bedId: "",
    doctorId: "",
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [hospitalizationToDelete, setHospitalizationToDelete] = useState<HospitalizationRow | null>(null)
  const [selectedHospitalization, setSelectedHospitalization] = useState<HospitalizationRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
 
  // Real-time synchronization
  useEffect(() => {
    const channel = supabase
      .channel('hospitalization_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hospitalizations' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rooms' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'services' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patients' }, () => {
        router.refresh()
      })
      .subscribe()
 
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  const availablePatients = patients.filter((p) => {
    // Only display patients who are not currently hospitalized
    const isHospitalized = hospitalizations.some((h) => h.patient_id === p.id && h.status === "hospitalized")
    return !isHospitalized
  })

  const isServiceFull = (serviceId: string) => {
    const sRooms = rooms.filter((r) => r.service_id === serviceId)
    if (sRooms.length === 0) return true
    // If the patient is already in this service, it's not "full" for them
    if (selectedHospitalization?.service_id === serviceId) return false
    return sRooms.every((r) => r.available_beds === 0)
  }

  const serviceRooms = formData.serviceId
    ? rooms.filter((r) => r.service_id === formData.serviceId)
    : []

  const selectedRoom = serviceRooms.find((r) => r.id === formData.roomId)
  const roomBeds = selectedRoom ? selectedRoom.beds : []

  const handleOpenDialog = () => {
    setSelectedHospitalization(null)
    setFormData({ patientId: "", serviceId: "", roomId: "", bedId: "", doctorId: "" })
    setIsDialogOpen(true)
  }

  const handleOpenAssignDialog = (h: HospitalizationRow) => {
    setSelectedHospitalization(h)
    setFormData({
      patientId: h.patient_id,
      doctorId: h.doctor_id,
      serviceId: h.service_id || "",
      roomId: h.room_id || "",
      bedId: h.bed_id || "",
    })
    setIsDialogOpen(true)
  }


  const handleDelete = async () => {
    if (!hospitalizationToDelete) return
    setIsDeleting(true)
    try {
      // 1. Libérer le lit
      if (hospitalizationToDelete.bed_id) {
        await supabase.from("beds").update({ status: "available" } as never).eq("id", hospitalizationToDelete.bed_id)
      }

      // 2. Mettre à jour le statut du patient
      await supabase.from("patients").update({ status: "consultation" } as never).eq("id", hospitalizationToDelete.patient_id)

      // 3. Mettre à jour la consultation (si elle existe)
      if (hospitalizationToDelete.consultation_id) {
        await supabase.from("consultations").update({ requires_hospitalization: false } as never).eq("id", hospitalizationToDelete.consultation_id)
      }

      // 4. Supprimer l'hospitalisation avec validation stricte
      const { data, error } = await supabase
        .from("hospitalizations")
        .delete()
        .eq("id", hospitalizationToDelete.id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error("Impossible de supprimer l'hospitalisation. Vérifiez vos permissions.")
      }

      setHospitalizations(hospitalizations.filter((h) => h.id !== hospitalizationToDelete.id))
      setIsDeleteDialogOpen(false)
      setHospitalizationToDelete(null)
      toast.success("Hospitalisation annulée et supprimée")
      router.refresh()
    } catch (err: any) {
      console.error("Error deleting hospitalization:", err)
      toast.error(err.message || "Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!formData.patientId || !formData.roomId || !formData.bedId || !formData.doctorId) return

    // Pre-flight validations
    if (!selectedHospitalization) {
      const isAlreadyHospitalized = hospitalizations.some((h) => h.patient_id === formData.patientId && h.status === "hospitalized")
      if (isAlreadyHospitalized) {
        toast.error("Ce patient est déjà hospitalisé.")
        return
      }
    }

    const room = rooms.find((r) => r.id === formData.roomId)
    if (!room || room.available_beds === 0) {
      toast.error("Cette chambre est complète.")
      return
    }

    const isBedOccupied = hospitalizations.some(
      (h) => h.bed_id === formData.bedId && h.status === "hospitalized" && h.id !== selectedHospitalization?.id
    )
    if (isBedOccupied) {
      toast.error("Ce lit est déjà réservé.")
      return
    }

    setIsSaving(true)

    try {
      if (selectedHospitalization) {
        // Liberate old bed if it changed
        if (selectedHospitalization.bed_id && selectedHospitalization.bed_id !== formData.bedId) {
          await supabase
            .from("beds")
            .update({ status: "available" } as never)
            .eq("id", selectedHospitalization.bed_id)
        }

        await supabase.from("hospitalizations").update({
          room_id: formData.roomId,
          bed_id: formData.bedId,
          service_id: formData.serviceId || null,
          status: "hospitalized",
        } as never).eq("id", selectedHospitalization.id)
      } else {
        await supabase.from("hospitalizations").insert({
          patient_id: formData.patientId,
          doctor_id: formData.doctorId,
          room_id: formData.roomId,
          bed_id: formData.bedId,
          service_id: formData.serviceId || null,
          status: "hospitalized",
        } as never)
      }

      // Update bed status
      await supabase
        .from("beds")
        .update({ status: "occupied" })
        .eq("id", formData.bedId)

      // Update patient status and primary doctor
      await supabase
        .from("patients")
        .update({ 
          status: "hospitalized",
          primary_doctor_id: formData.doctorId 
        } as never)
        .eq("id", formData.patientId)

      setIsDialogOpen(false)
      router.refresh()

      // Refetch
      const { data: fresh } = await supabase
        .from("hospitalizations")
        .select(
          `*, patients:patient_id(id, first_name, last_name), doctors:doctor_id(id, profiles:profile_id(full_name)), rooms:room_id(id, room_number), beds:bed_id(id, bed_number), services:service_id(id, name)`
        )
        .order("admission_date", { ascending: false })
      if (fresh) setHospitalizations(fresh as HospitalizationRow[])
    } catch (err) {
      console.error("Error admitting patient:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleServiceChange = (serviceId: string) => {
    setFormData({ ...formData, serviceId, roomId: "", bedId: "" })
  }

  const handleRoomChange = (roomId: string) => {
    setFormData({ ...formData, roomId, bedId: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.hospitalisation}</h1>
        <Button onClick={handleOpenDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.admitPatient}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.hospitalisation}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.patient}</TableHead>
                <TableHead>{t.service}</TableHead>
                <TableHead>{t.room}</TableHead>
                <TableHead>{t.bed}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitalizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucune hospitalisation
                  </TableCell>
                </TableRow>
              ) : (
                hospitalizations.map((hosp) => (
                  <TableRow key={hosp.id}>
                    <TableCell className="font-medium">
                      {hosp.patients
                        ? `${hosp.patients.first_name} ${hosp.patients.last_name}`
                        : "—"}
                    </TableCell>
                    <TableCell>{hosp.services?.name ?? "—"}</TableCell>
                    <TableCell>{hosp.rooms?.room_number ?? "—"}</TableCell>
                    <TableCell>{hosp.beds?.bed_number ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={hosp.status === "hospitalized" ? "default" : "destructive"}
                      >
                        {hosp.status === "hospitalized" ? t.hospitalised : "Besoin d'hospitalisation"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hosp.status === "waiting" ? (
                          <Button size="sm" variant="secondary" onClick={() => handleOpenAssignDialog(hosp)}>
                            Affecter Chambre
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Modifier l'affectation"
                            onClick={() => handleOpenAssignDialog(hosp)}
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Supprimer"
                          onClick={() => {
                            setHospitalizationToDelete(hosp)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admit Patient Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedHospitalization 
                ? (selectedHospitalization.status === "hospitalized" ? "Modifier Hospitalisation" : "Affecter une chambre") 
                : t.admitPatient}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedHospitalization?.status === "hospitalized" && (
              <div className="bg-muted/50 p-3 rounded-lg border text-sm">
                <p className="font-semibold text-muted-foreground mb-1">Affectation actuelle :</p>
                <p className="font-medium">
                  {selectedHospitalization.services?.name ?? "—"} 
                  <span className="mx-2 text-muted-foreground">→</span> 
                  Chambre {selectedHospitalization.rooms?.room_number ?? "—"} 
                  <span className="mx-2 text-muted-foreground">→</span> 
                  {t.bed} {selectedHospitalization.beds?.bed_number ?? "—"}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t.patient}</Label>
              <Select
                value={formData.patientId}
                onValueChange={(v) => setFormData({ ...formData, patientId: v })}
                disabled={!!selectedHospitalization}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectPatient} />
                </SelectTrigger>
                <SelectContent>
                  {availablePatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.doctor}</Label>
              <Select
                value={formData.doctorId}
                onValueChange={(v) => setFormData({ ...formData, doctorId: v })}
                disabled={!!selectedHospitalization}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectDoctor} />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.profiles?.full_name ?? doctor.id}
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
                  {services.map((service) => {
                    const full = isServiceFull(service.id)
                    return (
                      <SelectItem 
                        key={service.id} 
                        value={service.id} 
                        disabled={full}
                        className={full ? "text-destructive font-medium focus:text-destructive" : ""}
                      >
                        {service.name} {full && "- Service complet"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.room}</Label>
              <Select
                value={formData.roomId}
                onValueChange={handleRoomChange}
                disabled={!formData.serviceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectRoom} />
                </SelectTrigger>
                <SelectContent>
                  {serviceRooms.map((room) => {
                    const isCurrentRoom = room.id === selectedHospitalization?.room_id
                    const isFull = room.available_beds === 0 && !isCurrentRoom
                    return (
                      <SelectItem 
                        key={room.id} 
                        value={room.id} 
                        disabled={isFull}
                        className={isFull ? "text-destructive font-medium focus:text-destructive" : ""}
                      >
                        {room.room_number} ({room.available_beds} {t.bed}s) {isFull && "- Chambre complète"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.bed}</Label>
              <Select
                value={formData.bedId}
                onValueChange={(v) => setFormData({ ...formData, bedId: v })}
                disabled={!formData.roomId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectBed} />
                </SelectTrigger>
                <SelectContent>
                  {roomBeds.map((bed) => {
                    const isOccupied = hospitalizations.some(
                      (h) => h.bed_id === bed.id && h.status === "hospitalized" && h.id !== selectedHospitalization?.id
                    )
                    return (
                      <SelectItem 
                        key={bed.id} 
                        value={bed.id} 
                        disabled={isOccupied}
                        className={isOccupied ? "text-destructive font-medium focus:text-destructive" : ""}
                      >
                        {t.bed} {bed.bed_number} {isOccupied ? "— Réservé" : ""}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "..." : (selectedHospitalization ? "Confirmer l'hospitalisation" : t.save)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'hospitalisation</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Êtes-vous sûr de vouloir annuler et supprimer cette hospitalisation ? La chambre sera libérée et le patient sera retiré du tableau de bord infirmier.
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
