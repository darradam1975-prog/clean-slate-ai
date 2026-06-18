export type AiLabelTone = "ai" | "uncertain" | "neutral";

export type AiLabel = {
  badge: string;
  hint: string;
  tone: AiLabelTone;
};

export function getAiLabel(isAiGenerated: boolean, confidence: number): AiLabel {
  const percent = Math.round(confidence * 100);

  if (isAiGenerated) {
    if (confidence >= 0.7) {
      return {
        badge: "AI-generated",
        hint: `${percent}% AI likelihood`,
        tone: "ai",
      };
    }
    return {
      badge: "Likely AI",
      hint: `${percent}% AI likelihood`,
      tone: "ai",
    };
  }

  if (confidence >= 0.25) {
    return {
      badge: "Uncertain",
      hint: `${percent}% AI likelihood — below detection threshold`,
      tone: "uncertain",
    };
  }

  if (confidence > 0) {
    return {
      badge: "No strong signals",
      hint: `${percent}% AI likelihood — realistic AI may lack hints`,
      tone: "neutral",
    };
  }

  return {
    badge: "No scan hits",
    hint: "No metadata found — realistic AI can look untouched",
    tone: "neutral",
  };
}

export const aiLabelToneClasses: Record<AiLabelTone, string> = {
  ai: "bg-fuchsia-500/80 text-white",
  uncertain: "bg-amber-500/80 text-white",
  neutral: "bg-zinc-700/85 text-zinc-100",
};