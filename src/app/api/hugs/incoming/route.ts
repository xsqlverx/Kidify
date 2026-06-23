import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { corsHeaders, handleOptions } from "@/lib/api-helpers"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req) ?? new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin")

  try {
    const body = await req.json()
    if (!body.message) {
      return NextResponse.json({ error: "missing message" }, { status: 400, headers: corsHeaders(origin) })
    }

    const ts = Date.now()
    await supabase.from("activity").insert({
      type: "incoming_hug",
      detail: body.message,
      ts,
    })

    return NextResponse.json({ success: true, ts }, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: corsHeaders(origin) })
  }
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin")

  try {
    const { searchParams } = new URL(req.url)
    const since = parseInt(searchParams.get("since") || "0")

    let query = supabase
      .from("activity")
      .select("detail, ts")
      .eq("type", "incoming_hug")
      .order("ts", { ascending: false })
      .limit(1)

    if (since > 0) query = query.gt("ts", since)

    const { data } = await query

    if (data && data.length > 0) {
      return NextResponse.json({ message: data[0].detail, ts: data[0].ts }, { headers: corsHeaders(origin) })
    }

    return NextResponse.json(null, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: corsHeaders(origin) })
  }
}
