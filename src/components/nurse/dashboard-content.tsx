"use client"

import { BedDouble } from "lucide-react"
import { useNurseLanguage } from "@/src/lib/nurse-language-context"
import { Card, CardContent } from "@/src/components/ui/card"

interface NurseDashboardContentProps {
  totalHospitalized: number
}

export function NurseDashboardContent({ totalHospitalized }: NurseDashboardContentProps) {
  const { t } = useNurseLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.welcome}</h1>
      </div>
      <div className="max-w-sm">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.totalHospitalisedPatients}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalHospitalized}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <BedDouble className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
