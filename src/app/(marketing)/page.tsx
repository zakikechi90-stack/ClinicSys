import { HeroSection } from "@/src/components/marketing/hero-section"
import { FeaturesSection } from "@/src/components/marketing/features-section"
import { TestimonialsSection } from "@/src/components/marketing/testimonials-section"
import { StatsSection } from "@/src/components/marketing/stats-section"
import { CTASection } from "@/src/components/marketing/cta-section"
import { SectionWrapper, SectionHeader } from "@/src/components/marketing/section-wrapper"
import { ContactDoctor } from "@/src/components/marketing/contact-doctor"
import {
  Stethoscope,
  HeartPulse,
  UserCog,
  ConciergeBell,
} from "lucide-react"

const roles = [
  {
    icon: Stethoscope,
    title: "Doctor",
    description:
      "Access patient records, manage consultations, write prescriptions, and review medical history — all from a unified dashboard.",
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    icon: HeartPulse,
    title: "Nurse",
    description:
      "Track vital signs, manage patient care plans, coordinate with doctors, and handle medication administration seamlessly.",
    gradient: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    icon: UserCog,
    title: "Admin",
    description:
      "Oversee the entire clinic operations, manage staff accounts, configure system settings, and access comprehensive analytics.",
    gradient: "from-violet-500 to-violet-600",
    bgLight: "bg-violet-50",
    textColor: "text-violet-600",
  },
  {
    icon: ConciergeBell,
    title: "Reception",
    description:
      "Handle patient check-ins, manage appointment bookings, process billing, and maintain smooth front-desk operations.",
    gradient: "from-amber-500 to-amber-600",
    bgLight: "bg-amber-50",
    textColor: "text-amber-600",
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Section Divider */}
      <div className="section-divider mx-auto max-w-4xl" />

      {/* Features Preview */}
      <FeaturesSection />

      {/* Role-Based Section */}
      <SectionWrapper id="roles" className="relative bg-gradient-to-b from-muted/20 to-transparent">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-0 top-1/4 h-96 w-96 translate-x-1/3 orb-violet opacity-40" />
        </div>

        <SectionHeader
          badge="Role-Based Access"
          title="Tailored for Every Team Member"
          description="Each role gets a personalized dashboard with the exact tools and data they need to perform at their best."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <div
              key={role.title}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white p-8 shadow-sm card-hover"
            >
              {/* Icon */}
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${role.bgLight} ${role.textColor} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}
              >
                <role.icon className="h-7 w-7" />
              </div>

              <h3 className="mb-3 text-lg font-bold text-foreground">
                {role.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {role.description}
              </p>

              {/* Bottom gradient line */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${role.gradient} transition-all duration-500 group-hover:w-full`} />
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Statistics Section */}
      <StatsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Patient Message Form */}
      <SectionWrapper id="contact-doctor" className="relative bg-muted/10">
        <SectionHeader
          badge="Patient Portal"
          title="Message Your Doctor"
          description="Send simple medical updates or questions directly to your doctor. No account required."
        />
        <div className="flex justify-center px-4">
          <ContactDoctor />
        </div>
      </SectionWrapper>

      {/* CTA */}
      <CTASection />
    </>
  )
}
