import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code || typeof code !== "string" || code.length !== 4 || !/^\d{4}$/.test(code)) {
      return NextResponse.json({ success: false, error: "invalid_code" }, { status: 400 })
    }

    const db = await getDb()
    const existing = await db.collection("config").findOne({ _id: "unlock" })

    if (existing) {
      return NextResponse.json({ success: false, error: "already_setup" }, { status: 409 })
    }

    await db.collection("config").insertOne({
      _id: "unlock",
      code,
      attempts: 0,
      failsafeLocked: false,
      failsafeUntil: null,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 })
  }
}
