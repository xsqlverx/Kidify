import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code || typeof code !== "string" || code.length !== 4) {
      return NextResponse.json({ success: false, error: "invalid" }, { status: 400 })
    }

    const db = await getDb()
    const config = await db.collection("config").findOne({ _id: "unlock" })

    if (!config) {
      return NextResponse.json({ success: false, error: "not_setup" }, { status: 404 })
    }

    if (config.failsafeLocked && config.failsafeUntil > Date.now()) {
      return NextResponse.json({
        success: false,
        locked: true,
        lockedUntil: config.failsafeUntil,
      })
    }

    if (config.failsafeLocked) {
      await db.collection("config").updateOne(
        { _id: "unlock" },
        { $set: { failsafeLocked: false, failsafeUntil: null } }
      )
    }

    if (code === config.code) {
      await db.collection("config").updateOne(
        { _id: "unlock" },
        { $set: { attempts: 0 } }
      )
      return NextResponse.json({ success: true })
    }

    const attempts = (config.attempts || 0) + 1
    const update: Record<string, unknown> = { $set: { attempts } }

    if (attempts >= 5) {
      const lockedUntil = Date.now() + 1000 * 60 * 5
      update.$set = {
        ...update.$set,
        failsafeLocked: true,
        failsafeUntil: lockedUntil,
      }
      console.log(`[FAILSAFE] 5 wrong unlock attempts at ${new Date().toISOString()}`)
    }

    await db.collection("config").updateOne({ _id: "unlock" }, update)

    return NextResponse.json({
      success: false,
      attempts,
      locked: attempts >= 5,
      lockedUntil: attempts >= 5 ? Date.now() + 1000 * 60 * 5 : null,
    })
  } catch {
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 })
  }
}
