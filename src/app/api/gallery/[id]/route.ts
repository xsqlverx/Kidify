import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAdmin, handleOptions } from "@/lib/api-helpers"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req) ?? new NextResponse(null, { status: 204 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(req.headers.get("authorization") ?? null)
  if (unauthorized) return unauthorized

  try {
    const { id } = await params
    await supabase.from("gallery").delete().eq("id", id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
