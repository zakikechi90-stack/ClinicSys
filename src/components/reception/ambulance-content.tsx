"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Clock, Eye } from "lucide-react"
import { useReceptionLanguage } from "@/src/lib/reception-language-context"
import { toast } from "sonner"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

type AmbulanceRow = Tables<"ambulance_requests"> & {
  patients: { id: string; first_name: string; last_name: string } | null
}

interface AmbulanceContentProps {
  initialRequests: AmbulanceRow[]
  patients: Tables<"patients">[]
}

// ─── Priority helpers ──────────────────────────────────────────────────────────
type DisplayPriority = "normal" | "urgent"

function toDisplayPriority(raw: string | null): DisplayPriority {
  if (!raw) return "normal"
  return raw === "high" || raw === "critical" ? "urgent" : "normal"
}

function toDbPriority(display: DisplayPriority): string {
  return display === "urgent" ? "high" : "normal"
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const display = toDisplayPriority(priority)
  if (display === "urgent") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "2px 10px",
          borderRadius: "9999px",
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
          background: "rgba(239,68,68,0.10)",
          color: "#dc2626",
          border: "1px solid rgba(239,68,68,0.25)",
        }}
      >
        Urgent
      </span>
    )
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "9999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: "rgba(22,163,74,0.10)",
        color: "#16a34a",
        border: "1px solid rgba(22,163,74,0.25)",
      }}
    >
      Normal
    </span>
  )
}

// ─── Status helpers ────────────────────────────────────────────────────────────
type DisplayStatus = "pending" | "en_route" | "completed"

function toDisplayStatus(raw: string | null): DisplayStatus {
  if (!raw || raw === "cancelled") return "pending"
  if (raw === "dispatched" || raw === "en_route") return "en_route"
  if (raw === "completed") return "completed"
  return "pending"
}

function toDbStatus(display: DisplayStatus): string {
  if (display === "en_route") return "en_route"
  if (display === "completed") return "completed"
  return "pending"
}

function StatusBadge({ status, t }: { status: string | null; t: any }) {
  const display = toDisplayStatus(status)

  const styles: Record<DisplayStatus, React.CSSProperties> = {
    pending: {
      background: "rgba(234,179,8,0.12)",
      color: "#a16207",
      border: "1px solid rgba(234,179,8,0.30)",
    },
    en_route: {
      background: "rgba(59,130,246,0.12)",
      color: "#1d4ed8",
      border: "1px solid rgba(59,130,246,0.28)",
    },
    completed: {
      background: "rgba(22,163,74,0.10)",
      color: "#15803d",
      border: "1px solid rgba(22,163,74,0.25)",
    },
  }

  const labels: Record<DisplayStatus, string> = {
    pending: t.pending,
    en_route: t.enRoute,
    completed: t.completed,
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "9999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        ...styles[display],
      }}
    >
      {labels[display]}
    </span>
  )
}

// ─── Time formatter ────────────────────────────────────────────────────────────
function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return "—"
  }
}

