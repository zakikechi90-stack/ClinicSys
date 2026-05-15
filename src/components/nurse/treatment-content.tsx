"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import { useNurseLanguage } from "@/src/lib/nurse-language-context"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

type HospitalizationRow = Tables<"hospitalizations"> & {
  patients: { id: string; first_name: string; last_name: string } | null
  rooms: { room_number: string } | null
  beds: { bed_number: number } | null
}

interface NurseTreatmentContentProps {
  initialHospitalizations: HospitalizationRow[]
}

export function NurseTreatmentContent({ initialHospitalizations }: NurseTreatmentContentProps) {
  const { t } = useNurseLanguage()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [medications, setMedications] = useState("")
  const [notes, setNotes] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const patientId = searchParams.get("patientId")
    if (patientId) setSelectedPatientId(patientId)
  }, [searchParams])

  const selectedHosp = initialHospitalizations.find((h) => h.patient_id === selectedPatientId)

  const handleSaveTreatment = async () => {
    if (!selectedPatientId || !medications) return
    setIsSaving(true)
    try {
      // 1. Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Non authentifié")

      // 2. Get the nurse_id for this user
      const { data: nurseData, error: nurseError } = await supabase
        .from("nurses")
        .select("id")
        .eq("profile_id", user.id)
        .single()

      if (nurseError || !nurseData) throw new Error("Profil infirmier introuvable")

      // 3. Insert the treatment with the correct fields
      const { error } = await supabase.from("treatments").insert({
        patient_id: selectedPatientId,
        hospitalization_id: selectedHosp?.id ?? null,
        nurse_id: nurseData.id,
        medications,
        notes,
        treatment_date: new Date().toISOString(),
      })

      if (error) throw error

      setShowSuccess(true)
      setTimeout(() => { 
        setShowSuccess(false)
        setSelectedPatientId("")
        setMedications("")
        setNotes("") 
      }, 2000)
    } catch (err: any) { 
      console.error("Error saving treatment:", err) 
      alert(err.message || "Erreur lors de l'enregistrement du traitement")
    } finally { 
      setIsSaving(false) 
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">{t.treatment}</h1></div>
      {showSuccess && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-600">
          <Check className="w-5 h-5" /><span className="font-medium">{t.treatmentSaved}</span>
        </div>
      )}
      <div className="max-w-2xl">
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">{t.selectPatient}</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger><SelectValue placeholder={t.selectPatient} /></SelectTrigger>
              <SelectContent>
                {initialHospitalizations.map((h) => (
                  <SelectItem key={h.id} value={h.patient_id}>
                    {h.patients ? `${h.patients.first_name} ${h.patients.last_name}` : "—"} - {t.room} {h.rooms?.room_number ?? "?"}, {t.bed} {h.beds?.bed_number ?? "?"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        {selectedHosp && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-lg">{t.patientInfo}</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-3 gap-4">
              <div><Label className="text-muted-foreground">{t.patientName}</Label><p className="font-medium">{selectedHosp.patients ? `${selectedHosp.patients.first_name} ${selectedHosp.patients.last_name}` : "—"}</p></div>
              <div><Label className="text-muted-foreground">{t.room}</Label><p className="font-medium">{selectedHosp.rooms?.room_number ?? "—"}</p></div>
              <div><Label className="text-muted-foreground">{t.bed}</Label><p className="font-medium">{selectedHosp.beds?.bed_number ?? "—"}</p></div>
            </div></CardContent>
          </Card>
        )}
        <Card>
          <CardHeader><CardTitle className="text-lg">{t.treatmentForm}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="medications">{t.medications}</Label><Textarea id="medications" placeholder={t.medicationsPlaceholder} value={medications} onChange={(e) => setMedications(e.target.value)} rows={4} disabled={!selectedPatientId} /></div>
            <div className="space-y-2"><Label htmlFor="notes">{t.notes}</Label><Textarea id="notes" placeholder={t.notesPlaceholder} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} disabled={!selectedPatientId} /></div>
            <div className="flex justify-end pt-4"><Button onClick={handleSaveTreatment} disabled={!selectedPatientId || !medications || isSaving}>{isSaving ? "..." : t.saveTreatment}</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
