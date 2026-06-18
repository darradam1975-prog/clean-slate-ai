export type VisualAiResult = {
  used: boolean;
  score: number;
  topGenerator: string | null;
  signals: string[];
};

function formatGenerator(name: string): string {
  return name.replace(/_/g, " ");
}

export async function detectVisualAi(
  buffer: Buffer,
  mimeType: string,
): Promise<VisualAiResult> {
  const empty: VisualAiResult = {
    used: false,
    score: 0,
    topGenerator: null,
    signals: [],
  };

  if (!mimeType.startsWith("image/")) return empty;

  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) return empty;

  try {
    const form = new FormData();
    const ext = mimeType.includes("png")
      ? "png"
      : mimeType.includes("webp")
        ? "webp"
        : mimeType.includes("gif")
          ? "gif"
          : "jpg";
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    form.append("media", blob, `upload.${ext}`);
    form.append("models", "genai");
    form.append("api_user", apiUser);
    form.append("api_secret", apiSecret);

    const response = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: form,
    });

    const data = (await response.json()) as {
      status?: string;
      type?: {
        ai_generated?: number;
        ai_generators?: Record<string, number>;
      };
    };

    if (!response.ok || data.status !== "success") {
      console.warn("Sightengine visual scan failed:", data);
      return empty;
    }

    const score = data.type?.ai_generated ?? 0;
    const signals: string[] = [];

    if (score > 0.05) {
      signals.push(`Visual scan: ${Math.round(score * 100)}% AI likelihood`);
    }

    let topGenerator: string | null = null;
    const generators = data.type?.ai_generators;
    if (generators) {
      let topScore = 0;
      for (const [name, value] of Object.entries(generators)) {
        if (value > topScore && value >= 0.25) {
          topScore = value;
          topGenerator = name;
        }
      }
      if (topGenerator) {
        signals.push(
          `Visual scan hint: possible ${formatGenerator(topGenerator)} output`,
        );
      }
    }

    return { used: true, score, topGenerator, signals };
  } catch (error) {
    console.error("Sightengine error:", error);
    return empty;
  }
}

export function isVisualAiConfigured(): boolean {
  return Boolean(
    process.env.SIGHTENGINE_API_USER && process.env.SIGHTENGINE_API_SECRET,
  );
}