"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
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
import { Label } from "@/src/components/ui/label"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

interface PatientsContentProps {
  initialPatients: Tables<"patients">[]
}

export function PatientsContent({ initialPatients }: PatientsContentProps) {
  const { t } = useReceptionLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [patients, setPatients] = useState(initialPatients)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Tables<"patients"> | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Tables<"patients"> | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
 
  // Real-time synchronization
  useEffect(() => {
    const channel = supabase
      .channel('patients_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        router.refresh()
      })
      .subscribe()
 
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  const filteredPatients = patients.filter(
    (p) =>
      p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenDialog = (patient?: Tables<"patients">) => {
    if (patient) {
      setEditingPatient(patient)
      setFormData({
        firstName: patient.first_name,
        lastName: patient.last_name,
        dateOfBirth: patient.date_of_birth,
      })
    } else {
      setEditingPatient(null)
      setFormData({ firstName: "", lastName: "", dateOfBirth: "" })
    }
    setIsDialogOpen(true)
  }

  const handleOpenDeleteDialog = (patient: Tables<"patients">) => {
    setPatientToDelete(patient)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!patientToDelete) return
    setIsDeleting(true)
    try {
      const { error, data } = await supabase
        .from("patients")
        .delete()
        .eq("id", patientToDelete.id)
        .select()

      if (error) throw error
      
      // If RLS fails silently, data will be empty.
      if (!data || data.length === 0) {
        throw new Error("Impossible de supprimer le patient. Vérifiez vos permissions.")
      }

      setPatients(patients.filter((p) => p.id !== patientToDelete.id))
      setIsDeleteDialogOpen(false)
      setPatientToDelete(null)
      toast.success("Patient supprimé avec succès")
      router.refresh()
    } catch (err: any) {
      console.error("Error deleting patient:", err)
      toast.error(err.message || "Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (editingPatient) {
        const { data, error } = await supabase
          .from("patients")
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth,
          } as never)
          .eq("id", editingPatient.id)
          .select()
          .single()

        if (error) throw error
        setPatients(patients.map((p) => (p.id === editingPatient.id ? data : p)))
      } else {
        const { data, error } = await supabase
          .from("patients")
          .insert({
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth,
          } as never)
          .select()
          .single()

        if (error) throw error
        setPatients([data, ...patients])
      }
      setIsDialogOpen(false)
      router.refresh()
    } catch (err) {
      console.error("Error saving patient:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.patients}</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.addPatient}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.patients}</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t.searchByName}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.firstName}</TableHead>
                <TableHead>{t.lastName}</TableHead>
                <TableHead>{t.dateOfBirth}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "Aucun résultat" : "Aucun patient"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.first_name}</TableCell>
                    <TableCell>{patient.last_name}</TableCell>
                    <TableCell>{patient.date_of_birth}</TableCell>
                    <TableCell>
                      <Badge variant={patient.status === "consultation" ? "default" : "secondary"} className={patient.status === "hospitalized" ? "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" : ""}>
                        {patient.status === "hospitalized" ? t.hospitalised : "Consultation"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(patient)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(patient)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? t.editPatient : t.addPatient}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.firstName}</Label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t.lastName}</Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t.dateOfBirth}</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "..." : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le patient</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Êtes-vous sûr de vouloir supprimer définitivement ce patient ? Cette action supprimera également tous ses rendez-vous, hospitalisations et son historique médical.
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
