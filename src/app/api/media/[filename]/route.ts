import { NextResponse } from "next/server";
import { readMediaFile } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;

  const media = await readMediaFile(filename);
  if (!media) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(media.buffer), {
    headers: {
      "Content-Type": media.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}