"use client"

import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/src/lib/language-context"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { createClient } from "@/src/lib/supabase/client"
import { ThemeToggle } from "@/src/components/ui/theme-toggle"

interface AdminHeaderProps {
  userName: string
}

export function AdminHeader({ userName }: AdminHeaderProps) {
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

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
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary"><User className="w-4 h-4" /></AvatarFallback></Avatar>
          <span className="text-sm font-medium text-foreground">{userName}</span>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}><LogOut className="w-4 h-4" />{t.logout}</Button>
      </div>
    </header>
  )
}
