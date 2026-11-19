import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-[background-color,color,border-color,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50";
const sizes = { md: "h-11 px-5", sm: "h-9 px-3.5 text-[13px]", lg: "h-12 px-6 text-[15px]" };
const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface text-ink hover:border-ink",
  ghost: "text-ink hover:bg-surface-2",
};

export function buttonClass(variant: Variant = "primary", size: keyof typeof sizes = "md", extra = "") {
  return `${base} ${sizes[size]} ${variants[variant]} ${extra}`;
}

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
}

export function LinkButton({ variant = "primary", size = "md", className = "", children, ...rest }: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
