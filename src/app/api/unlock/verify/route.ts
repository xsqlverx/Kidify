import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code || typeof code !== "string" || code.length !== 4) {
      return NextResponse.json({ success: false, error: "invalid" }, { status: 400 })
    }

    const { data: config } = await supabase
      .from("config")
      .select("*")
      .eq("id", "unlock")
      .maybeSingle()

    if (!config) {
      return NextResponse.json({ success: false, error: "not_setup" }, { status: 404 })
    }

    if (config.failsafe_locked && config.failsafe_until > Date.now()) {
      return NextResponse.json({
        success: false,
        locked: true,
        lockedUntil: config.failsafe_until,
      })
    }

    if (config.failsafe_locked) {
      await supabase
        .from("config")
        .update({ failsafe_locked: false, failsafe_until: null })
        .eq("id", "unlock")
    }

    if (code === config.code) {
      await supabase
        .from("config")
        .update({ attempts: 0 })
        .eq("id", "unlock")
      return NextResponse.json({ success: true })
    }

    const attempts = (config.attempts || 0) + 1
    const update: Record<string, unknown> = { attempts }

    if (attempts >= 5) {
      const lockedUntil = Date.now() + 1000 * 60 * 5
      update.failsafe_locked = true
      update.failsafe_until = lockedUntil
    }

    await supabase
      .from("config")
      .update(update)
      .eq("id", "unlock")

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
