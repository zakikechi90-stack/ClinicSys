import { cn } from "@/src/lib/utils"

interface ClinicLogoProps {
  /** Show just the icon mark (no text) — good for very compact spaces */
  iconOnly?: boolean
  /** Additional class names */
  className?: string
  /** Height of the logo in pixels (width auto-scales) */
  height?: number
}

/**
 * Inline SVG logo — works in both light and dark mode with no image loading.
 * Medical cross + ECG heartbeat line + "ClinicSys" wordmark.
 */
export function ClinicLogo({ iconOnly = false, className, height = 36 }: ClinicLogoProps) {
  if (iconOnly) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 40"
        height={height}
        width={height}
        aria-label="ClinicSys"
        className={cn("shrink-0", className)}
      >
        {/* Rounded medical cross */}
        <rect x="14" y="2" width="12" height="36" rx="5" ry="5" fill="#3B6FD4" />
        <rect x="2" y="14" width="36" height="12" rx="5" ry="5" fill="#3B6FD4" />
        {/* ECG / heartbeat line through the centre */}
        <polyline
          points="4,20 10,20 13,13 17,27 21,14 24,22 28,22 36,22"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 190 40"
      height={height}
      aria-label="ClinicSys"
      className={cn("shrink-0", className)}
      style={{ width: "auto" }}
    >
      {/* ── Icon mark ── */}
      {/* Rounded medical cross (two overlapping rounded rects) */}
      <rect x="4"  y="2"  width="11" height="36" rx="4" ry="4" fill="#3B6FD4" />
      <rect x="2"  y="15" width="15" height="11" rx="4" ry="4" fill="#3B6FD4" />

      {/* ECG heartbeat line through centre of cross */}
      <polyline
        points="2,20.5 5,20.5 7,14 9.5,27 11.5,13 13.5,22 17,22"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Wordmark ── */}
      {/* "Clinic" — dark charcoal, adapts via currentColor trick via fill */}
      <text
        x="26"
        y="27"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        fontSize="18"
        letterSpacing="-0.3"
        fill="currentColor"
        className="text-foreground"
      >
        Clinic
      </text>
      {/* "Sys" — brand blue */}
      <text
        x="93"
        y="27"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        fontSize="18"
        letterSpacing="-0.3"
        fill="#3B6FD4"
      >
        Sys
      </text>
    </svg>
  )
}
