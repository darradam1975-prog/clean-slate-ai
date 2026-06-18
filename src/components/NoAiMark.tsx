type NoAiMarkProps = {
  className?: string;
};

export function NoAiMark({ className = "" }: NoAiMarkProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    >
      <span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-1 text-xs font-bold tracking-[0.2em] text-white/85 backdrop-blur-sm">
        noAI
      </span>
      <span className="absolute left-3 top-3 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.15em] text-white/70 backdrop-blur-sm">
        noAI
      </span>
    </div>
  );
}