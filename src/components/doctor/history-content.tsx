"use client"

import { useState } from "react"
import { Eye, FileText } from "lucide-react"
import { useDoctorLanguage } from "@/src/lib/doctor-language-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import type { Tables } from "@/src/lib/supabase/types"

type ConsultationRow = Tables<"consultations"> & {
  patients: { first_name: string; last_name: string } | null
}

interface HistoryContentProps {
  consultations: ConsultationRow[]
}

export function HistoryContent({ consultations }: HistoryContentProps) {
  const { t } = useDoctorLanguage()
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationRow | null>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t.history}</h1>
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.patientName}</TableHead>
              <TableHead>{t.date}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">{t.noHistory}</TableCell></TableRow>
            ) : consultations.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.patients ? `${record.patients.first_name} ${record.patients.last_name}` : "—"}</TableCell>
                <TableCell>
                  {record.consultation_date} {record.consultation_time && <span className="text-muted-foreground text-xs ml-1">{record.consultation_time.slice(0,5)}</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedConsultation(record)} className="gap-2">
                    <Eye className="w-4 h-4" />
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedConsultation} onOpenChange={(open) => !open && setSelectedConsultation(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-primary" />
              Détails de la consultation
            </DialogTitle>
          </DialogHeader>
          
          {selectedConsultation && (
            <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 py-4 flex-1">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="text-lg font-semibold">{selectedConsultation.patients ? `${selectedConsultation.patients.first_name} ${selectedConsultation.patients.last_name}` : "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Date & Heure</p>
                  <p className="font-medium">{selectedConsultation.consultation_date} {selectedConsultation.consultation_time ? `à ${selectedConsultation.consultation_time.slice(0,5)}` : ''}</p>
                </div>
              </div>

              {selectedConsultation.symptoms && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Symptômes</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedConsultation.symptoms}</p>
                  </div>
                </div>
              )}

              {selectedConsultation.diagnosis && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">{t.diagnosis}</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedConsultation.diagnosis}</p>
                  </div>
                </div>
              )}

              {selectedConsultation.medications && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">{t.medications}</h4>
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium text-primary">{selectedConsultation.medications}</p>
                  </div>
                </div>
              )}

              {selectedConsultation.notes && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Notes Additionnelles</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedConsultation.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setSelectedConsultation(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
