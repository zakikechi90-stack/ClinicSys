import { NextResponse } from "next/server"
import { fetchAdminStats } from "@/src/lib/supabase/queries"

export async function GET() {
  try {
    const stats = await fetchAdminStats()
    return NextResponse.json(stats)
  } catch (err) {
    console.error("Admin stats error:", err)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
