import Link from "next/link";

// Placeholder wordmark until YT's own logo file is supplied.
export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="YT Aluminium, home">
      <span className="grid size-8 place-items-center rounded-lg bg-ink font-mono text-[13px] font-bold tracking-tight text-bg">
        YT
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Aluminium</span>
    </Link>
  );
}
