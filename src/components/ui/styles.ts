export type ButtonVariant =
  | "primary"
  | "accent"
  | "outline"
  | "subtle"
  | "ghost"
  | "danger"
  | "onDark"
  | "glass";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export const buttonVariantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-bone hover:bg-ink-2 focus-visible:outline-ink disabled:hover:bg-ink",
  accent:
    "bg-vermilion text-white hover:bg-[#e13d12] focus-visible:outline-vermilion disabled:hover:bg-vermilion",
  outline:
    "border border-line bg-transparent text-ink hover:border-ink hover:bg-paper focus-visible:outline-ink",
  subtle:
    "bg-bone-2 text-ink hover:bg-line-soft focus-visible:outline-ink disabled:hover:bg-bone-2",
  ghost:
    "text-ink-2 hover:bg-bone-2 hover:text-ink focus-visible:outline-ink disabled:hover:bg-transparent",
  danger:
    "bg-crimson text-white hover:bg-[#930d25] focus-visible:outline-crimson disabled:hover:bg-crimson",
  onDark: "bg-bone text-ink hover:bg-white focus-visible:outline-bone",
  glass:
    "border border-white/25 bg-white/10 text-bone backdrop-blur hover:bg-white/20 focus-visible:outline-white",
};

export const buttonSizeClass: Record<ButtonSize, string> = {
  xs: "h-8 px-3 text-[11px]",
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-[13px]",
  lg: "h-13 px-7 text-sm",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "active:scale-[0.98]",
    buttonVariantClass[variant],
    buttonSizeClass[size],
    extra,
  ].join(" ");
}

export const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 transition-colors focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10";

export const labelClass = "micro block text-[9px] text-ink/45";
