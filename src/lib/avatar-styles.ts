import type { AvatarKind } from "@/lib/identity";
import type { CSSProperties } from "react";

type ColorPalette = {
  base: string;
  highlight: string;
  shadow: string;
};

const COLOR_PALETTES: Record<string, ColorPalette> = {
  Crimson: { base: "#b91c1c", highlight: "#fca5a5", shadow: "#7f1d1d" },
  Azure: { base: "#2563eb", highlight: "#93c5fd", shadow: "#1e3a8a" },
  Emerald: { base: "#059669", highlight: "#6ee7b7", shadow: "#064e3b" },
  Violet: { base: "#7c3aed", highlight: "#c4b5fd", shadow: "#4c1d95" },
  Amber: { base: "#d97706", highlight: "#fcd34d", shadow: "#92400e" },
  Indigo: { base: "#4f46e5", highlight: "#a5b4fc", shadow: "#312e81" },
  Coral: { base: "#f97316", highlight: "#fdba74", shadow: "#9a3412" },
  Teal: { base: "#0d9488", highlight: "#5eead4", shadow: "#134e4a" },
  Ruby: { base: "#e11d48", highlight: "#fda4af", shadow: "#9f1239" },
  Sapphire: { base: "#1d4ed8", highlight: "#60a5fa", shadow: "#1e3a8a" },
  Jade: { base: "#0f766e", highlight: "#2dd4bf", shadow: "#115e59" },
  Plum: { base: "#9333ea", highlight: "#d8b4fe", shadow: "#581c87" },
  Gold: { base: "#ca8a04", highlight: "#fde047", shadow: "#854d0e" },
  Silver: { base: "#64748b", highlight: "#cbd5e1", shadow: "#334155" },
  Bronze: { base: "#b45309", highlight: "#fbbf24", shadow: "#78350f" },
  Copper: { base: "#c2410c", highlight: "#fb923c", shadow: "#7c2d12" },
  Onyx: { base: "#18181b", highlight: "#52525b", shadow: "#09090b" },
  Ivory: { base: "#fef3c7", highlight: "#fffbeb", shadow: "#d6d3d1" },
  Scarlet: { base: "#dc2626", highlight: "#f87171", shadow: "#991b1b" },
  Cobalt: { base: "#1e40af", highlight: "#3b82f6", shadow: "#1e3a8a" },
  Magenta: { base: "#c026d3", highlight: "#f0abfc", shadow: "#86198f" },
  Cyan: { base: "#0891b2", highlight: "#67e8f9", shadow: "#155e75" },
  Olive: { base: "#4d7c0f", highlight: "#a3e635", shadow: "#365314" },
  Maroon: { base: "#881337", highlight: "#fb7185", shadow: "#4c0519" },
  Navy: { base: "#1e3a8a", highlight: "#60a5fa", shadow: "#172554" },
  Peach: { base: "#fb7185", highlight: "#fecdd3", shadow: "#be123c" },
  Mint: { base: "#34d399", highlight: "#a7f3d0", shadow: "#047857" },
  Rose: { base: "#f43f5e", highlight: "#fda4af", shadow: "#be123c" },
  Slate: { base: "#475569", highlight: "#94a3b8", shadow: "#1e293b" },
  Charcoal: { base: "#27272a", highlight: "#71717a", shadow: "#09090b" },
};

const PATTERN_PALETTES: Record<string, [string, string, string]> = {
  Striped: ["#6366f1", "#a5b4fc", "#4338ca"],
  Dotted: ["#ec4899", "#f9a8d4", "#be185d"],
  Plaid: ["#16a34a", "#86efac", "#14532d"],
  Chevron: ["#f59e0b", "#fde68a", "#b45309"],
  Houndstooth: ["#111827", "#f3f4f6", "#374151"],
  Paisley: ["#8b5cf6", "#ddd6fe", "#5b21b6"],
  Argyle: ["#ef4444", "#fecaca", "#991b1b"],
  Floral: ["#f472b6", "#fbcfe8", "#db2777"],
  Geometric: ["#06b6d4", "#a5f3fc", "#0e7490"],
  Marbled: ["#a78bfa", "#ede9fe", "#6d28d9"],
  Speckled: ["#84cc16", "#d9f99d", "#3f6212"],
  Woven: ["#d97706", "#fed7aa", "#9a3412"],
  Zigzag: ["#14b8a6", "#99f6e4", "#0f766e"],
  Lattice: ["#3b82f6", "#bfdbfe", "#1d4ed8"],
  Herringbone: ["#78716c", "#e7e5e4", "#44403c"],
  Checkered: ["#0f172a", "#e2e8f0", "#334155"],
  Swirled: ["#e879f9", "#f5d0fe", "#a21caf"],
  Rippled: ["#38bdf8", "#bae6fd", "#0369a1"],
  Mosaic: ["#f97316", "#fdba74", "#c2410c"],
  Tiled: ["#22c55e", "#bbf7d0", "#15803d"],
};

