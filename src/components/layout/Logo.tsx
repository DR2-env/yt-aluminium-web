import Link from "next/link";

// Text wordmark until YT's own logo file is supplied.
export function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className="text-[17px] font-semibold tracking-tight" aria-label="YT Aluminium">
      YT Aluminium
    </Link>
  );
}
