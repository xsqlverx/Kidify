import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/api-helpers"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params
    const db = await getDb()
    const message = await db.collection("messages").findOne({ date })
    if (!message) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }
    const { _id, createdAt, ...rest } = message
    return NextResponse.json(rest)
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const unauthorized = requireAdmin(req.headers.get("authorization") ?? null)
  if (unauthorized) return unauthorized

  try {
    const { date } = await params
    const db = await getDb()
    await db.collection("messages").deleteOne({ date })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
