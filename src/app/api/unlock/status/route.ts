import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()
    const config = await db.collection("config").findOne({ _id: "unlock" })
    return NextResponse.json({ exists: !!config })
  } catch {
    return NextResponse.json({ exists: false, error: "db unavailable" }, { status: 503 })
  }
}
