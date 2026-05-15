"use client"

import { useState } from "react"
import { SectionWrapper } from "@/src/components/marketing/section-wrapper"
import { CTASection } from "@/src/components/marketing/cta-section"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { Mail, Phone, MapPin, Send, Clock, CheckCircle2, MessageSquare, ArrowRight, Sparkles } from "lucide-react"

const contactInfo = [
  {
    icon: Mail,
    label: "Email Us",
    value: "contact@clinicsys.com",
    href: "mailto:contact@clinicsys.com",
    description: "We reply within 24 hours",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+213 55 000 00 00",
    href: "tel:+213550000000",
    description: "Mon–Fri from 8AM to 5PM",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "Algiers, Algeria",
    href: undefined,
    description: "Rue Didouche Mourad, 16000",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Sun – Thu: 8AM – 5PM",
    href: undefined,
    description: "Closed on weekends",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
]

const faq = [
  { q: "How long does setup take?", a: "Most clinics are fully set up within 24 hours. Our onboarding team guides you every step of the way." },
  { q: "Is my data secure?", a: "Absolutely. We use 256-bit encryption, role-based access, and comply with HIPAA regulations." },
  { q: "Can I try before I buy?", a: "Yes! We offer a 14-day free trial with full access to all features. No credit card required." },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-32 md:pb-20 md:pt-44">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 hero-grid-pattern opacity-40" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/4 -translate-y-1/4 orb-blue animate-float-slow" />
          <div className="absolute left-0 bottom-0 h-[400px] w-[400px] -translate-x-1/4 orb-teal" />
        </div>
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm">
            <MessageSquare className="h-3.5 w-3.5" />
            Contact
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
            Get in{" "}
            <span className="gradient-text">
              Touch
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Have questions about ClinicSys? Want to schedule a demo? We would love to hear from you.
            Reach out and our team will get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Form + Info */}
      <SectionWrapper className="bg-gradient-to-b from-muted/20 to-transparent">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form */}
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm lg:col-span-3">
              {submitted ? (
                <div className="flex flex-col items-center justify-center p-8 py-20 text-center md:p-12">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 animate-scale-in">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">Message Sent!</h3>
                  <p className="max-w-sm text-muted-foreground">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <Button
                    className="mt-8 rounded-full px-8 shadow-md shadow-primary/20"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="p-8 md:p-10">
                  {/* Form header */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground">Send Us a Message</h2>
                    <p className="mt-2 text-muted-foreground">
                      Fill out the form and we will respond as soon as possible.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name" className="text-sm font-medium">Full Name</Label>
                        <Input
                          id="contact-name"
                          placeholder="John Doe"
                          required
                          className="h-12 rounded-xl border-border/60 transition-all duration-300 focus:border-primary focus:shadow-sm focus:shadow-primary/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="h-12 rounded-xl border-border/60 transition-all duration-300 focus:border-primary focus:shadow-sm focus:shadow-primary/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-subject" className="text-sm font-medium">Subject</Label>
                      <Input
                        id="contact-subject"
                        placeholder="How can we help you?"
                        className="h-12 rounded-xl border-border/60 transition-all duration-300 focus:border-primary focus:shadow-sm focus:shadow-primary/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-message" className="text-sm font-medium">Message</Label>
                      <Textarea
                        id="contact-message"
                        placeholder="Tell us more about your clinic and what you are looking for..."
                        rows={5}
                        required
                        className="rounded-xl border-border/60 resize-none transition-all duration-300 focus:border-primary focus:shadow-sm focus:shadow-primary/10"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="group h-13 w-full rounded-full text-base shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.01] sm:w-auto sm:px-10"
                    >
                      <Send className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      Send Message
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Contact Info Sidebar */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              {contactInfo.map((item) => (
                <div
                  key={item.label}
                  className="group overflow-hidden rounded-2xl border border-border/40 bg-white p-6 shadow-sm card-hover-subtle"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.bgColor} ${item.color} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="mt-1 block text-base font-bold text-foreground transition-colors hover:text-primary">
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-base font-bold text-foreground">{item.value}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Map Embed */}
              <div className="flex-1 overflow-hidden rounded-2xl border border-border/40 shadow-sm min-h-[200px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102239.5847645448!2d2.9413862302246094!3d36.75399199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb26977ea659f%3A0x4c5d40c4cd17c95a!2sAlgiers%2C%20Algeria!5e0!3m2!1sfr!2sdz!4v1714666666666!5m2!1sfr!2sdz"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "200px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ClinicSys Location - Algiers, Algeria"
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* FAQ Section */}
      <SectionWrapper>
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            FAQ
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Quick answers to questions you may have.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {faq.map((item) => (
            <div key={item.q} className="group overflow-hidden rounded-2xl border border-border/40 bg-white p-6 shadow-sm card-hover-subtle">
              <h3 className="text-base font-bold text-foreground">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <CTASection />
    </>
  )
}
