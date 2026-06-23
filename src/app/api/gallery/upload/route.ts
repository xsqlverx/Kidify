import { NextRequest, NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"
import { supabase } from "@/lib/supabase"
import { requireAdmin, corsHeaders, handleOptions } from "@/lib/api-helpers"

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req) ?? new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin")
  const unauthorized = requireAdmin(req.headers.get("authorization") ?? null)
  if (unauthorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: corsHeaders(origin) })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("image") as File | null
    if (!file) {
      return NextResponse.json({ error: "missing image" }, { status: 400, headers: corsHeaders(origin) })
    }

    const caption = (formData.get("caption") as string) || ""
    const date = (formData.get("date") as string) || new Date().toISOString().slice(0, 10)

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const dataUri = `data:${file.type};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "kidify/gallery",
    })

    const image = {
      url: result.secure_url,
      cloudinary_id: result.public_id,
      caption,
      date,
    }

    const { data } = await supabase.from("gallery").insert(image).select().single()

    return NextResponse.json({ success: true, id: data?.id, url: result.secure_url }, { headers: corsHeaders(origin) })
  } catch {
    return NextResponse.json({ error: "upload_failed" }, { status: 500, headers: corsHeaders(origin) })
  }
}
