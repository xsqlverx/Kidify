import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
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

    const db = await getDb()
    const messages = await db
      .collection("messages")
      .find({ date: { $gte: from, $lte: to } })
      .sort({ date: 1 })
      .toArray()

    const cleaned = messages.map(({ _id, createdAt, ...rest }) => rest)
    return NextResponse.json(cleaned, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: corsHeaders(origin) })
  }
}
