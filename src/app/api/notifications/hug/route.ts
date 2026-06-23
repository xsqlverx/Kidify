import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_API = "https://api.telegram.org/bot";
const HUG_MESSAGES = [
  "a hug was just sent. the bear felt it all the way here. 🤍",
  "someone just sent a hug. it landed safely. 🧸",
  "hug delivered. warmth received. always. 🤍",
  "a squeeze just travelled through the air and arrived. right here. 🤍",
  "the bear just got a hug. he's smiling. you should see it. 🐻",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.type !== "hug" || !body.count) {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TARGET_CHAT_ID;

    if (!token || !chatId) {
      console.warn("Telegram env vars not configured");
      return NextResponse.json({ error: "not configured" }, { status: 500 });
    }

    const origin = req.headers.get("origin") || "";
    const hugUrl = `${origin}/hug`;

    const msg = HUG_MESSAGES[Math.floor(Math.random() * HUG_MESSAGES.length)];
    const text = `${msg}\n\nthat's ${body.count} ${body.count === 1 ? "hug" : "hugs"} so far.`;

    const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: Number(chatId),
        text,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "💗 send a hug back", url: hugUrl },
          ]],
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram API error:", err);
      return NextResponse.json({ error: "telegram error" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Hug notification error:", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
