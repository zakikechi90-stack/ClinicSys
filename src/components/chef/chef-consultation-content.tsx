"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useChefLanguage } from "@/src/lib/chef-language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Label } from "@/src/components/ui/label"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"


interface ChefConsultationContentProps {
  patients: Tables<"patients">[]
  doctorId: string
}

export function ChefConsultationContent({ patients, doctorId }: ChefConsultationContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const patientId = searchParams.get("patientId") || patients[0]?.id || ""
  const { t } = useChefLanguage()
  const patient = patients.find((p) => p.id === patientId) || patients[0]
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    weight: "", height: "", bloodPressure: "", heartRate: "",
    diagnosis: "", medications: "", hospitalize: false
  })

  const handleHospitalizeChange = (checked: boolean) => {
    setFormData({ ...formData, hospitalize: checked })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient || !doctorId) return
    setIsSaving(true)
    try {
      const { error } = await supabase.from("consultations").insert({
        patient_id: patient.id,
        doctor_id: doctorId,
        diagnosis: formData.diagnosis,
        medications: formData.medications,
        weight_kg: formData.weight ? parseFloat(formData.weight) : null,
        height_cm: formData.height ? parseFloat(formData.height) : null,
        blood_pressure: formData.bloodPressure || null,
        heart_rate: formData.heartRate ? parseInt(formData.heartRate) : null,
        consultation_date: new Date().toISOString(),
        consultation_type: 'routine',
        requires_hospitalization: formData.hospitalize,
      } as never)
      
      if (error) {
        console.error("Error saving consultation:", error)
        alert("Erreur lors de l'enregistrement: " + error.message)
        return
      }

      if (formData.hospitalize) {
        // 1. Create hospitalization request
        await supabase.from("hospitalizations").insert({
          patient_id: patient.id,
          doctor_id: doctorId,
          status: "waiting"
        } as never)
      }
      router.refresh()
      setFormData({ weight: "", height: "", bloodPressure: "", heartRate: "", diagnosis: "", medications: "", hospitalize: false })
      alert("Consultation enregistrée avec succès !")
    } catch (err) { 
      console.error(err) 
    } finally { 
      setIsSaving(false) 
    }
  }

  if (!patient) return <div className="text-muted-foreground">Aucun patient sélectionné</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{t.patientInfo}</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-3 gap-4">
          <div><Label className="text-muted-foreground">{t.patientName}</Label><p className="font-medium">{patient.first_name} {patient.last_name}</p></div>
          <div><Label className="text-muted-foreground">{t.age}</Label><p className="font-medium">{patient.date_of_birth}</p></div>
        </div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t.medicalInfo}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="weight">{t.weight}</Label><Input id="weight" type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="height">{t.height}</Label><Input id="height" type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="bloodPressure">{t.bloodPressure}</Label><Input id="bloodPressure" placeholder="120/80" value={formData.bloodPressure} onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="heartRate">{t.heartRate}</Label><Input id="heartRate" type="number" placeholder="bpm" value={formData.heartRate} onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="diagnosis">{t.diagnosis}</Label><Textarea id="diagnosis" placeholder={t.diagnosisPlaceholder} rows={4} value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="medications">{t.medications}</Label><Textarea id="medications" placeholder={t.medicationsPlaceholder} rows={4} value={formData.medications} onChange={(e) => setFormData({ ...formData, medications: e.target.value })} /></div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2"><Checkbox id="hospitalize" checked={formData.hospitalize} onCheckedChange={handleHospitalizeChange as any} /><Label htmlFor="hospitalize">{t.hospitalizePatient}</Label></div>

            </div>
            <Button type="submit" className="w-full" disabled={isSaving}>{isSaving ? "..." : t.save}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
