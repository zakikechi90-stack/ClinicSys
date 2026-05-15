import type { Metadata } from "next"
import { Navbar } from "@/src/components/marketing/navbar"
import { Footer } from "@/src/components/marketing/footer"

export const metadata: Metadata = {
  title: {
    template: "%s | ClinicSys",
    default: "ClinicSys — Smart Clinic Management Platform",
  },
  description:
    "Streamline your clinic operations with ClinicSys. Manage patients, appointments, billing, and analytics in one secure, powerful platform.",
  keywords: [
    "clinic management",
    "healthcare software",
    "patient management",
    "medical billing",
    "appointment scheduling",
    "hospital management system",
  ],
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
