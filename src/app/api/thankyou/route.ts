import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin, corsHeaders, handleOptions } from "@/lib/api-helpers"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req) ?? new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin")

  try {
    const db = await getDb()
    const doc = await db.collection("thankyou").findOne({ _id: "singleton" })
    if (!doc) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }
    const { _id, updatedAt, ...rest } = doc
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
    const db = await getDb()

    const update: Record<string, unknown> = { updatedAt: new Date() }
    if (body.intro !== undefined) update.intro = body.intro
    if (body.sections !== undefined) update.sections = body.sections

    await db.collection("thankyou").updateOne(
      { _id: "singleton" },
      { $set: update },
      { upsert: true }
    )

    return NextResponse.json({ success: true }, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json(
      { error: "server_error" },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}
