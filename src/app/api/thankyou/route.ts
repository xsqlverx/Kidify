import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAdmin, corsHeaders, handleOptions } from "@/lib/api-helpers"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req) ?? new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin")

  try {
    const { data: doc } = await supabase
      .from("thankyou")
      .select("*")
      .eq("id", "singleton")
      .single()

    if (!doc) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    const { id, updated_at, ...rest } = doc
    return NextResponse.json(rest, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: corsHeaders(origin) })
  }
}

export async function PUT(req: NextRequest) {
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
    const update: Record<string, unknown> = {}
    if (body.intro !== undefined) update.intro = body.intro
    if (body.sections !== undefined) update.sections = body.sections
    update.updated_at = new Date().toISOString()

    await supabase.from("thankyou").upsert({ id: "singleton", ...update }, { onConflict: "id" })

    return NextResponse.json({ success: true }, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json(
      { error: "server_error" },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}
