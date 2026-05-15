"use client"

import { Users, Building2, Calendar, Globe } from "lucide-react"
import { SectionWrapper } from "./section-wrapper"
import { AnimatedCounter } from "./animated-counter"
import { ScrollReveal } from "./scroll-reveal"

const stats = [
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Patients Managed",
    description: "Active patient records across all clinics",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Building2,
    value: 500,
    suffix: "+",
    label: "Clinics Served",
    description: "Healthcare facilities using our platform",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Calendar,
    value: 50000,
    suffix: "+",
    label: "Appointments Booked",
    description: "Monthly appointments processed seamlessly",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    icon: Globe,
    value: 15,
    suffix: "+",
    label: "Countries Reached",
    description: "Growing presence across MENA & Africa",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
]

export function StatsSection() {
  return (
    <SectionWrapper className="relative" id="stats">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-blue-50/30" />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 100}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-8 text-center shadow-sm card-hover-subtle">
                {/* Icon */}
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bgColor} dark:bg-primary/10 ${stat.color} transition-transform duration-500 group-hover:scale-110`}>
                  <stat.icon className="h-7 w-7" />
                </div>

                {/* Counter */}
                <div className="text-3xl font-extrabold text-foreground md:text-4xl">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    duration={2500}
                  />
                </div>

                {/* Label */}
                <p className="mt-2 text-sm font-semibold text-foreground">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>

                {/* Bottom accent */}
                <div className={`absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-current to-transparent ${stat.color} transition-all duration-500 group-hover:w-3/4`} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
