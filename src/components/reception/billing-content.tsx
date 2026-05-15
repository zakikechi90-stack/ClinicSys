"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Printer } from "lucide-react"
import { useReceptionLanguage } from "@/src/lib/reception-language-context"
import { toast } from "sonner"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Label } from "@/src/components/ui/label"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

type InvoiceItem = {
  id: string
  name: string
  custom_name?: string
  quantity: number
  unit_price: number
  total: number
}

type InvoiceRow = Tables<"invoices"> & {
  patients: { id: string; first_name: string; last_name: string } | null
  invoice_items?: InvoiceItem[]
  payment_method?: string
  assurance_details?: { type: string; number: string; coverage: number } | null
}

interface BillingContentProps {
  initialInvoices: InvoiceRow[]
  patients: Tables<"patients">[]
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid": return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">Payée</Badge>
    case "pending": return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200">En attente</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export function BillingContent({ initialInvoices, patients }: BillingContentProps) {
  const { t } = useReceptionLanguage()
  const router = useRouter()
  const supabase = createClient()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRow | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({ 
    patientId: "", 
    status: "pending", 
    paymentMethod: "cash",
    assuranceType: "CNAS",
    assuranceNumber: "",
    assuranceCoverage: 80
  })
  const [items, setItems] = useState<InvoiceItem[]>([])
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [printingInvoice, setPrintingInvoice] = useState<InvoiceRow | null>(null)

