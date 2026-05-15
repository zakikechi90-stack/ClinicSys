"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useLanguage } from "@/src/lib/language-context"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

interface ServicesContentProps {
  initialServices: Tables<"services">[]
}

export function ServicesContent({ initialServices }: ServicesContentProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()
  const [services, setServices] = useState(initialServices)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Tables<"services"> | null>(null)
  const [serviceName, setServiceName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = async () => {
    setIsSaving(true)
    try {
      const { data, error } = await supabase.from("services").insert({ name: serviceName }).select().single()
      if (error) throw error
      setServices([...services, data])
      setServiceName("")
      setIsAddOpen(false)
      router.refresh()
    } catch (err) { console.error(err) } finally { setIsSaving(false) }
  }

  const handleEdit = async () => {
    if (!selectedService) return
    setIsSaving(true)
    try {
      await supabase.from("services").update({ name: serviceName }).eq("id", selectedService.id)
      setServices(services.map((s) => s.id === selectedService.id ? { ...s, name: serviceName } : s))
      setIsEditOpen(false)
      setSelectedService(null)
      setServiceName("")
      router.refresh()
    } catch (err) { console.error(err) } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!selectedService) return
    setIsSaving(true)
    try {
      const { error } = await supabase.rpc('delete_service_cascade', { service_uuid: selectedService.id })
      if (error) throw error
      
      setServices(services.filter((s) => s.id !== selectedService.id))
      setIsDeleteOpen(false)
      setSelectedService(null)
      router.refresh()
    } catch (err) { 
      console.error(err)
      alert("Une erreur est survenue lors de la suppression du service.")
    } finally { setIsSaving(false) }
  }

  const openEditDialog = (service: Tables<"services">) => { setSelectedService(service); setServiceName(service.name); setIsEditOpen(true) }
  const openDeleteDialog = (service: Tables<"services">) => { setSelectedService(service); setIsDeleteOpen(true) }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">{t.services}</CardTitle>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2"><Plus className="w-4 h-4" />{t.addService}</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <Badge variant="secondary" className="text-sm py-1.5 px-3">{service.name}</Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(service)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}><DialogContent><DialogHeader><DialogTitle>{t.addService}</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>{t.serviceName}</Label><Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)}>{t.cancel}</Button><Button onClick={handleAdd} disabled={isSaving}>{isSaving ? "..." : t.save}</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}><DialogContent><DialogHeader><DialogTitle>{t.editService}</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>{t.serviceName}</Label><Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>{t.cancel}</Button><Button onClick={handleEdit} disabled={isSaving}>{isSaving ? "..." : t.save}</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}><DialogContent><DialogHeader><DialogTitle>{t.deleteService}</DialogTitle></DialogHeader><p className="text-muted-foreground">{t.deleteServiceConfirm}</p><DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t.cancel}</Button><Button variant="destructive" onClick={handleDelete}>{t.delete}</Button></DialogFooter></DialogContent></Dialog>
    </>
  )
}
