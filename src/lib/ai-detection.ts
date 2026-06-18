import exifr from "exifr";
import { loadSharp } from "@/lib/sharp-loader";

export type AiDetectionResult = {
  isAiGenerated: boolean;
  confidence: number;
  signals: string[];
};

const AI_METADATA_MARKERS = [
  "midjourney",
  "dall-e",
  "dalle",
  "stable diffusion",
  "stablediffusion",
  "comfyui",
  "automatic1111",
  "novelai",
  "leonardo",
  "firefly",
  "ideogram",
  "flux",
  "sdxl",
  "openai",
  "generative fill",
  "adobe firefly",
  "imagen",
  "c2pa",
  "trainedalgorithmicmedia",
  "digital source type",
  "created by ai",
  "ai generated",
  "synthetic",
];

const AI_PNG_TEXT_KEYS = [
  "parameters",
  "prompt",
  "negative prompt",
  "workflow",
  "comfy",
  "sd-metadata",
];

function containsAiMarker(text: string): string | null {
  const lower = text.toLowerCase();
  for (const marker of AI_METADATA_MARKERS) {
    if (lower.includes(marker)) return marker;
  }
  return null;
}

function scanRawText(buffer: Buffer): string[] {
  const signals: string[] = [];
  const text = buffer.toString("latin1").toLowerCase();

  for (const marker of AI_METADATA_MARKERS) {
    if (text.includes(marker)) {
      signals.push(`Embedded marker: ${marker}`);
    }
  }

  for (const key of AI_PNG_TEXT_KEYS) {
    if (text.includes(key)) {
      signals.push(`PNG/text chunk hint: ${key}`);
    }
  }

  if (text.includes("jumbf") || text.includes("c2pa")) {
    signals.push("C2PA content credentials manifest detected");
  }

  return signals;
}

async function analyzeImageStats(buffer: Buffer): Promise<string[]> {
  const signals: string[] = [];
  const sharp = await loadSharp();
  if (!sharp) return signals;

  try {
    const { data, info } = await sharp(buffer)
      .resize(256, 256, { fit: "inside", withoutEnlargement: true })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = info.width * info.height;
    if (pixels === 0) return signals;

    let smoothTransitions = 0;
    let highFreqNoise = 0;

    for (let i = 0; i < data.length - 12; i += 12) {
      const r1 = data[i];
      const g1 = data[i + 1];
      const b1 = data[i + 2];
      const r2 = data[i + 4];
      const g2 = data[i + 5];
      const b2 = data[i + 6];

      const delta =
        Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

      if (delta < 8) smoothTransitions++;
      if (delta > 80) highFreqNoise++;
    }

    const samples = Math.floor(data.length / 12);
    const smoothRatio = smoothTransitions / samples;
    const noiseRatio = highFreqNoise / samples;

    if (smoothRatio > 0.72 && noiseRatio < 0.02) {
      signals.push("Unusually smooth tonal gradients (common in diffusion output)");
    }

    if (noiseRatio > 0.08 && smoothRatio < 0.45) {
      signals.push("Sensor-like high-frequency noise pattern (likely camera capture)");
    }
  } catch {
    // Non-image buffers fall through to other checks.
  }

  return signals;
}

async function analyzeMetadata(buffer: Buffer, mimeType: string): Promise<string[]> {
  const signals: string[] = [];

  try {
    const exif = await exifr.parse(buffer, { xmp: true, iptc: true, icc: true });
    if (exif) {
      const serialized = JSON.stringify(exif);
      const marker = containsAiMarker(serialized);
      if (marker) signals.push(`EXIF/XMP marker: ${marker}`);

      const software = String(exif.Software ?? exif.CreatorTool ?? "");
      if (software) {
        const softwareMarker = containsAiMarker(software);
        if (softwareMarker) signals.push(`Software tag: ${software}`);
      }
    }
  } catch {
    // Metadata may be absent on AI exports.
  }

  if (mimeType.startsWith("image/")) {
    const sharp = await loadSharp();
    if (sharp) {
      try {
        const meta = await sharp(buffer).metadata();
        if (meta.exif) {
          const exifText = meta.exif.toString("latin1").toLowerCase();
          const marker = containsAiMarker(exifText);
          if (marker) signals.push(`EXIF binary marker: ${marker}`);
        }
      } catch {
        // Ignore sharp metadata failures.
      }
    }
  }

  return signals;
}

function scoreFromSignals(signals: string[]): { confidence: number; isAi: boolean } {
  let score = 0;

  for (const signal of signals) {
    const lower = signal.toLowerCase();
    if (
      lower.includes("c2pa") ||
      lower.includes("parameters") ||
      lower.includes("prompt") ||
      lower.includes("software tag") ||
      lower.includes("embedded marker")
    ) {
      score += 0.45;
    } else if (lower.includes("smooth tonal")) {
      score += 0.2;
    } else if (lower.includes("sensor-like")) {
      score -= 0.25;
    } else {
      score += 0.15;
    }
  }

  const confidence = Math.max(0, Math.min(1, score));
  return { confidence, isAi: confidence >= 0.45 };
}

export async function detectAiContent(
  buffer: Buffer,
  mimeType: string,
): Promise<AiDetectionResult> {
  const signals = [
    ...scanRawText(buffer),
    ...(await analyzeMetadata(buffer, mimeType)),
    ...(await analyzeImageStats(buffer)),
  ];

  const uniqueSignals = [...new Set(signals)];
  const { confidence, isAi } = scoreFromSignals(uniqueSignals);

  return {
    isAiGenerated: isAi,
    confidence,
    signals: uniqueSignals,
  };
}