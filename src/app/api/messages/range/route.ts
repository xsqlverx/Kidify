import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { corsHeaders, handleOptions } from "@/lib/api-helpers"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req) ?? new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin")

  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!from || !to) {
      return NextResponse.json({ error: "missing from/to" }, { status: 400, headers: corsHeaders(origin) })
    }

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true })

    const cleaned = (messages || []).map(({ id, created_at, ...rest }) => rest)
    return NextResponse.json(cleaned, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: corsHeaders(origin) })
  }
}
