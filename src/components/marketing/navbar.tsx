"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowRight } from "lucide-react"
import { ClinicLogo } from "@/src/components/ui/clinic-logo"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "glass-strong shadow-lg shadow-black/[0.03] py-2"
          : "bg-transparent py-3"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-all duration-300 hover:opacity-80 hover:scale-[1.02]">
          <ClinicLogo height={34} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                pathname === link.href
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild className="rounded-full text-muted-foreground hover:text-foreground">
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild className="group rounded-full px-6 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30">
            <Link href="/contact">
              Get Started
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 md:hidden",
            mobileOpen
              ? "bg-primary/10 text-primary rotate-90"
              : "text-foreground hover:bg-accent"
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={cn(
          "overflow-hidden glass-strong transition-all duration-500 ease-out md:hidden",
          mobileOpen ? "max-h-[400px] opacity-100 border-t border-border/30" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-5">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300",
                pathname === link.href
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2.5 border-t border-border/30 pt-5">
            <Button variant="outline" size="sm" asChild className="w-full rounded-xl h-11">
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild className="w-full rounded-xl h-11 shadow-md shadow-primary/20">
              <Link href="/contact">
                Get Started
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
