"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, Stethoscope } from "lucide-react"
import { useChefLanguage } from "@/src/lib/chef-language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import type { Tables } from "@/src/lib/supabase/types"

type PatientWithDoctor = Tables<"patients"> & {
  doctors: { id: string; profile_id: string; profiles: { full_name: string } | null } | null
}

interface ChefPatientsContentProps {
  initialPatients: PatientWithDoctor[]
}

export function ChefPatientsContent({ initialPatients }: ChefPatientsContentProps) {
  const router = useRouter()
  const { t } = useChefLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = initialPatients.filter((p) => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase()
    const doctorName = p.doctors?.profiles?.full_name?.toLowerCase() ?? ""
    return name.includes(searchQuery.toLowerCase()) || doctorName.includes(searchQuery.toLowerCase())
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t.myPatients}</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t.searchPatient} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t.patientName}</TableHead>
            <TableHead>{t.doctor}</TableHead>
            <TableHead>{t.status}</TableHead>
            <TableHead className="text-right">{t.actions}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Aucun patient</TableCell></TableRow>
            ) : filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.first_name} {patient.last_name}</TableCell>
                <TableCell>{patient.doctors?.profiles?.full_name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={patient.status === "consultation" ? "default" : "secondary"} className={patient.status === "hospitalized" ? "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" : ""}>
                    {patient.status === "hospitalized" ? t.hospitalizedStatus : t.consultationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/chef/history?patientId=${patient.id}`)}><Eye className="w-4 h-4 mr-1" />{t.view}</Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/chef/consultation?patientId=${patient.id}`)}><Stethoscope className="w-4 h-4 mr-1" />{t.consult}</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
