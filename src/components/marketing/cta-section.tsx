"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { ScrollReveal } from "./scroll-reveal"

const benefits = [
  "No credit card required",
  "14-day free trial",
  "Cancel anytime",
  "24/7 support",
]

export function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-blue-600 to-blue-500 px-8 py-16 text-center shadow-2xl shadow-primary/20 md:px-16 md:py-24">
            {/* Background decorations */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/[0.07] blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/[0.05] blur-3xl" />
              <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }} />
              {/* Floating sparkle */}
              <Sparkles className="absolute right-[20%] top-[20%] h-6 w-6 text-white/20 animate-float" />
              <Sparkles className="absolute left-[15%] bottom-[25%] h-4 w-4 text-white/15 animate-float" style={{ animationDelay: "3s" }} />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-white md:text-4xl lg:text-5xl leading-tight">
                Ready to Transform
                <br />
                Your Clinic?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100/80 leading-relaxed">
                Join hundreds of healthcare providers who have modernized their practice
                with ClinicSys. Start your free trial today.
              </p>

              {/* Benefits */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {benefits.map((b) => (
                  <span key={b} className="flex items-center gap-1.5 text-sm text-blue-100/70">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-200/80" />
                    {b}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="group h-13 rounded-full bg-white px-8 text-base font-semibold text-primary shadow-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-xl hover:scale-[1.02]"
                >
                  <Link href="/contact">
                    Start Free Trial
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-13 rounded-full border-white/25 bg-white/10 px-8 text-base text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white hover:border-white/40"
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
