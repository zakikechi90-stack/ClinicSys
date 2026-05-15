import type { Metadata } from "next"
import Image from "next/image"
import { SectionWrapper, SectionHeader } from "@/src/components/marketing/section-wrapper"
import { CTASection } from "@/src/components/marketing/cta-section"
import {
  Target,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Lightbulb,
  Clock,
  Award,
  Zap,
} from "lucide-react"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about ClinicSys — our mission to modernize healthcare management and empower medical professionals with cutting-edge technology.",
}

const values = [
  {
    icon: HeartHandshake,
    title: "Patient-Centered Design",
    description:
      "Every feature is built with the end goal of improving patient care quality and experience at your clinic.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    description:
      "Your data is protected with enterprise-grade security, role-based access controls, and full regulatory compliance.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Lightbulb,
    title: "Continuous Innovation",
    description:
      "We continuously evolve our platform with new features, driven by feedback from healthcare professionals worldwide.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: Clock,
    title: "Reliable & Available",
    description:
      "With 99.9% uptime and 24/7 monitoring, your clinic management system is always available when you need it.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
]

const teamMembers = [
  {
    name: "Dr. Sarah Benali",
    role: "Co-Founder & CEO",
    description: "Former hospital administrator with 15+ years in healthcare operations management.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    name: "Karim Hadj",
    role: "CTO",
    description: "Full-stack engineer specialized in scalable healthcare technology solutions.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Amira Cherif",
    role: "Head of Product",
    description: "UX researcher passionate about creating intuitive interfaces for medical professionals.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Dr. Yacine Khelifi",
    role: "Medical Advisor",
    description: "Practicing physician ensuring our platform meets real clinical workflow needs.",
    gradient: "from-amber-500 to-orange-600",
  },
]

const milestones = [
  { year: "2023", title: "Founded", description: "ClinicSys was born in Algiers with a vision to modernize healthcare." },
  { year: "2024", title: "Beta Launch", description: "First 50 clinics onboarded during beta testing phase." },
  { year: "2025", title: "Full Release", description: "Platform launch with 500+ clinics across North Africa." },
  { year: "2026", title: "Expansion", description: "Growing to 15+ countries with multi-language support." },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 hero-grid-pattern opacity-40" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/4 -translate-y-1/4 orb-blue animate-float-slow" />
          <div className="absolute left-0 bottom-0 h-[400px] w-[400px] -translate-x-1/4 orb-teal" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm">
                <Award className="h-3.5 w-3.5" />
                About Us
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
                Empowering Healthcare{" "}
                <span className="gradient-text">
                  Through Technology
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:max-w-none">
                ClinicSys was born from a simple belief: healthcare professionals deserve
                modern, intuitive tools that let them focus on what matters most — their patients.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="absolute inset-0 -z-10 scale-90 rounded-3xl bg-gradient-to-br from-primary/10 to-teal-400/5 blur-2xl" />
              <Image
                src="/medical-team.png"
                alt="ClinicSys Medical Team Illustration"
                width={600}
                height={400}
                className="w-full rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <SectionWrapper className="bg-gradient-to-b from-muted/20 to-transparent">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white p-10 shadow-sm card-hover">
            <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 group-hover:w-full" />
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-500 group-hover:scale-110">
              <Target className="h-7 w-7" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Our Mission</h2>
            <p className="leading-relaxed text-muted-foreground">
              To provide healthcare facilities of all sizes with accessible, powerful, and secure
              clinic management software that reduces administrative burden and enhances patient
              outcomes. We believe that digital transformation in healthcare should be simple,
              affordable, and impactful.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white p-10 shadow-sm card-hover">
            <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500 group-hover:w-full" />
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform duration-500 group-hover:scale-110">
              <Eye className="h-7 w-7" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Our Vision</h2>
            <p className="leading-relaxed text-muted-foreground">
              To become the leading clinic management platform across North Africa and the MENA region,
              setting the standard for digital healthcare administration. We envision a future where
              every clinic — from small practices to multi-location facilities — operates with the
              efficiency and insight of world-class institutions.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* Journey Timeline */}
      <SectionWrapper>
        <SectionHeader
          badge="Our Journey"
          title="From Idea to Impact"
          description="Key milestones in our mission to transform healthcare management."
        />

        <div className="mx-auto max-w-3xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent md:left-1/2 md:-translate-x-px" />

            {milestones.map((m, i) => (
              <div key={m.year} className={`relative mb-12 flex items-start gap-6 last:mb-0 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                {/* Content */}
                <div className={`flex-1 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <span className="mb-1 inline-block text-sm font-bold text-primary">{m.year}</span>
                  <h3 className="text-lg font-bold text-foreground">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                </div>

                {/* Dot */}
                <div className="absolute left-6 flex h-3 w-3 -translate-x-1/2 items-center justify-center md:left-1/2">
                  <div className="h-3 w-3 rounded-full border-2 border-primary bg-white shadow-sm" />
                </div>

                {/* Spacer for other side */}
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Why Choose Us */}
      <SectionWrapper className="bg-gradient-to-b from-muted/20 to-transparent">
        <SectionHeader
          badge="Why ClinicSys"
          title="Built Different, Built Better"
          description="We combine deep healthcare domain expertise with modern engineering to deliver a platform that truly works."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white p-8 shadow-sm card-hover"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${value.bgColor} ${value.color} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                <value.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-foreground">{value.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Team Section */}
      <SectionWrapper>
        <SectionHeader
          badge="Our Team"
          title="The People Behind ClinicSys"
          description="A passionate team of healthcare experts, engineers, and designers working together to transform clinic management."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm card-hover"
            >
              {/* Avatar area */}
              <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-muted/30 to-blue-50/50 overflow-hidden">
                {/* Decorative rings */}
                <div className="absolute h-32 w-32 rounded-full border border-primary/[0.06] transition-transform duration-700 group-hover:scale-150" />
                <div className="absolute h-48 w-48 rounded-full border border-primary/[0.04] transition-transform duration-700 group-hover:scale-125" />
                {/* Avatar */}
                <div className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} text-2xl font-bold text-white shadow-xl transition-transform duration-500 group-hover:scale-110`}>
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-base font-bold text-foreground">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Stats */}
      <SectionWrapper className="bg-gradient-to-b from-muted/20 to-transparent">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "500+", label: "Clinics Served", icon: Zap },
            { value: "10,000+", label: "Patients Managed", icon: HeartHandshake },
            { value: "99.9%", label: "System Uptime", icon: Clock },
            { value: "24/7", label: "Support Available", icon: ShieldCheck },
          ].map((stat) => (
            <div key={stat.label} className="group text-center">
              <stat.icon className="mx-auto mb-3 h-6 w-6 text-primary/60 transition-transform duration-300 group-hover:scale-110" />
              <div className="text-3xl font-extrabold text-primary md:text-4xl">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <CTASection />
    </>
  )
}