function patternBackground(name: string, colors: [string, string, string]): string {
  const [a, b, c] = colors;

  switch (name) {
    case "Striped":
      return `repeating-linear-gradient(45deg, ${a}, ${a} 10px, ${b} 10px, ${b} 20px)`;
    case "Dotted":
      return `radial-gradient(circle, ${c} 18%, transparent 19%), radial-gradient(circle, ${a} 18%, transparent 19%), ${b}`;
    case "Plaid":
      return `linear-gradient(90deg, ${a} 50%, ${b} 50%), linear-gradient(${a} 50%, ${b} 50%)`;
    case "Chevron":
      return `repeating-linear-gradient(135deg, ${a} 0 12px, ${b} 12px 24px, ${c} 24px 36px)`;
    case "Houndstooth":
      return `conic-gradient(from 45deg, ${a} 0 25%, ${b} 0 50%, ${a} 0 75%, ${b} 0 100%)`;
    case "Argyle":
      return `repeating-linear-gradient(120deg, ${a} 0 16px, ${b} 16px 32px, ${c} 32px 48px)`;
    case "Geometric":
      return `linear-gradient(30deg, ${a} 12%, transparent 12%), linear-gradient(150deg, ${b} 12%, transparent 12%), linear-gradient(90deg, ${c} 12%, transparent 12%)`;
    case "Marbled":
      return `radial-gradient(circle at 20% 20%, ${b}, transparent 45%), radial-gradient(circle at 80% 70%, ${a}, transparent 40%), ${c}`;
    case "Speckled":
      return `radial-gradient(${a} 1.5px, transparent 1.6px), radial-gradient(${c} 1.5px, transparent 1.6px), ${b}`;
    case "Zigzag":
      return `linear-gradient(135deg, ${a} 25%, transparent 25%) -12px 0, linear-gradient(225deg, ${c} 25%, transparent 25%) -12px 0, ${b}`;
    case "Lattice":
      return `linear-gradient(${a} 2px, transparent 2px), linear-gradient(90deg, ${a} 2px, transparent 2px), ${b}`;
    case "Herringbone":
      return `repeating-linear-gradient(90deg, ${a} 0 10px, ${b} 10px 20px), repeating-linear-gradient(0deg, ${c} 0 10px, transparent 10px 20px)`;
    case "Checkered":
      return `conic-gradient(${a} 90deg, ${b} 0 180deg, ${a} 0 270deg, ${b} 0)`;
    case "Swirled":
      return `conic-gradient(from 180deg at 50% 50%, ${a}, ${b}, ${c}, ${a})`;
    case "Rippled":
      return `repeating-radial-gradient(circle at 50% 50%, ${a}, ${b} 12px, ${c} 24px)`;
    case "Mosaic":
      return `linear-gradient(45deg, ${a} 25%, transparent 25%), linear-gradient(-45deg, ${c} 25%, transparent 25%), ${b}`;
    case "Tiled":
      return `linear-gradient(${a} 2px, transparent 2px), linear-gradient(90deg, ${a} 2px, transparent 2px), ${b}`;
    case "Floral":
      return `radial-gradient(circle at 30% 30%, ${b} 0 18%, transparent 19%), radial-gradient(circle at 70% 60%, ${a} 0 16%, transparent 17%), ${c}`;
    case "Paisley":
      return `radial-gradient(ellipse at top left, ${b}, transparent 55%), radial-gradient(ellipse at bottom right, ${a}, transparent 50%), ${c}`;
    case "Woven":
    default:
      return `repeating-linear-gradient(0deg, ${a}, ${a} 8px, ${b} 8px 16px), repeating-linear-gradient(90deg, ${c}, ${c} 8px, transparent 8px 16px)`;
  }
}

export function getAvatarStyle(
  kind: AvatarKind,
  style: string,
): CSSProperties {
  if (kind === "color") {
    const palette = COLOR_PALETTES[style] ?? COLOR_PALETTES.Violet;
    return {
      background: `radial-gradient(circle at 30% 25%, ${palette.highlight}, transparent 42%), radial-gradient(circle at 70% 75%, ${palette.shadow}, transparent 45%), linear-gradient(145deg, ${palette.base}, ${palette.shadow})`,
    };
  }

  const colors = PATTERN_PALETTES[style] ?? PATTERN_PALETTES.Striped;
  const background = patternBackground(style, colors);
  const backgroundSize =
    style === "Dotted" || style === "Speckled"
      ? "18px 18px, 18px 18px, 100% 100%"
      : style === "Plaid"
        ? "24px 24px, 24px 24px"
        : style === "Lattice" || style === "Tiled"
          ? "16px 16px, 16px 16px, 100% 100%"
          : style === "Zigzag"
            ? "24px 24px, 24px 24px, 100% 100%"
            : style === "Mosaic"
              ? "20px 20px, 20px 20px, 100% 100%"
              : undefined;

  return {
    background,
    backgroundSize,
  };
}