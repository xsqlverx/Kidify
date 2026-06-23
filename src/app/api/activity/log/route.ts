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
    if (!body.type) {
      return NextResponse.json({ error: "missing type" }, { status: 400, headers: corsHeaders(origin) })
    }

    await supabase.from("activity").insert({
      type: body.type,
      detail: body.detail || null,
      ts: body.ts || Date.now(),
    })

    return NextResponse.json({ success: true }, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: corsHeaders(origin) })
  }
}
