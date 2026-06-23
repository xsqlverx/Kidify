import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code || typeof code !== "string" || code.length !== 4 || !/^\d{4}$/.test(code)) {
      return NextResponse.json({ success: false, error: "invalid_code" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("config")
      .select("id")
      .eq("id", "unlock")
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: false, error: "already_setup" }, { status: 409 })
    }

    await supabase.from("config").insert({
      id: "unlock",
      code,
      attempts: 0,
      failsafe_locked: false,
      failsafe_until: null,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 })
  }
}
