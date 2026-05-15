"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, Bell } from "lucide-react"
import { useDoctorLanguage } from "@/src/lib/doctor-language-context"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { MailOpen, Calendar } from "lucide-react"
import { createClient } from "@/src/lib/supabase/client"
import { ThemeToggle } from "@/src/components/ui/theme-toggle"

interface NotificationItem {
  id: string
  message: string
  is_read: boolean
  related_patient_id: string | null
  patients: { first_name: string; last_name: string } | null
  [key: string]: unknown
}

interface DoctorHeaderProps {
  userName: string
  isChef: boolean
  initialNotifications: NotificationItem[]
}

export function DoctorHeader({ userName, isChef, initialNotifications }: DoctorHeaderProps) {
  const { language, setLanguage, t } = useDoctorLanguage()
  const router = useRouter()
  const supabase = createClient()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null)
  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleOpenNotification = async (n: NotificationItem) => {
    setSelectedNotification(n)
    if (!n.is_read) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", n.id)
      
      if (!error) {
        setNotifications(notifications.map((notif) => notif.id === n.id ? { ...notif, is_read: true } : notif))
        router.refresh()
      }
    }
  }

  const formatDate = (isoString?: string | unknown) => {
    if (!isoString || typeof isoString !== "string") return ""
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.replace("/")
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-1 rounded-[0.6rem] bg-muted/50 p-1 border border-border/50">
          <button type="button" onClick={() => setLanguage("FR")} className={`px-3 py-1.5 text-sm font-medium rounded-[0.4rem] transition-all duration-300 ${language === "FR" ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"}`}>FR</button>
          <button type="button" onClick={() => setLanguage("EN")} className={`px-3 py-1.5 text-sm font-medium rounded-[0.4rem] transition-all duration-300 ${language === "EN" ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"}`}>EN</button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (<span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">{unreadCount}</span>)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <p className="font-medium text-sm">{t.notifications}</p>
              {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} non lus</span>}
            </div>
            <ScrollArea className="max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">{t.noNotifications}</div>
              ) : notifications.map((n) => (
                <DropdownMenuItem 
                  key={n.id} 
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer border-b last:border-0 ${!n.is_read ? 'bg-primary/5' : ''}`}
                  onClick={() => handleOpenNotification(n)}
                >
                  <div className="flex justify-between w-full items-center">
                    <span className={`text-sm ${!n.is_read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                      {n.title === "Nouveau message patient" && n.patients 
                        ? `${n.patients.first_name} ${n.patients.last_name}` 
                        : n.title}
                    </span>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</span>
                  <span className="text-[10px] text-muted-foreground/70 mt-1">{formatDate(n.created_at)}</span>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary"><User className="w-4 h-4" /></AvatarFallback></Avatar>
          <span className="text-sm font-medium text-foreground">{userName} {isChef ? "(Chef)" : ""}</span>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}><LogOut className="w-4 h-4" />{t.logout}</Button>
      </div>

      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailOpen className="w-5 h-5 text-primary" />
              Détails de la notification
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {selectedNotification.title === "Nouveau message patient" && selectedNotification.patients 
                        ? `${selectedNotification.patients.first_name} ${selectedNotification.patients.last_name}` 
                        : selectedNotification.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(selectedNotification.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Message</h4>
                <div className="bg-muted/10 border p-4 rounded-xl whitespace-pre-wrap leading-relaxed text-sm">
                  {selectedNotification.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedNotification(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
