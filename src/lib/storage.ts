import { getStore } from "@netlify/blobs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export function isNetlifyRuntime(): boolean {
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.NETLIFY_DB_URL,
  );
}

async function ensureUploadDir(): Promise<void> {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveMediaFile(
  filename: string,
  buffer: Buffer,
  mimeType: string,
): Promise<void> {
  if (isNetlifyRuntime()) {
    const store = getStore({ name: "media", consistency: "strong" });
    const bytes = Uint8Array.from(buffer);
    await store.set(filename, new Blob([bytes], { type: mimeType }), {
      metadata: { contentType: mimeType },
    });
    return;
  }

  await ensureUploadDir();
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
}

export async function readMediaFile(filename: string): Promise<{
  buffer: Buffer;
  mimeType: string;
} | null> {
  const safeName = path.basename(filename);

  if (isNetlifyRuntime()) {
    const store = getStore({ name: "media", consistency: "eventual" });
    const result = await store.getWithMetadata(safeName, { type: "arrayBuffer" });

    if (!result || !result.data) return null;

    const mimeType =
      typeof result.metadata?.contentType === "string"
        ? result.metadata.contentType
        : mimeFromExtension(safeName);

    return {
      buffer: Buffer.from(result.data),
      mimeType,
    };
  }

  try {
    const buffer = await readFile(path.join(UPLOAD_DIR, safeName));
    return { buffer, mimeType: mimeFromExtension(safeName) };
  } catch {
    return null;
  }
}

function mimeFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
}