import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data } = await supabase
      .from("config")
      .select("id")
      .eq("id", "unlock")
      .maybeSingle()
    return NextResponse.json({ exists: !!data })
  } catch {
    return NextResponse.json({ exists: false, error: "db unavailable" }, { status: 503 })
  }
}
