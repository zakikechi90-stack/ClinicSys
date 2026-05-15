"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Pill, Search, Trash2 } from "lucide-react"
import { useNurseLanguage } from "@/src/lib/nurse-language-context"
import { toast } from "sonner"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Badge } from "@/src/components/ui/badge"
import { Label } from "@/src/components/ui/label"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

type HospitalizationRow = Tables<"hospitalizations"> & {
  patients: { id: string; first_name: string; last_name: string } | null
  rooms: { room_number: string } | null
  beds: { bed_number: number } | null
}

interface NursePatientsContentProps {
  initialHospitalizations: HospitalizationRow[]
}

export function NursePatientsContent({ initialHospitalizations }: NursePatientsContentProps) {
  const { t } = useNurseLanguage()
  const router = useRouter()
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<HospitalizationRow | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [treatments, setTreatments] = useState<Tables<"treatments">[]>([])
  const [loadingTreatments, setLoadingTreatments] = useState(false)

  const filteredPatients = initialHospitalizations.filter((h) => {
    const name = h.patients ? `${h.patients.first_name} ${h.patients.last_name}` : ""
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleView = async (hosp: HospitalizationRow) => { 
    setSelectedPatient(hosp)
    setViewDialogOpen(true)
    setLoadingTreatments(true)
    const { data } = await supabase
      .from("treatments")
      .select("*")
      .eq("patient_id", hosp.patient_id)
      .order("created_at", { ascending: false })
    
    setTreatments(data || [])
    setLoadingTreatments(false)
  }
  const handleDeleteTreatment = async (treatmentId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce traitement ?")) return

    try {
      const { data, error } = await supabase
        .from("treatments")
        .delete()
        .eq("id", treatmentId)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error("Impossible de supprimer le traitement. Vérifiez vos permissions.")
      }

      setTreatments((prev) => prev.filter((t) => t.id !== treatmentId))
      toast.success("Traitement supprimé avec succès")
    } catch (err: any) {
      console.error("Error deleting treatment:", err)
      toast.error(err.message || "Erreur lors de la suppression.")
    }
  }

  const handleAddTreatment = (hosp: HospitalizationRow) => { router.push(`/nurse/treatment?patientId=${hosp.patient_id}`) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.patients}</h1>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t.searchByName} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>{t.patientName}</TableHead><TableHead>{t.room}</TableHead><TableHead>{t.bed}</TableHead><TableHead>{t.status}</TableHead><TableHead className="text-right">{t.actions}</TableHead></TableRow></TableHeader>
          <TableBody>
            {filteredPatients.map((hosp) => (
              <TableRow key={hosp.id}>
                <TableCell className="font-medium">{hosp.patients ? `${hosp.patients.first_name} ${hosp.patients.last_name}` : "—"}</TableCell>
                <TableCell>{hosp.rooms?.room_number ?? "—"}</TableCell>
                <TableCell>{hosp.beds?.bed_number ?? "—"}</TableCell>
                <TableCell><Badge variant="secondary" className="bg-blue-500/10 text-blue-600">{t.hospitalised}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(hosp)}><Eye className="w-4 h-4 mr-1" />{t.view}</Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddTreatment(hosp)}><Pill className="w-4 h-4 mr-1" />{t.addTreatment}</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.patientInfo}</DialogTitle></DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">{t.patientName}</Label><p className="font-medium">{selectedPatient.patients ? `${selectedPatient.patients.first_name} ${selectedPatient.patients.last_name}` : "—"}</p></div>
                <div><Label className="text-muted-foreground">{t.status}</Label><Badge variant="secondary" className="bg-blue-500/10 text-blue-600 mt-1">{t.hospitalised}</Badge></div>
                <div><Label className="text-muted-foreground">{t.room}</Label><p className="font-medium">{selectedPatient.rooms?.room_number ?? "—"}</p></div>
                <div><Label className="text-muted-foreground">{t.bed}</Label><p className="font-medium">{selectedPatient.beds?.bed_number ?? "—"}</p></div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <Label className="text-base font-semibold mb-3 block">Traitements / Soins</Label>
                {loadingTreatments ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : treatments.length > 0 ? (
                  <div className="space-y-3">
                    {treatments.map(t => (
                      <div key={t.id} className="bg-muted p-3 rounded-md text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-muted-foreground">{new Date(t.created_at).toLocaleString()}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteTreatment(t.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="font-medium">Médicaments: <span className="font-normal">{t.medications}</span></p>
                        {t.notes && <p className="font-medium mt-1">Notes: <span className="font-normal">{t.notes}</span></p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun traitement trouvé.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
