"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Play, Shield, Clock, Users, Activity, Sparkles } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { AnimatedCounter } from "./animated-counter"

const stats = [
  { icon: Users, value: 10000, suffix: "+", label: "Patients Managed" },
  { icon: Clock, value: 99, suffix: ".9%", label: "Uptime Guarantee" },
  { icon: Shield, label: "HIPAA Compliant", text: "HIPAA" },
  { icon: Activity, value: 500, suffix: "+", label: "Clinics Worldwide" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-20 pt-28 md:pb-32 md:pt-44">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Grid pattern */}
        <div className="absolute inset-0 hero-grid-pattern opacity-60" />
        {/* Gradient orbs */}
        <div className="absolute right-0 top-0 h-[700px] w-[700px] translate-x-1/4 -translate-y-1/4 orb-blue animate-float-slow" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/4 orb-teal animate-float" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 orb-violet" />
        {/* Decorative ring */}
        <div className="absolute right-[15%] top-[20%] h-72 w-72 rounded-full border border-primary/[0.06] animate-spin-slow" />
        <div className="absolute left-[10%] bottom-[15%] h-48 w-48 rounded-full border border-blue-300/[0.08] animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "25s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text Content */}
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            {/* Badge */}
            <div className="animate-fade-in mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <Sparkles className="h-3.5 w-3.5" />
              Now Available — Start Your Free Trial
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-6xl">
              Smart Clinic{" "}
              <br className="hidden sm:block" />
              Management{" "}
              <span className="gradient-text">
                System
              </span>
            </h1>

            {/* Subtext */}
            <p className="animate-fade-in delay-100 mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl lg:max-w-xl">
              Streamline your entire clinic workflow — from patient registration and appointment 
              scheduling to billing and analytics — with efficiency, security, and simplicity.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in delay-200 mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                asChild
                className="group h-13 rounded-full px-8 text-base shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02]"
              >
                <Link href="/contact">
                  Get Started Free
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="group h-13 rounded-full px-8 text-base border-border/60 transition-all duration-300 hover:border-primary/30 hover:bg-primary/5"
              >
                <Link href="/features">
                  <Play className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  Book Demo
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="animate-fade-in delay-300 mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                256-bit SSL
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-blue-500" />
                99.9% Uptime
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-violet-500" />
                10k+ Users
              </span>
            </div>
          </div>

          {/* Right: Dashboard Illustration */}
          <div className="animate-scale-in delay-300 relative mx-auto w-full max-w-xl lg:max-w-none">
            {/* Glow behind */}
            <div className="absolute inset-0 -z-10 scale-95 rounded-3xl bg-gradient-to-br from-primary/10 via-blue-400/5 to-teal-400/10 blur-2xl" />
            
            {/* Dashboard mockup container */}
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-white dark:bg-slate-900 shadow-2xl shadow-primary/[0.08] animate-pulse-glow">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-border/30 bg-gradient-to-r from-muted/60 to-muted/30 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80 transition-colors hover:bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80 transition-colors hover:bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80 transition-colors hover:bg-emerald-500" />
                </div>
                <div className="mx-auto flex h-7 w-64 items-center justify-center rounded-lg bg-white/80 px-3 text-xs text-muted-foreground/70 shadow-inner">
                  <span className="mr-1.5 text-emerald-500">🔒</span>
                  app.clinicsys.com/dashboard
                </div>
              </div>

              {/* Dashboard illustration */}
              <Image
                src="/dashboard-preview.png"
                alt="ClinicSys Dashboard Preview — Patient Management, Appointments, Analytics"
                width={800}
                height={500}
                className="w-full object-cover"
                priority
              />
            </div>

            {/* Floating card — top right */}
            <div className="absolute -right-4 -top-4 z-10 hidden animate-float rounded-xl glass-strong p-3 shadow-lg sm:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Today&apos;s Patients</p>
                  <p className="text-sm font-bold text-foreground">127</p>
                </div>
              </div>
            </div>

            {/* Floating card — bottom left */}
            <div className="absolute -bottom-3 -left-3 z-10 hidden animate-float rounded-xl glass-strong p-3 shadow-lg sm:block" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Avg. Wait Time</p>
                  <p className="text-sm font-bold text-foreground">8 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="animate-fade-in delay-400 mt-20 md:mt-28">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 rounded-2xl border border-border/40 bg-white/60 dark:bg-card/60 p-6 shadow-sm backdrop-blur-sm md:grid-cols-4 md:gap-8 md:p-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary/70" />
                <div className="text-2xl font-bold text-foreground md:text-3xl">
                  {stat.text ? (
                    stat.text
                  ) : (
                    <AnimatedCounter
                      target={stat.value!}
                      suffix={stat.suffix}
                      duration={2200}
                    />
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
