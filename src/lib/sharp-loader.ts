import type sharp from "sharp";

type SharpFn = typeof sharp;

let cached: SharpFn | null | undefined;

export async function loadSharp(): Promise<SharpFn | null> {
  if (cached !== undefined) return cached;
  try {
    const mod = await import("sharp");
    cached = mod.default as SharpFn;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}