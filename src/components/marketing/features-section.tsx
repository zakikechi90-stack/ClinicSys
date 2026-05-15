"use client"

import {
  Users,
  CalendarDays,
  CreditCard,
  Building2,
  BarChart3,
  ShieldCheck,
} from "lucide-react"
import { SectionWrapper, SectionHeader } from "./section-wrapper"
import { ScrollReveal } from "./scroll-reveal"

const features = [
  {
    icon: Users,
    title: "Patient Management",
    description:
      "Maintain comprehensive patient records including medical history, prescriptions, and consultation notes in a centralized digital system.",
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    icon: CalendarDays,
    title: "Appointment Scheduling",
    description:
      "Effortlessly manage doctor schedules, book appointments, and reduce no-shows with automated reminders and real-time availability.",
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description:
      "Generate invoices, track payments, and manage insurance claims with a streamlined billing workflow that reduces overhead.",
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    icon: Building2,
    title: "Hospitalisation Tracking",
    description:
      "Monitor bed availability, track patient admissions and discharges, and manage room assignments across your facility.",
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    textColor: "text-violet-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Gain actionable insights with real-time dashboards that track patient flow, revenue trends, and operational KPIs.",
    gradient: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50",
    textColor: "text-rose-600",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Secure your data with granular permissions for doctors, nurses, admin, and reception — ensuring everyone sees only what they need.",
    gradient: "from-cyan-500 to-blue-600",
    bgLight: "bg-cyan-50",
    textColor: "text-cyan-600",
  },
]

export function FeaturesSection() {
  return (
    <SectionWrapper className="relative" id="features-preview">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/4 h-96 w-96 -translate-x-1/2 orb-blue opacity-50" />
        <div className="absolute right-0 bottom-1/4 h-96 w-96 translate-x-1/2 orb-teal opacity-50" />
      </div>

      <SectionHeader
        badge="Features"
        title="Everything You Need to Run Your Clinic"
        description="A complete suite of tools designed specifically for modern healthcare facilities. Manage every aspect from a single platform."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <ScrollReveal key={feature.title} delay={i * 100}>
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-8 shadow-sm card-hover h-full"
            >
              {/* Icon */}
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bgLight} dark:bg-primary/10 ${feature.textColor} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}
              >
                <feature.icon className="h-7 w-7" />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-lg font-bold text-foreground">{feature.title}</h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>

              {/* Bottom gradient line */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${feature.gradient} transition-all duration-500 group-hover:w-full`} />

              {/* Hover glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </SectionWrapper>
  )
}
