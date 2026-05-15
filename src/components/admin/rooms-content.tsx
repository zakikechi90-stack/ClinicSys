"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useLanguage } from "@/src/lib/language-context"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

type RoomWithBeds = Tables<"rooms"> & {
  services: { id: string; name: string } | null
  beds: { id: string; bed_number: number; status: string }[]
  hospitalizations?: { id: string; status: string }[]
  total_beds: number
  occupied_beds: number
  available_beds: number
}

interface RoomsContentProps {
  initialRooms: RoomWithBeds[]
  services: Tables<"services">[]
}

export function RoomsContent({ initialRooms, services }: RoomsContentProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()
  const [rooms, setRooms] = useState(initialRooms)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomWithBeds | null>(null)
  const [formData, setFormData] = useState({ roomNumber: "", serviceId: "", beds: "" })
  const [isSaving, setIsSaving] = useState(false)
 
  // Real-time synchronization
  useEffect(() => {
    const channel = supabase
      .channel('rooms_sync')
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rooms' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'services' }, () => {
        router.refresh()
      })
      .subscribe()
 
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  const handleAdd = async () => {
    setIsSaving(true)
    try {
      // Check for duplicate room number
      const { data: existingRoom } = await supabase
        .from("rooms")
        .select("id")
        .eq("room_number", formData.roomNumber)
        .maybeSingle()

      if (existingRoom) {
        alert("Ce numéro de chambre existe déjà")
        setIsSaving(false)
        return
      }

      const { data, error } = await supabase.from("rooms").insert({
        room_number: formData.roomNumber,
        service_id: formData.serviceId,
      } as any).select().single() as unknown as { data: import("@/src/lib/supabase/types").Tables<"rooms">, error: any }
      if (error) throw error

      // Create beds for the room
      const bedCount = parseInt(formData.beds) || 1
      const bedsToInsert = Array.from({ length: bedCount }, (_, i) => ({
        room_id: data.id,
        bed_number: i + 1,
        status: "available" as const,
      }))
      await supabase.from("beds").insert(bedsToInsert as any)

      setFormData({ roomNumber: "", serviceId: "", beds: "" })
      setIsAddOpen(false)
      router.refresh()

      // Refetch
      const { data: fresh } = await supabase
        .from("rooms")
        .select("*, services:service_id(id, name), beds(id, bed_number, status), hospitalizations(id, status)")
        .eq("is_active", true)
        .order("room_number")
      
      if (fresh) {
        setRooms((fresh as any[]).map((r: any) => {
          const total_beds = r.beds?.length ?? 0
          const occupied_beds = r.hospitalizations?.filter((h: any) => h.status === "hospitalized").length ?? 0
          return {
            ...r,
            total_beds,
            occupied_beds,
            available_beds: Math.max(0, total_beds - occupied_beds),
          }
        }))
      }
    } catch (err) { console.error(err) } finally { setIsSaving(false) }
  }

  const handleEdit = async () => {
    if (!selectedRoom) return
    setIsSaving(true)
    try {
      // Check for duplicate room number if changed
      if (formData.roomNumber !== selectedRoom.room_number) {
        const { data: existingRoom } = await supabase
          .from("rooms")
          .select("id")
          .eq("room_number", formData.roomNumber)
          .maybeSingle()

        if (existingRoom) {
          alert("Ce numéro de chambre existe déjà")
          setIsSaving(false)
          return
        }
      }

      const { error } = await supabase.from("rooms").update({
        room_number: formData.roomNumber,
        service_id: formData.serviceId,
      } as any).eq("id", selectedRoom.id)
      
      if (error) throw error

      const newBedsCount = parseInt(formData.beds) || 1
      const oldBedsCount = selectedRoom.total_beds

      if (newBedsCount > oldBedsCount) {
        const bedsToAdd = newBedsCount - oldBedsCount
        const maxBedNumber = selectedRoom.beds.reduce((max, b) => Math.max(max, b.bed_number), 0)
        
        const bedsToInsert = Array.from({ length: bedsToAdd }, (_, i) => ({
          room_id: selectedRoom.id,
          bed_number: maxBedNumber + i + 1,
          status: "available" as const,
        }))
        await supabase.from("beds").insert(bedsToInsert as any)
      } else if (newBedsCount < oldBedsCount) {
        const bedsToRemoveCount = oldBedsCount - newBedsCount
        const availableBeds = selectedRoom.beds.filter(b => b.status === "available")
        
        if (availableBeds.length < bedsToRemoveCount) {
          alert(`Impossible de réduire à ${newBedsCount} lits car ${selectedRoom.occupied_beds} lits sont actuellement occupés.`)
          setIsSaving(false)
          return
        }

        const bedsToDelete = availableBeds
          .sort((a, b) => b.bed_number - a.bed_number)
          .slice(0, bedsToRemoveCount)
          
        const bedIdsToDelete = bedsToDelete.map(b => b.id)
        await supabase.from("beds").delete().in("id", bedIdsToDelete)
      }

      setIsEditOpen(false)
      setSelectedRoom(null)
      router.refresh()
      
      const { data: fresh } = await supabase
        .from("rooms")
        .select("*, services:service_id(id, name), beds(id, bed_number, status), hospitalizations(id, status)")
        .eq("is_active", true)
        .order("room_number")
        
      if (fresh) {
        setRooms((fresh as any[]).map((r: any) => {
          const total_beds = r.beds?.length ?? 0
          const occupied_beds = r.hospitalizations?.filter((h: any) => h.status === "hospitalized").length ?? 0
          return {
            ...r,
            total_beds,
            occupied_beds,
            available_beds: Math.max(0, total_beds - occupied_beds),
          }
        }))
      }
    } catch (err) { 
      console.error(err) 
      alert("Une erreur est survenue lors de la modification de la chambre.")
    } finally { 
      setIsSaving(false) 
    }
  }

  const handleDelete = async () => {
    if (!selectedRoom) return
    setIsSaving(true)
    try {
      const { error } = await supabase.rpc('delete_room_cascade', { room_uuid: selectedRoom.id })
      if (error) throw error
      
      setRooms(rooms.filter((r) => r.id !== selectedRoom.id))
      setIsDeleteOpen(false)
      setSelectedRoom(null)
      router.refresh()
    } catch (err) { 
      console.error(err)
      alert("Une erreur est survenue lors de la suppression de la chambre.")
    } finally { setIsSaving(false) }
  }

  const openEditDialog = (room: RoomWithBeds) => {
    setSelectedRoom(room)
    setFormData({ roomNumber: room.room_number, serviceId: room.service_id || "", beds: room.total_beds.toString() })
    setIsEditOpen(true)
  }
  const openDeleteDialog = (room: RoomWithBeds) => { setSelectedRoom(room); setIsDeleteOpen(true) }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">{t.rooms}</CardTitle>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2"><Plus className="w-4 h-4" />{t.addRoom}</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t.roomNumber}</TableHead>
              <TableHead>{t.service}</TableHead>
              <TableHead>{t.numberOfBeds}</TableHead>
              <TableHead>{t.occupancy}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rooms.map((room) => {
                const isFull = room.occupied_beds >= room.total_beds
                return (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.room_number}</TableCell>
                    <TableCell><Badge variant="secondary">{room.services?.name ?? "—"}</Badge></TableCell>
                    <TableCell>{room.total_beds}</TableCell>
                    <TableCell>{room.occupied_beds}/{room.total_beds}</TableCell>
                    <TableCell><Badge variant={isFull ? "destructive" : "default"}>{isFull ? t.full : t.available}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(room)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(room)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}><DialogContent><DialogHeader><DialogTitle>{t.addRoom}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>{t.roomNumber}</Label><Input value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} /></div>
          <div className="space-y-2"><Label>{t.service}</Label><Select value={formData.serviceId} onValueChange={(v) => setFormData({ ...formData, serviceId: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t.service} /></SelectTrigger><SelectContent>{services.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><Label>{t.numberOfBeds}</Label><Input type="number" min="1" value={formData.beds} onChange={(e) => setFormData({ ...formData, beds: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)}>{t.cancel}</Button><Button onClick={handleAdd} disabled={isSaving}>{isSaving ? "..." : t.save}</Button></DialogFooter>
      </DialogContent></Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}><DialogContent><DialogHeader><DialogTitle>{t.editRoom}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>{t.roomNumber}</Label><Input value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} /></div>
          <div className="space-y-2"><Label>{t.service}</Label><Select value={formData.serviceId} onValueChange={(v) => setFormData({ ...formData, serviceId: v })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{services.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><Label>{t.numberOfBeds}</Label><Input type="number" min="1" value={formData.beds} onChange={(e) => setFormData({ ...formData, beds: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>{t.cancel}</Button><Button onClick={handleEdit} disabled={isSaving}>{isSaving ? "..." : t.save}</Button></DialogFooter>
      </DialogContent></Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}><DialogContent><DialogHeader><DialogTitle>{t.deleteRoom}</DialogTitle></DialogHeader><p className="text-muted-foreground">{t.deleteRoomConfirm}</p><DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t.cancel}</Button><Button variant="destructive" onClick={handleDelete}>{t.delete}</Button></DialogFooter></DialogContent></Dialog>
    </>
  )
}
