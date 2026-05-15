"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, Stethoscope, RefreshCw } from "lucide-react"
import { useDoctorLanguage } from "@/src/lib/doctor-language-context"
import { createClient } from "@/src/lib/supabase/client"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

interface EnhancedPatient {
  id: string
  first_name: string
  last_name: string
  status: string
  doctors: { id: string; profile_id: string; profiles: { full_name: string } | null } | null
  computedStatus: string
  badgeVariant: string
  badgeColor: string
  sortPriority: number
}

interface PatientsContentProps {
  doctorId: string
}

export function PatientsContent({ doctorId }: PatientsContentProps) {
  const { t } = useDoctorLanguage()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<EnhancedPatient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPatients = useCallback(async () => {
    const supabase = createClient()
    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const todayStr = `${year}-${month}-${day}`

    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")
    const timeStr = `${hours}:${minutes}:${seconds}`

    // Fetch from all 3 sources in parallel
    const [
      { data: hospitalizations },
      { data: appointments },
      { data: consultations },
      { data: primaryPatients },
    ] = await Promise.all([
      supabase.from("hospitalizations").select("patient_id, status").eq("doctor_id", doctorId),
      supabase.from("appointments").select("patient_id, appointment_date, appointment_time, status").eq("doctor_id", doctorId),
      supabase.from("consultations").select("patient_id, consultation_date").eq("doctor_id", doctorId),
      supabase.from("patients").select("id").eq("primary_doctor_id", doctorId),
    ])

    // Collect unique patient IDs
    const patientIds = new Set<string>()
    hospitalizations?.forEach((h: any) => patientIds.add(h.patient_id))
    appointments?.forEach((a: any) => patientIds.add(a.patient_id))
    consultations?.forEach((c: any) => patientIds.add(c.patient_id))
    primaryPatients?.forEach((p: any) => patientIds.add(p.id))

    if (patientIds.size === 0) {
      setPatients([])
      setIsLoading(false)
      return
    }

    // Fetch full patient records
    const { data: patientRows } = await supabase
      .from("patients")
      .select("*, doctors:primary_doctor_id(id, profile_id, profiles:profile_id(full_name))")
      .in("id", Array.from(patientIds))

    if (!patientRows) {
      setPatients([])
      setIsLoading(false)
      return
    }

    // Compute status and sort priority for each patient
    const enhanced: EnhancedPatient[] = patientRows.map((patient: any) => {
      const pHosps = hospitalizations?.filter((h: any) => h.patient_id === patient.id) || []
      const pAppts = appointments?.filter((a: any) => a.patient_id === patient.id) || []

      const isHospitalized = pHosps.some((h: any) => h.status === "hospitalized")

      const todayAppts = pAppts.filter(
        (a: any) => a.appointment_date === todayStr && a.status !== "cancelled" && a.status !== "completed"
      )

      const futureAppts = pAppts.filter(
        (a: any) =>
          a.status !== "cancelled" &&
          a.status !== "completed" &&
          (a.appointment_date > todayStr ||
            (a.appointment_date === todayStr && a.appointment_time >= timeStr))
      )

      let computedStatus = "Rendez-vous terminé"
      let badgeVariant = "secondary"
      let badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      let sortPriority = 4

      if (isHospitalized) {
        computedStatus = "Hospitalisé"
        badgeVariant = "secondary"
        badgeColor = "bg-orange-500/10 text-orange-600 border-orange-500/20"
        sortPriority = 1
      } else if (todayAppts.length > 0) {
        computedStatus = "Consultation"
        badgeVariant = "default"
        badgeColor = "bg-blue-500/10 text-blue-600 border-blue-500/20"
        sortPriority = 2
      } else if (futureAppts.length > 0) {
        computedStatus = "Rendez-vous à venir"
        badgeVariant = "outline"
        badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20"
        sortPriority = 3
      }

      return { ...patient, computedStatus, badgeVariant, badgeColor, sortPriority }
    })

    enhanced.sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority
      return a.first_name.localeCompare(b.first_name)
    })

    setPatients(enhanced)
    setIsLoading(false)
  }, [doctorId])

  // Initial fetch
  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  // Real-time subscriptions — re-fetch data directly instead of router.refresh()
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("doctor_patients_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "hospitalizations" }, () => {
        fetchPatients()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, () => {
        fetchPatients()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchPatients()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPatients])

  const filteredPatients = patients.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.myPatients}</h1>
        <Button variant="ghost" size="sm" onClick={fetchPatients} className="gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t.searchPatient} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>
      <div className="border border-border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.patientName}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Chargement...</TableCell></TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Aucun patient</TableCell></TableRow>
            ) : filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.first_name} {patient.last_name}</TableCell>
                <TableCell>
                  <Badge variant={patient.badgeVariant as any} className={patient.badgeColor}>
                    {patient.computedStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/doctor/history?patientId=${patient.id}`)}><Eye className="w-4 h-4 mr-1" />{t.view}</Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/doctor/consultation?patientId=${patient.id}`)}><Stethoscope className="w-4 h-4 mr-1" />{t.consult}</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
