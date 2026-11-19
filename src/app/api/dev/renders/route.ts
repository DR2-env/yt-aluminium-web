// Development-only endpoint: saves pre-rendered product images into public/renders.
// Disabled in production builds.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  const { slug, dataUrl } = (await request.json()) as { slug?: string; dataUrl?: string };
  if (!slug || !/^[a-z0-9-]+$/.test(slug) || !dataUrl?.startsWith("data:image/webp;base64,")) {
    return new Response("Bad request", { status: 400 });
  }
  const dir = join(process.cwd(), "public", "renders");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${slug}.webp`), Buffer.from(dataUrl.split(",")[1], "base64"));
  return Response.json({ ok: true });
}
