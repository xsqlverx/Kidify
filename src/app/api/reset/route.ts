import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAdmin, corsHeaders, handleOptions } from "@/lib/api-helpers"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req) ?? new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin")
  const unauthorized = requireAdmin(req.headers.get("authorization") ?? null)
  if (unauthorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: corsHeaders(origin) })
  }

  try {
    await supabase.from("config").delete().neq("id", "nonexistent")
    await supabase.from("messages").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    await supabase.from("gallery").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    await supabase.from("activity").delete().neq("id", 0)
    await supabase.from("thankyou").delete().neq("id", "nonexistent")

    return NextResponse.json({
      success: true,
      message: "All data wiped. Unlock code removed — app will show onboarding on next launch.",
    }, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: corsHeaders(origin) })
  }
}
