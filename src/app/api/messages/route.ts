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
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: corsHeaders(origin) }
    )
  }

  try {
    const body = await req.json()
    if (!body.date || !body.title || !body.body) {
      return NextResponse.json(
        { error: "missing_fields" },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const message = {
      date: body.date,
      title: body.title,
      body: body.body,
      signature: body.signature || "— always, me",
      sticker: body.sticker || "💌",
    }

    await supabase.from("messages").upsert(message, { onConflict: "date" })

    return NextResponse.json({ success: true }, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json(
      { error: "server_error" },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}
