import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAdmin, corsHeaders, handleOptions } from "@/lib/api-helpers"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req) ?? new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin")
  const unauthorized = requireAdmin(req.headers.get("authorization") ?? null)
  if (unauthorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: corsHeaders(origin) })
  }

  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500)
    const type = searchParams.get("type")

    let query = supabase
      .from("activity")
      .select("*")
      .order("ts", { ascending: false })
      .limit(limit)

    if (type) query = query.eq("type", type)

    const { data: logs } = await query

    return NextResponse.json(logs || [], { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: corsHeaders(origin) })
  }
}
