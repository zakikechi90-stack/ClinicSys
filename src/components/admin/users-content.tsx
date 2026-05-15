"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, UserCheck, UserX } from "lucide-react"
import { useLanguage } from "@/src/lib/language-context"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Switch } from "@/src/components/ui/switch"
import { createClient } from "@/src/lib/supabase/client"
import type { Tables } from "@/src/lib/supabase/types"

const roles = ["admin", "doctor", "chef", "nurse", "reception"] as const

interface UsersContentProps {
  initialUsers: Tables<"profiles">[]
  services: Tables<"services">[]
}

export function UsersContent({ initialUsers, services }: UsersContentProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState(initialUsers)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Tables<"profiles"> | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "doctor" as string, serviceId: "" })
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = async () => {
    setIsSaving(true)
    try {
      // 1. Validation
      if (!formData.email) throw new Error("L'email est obligatoire.")
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) throw new Error("Format d'email invalide.")
      if (!formData.password) throw new Error("Le mot de passe est obligatoire.")
      if (formData.password.length < 6) throw new Error("Le mot de passe doit faire au moins 6 caractères.")
      if (!formData.name) throw new Error("Le nom est obligatoire.")

      // Check for duplicate email
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email)
        .maybeSingle()
      
      if (existingUser) throw new Error("Cet email est déjà utilisé par un autre utilisateur.")

      const { data: result, error } = await supabase.functions.invoke('create-user', {
        body: { email: formData.email, password: formData.password, full_name: formData.name, role: formData.role }
      })
      if (error) throw error
      if (result?.error) throw new Error(result.error)

      const newProfile: Tables<"profiles"> = {
        id: result.data.id,
        email: formData.email,
        full_name: formData.name,
        role: formData.role as Tables<"profiles">["role"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        address: null,
        avatar_url: null,
        is_active: true,
        phone: null
      }

      if ((formData.role === "doctor" || formData.role === "chef") && formData.serviceId) {
        // Wait a bit to ensure the DB trigger has created the doctor row
        await new Promise(r => setTimeout(r, 500))
        await supabase.from("doctors").update({ service_id: formData.serviceId } as never).eq("profile_id", result.data.id)
      }

      setUsers([newProfile, ...users])
      setFormData({ name: "", email: "", password: "", role: "doctor", serviceId: "" })
      setIsAddOpen(false)
      router.refresh()
    } catch (err: any) {
      console.error("Error adding user:", err)
      alert(err.message || "Erreur lors de l'ajout de l'utilisateur.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedUser) return
    setIsSaving(true)
    try {
      // 1. Validation
      if (!formData.email) throw new Error("L'email est obligatoire.")
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) throw new Error("Format d'email invalide.")
      if (!formData.name) throw new Error("Le nom est obligatoire.")

      // Check for duplicate email (excluding current user)
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email)
        .neq("id", selectedUser.id)
        .maybeSingle()
      
      if (existingUser) throw new Error("Cet email est déjà utilisé par un autre utilisateur.")

      // 2. Update via Edge Function (handles auth.users + profiles)
      const { data: result, error: fnError } = await supabase.functions.invoke('update-user', {
        body: { 
          user_id: selectedUser.id, 
          email: formData.email, 
          password: formData.password || undefined,
          full_name: formData.name,
          role: formData.role
        }
      })

      if (fnError) throw fnError
      if (result?.error) throw new Error(result.error)

      // 3. Update doctor service if applicable
      if ((formData.role === "doctor" || formData.role === "chef") && formData.serviceId) {
        await supabase.from("doctors").update({ service_id: formData.serviceId } as never).eq("profile_id", selectedUser.id)
      }

      setUsers(users.map((u) => u.id === selectedUser.id ? { ...u, full_name: formData.name, email: formData.email, role: formData.role as Tables<"profiles">["role"] } : u))
      
      alert(formData.email !== selectedUser.email ? "Email mis à jour avec succès" : "Utilisateur mis à jour avec succès")
      
      setIsEditOpen(false)
      setSelectedUser(null)
      router.refresh()
    } catch (err: any) {
      console.error("Error editing user:", err)
      alert(err.message || "Erreur lors de la modification de l'utilisateur.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      const { data: result, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: selectedUser.id }
      })

      if (error) throw error
      if (result?.error) throw new Error(result.error)

      setUsers(users.filter((u) => u.id !== selectedUser.id))
      setIsDeleteOpen(false)
      setSelectedUser(null)
      router.refresh()
    } catch (err: any) {
      console.error("Error deleting user:", err)
      alert(err.message || "Erreur lors de la suppression de l'utilisateur.")
      setIsDeleteOpen(false)
    }
  }

  const handleToggleStatus = async (user: Tables<"profiles">) => {
    const newStatus = !user.is_active
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newStatus } as never)
        .eq("id", user.id)
      
      if (error) throw error
      
      setUsers(users.map((u) => u.id === user.id ? { ...u, is_active: newStatus } : u))
      router.refresh()
    } catch (err: any) {
      console.error("Error toggling user status:", err)
      alert(err.message || "Erreur lors de la modification du statut.")
    }
  }

  const openEditDialog = async (user: Tables<"profiles">) => {
    setSelectedUser(user)
    let sId = ""
    if (user.role === "doctor" || user.role === "chef") {
      const { data } = await supabase.from("doctors").select("service_id").eq("profile_id", user.id).single()
      if ((data as any)?.service_id) sId = (data as any).service_id
    }
    setFormData({ name: user.full_name, email: user.email || "", password: "", role: user.role, serviceId: sId })
    setIsEditOpen(true)
  }
  const openDeleteDialog = (user: Tables<"profiles">) => { setSelectedUser(user); setIsDeleteOpen(true) }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">{t.users}</CardTitle>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2"><Plus className="w-4 h-4" />{t.addUser}</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>{t.name}</TableHead><TableHead>{t.email}</TableHead><TableHead>{t.role}</TableHead><TableHead>{t.status}</TableHead><TableHead className="text-right">{t.actions}</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={user.is_active} 
                        onCheckedChange={() => handleToggleStatus(user)}
                      />
                      <Badge variant={user.is_active ? "success" : "destructive"} className="capitalize gap-1">
                        {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {user.is_active ? t.active : t.inactive}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>{t.addUser}</DialogTitle><DialogDescription className="sr-only">Add a new user</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>{t.name}</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{t.email}</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>{t.password}</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
            <div className="space-y-2"><Label>{t.role}</Label><Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{roles.map((role) => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent></Select></div>
            {(formData.role === "doctor" || formData.role === "chef") && (
              <div className="space-y-2"><Label>Service</Label><Select value={formData.serviceId} onValueChange={(v) => setFormData({ ...formData, serviceId: v })}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner un service" /></SelectTrigger><SelectContent>{services.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent></Select></div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)}>{t.cancel}</Button><Button onClick={handleAdd} disabled={isSaving}>{isSaving ? "..." : t.save}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent><DialogHeader><DialogTitle>{t.editUser}</DialogTitle><DialogDescription className="sr-only">Edit an existing user</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>{t.name}</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{t.email}</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>{t.password} (Optionnel)</Label>
              <Input type="password" placeholder="Laissez vide pour ne pas modifier" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="space-y-2"><Label>{t.role}</Label><Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{roles.map((role) => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent></Select></div>
            {(formData.role === "doctor" || formData.role === "chef") && (
              <div className="space-y-2"><Label>Service</Label><Select value={formData.serviceId} onValueChange={(v) => setFormData({ ...formData, serviceId: v })}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner un service" /></SelectTrigger><SelectContent>{services.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent></Select></div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>{t.cancel}</Button><Button onClick={handleEdit} disabled={isSaving}>{isSaving ? "..." : t.save}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent><DialogHeader><DialogTitle>{t.deleteUser}</DialogTitle><DialogDescription>{t.deleteUserConfirm}</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t.cancel}</Button><Button variant="destructive" onClick={handleDelete}>{t.delete}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
