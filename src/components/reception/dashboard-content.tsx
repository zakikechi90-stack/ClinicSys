"use client"

import { Users, Calendar, Ambulance, BedDouble, Receipt } from "lucide-react"
import { useReceptionLanguage } from "@/src/lib/reception-language-context"
import { Card, CardContent } from "@/src/components/ui/card"

interface ReceptionStats {
  total_patients: number
  pending_ambulances: number
  active_hospitalizations: number
  pending_invoices: number
}

interface ReceptionDashboardContentProps {
  stats: ReceptionStats
  userName: string
}

export function ReceptionDashboardContent({
  stats,
  userName,
}: ReceptionDashboardContentProps) {
  const { t } = useReceptionLanguage()

  const statCards = [
    {
      label: t.totalPatients,
      value: stats.total_patients,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: t.ambulance,
      value: stats.pending_ambulances,
      icon: Ambulance,
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      label: t.hospitalisation,
      value: stats.active_hospitalizations,
      icon: BedDouble,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: t.pendingInvoices,
      value: stats.pending_invoices,
      icon: Receipt,
      color: "bg-yellow-500/10 text-yellow-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t.welcome}, {userName}
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="shadow-sm border-0 bg-card/60 backdrop-blur-md hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
