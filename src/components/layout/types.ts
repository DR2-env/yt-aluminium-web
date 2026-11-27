import type { Locale } from "@/i18n/config";

export interface NavLink {
  href: string;
  label: string;
  /** Path as seen in English, used to mark the active item. */
  match: string;
}

export interface LayoutStrings {
  lang: Locale;
  home: string;
  nav: NavLink[];
  /** null while online quotes are switched off (see lib/features.ts). */
  quote: { href: string; label: string } | null;
  directions: string;
  menu: { open: string; close: string; language: string };
  call: string;
  whatsapp: string;
  hours: string;
  address: string;
}
