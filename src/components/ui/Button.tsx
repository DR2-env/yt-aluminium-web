import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";
const sizes = { md: "h-10 px-4", sm: "h-9 px-3", lg: "h-11 px-5" };
const variants: Record<Variant, string> = {
  primary: "bg-brand text-accent-ink hover:brightness-110",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-surface-2",
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
