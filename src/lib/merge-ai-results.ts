import type { AiDetectionResult } from "@/lib/ai-detection";
import type { VisualAiResult } from "@/lib/visual-ai-detection";

const AI_THRESHOLD = 0.45;
const USER_DECLARED_CONFIDENCE = 0.85;

export function mergeAiResults(
  metadata: AiDetectionResult,
  visual: VisualAiResult,
  userDeclared: boolean,
): AiDetectionResult {
  const signals = [...metadata.signals, ...visual.signals];

  if (userDeclared) {
    signals.push("Creator labeled: AI-generated at upload");
  }

  let confidence = metadata.confidence;
  if (visual.used) {
    confidence = Math.max(confidence, visual.score);
  }
  if (userDeclared) {
    confidence = Math.max(confidence, USER_DECLARED_CONFIDENCE);
  }

  const isAiGenerated =
    userDeclared || metadata.isAiGenerated || confidence >= AI_THRESHOLD;

  return {
    isAiGenerated,
    confidence: Math.min(1, confidence),
    signals: [...new Set(signals)],
  };
}