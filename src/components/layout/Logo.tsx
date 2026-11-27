import Link from "next/link";

// Current YT emblem plus the name, sized to be noticed in the header. Swap the emblem file
// (public/brand/yt-emblem.png) when the new logo is chosen.
export function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="YT Aluminium">
      {/* eslint-disable-next-line @next/next/no-img-element -- small static PNG, no optimisation needed */}
      <img src="/brand/yt-emblem.png" alt="" width={36} height={36} className="size-9" />
      <span className="text-[19px] font-semibold tracking-tight text-ink">YT Aluminium</span>
    </Link>
  );
}
