import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAdmin } from "@/lib/api-helpers"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params
    const { data: message } = await supabase
      .from("messages")
      .select("*")
      .eq("date", date)
      .maybeSingle()

    if (!message) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    const { id, created_at, ...rest } = message
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
    await supabase.from("messages").delete().eq("date", date)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
