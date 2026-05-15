"use client"

import { ClinicLogo } from "@/src/components/ui/clinic-logo"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Stethoscope, History, Calendar, MessageSquare } from "lucide-react"
import { useDoctorLanguage } from "@/src/lib/doctor-language-context"
import { cn } from "@/src/lib/utils"

export function DoctorSidebar() {
  const pathname = usePathname()
  const { t, isMedecinChef } = useDoctorLanguage()

  const navItems = [
    { key: "dashboard", label: t.dashboard, href: "/doctor", icon: LayoutDashboard },
    { key: "myPatients", label: t.myPatients, href: "/doctor/patients", icon: Users },
    { key: "consultation", label: t.consultation, href: "/doctor/consultation", icon: Stethoscope },
    { key: "history", label: t.history, href: "/doctor/history", icon: History },
    { key: "monPlanning", label: "Mon Planning", href: "/doctor/mon-planning", icon: Calendar },
    ...(isMedecinChef ? [{ key: "planning", label: t.planning, href: "/doctor/planning", icon: Calendar }] : []),
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <ClinicLogo height={32} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/doctor" && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-[0.6rem] text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
