"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/src/lib/theme-context"
import { Button } from "@/src/components/ui/button"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="relative h-9 w-9 transition-all duration-300"
    >
      {/* Sun icon — shown in dark mode to switch to light */}
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${
          theme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-50"
        }`}
      />
      {/* Moon icon — shown in light mode to switch to dark */}
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          theme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-50"
        }`}
      />
    </Button>
  )
}