// ─── Main component ────────────────────────────────────────────────────────────
export function AmbulanceContent({ initialRequests, patients }: AmbulanceContentProps) {
  const { t } = useReceptionLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [requests, setRequests] = useState(initialRequests)

  // Form dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<AmbulanceRow | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    pickupAddress: "",
    status: "pending" as DisplayStatus,
    priority: "normal" as DisplayPriority,
    notes: "",
  })

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<AmbulanceRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Details modal
  const [selectedRequest, setSelectedRequest] = useState<AmbulanceRow | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleOpenDialog = (request?: AmbulanceRow) => {
    if (request) {
      setEditingRequest(request)
      setFormData({
        patientId: request.patient_id || "",
        patientName: request.patient_name,
        pickupAddress: request.pickup_address,
        status: toDisplayStatus(request.status),
        priority: toDisplayPriority(request.priority),
        notes: request.notes || "",
      })
    } else {
      setEditingRequest(null)
      setFormData({ patientId: "", patientName: "", pickupAddress: "", status: "pending", priority: "normal", notes: "" })
    }
    setIsDialogOpen(true)
  }

  const handleRowClick = (req: AmbulanceRow) => {
    setSelectedRequest(req)
    setIsDetailsOpen(true)
  }

  const handleOpenDeleteDialog = (e: React.MouseEvent, request: AmbulanceRow) => {
    e.stopPropagation()
    setRequestToDelete(request)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!requestToDelete) return
    setIsDeleting(true)
    try {
      const { data, error } = await supabase
        .from("ambulance_requests")
        .delete()
        .eq("id", requestToDelete.id)
        .select()

      if (error) throw error
      if (!data || data.length === 0) throw new Error("Impossible de supprimer la demande. Vérifiez vos permissions.")

      setRequests(requests.filter((req) => req.id !== requestToDelete.id))
      setIsDeleteDialogOpen(false)
      setRequestToDelete(null)
      toast.success("Demande d'ambulance supprimée")
      router.refresh()
    } catch (err: any) {
      console.error("Error deleting ambulance request:", err)
      toast.error(err.message || "Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const patient = patients.find((p) => p.id === formData.patientId)
      const name = patient ? `${patient.first_name} ${patient.last_name}` : formData.patientName || "Inconnu"
      const payload = {
        patient_id: formData.patientId || null,
        patient_name: name,
        pickup_address: formData.pickupAddress || "Clinique",
        status: toDbStatus(formData.status) as Tables<"ambulance_requests">["status"],
        priority: toDbPriority(formData.priority),
        notes: formData.notes || null,
      }
      if (editingRequest) {
        await supabase.from("ambulance_requests").update(payload as never).eq("id", editingRequest.id)
      } else {
        await supabase.from("ambulance_requests").insert(payload as never)
      }
      setIsDialogOpen(false)
      router.refresh()
      const { data: fresh } = await supabase
        .from("ambulance_requests")
        .select("*, patients:patient_id(id, first_name, last_name)")
        .order("created_at", { ascending: false })
      if (fresh) setRequests(fresh as AmbulanceRow[])
    } catch (err) {
      console.error("Error saving ambulance request:", err)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.ambulance}</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.addRequest}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.ambulance}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.patient}</TableHead>
                <TableHead>{t.priorityLabel}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    {t.requestTime}
                  </span>
                </TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucune demande
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(req)}
                  >
                    <TableCell className="font-medium">
                      {req.patients
                        ? `${req.patients.first_name} ${req.patients.last_name}`
                        : req.patient_name}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={req.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} t={t} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {formatTime(req.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleOpenDialog(req) }}
                          title={t.editRequest}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleOpenDeleteDialog(e, req)}
                          title="Supprimer"
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

      {/* ── Details Modal ── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4 opacity-70" />
              {t.details}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2">
              {/* Patient */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.patient}</span>
                <span className="font-semibold text-foreground">
                  {selectedRequest.patients
                    ? `${selectedRequest.patients.first_name} ${selectedRequest.patients.last_name}`
                    : selectedRequest.patient_name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.priorityLabel}</span>
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.status}</span>
                  <StatusBadge status={selectedRequest.status} t={t} />
                </div>
              </div>

              {/* Request time */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.requestTime}</span>
                <span className="text-sm text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-50" />
                  {formatTime(selectedRequest.created_at)}
                </span>
              </div>

              {/* Address */}
              {selectedRequest.pickup_address && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.address}</span>
                  <span className="text-sm text-foreground">{selectedRequest.pickup_address}</span>
                </div>
              )}

              {/* Notes */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.notes}</span>
                {selectedRequest.notes ? (
                  <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3 leading-relaxed">
                    {selectedRequest.notes}
                  </p>
                ) : (
                  <span className="text-sm text-muted-foreground italic">{t.noNotes}</span>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              onClick={() => {
                setIsDetailsOpen(false)
                if (selectedRequest) handleOpenDialog(selectedRequest)
              }}
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              {t.editRequest}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRequest ? t.editRequest : t.addRequest}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Patient */}
            <div className="space-y-2">
              <Label>{t.patient}</Label>
              <Select
                value={formData.patientId}
                onValueChange={(v) => {
                  const p = patients.find((x) => x.id === v)
                  setFormData({ ...formData, patientId: v, patientName: p ? `${p.first_name} ${p.last_name}` : "" })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectPatient} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>{t.address}</Label>
              <Input
                value={formData.pickupAddress}
                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                placeholder="Adresse de prise en charge"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>{t.priorityLabel}</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as DisplayPriority })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectPriority} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t.priorityNormal}</SelectItem>
                  <SelectItem value="urgent">{t.priorityUrgent}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status — only when editing */}
            {editingRequest && (
              <div className="space-y-2">
                <Label>{t.status}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as DisplayStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t.pending}</SelectItem>
                    <SelectItem value="en_route">{t.enRoute}</SelectItem>
                    <SelectItem value="completed">{t.completed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>{t.notes}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes optionnelles..."
                rows={3}
                className="resize-none"
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

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la demande d'ambulance</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Êtes-vous sûr de vouloir supprimer cette demande d'ambulance ? Cette action est irréversible.
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
