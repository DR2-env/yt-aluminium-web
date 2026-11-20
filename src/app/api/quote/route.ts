// Receives a quote request from the website and emails it to YT through Resend.
// Configuration (Vercel environment variables):
//   RESEND_API_KEY      API key from resend.com (required to send)
//   QUOTE_TO_EMAIL      where requests go (defaults to the business email)
//   QUOTE_FROM_EMAIL    sender, e.g. "YT Aluminium website <quotes@ytaluminium.com>" once the domain is verified
import { SITE } from "@/lib/site";
import { MAX_PHOTO_BYTES, type QuoteRequest } from "@/lib/quote-request";

const LANGS: Record<string, string> = { en: "English", zh: "Chinese", ko: "Korean", ar: "Arabic" };
const clip = (s: unknown, max: number) => (typeof s === "string" ? s.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: QuoteRequest;
  try {
    body = (await request.json()) as QuoteRequest;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // Bots fill every field; people never see this one.
  if (clip(body.website, 200)) return Response.json({ ok: true });

  const name = clip(body.name, 120);
  const phone = clip(body.phone, 40);
  const list = clip(body.list, 5000);
  const lines = Array.isArray(body.lines) ? body.lines.slice(0, 200).map((l) => clip(l, 300)).filter(Boolean) : [];
  const photo = body.photo && typeof body.photo.dataUrl === "string" ? body.photo : undefined;

  if (!name || !phone) return Response.json({ error: "missing_details" }, { status: 400 });
  if (!list && !lines.length && !photo) return Response.json({ error: "empty" }, { status: 400 });

  let attachment: { filename: string; content: string } | undefined;
  if (photo) {
    const m = /^data:(image\/(?:jpeg|png|webp|heic)|application\/pdf);base64,(.+)$/.exec(photo.dataUrl);
    if (!m) return Response.json({ error: "bad_photo" }, { status: 400 });
    if ((m[2].length * 3) / 4 > MAX_PHOTO_BYTES) return Response.json({ error: "photo_too_large" }, { status: 413 });
    const ext = m[1] === "application/pdf" ? "pdf" : m[1].split("/")[1].replace("jpeg", "jpg");
    attachment = { filename: `list-${name.replace(/[^\w-]+/g, "-").slice(0, 30)}.${ext}`, content: m[2] };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return Response.json({ error: "not_configured" }, { status: 503 });

  const when = new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short" });
  const text = [
    `Quote request from the website (${when})`,
    "",
    ...(lines.length ? ["Items from the catalogue:", ...lines, ""] : []),
    ...(list ? ["Their list:", list, ""] : []),
    ...(attachment ? ["Photo of their list attached.", ""] : []),
    `Name: ${name}`,
    clip(body.company, 120) ? `Company: ${clip(body.company, 120)}` : null,
    `Phone: ${phone}`,
    body.delivery === "collect" ? "Pick up from Milperra" : `Deliver to: ${clip(body.suburb, 80) || "(suburb to confirm)"}`,
    clip(body.notes, 1000) ? `Notes: ${clip(body.notes, 1000)}` : null,
    `Website language: ${LANGS[body.lang] ?? "English"}`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.QUOTE_FROM_EMAIL || "YT Aluminium website <onboarding@resend.dev>",
      to: [process.env.QUOTE_TO_EMAIL || SITE.email],
      subject: `Quote request: ${name}${lines.length ? ` (${lines.length} items)` : ""}`,
      text,
      attachments: attachment ? [attachment] : undefined,
    }),
  });
  if (!res.ok) return Response.json({ error: "send_failed" }, { status: 502 });
  return Response.json({ ok: true });
}
