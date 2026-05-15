"use client"

import { Star, Quote } from "lucide-react"
import { SectionWrapper, SectionHeader } from "./section-wrapper"
import { ScrollReveal } from "./scroll-reveal"

const testimonials = [
  {
    name: "Dr. Amina Benali",
    role: "General Practitioner",
    clinic: "Centre Médical El-Biar",
    content:
      "ClinicSys transformed how we manage patients. The appointment system alone saved us 3 hours of administrative work daily. The interface is intuitive and my staff picked it up within a day.",
    rating: 5,
    avatar: "AB",
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Karim Meziane",
    role: "Clinic Director",
    clinic: "Polyclinique Saada",
    content:
      "We switched from paper-based records to ClinicSys and saw a 40% improvement in billing accuracy. The analytics dashboard gives me real-time insights I never had before.",
    rating: 5,
    avatar: "KM",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Dr. Fatima Hadj",
    role: "Pediatrician",
    clinic: "Clinique Les Oliviers",
    content:
      "The role-based access is exactly what we needed. Nurses see their tasks, receptionists manage bookings, and I focus on patient care. Everything works seamlessly together.",
    rating: 5,
    avatar: "FH",
    color: "from-violet-500 to-purple-600",
  },
]

export function TestimonialsSection() {
  return (
    <SectionWrapper className="relative bg-gradient-to-b from-muted/20 to-transparent" id="testimonials">
      <SectionHeader
        badge="Testimonials"
        title="Trusted by Healthcare Professionals"
        description="See what doctors and clinic managers say about transforming their practice with ClinicSys."
      />

      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <ScrollReveal key={t.name} delay={i * 120}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card p-8 shadow-sm card-hover-subtle">
              {/* Quote icon */}
              <div className="mb-5">
                <Quote className="h-8 w-8 text-primary/15" />
              </div>

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-border/30 pt-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white shadow-md`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} · {t.clinic}
                  </p>
                </div>
              </div>

              {/* Hover gradient */}
              <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </SectionWrapper>
  )
}
