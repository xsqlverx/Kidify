import { NextResponse } from "next/server"

export function requireAdmin(authHeader: string | null): NextResponse | null {
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  return null
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {}
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export function handleOptions(req: Request): NextResponse | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin")
    if (origin) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      })
    }
    return new NextResponse(null, { status: 204 })
  }
  return null
}
