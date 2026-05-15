"use client"

import { ClinicLogo } from "@/src/components/ui/clinic-logo"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Stethoscope, DoorOpen } from "lucide-react"
import { useLanguage } from "@/src/lib/language-context"
import { cn } from "@/src/lib/utils"

const navItems = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "users", href: "/admin/users", icon: Users },
  { key: "services", href: "/admin/services", icon: Stethoscope },
  { key: "rooms", href: "/admin/rooms", icon: DoorOpen },
] as const

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

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
              (item.href !== "/admin" && pathname.startsWith(item.href))
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
                  {t[item.key as keyof typeof t]}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
