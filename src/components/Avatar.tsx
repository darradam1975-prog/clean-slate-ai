import { getAvatarStyle } from "@/lib/avatar-styles";
import type { AvatarKind } from "@/lib/identity";

type AvatarSize = "xs" | "sm" | "md" | "lg";

type AvatarProps = {
  kind: AvatarKind;
  style: string;
  username?: string;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
};

export function Avatar({
  kind,
  style,
  username,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = username
    ? username.replace(/\d+$/, "").slice(0, 2).toUpperCase()
    : style.slice(0, 2).toUpperCase();

  return (
    <span
      title={`${style} ${kind}`}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 font-semibold text-white shadow-md shadow-black/30 ${sizeClasses[size]} ${className}`}
      style={getAvatarStyle(kind, style)}
    >
      <span className="rounded-full bg-black/20 px-1 backdrop-blur-[1px]">
        {initials}
      </span>
    </span>
  );
}