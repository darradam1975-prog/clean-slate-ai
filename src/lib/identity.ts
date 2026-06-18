export const COLORS = [
  "Crimson",
  "Azure",
  "Emerald",
  "Violet",
  "Amber",
  "Indigo",
  "Coral",
  "Teal",
  "Ruby",
  "Sapphire",
  "Jade",
  "Plum",
  "Gold",
  "Silver",
  "Bronze",
  "Copper",
  "Onyx",
  "Ivory",
  "Scarlet",
  "Cobalt",
  "Magenta",
  "Cyan",
  "Olive",
  "Maroon",
  "Navy",
  "Peach",
  "Mint",
  "Rose",
  "Slate",
  "Charcoal",
] as const;

export const PATTERNS = [
  "Striped",
  "Dotted",
  "Plaid",
  "Chevron",
  "Houndstooth",
  "Paisley",
  "Argyle",
  "Floral",
  "Geometric",
  "Marbled",
  "Speckled",
  "Woven",
  "Zigzag",
  "Lattice",
  "Herringbone",
  "Checkered",
  "Swirled",
  "Rippled",
  "Mosaic",
  "Tiled",
] as const;

export type ColorName = (typeof COLORS)[number];
export type PatternName = (typeof PATTERNS)[number];
export type AvatarKind = "color" | "pattern";

export type RandomAvatar = {
  avatarKind: AvatarKind;
  avatarStyle: string;
};

function pickFrom<T extends readonly string[]>(pool: T): T[number] {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateRandomAvatar(): RandomAvatar {
  const useColor = Math.random() < 0.5;
  return {
    avatarKind: useColor ? "color" : "pattern",
    avatarStyle: useColor ? pickFrom(COLORS) : pickFrom(PATTERNS),
  };
}

export const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  avatarKind: true,
  avatarStyle: true,
  createdAt: true,
} as const;