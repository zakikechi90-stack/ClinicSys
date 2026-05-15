import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/", "/about", "/features", "/contact"]

  if (!user && !publicRoutes.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    const response = NextResponse.redirect(url)
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    return response
  }

  // If user is authenticated, check role-based access
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single()

    if (profile) {
      if (!profile.is_active) {
        // Sign out user server-side by clearing session
        await supabase.auth.signOut()
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        url.searchParams.set("error", "account_disabled")
        const response = NextResponse.redirect(url)
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
        return response
      }

      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        doctor: "/doctor",
        chef: "/chef",
        reception: "/reception",
        nurse: "/nurse",
      }

      // Redirect from login if already authenticated
      if (pathname === "/login") {
        const url = request.nextUrl.clone()
        url.pathname = roleRoutes[profile.role] || "/login"
        return NextResponse.redirect(url)
      }

      // Check if user is accessing their allowed route
      const allowedPrefix = roleRoutes[profile.role]
      if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
        // Admin can access any route
        if (profile.role !== "admin") {
          const url = request.nextUrl.clone()
          url.pathname = allowedPrefix
          return NextResponse.redirect(url)
        }
      }
    }
  }

  // Add no-cache headers to all protected pages so browser back button
  // doesn't show stale dashboard after logout
  if (!publicRoutes.includes(pathname)) {
    supabaseResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    supabaseResponse.headers.set("Pragma", "no-cache")
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
