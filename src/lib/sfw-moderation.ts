import { loadSharp } from "@/lib/sharp-loader";

export type SfwModerationResult = {
  isSfw: boolean;
  confidence: number;
  signals: string[];
};

const NSFW_TITLE_KEYWORDS = [
  "nude",
  "naked",
  "nsfw",
  "porn",
  "xxx",
  "sex",
  "erotic",
  "hentai",
  "fetish",
  "explicit",
  "boob",
  "breast",
  "genital",
  "penis",
  "vagina",
  "asshole",
  "bikini",
  "lingerie",
  "onlyfans",
];

function isSkinTone(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 40 || min > 230) return false;

  const rg = r - g;
  const rb = r - b;
  return r > 95 && g > 40 && b > 20 && rg > 15 && r > g && r > b;
}

async function analyzeImagePixels(buffer: Buffer): Promise<{
  skinRatio: number;
  signals: string[];
}> {
  const signals: string[] = [];
  const sharp = await loadSharp();

  if (!sharp) {
    return { skinRatio: 0, signals };
  }

  try {
    const { data, info } = await sharp(buffer)
      .resize(320, 320, { fit: "inside", withoutEnlargement: true })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let skinPixels = 0;
    const totalPixels = info.width * info.height;

    for (let i = 0; i < data.length; i += 3) {
      if (isSkinTone(data[i], data[i + 1], data[i + 2])) {
        skinPixels++;
      }
    }

    const skinRatio = totalPixels > 0 ? skinPixels / totalPixels : 0;

    if (skinRatio > 0.42) {
      signals.push("High skin-tone pixel ratio");
    } else if (skinRatio > 0.28) {
      signals.push("Elevated skin-tone pixel ratio");
    }

    return { skinRatio, signals };
  } catch {
    return { skinRatio: 0, signals };
  }
}

function scoreFromSignals(
  signals: string[],
  skinRatio: number,
  title: string,
): { confidence: number; isSfw: boolean } {
  let unsafeScore = 0;

  const titleLower = title.toLowerCase();
  for (const keyword of NSFW_TITLE_KEYWORDS) {
    if (titleLower.includes(keyword)) {
      unsafeScore += 0.5;
      signals.push(`Title keyword flagged: ${keyword}`);
    }
  }

  if (skinRatio > 0.42) unsafeScore += 0.45;
  else if (skinRatio > 0.28) unsafeScore += 0.2;

  const confidence = Math.max(0, Math.min(1, 1 - unsafeScore));
  return { confidence, isSfw: unsafeScore < 0.45 };
}

export async function moderateImage(
  buffer: Buffer,
  title: string,
): Promise<SfwModerationResult> {
  const { skinRatio, signals } = await analyzeImagePixels(buffer);
  const { confidence, isSfw } = scoreFromSignals(signals, skinRatio, title);

  return {
    isSfw,
    confidence,
    signals: [...new Set(signals)],
  };
}

export async function moderateVideoFrame(
  frameBuffer: Buffer,
  title: string,
): Promise<SfwModerationResult> {
  return moderateImage(frameBuffer, title);
}

export function moderateTitleOnly(title: string): SfwModerationResult {
  const signals: string[] = [];
  const titleLower = title.toLowerCase();

  for (const keyword of NSFW_TITLE_KEYWORDS) {
    if (titleLower.includes(keyword)) {
      signals.push(`Title keyword flagged: ${keyword}`);
    }
  }

  const unsafe = signals.length > 0;
  return {
    isSfw: !unsafe,
    confidence: unsafe ? 0.2 : 0.85,
    signals,
  };
}