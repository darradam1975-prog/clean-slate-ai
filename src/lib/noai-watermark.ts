import { loadSharp } from "@/lib/sharp-loader";

type WatermarkResult = {
  buffer: Buffer;
  mimeType: string;
  watermarked: boolean;
};

export async function applyNoAiWatermark(
  buffer: Buffer,
  mimeType: string,
): Promise<WatermarkResult> {
  if (!mimeType.startsWith("image/") || mimeType === "image/gif") {
    return { buffer, mimeType, watermarked: false };
  }

  const sharp = await loadSharp();
  if (!sharp) return { buffer, mimeType, watermarked: false };

  try {
    const image = sharp(buffer);
    const meta = await image.metadata();
    const width = meta.width ?? 800;
    const height = meta.height ?? 600;
    const fontSize = Math.max(14, Math.round(Math.min(width, height) * 0.045));
    const smallSize = Math.max(10, Math.round(fontSize * 0.65));
    const pad = Math.round(fontSize * 0.6);

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .mark { fill: rgba(255,255,255,0.42); font-family: Arial, Helvetica, sans-serif; font-weight: 700; }
        </style>
        <text x="${width - pad}" y="${height - pad}" text-anchor="end" class="mark" font-size="${fontSize}">noAI</text>
        <text x="${pad}" y="${pad + smallSize}" class="mark" font-size="${smallSize}">noAI</text>
      </svg>
    `;

    const output = await image
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .toBuffer();

    return { buffer: output, mimeType, watermarked: true };
  } catch {
    return { buffer, mimeType, watermarked: false };
  }
}