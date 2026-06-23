import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAdmin, corsHeaders, handleOptions } from "@/lib/api-helpers"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req) ?? new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin")

  try {
    const { data: images } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false })

    const cleaned = (images || []).map(({ id, created_at, ...rest }) => ({
      ...rest,
      id,
    }))
    return NextResponse.json(cleaned, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: corsHeaders(origin) })
  }
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

    if (!body.url && !body.cloudinaryId) {
      return NextResponse.json(
        { error: "missing image url" },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const image = {
      url: body.url,
      cloudinary_id: body.cloudinaryId || null,
      caption: body.caption || "",
      date: body.date || new Date().toISOString().slice(0, 10),
    }

    const { data } = await supabase.from("gallery").insert(image).select().single()

    return NextResponse.json({ success: true, id: data?.id }, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json(
      { error: "server_error" },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}
