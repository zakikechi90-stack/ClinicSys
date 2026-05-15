import type { Metadata } from "next"
import Image from "next/image"
import { SectionWrapper, SectionHeader } from "@/src/components/marketing/section-wrapper"
import { CTASection } from "@/src/components/marketing/cta-section"
import {
  Users, CalendarDays, CreditCard, Building2, BarChart3, ShieldCheck,
  FileText, Bell, Globe, Smartphone, Database, Lock,
  ArrowRight, CheckCircle2, Zap,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Features",
  description: "Explore the full feature set of ClinicSys — patient management, scheduling, billing, analytics, and more.",
}

const mainFeatures = [
  {
    icon: Users, title: "Patient Management",
    description: "Comprehensive patient records with full medical history, consultation notes, prescriptions, lab results, and document attachments. Search, filter, and manage thousands of records effortlessly.",
    highlights: ["Complete medical history", "Digital prescriptions", "Document attachments", "Quick search & filters"],
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    icon: CalendarDays, title: "Appointment Scheduling",
    description: "Smart scheduling with real-time doctor availability, automated conflict detection, drag-and-drop rescheduling, and patient reminders to minimize no-shows.",
    highlights: ["Real-time availability", "Conflict detection", "Automated reminders", "Multi-doctor support"],
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    icon: CreditCard, title: "Billing & Payments",
    description: "End-to-end billing from invoice generation to payment tracking. Manage insurance claims, generate financial reports, and track outstanding balances.",
    highlights: ["Automated invoicing", "Insurance claims", "Payment tracking", "Financial reporting"],
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    icon: Building2, title: "Hospitalisation Tracking",
    description: "Manage bed allocation, track admissions and discharges, monitor room occupancy in real-time, and coordinate care across departments.",
    highlights: ["Bed management", "Admission tracking", "Occupancy dashboard", "Department coordination"],
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    textColor: "text-violet-600",
  },
  {
    icon: ShieldCheck, title: "Role-Based Access Control",
    description: "Granular permissions with dedicated dashboards for doctors, nurses, admin, and reception. Each role sees only relevant tools and data.",
    highlights: ["5 distinct roles", "Custom dashboards", "Data-level security", "Audit trail logging"],
    gradient: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50",
    textColor: "text-rose-600",
  },
  {
    icon: BarChart3, title: "Analytics Dashboard",
    description: "Real-time insights into patient flow, revenue trends, staff utilization, and operational KPIs. Export reports for stakeholder review.",
    highlights: ["Real-time visualization", "Revenue analytics", "Performance metrics", "Exportable reports"],
    gradient: "from-cyan-500 to-blue-600",
    bgLight: "bg-cyan-50",
    textColor: "text-cyan-600",
  },
]

const extras = [
  { icon: FileText, title: "Digital Records", description: "Go paperless with fully digital patient records and medical documents.", color: "text-blue-600", bgColor: "bg-blue-50" },
  { icon: Bell, title: "Smart Notifications", description: "Automated alerts for appointments, follow-ups, and critical results.", color: "text-amber-600", bgColor: "bg-amber-50" },
  { icon: Globe, title: "Multi-Language", description: "Interface available in multiple languages for diverse teams.", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { icon: Smartphone, title: "Responsive Design", description: "Access your dashboard from desktop, tablet, or mobile.", color: "text-violet-600", bgColor: "bg-violet-50" },
  { icon: Database, title: "Cloud-Based", description: "Secure cloud infrastructure with automated backups and scaling.", color: "text-cyan-600", bgColor: "bg-cyan-50" },
  { icon: Lock, title: "Data Encryption", description: "End-to-end encryption for all data in transit and at rest.", color: "text-rose-600", bgColor: "bg-rose-50" },
]

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 hero-grid-pattern opacity-40" />
          <div className="absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/4 -translate-y-1/4 orb-blue animate-float-slow" />
          <div className="absolute right-0 bottom-0 h-[400px] w-[400px] translate-x-1/4 orb-teal" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm">
                <Zap className="h-3.5 w-3.5" />
                Features
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
                Powerful Features for{" "}
                <span className="gradient-text">
                  Modern Clinics
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:max-w-none">
                Every tool you need to manage patients, staff, finances, and operations —
                integrated into one powerful, secure platform.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="absolute inset-0 -z-10 scale-90 rounded-3xl bg-gradient-to-br from-primary/10 to-teal-400/5 blur-2xl" />
              <Image
                src="/healthcare-features.png"
                alt="ClinicSys Healthcare Features Illustration"
                width={600}
                height={400}
                className="w-full rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules */}
      <SectionWrapper className="bg-gradient-to-b from-muted/20 to-transparent">
        <SectionHeader badge="Core Modules" title="Everything You Need, Nothing You Don't" description="Six powerful modules working together for complete clinic control." />
        <div className="space-y-8">
          {mainFeatures.map((f, index) => (
            <div key={f.title} className={`group overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm card-hover-subtle`}>
              <div className={`grid md:grid-cols-5 ${index % 2 !== 0 ? "md:direction-rtl" : ""}`}>
                <div className={`flex flex-col justify-center p-8 md:col-span-3 md:p-12 ${index % 2 !== 0 ? "md:order-2" : ""}`}>
                  {/* Icon */}
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${f.bgLight} ${f.textColor} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                    <f.icon className="h-7 w-7" />
                  </div>

                  <h3 className="mb-3 text-2xl font-bold text-foreground">{f.title}</h3>
                  <p className="mb-6 leading-relaxed text-muted-foreground">{f.description}</p>

                  {/* Highlights */}
                  <ul className="grid grid-cols-2 gap-3">
                    {f.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2.5 text-sm text-foreground">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${f.textColor}`} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual area */}
                <div className={`relative flex items-center justify-center bg-gradient-to-br from-muted/30 to-blue-50/30 p-8 md:col-span-2 overflow-hidden ${index % 2 !== 0 ? "md:order-1" : ""}`}>
                  {/* Decorative rings */}
                  <div className="absolute h-40 w-40 rounded-full border border-primary/[0.06] transition-transform duration-700 group-hover:scale-150" />
                  <div className="absolute h-64 w-64 rounded-full border border-primary/[0.04] transition-transform duration-700 group-hover:scale-125" />

                  <div className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl ${f.bgLight} shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl`}>
                    <f.icon className={`h-12 w-12 ${f.textColor}`} />
                  </div>
                </div>
              </div>

              {/* Bottom gradient line */}
              <div className={`h-1 w-0 bg-gradient-to-r ${f.gradient} transition-all duration-700 group-hover:w-full`} />
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Extra Features */}
      <SectionWrapper>
        <SectionHeader badge="And More" title="Built for the Real World" description="Beyond core modules, everything needed for production-ready healthcare." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {extras.map((f) => (
            <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white p-8 shadow-sm card-hover">
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${f.bgColor} ${f.color} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>

              {/* Hover arrow */}
              <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <CTASection />
    </>
  )
}
