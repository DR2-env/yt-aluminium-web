// Shape of a quote request sent from the website to /api/quote.
export interface QuoteRequest {
  name: string;
  company?: string;
  phone: string;
  delivery: "deliver" | "collect";
  suburb?: string;
  notes?: string;
  /** Free-text list typed by the customer. */
  list?: string;
  /** Items added from the catalogue, already written as numbered lines in English. */
  lines: string[];
  photo?: { name: string; type: string; dataUrl: string };
  /** Page language, so staff know which language to reply in. */
  lang: string;
  /** Honeypot field: real people leave it empty. */
  website?: string;
}

export const MAX_PHOTO_BYTES = 3_500_000; // after in-browser compression; keeps the request under Vercel's 4.5 MB limit