  useEffect(() => {
    const handleAfterPrint = () => setPrintingInvoice(null)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  const handlePrint = (invoice: InvoiceRow) => {
    setPrintingInvoice(invoice)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const handleOpenDialog = (invoice?: InvoiceRow) => {
    if (invoice) {
      setEditingInvoice(invoice)
      const assurance = invoice.assurance_details || { type: "CNAS", number: "", coverage: 80 }
      setFormData({ 
        patientId: invoice.patient_id, 
        status: invoice.status,
        paymentMethod: invoice.payment_method || "cash",
        assuranceType: assurance.type || "CNAS",
        assuranceNumber: assurance.number || "",
        assuranceCoverage: assurance.coverage ?? 80
      })
      const knownServices = ["Consultation", "Analyse", "Hospitalisation", "Ambulance", "Autre"]
      const invItems = ((invoice as any).invoice_items || []).map((it: any) => {
        if (!knownServices.includes(it.name)) {
          return { ...it, name: "Autre", custom_name: it.name }
        }
        return it
      })
      setItems(invItems)
    } else {
      setEditingInvoice(null)
      setFormData({ 
        patientId: "", 
        status: "pending", 
        paymentMethod: "cash",
        assuranceType: "CNAS",
        assuranceNumber: "",
        assuranceCoverage: 80
      })
      setItems([])
    }
    setIsDialogOpen(true)
  }

  const handleOpenDeleteDialog = (invoice: InvoiceRow) => {
    setInvoiceToDelete(invoice)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!invoiceToDelete) return
    setIsDeleting(true)
    try {
      const { data, error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceToDelete.id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error("Impossible de supprimer la facture. Vérifiez vos permissions.")
      }

      setInvoices(invoices.filter((inv) => inv.id !== invoiceToDelete.id))
      setIsDeleteDialogOpen(false)
      setInvoiceToDelete(null)
      toast.success("Facture supprimée avec succès")
      router.refresh()
    } catch (err: any) {
      console.error("Error deleting invoice:", err)
      toast.error(err.message || "Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  const addItem = () => {
    setItems(prev => [...prev, { 
      id: crypto.randomUUID(), 
      name: "Consultation", 
      quantity: 1, 
      unit_price: 0, 
      total: 0 
    }])
  }

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newItem = { ...item, ...updates }
          // Always recalculate total if quantity or unit_price changes
          if ('quantity' in updates || 'unit_price' in updates) {
            newItem.total = (newItem.quantity || 0) * (newItem.unit_price || 0)
          }
          return newItem
        }
        return item
      })
    )
  }

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

  const handleSave = async () => {
    if (!formData.patientId) {
      toast.error("Veuillez sélectionner un patient");
      return;
    }
    if (items.length === 0) {
      toast.error("Veuillez ajouter au moins un service");
      return;
    }
    setIsSaving(true)
    try {
      const finalItems = items.map(it => {
        if (it.name === "Autre" && it.custom_name && it.custom_name.trim() !== "") {
          return { ...it, name: it.custom_name.trim(), custom_name: undefined }
        }
        return { ...it, custom_name: undefined }
      })
      const payload: any = {
        patient_id: formData.patientId,
        total_amount: totalAmount,
        paid_amount: formData.status === "paid" ? totalAmount : 0,
        status: formData.status as Tables<"invoices">["status"],
        payment_method: formData.paymentMethod,
        invoice_items: finalItems,
        assurance_details: formData.paymentMethod === 'insurance' ? {
          type: formData.assuranceType,
          number: formData.assuranceNumber,
          coverage: formData.assuranceCoverage
        } : null
      }
      if (editingInvoice) {
        await supabase.from("invoices").update(payload).eq("id", editingInvoice.id)
      } else {
        await supabase.from("invoices").insert({ ...payload, invoice_number: `INV-${Date.now()}` })
      }
      setIsDialogOpen(false)
      toast.success("Facture enregistrée avec succès")
      router.refresh()
      const { data: fresh } = await supabase.from("invoices").select("*, patients:patient_id(id, first_name, last_name)").order("created_at", { ascending: false })
      if (fresh) setInvoices(fresh as InvoiceRow[])
    } catch (err: any) { 
      console.error("Error saving invoice:", err)
      toast.error("Erreur lors de l'enregistrement de la facture")
    } finally { 
      setIsSaving(false) 
    }
  }

  return (
    <>
      <div className="space-y-6 print:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.billing}</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2"><Plus className="w-4 h-4" />{t.createBill}</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>{t.billing}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>{t.patient}</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>{t.amount}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucune facture</TableCell></TableRow>
              ) : invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-muted-foreground">{inv.invoice_number}</TableCell>
                  <TableCell>{new Date(inv.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="font-semibold">{inv.patients ? `${inv.patients.first_name} ${inv.patients.last_name}` : "—"}</TableCell>
                  <TableCell className="capitalize">{inv.payment_method === 'cash' ? 'Espèces' : inv.payment_method === 'card' ? 'Carte' : inv.payment_method === 'cheque' ? 'Chèque' : inv.payment_method === 'insurance' ? 'Assurance' : 'Virement'}</TableCell>
                  <TableCell className="font-bold text-primary">{inv.total_amount.toFixed(2)} DA</TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handlePrint(inv)}><Printer className="w-4 h-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(inv)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(inv)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>{editingInvoice ? t.editBill : t.createBill}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.patient}</Label>
                <Select value={formData.patientId} onValueChange={(v) => setFormData({ ...formData, patientId: v })}><SelectTrigger><SelectValue placeholder={t.selectPatient} /></SelectTrigger><SelectContent>{patients.map((p) => (<SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>))}</SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Méthode de Paiement</Label>
                <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cash">Espèces</SelectItem><SelectItem value="card">Carte Bancaire</SelectItem><SelectItem value="cheque">Chèque</SelectItem><SelectItem value="bank_transfer">Virement Bancaire</SelectItem><SelectItem value="insurance">Assurance</SelectItem></SelectContent></Select>
              </div>
            </div>
            
            {formData.paymentMethod === 'insurance' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="space-y-2">
                  <Label>Type d'Assurance</Label>
                  <Select value={formData.assuranceType} onValueChange={(v) => setFormData({ ...formData, assuranceType: v })}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNAS">CNAS</SelectItem>
                      <SelectItem value="CASNOS">CASNOS</SelectItem>
                      <SelectItem value="Privée">Privée</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>N° d'Assurance</Label>
                  <Input value={formData.assuranceNumber} onChange={(e) => setFormData({ ...formData, assuranceNumber: e.target.value })} className="bg-white" placeholder="Ex: 123456789" />
                </div>
                <div className="space-y-2">
                  <Label>Couverture (%)</Label>
                  <Input type="number" min="0" max="100" value={formData.assuranceCoverage} onChange={(e) => setFormData({ ...formData, assuranceCoverage: parseInt(e.target.value) || 0 })} className="bg-white" />
                </div>
              </div>
            )}
            
            <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Services Facturés</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-2" />Ajouter un service</Button>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun service ajouté. Cliquez sur le bouton pour commencer.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-background p-3 rounded-md border shadow-sm">
                      <div className="flex-1 space-y-1 w-full">
                        <Label className="text-xs font-medium text-muted-foreground">Service</Label>
                        <Select 
                          value={item.name} 
                          onValueChange={(v) => {
                            const updates: Partial<InvoiceItem> = { name: v }
                            if (v !== "Autre") updates.custom_name = ""
                            updateItem(item.id, updates)
                          }}
                        >
                          <SelectTrigger className="bg-transparent"><SelectValue placeholder="Service" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Consultation">Consultation</SelectItem>
                            <SelectItem value="Analyse">Analyse</SelectItem>
                            <SelectItem value="Hospitalisation">Hospitalisation</SelectItem>
                            <SelectItem value="Ambulance">Ambulance</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        {item.name === "Autre" && (
                          <Input 
                            className="mt-2 bg-transparent text-sm" 
                            placeholder="Nom du service..." 
                            value={item.custom_name || ""} 
                            onChange={(e) => updateItem(item.id, { custom_name: e.target.value })} 
                          />
                        )}
                      </div>
                      <div className="w-full sm:w-24 space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Qté</Label>
                        <Input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })} 
                          className="bg-transparent" 
                        />
                      </div>
                      <div className="w-full sm:w-32 space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Prix (DA)</Label>
                        <Input 
                          type="number" 
                          min="0" 
                          step="100" 
                          value={item.unit_price} 
                          onChange={(e) => updateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })} 
                          className="bg-transparent" 
                        />
                      </div>
                      <div className="w-full sm:w-36 space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Total (DA)</Label>
                        <Input type="text" readOnly value={`${item.total.toFixed(2)}`} className="bg-muted/50 font-semibold border-transparent" />
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive sm:mb-0.5 self-end sm:self-auto hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/20 mt-6 shadow-sm">
                    <span className="font-semibold text-lg text-foreground">Total Facture</span>
                    <span className="font-bold text-2xl text-primary">{totalAmount.toFixed(2)} DA</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Statut du paiement</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paid">Payée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleSave} disabled={isSaving || items.length === 0}>{isSaving ? "..." : t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la facture</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible et supprimera également les paiements associés.
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

    {printingInvoice && (
      <div className="invoice-print fixed inset-0 z-[99999] bg-white text-black p-8 overflow-auto">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .invoice-print, .invoice-print * { visibility: visible; }
            .invoice-print { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          }
        `}} />
        <div className="max-w-4xl mx-auto bg-white">
          <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-wider text-gray-900">FACTURE</h1>
              <p className="text-gray-500 mt-2 font-medium text-lg">N° {printingInvoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900">Clinique Médicale</h2>
              <p className="text-sm text-gray-600 mt-1">123 Rue de l'Hôpital</p>
              <p className="text-sm text-gray-600">Alger, Algérie</p>
              <p className="text-sm text-gray-600">Tél: +213 555 12 34 56</p>
              <p className="text-sm text-gray-600">Email: contact@clinique.dz</p>
              <p className="text-sm mt-3 font-semibold text-gray-800">Date: {new Date(printingInvoice.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-xs font-bold border-b border-gray-300 pb-2 mb-3 uppercase text-gray-500 tracking-wide">Informations du Patient</h3>
              <p className="text-xl font-bold text-gray-900">{printingInvoice.patients ? `${printingInvoice.patients.first_name} ${printingInvoice.patients.last_name}` : "—"}</p>
            </div>
            {printingInvoice.payment_method === 'insurance' && printingInvoice.assurance_details && (
              <div>
                <h3 className="text-xs font-bold border-b border-gray-300 pb-2 mb-3 uppercase text-gray-500 tracking-wide">Détails de l'Assurance</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p className="text-gray-600">Organisme :</p><p className="font-bold text-gray-900">{printingInvoice.assurance_details.type}</p>
                  <p className="text-gray-600">N° d'Assuré :</p><p className="font-bold text-gray-900">{printingInvoice.assurance_details.number || "Non spécifié"}</p>
                  <p className="text-gray-600">Taux de couverture :</p><p className="font-bold text-gray-900">{printingInvoice.assurance_details.coverage}%</p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-10">
            <h3 className="text-xs font-bold border-b border-gray-300 pb-2 mb-4 uppercase text-gray-500 tracking-wide">Détail des Services</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border border-gray-300 text-sm font-bold text-gray-700">Service</th>
                  <th className="p-3 border border-gray-300 text-center w-24 text-sm font-bold text-gray-700">Quantité</th>
                  <th className="p-3 border border-gray-300 text-right w-40 text-sm font-bold text-gray-700">Prix Unitaire (DA)</th>
                  <th className="p-3 border border-gray-300 text-right w-40 text-sm font-bold text-gray-700">Total (DA)</th>
                </tr>
              </thead>
              <tbody>
                {((printingInvoice as any).invoice_items || []).map((item: any) => (
                  <tr key={item.id}>
                    <td className="p-3 border border-gray-300 text-sm font-medium text-gray-900">
                      {item.name === "Autre" && item.custom_name ? item.custom_name : item.name}
                    </td>
                    <td className="p-3 border border-gray-300 text-center text-sm text-gray-700">{item.quantity}</td>
                    <td className="p-3 border border-gray-300 text-right text-sm text-gray-700">{item.unit_price.toFixed(2)}</td>
                    <td className="p-3 border border-gray-300 text-right font-bold text-sm text-gray-900">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-12">
            <div className="w-96">
              <div className="flex justify-between p-3 border-b border-gray-300">
                <span className="text-sm font-medium text-gray-600">Sous-total des services:</span>
                <span className="text-sm font-bold text-gray-900">{printingInvoice.total_amount.toFixed(2)} DA</span>
              </div>
              
              {printingInvoice.payment_method === 'insurance' && printingInvoice.assurance_details && (
                <>
                  <div className="flex justify-between p-3 border-b border-gray-300 text-blue-700 bg-blue-50/50">
                    <span className="text-sm font-semibold">Prise en charge ({printingInvoice.assurance_details.coverage}%):</span>
                    <span className="text-sm font-bold">- {((printingInvoice.total_amount * printingInvoice.assurance_details.coverage) / 100).toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between p-3 border-b border-gray-300 text-red-700 bg-red-50/50">
                    <span className="text-sm font-semibold">Reste à payer (Patient):</span>
                    <span className="text-sm font-bold">{((printingInvoice.total_amount * (100 - printingInvoice.assurance_details.coverage)) / 100).toFixed(2)} DA</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between p-4 border-b-2 border-black bg-gray-100 font-black text-xl text-gray-900">
                <span>TOTAL {printingInvoice.payment_method === 'insurance' ? 'À RÉGLER' : 'GÉNÉRAL'}:</span>
                <span>{printingInvoice.payment_method === 'insurance' && printingInvoice.assurance_details ? ((printingInvoice.total_amount * (100 - printingInvoice.assurance_details.coverage)) / 100).toFixed(2) : printingInvoice.total_amount.toFixed(2)} DA</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-300 text-sm text-center text-gray-500">
            <p className="mb-1">Méthode de paiement : <span className="font-bold text-gray-900">{printingInvoice.payment_method === 'cash' ? 'Espèces' : printingInvoice.payment_method === 'card' ? 'Carte Bancaire' : printingInvoice.payment_method === 'cheque' ? 'Chèque' : printingInvoice.payment_method === 'insurance' ? 'Assurance' : 'Virement'}</span></p>
            <p>Statut : <span className="font-bold text-gray-900">{printingInvoice.status === 'paid' ? 'Payée' : printingInvoice.status === 'pending' ? 'En attente' : 'Autre'}</span></p>
            <p className="mt-8 font-medium text-gray-800 italic">Merci de votre confiance.</p>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
