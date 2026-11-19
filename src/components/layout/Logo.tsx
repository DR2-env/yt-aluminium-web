import Link from "next/link";

// Text wordmark until YT's own logo file is supplied.
export function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="YT Aluminium">
      <span className="grid h-7 w-9 place-items-center rounded bg-ink font-mono text-xs font-bold text-bg">YT</span>
      <span className="text-[15px] font-semibold">YT Aluminium</span>
    </Link>
  );
}
