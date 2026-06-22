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
    const images = await db
      .collection("gallery")
      .find({})
      .sort({ date: -1 })
      .toArray()

    const cleaned = images.map(({ _id, createdAt, ...rest }) => ({
      ...rest,
      id: rest.id || String(_id),
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

    const db = await getDb()
    const image = {
      id: body.id || `gallery-${Date.now()}`,
      url: body.url,
      cloudinaryId: body.cloudinaryId || null,
      caption: body.caption || "",
      date: body.date || new Date().toISOString().slice(0, 10),
      createdAt: new Date(),
    }

    await db.collection("gallery").insertOne(image)

    return NextResponse.json({ success: true, id: image.id }, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json(
      { error: "server_error" },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}
