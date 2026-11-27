// Feature switches. NEXT_PUBLIC_ values are baked in at build time, on the server and in the browser.

/**
 * Online quote requests (quote page, "Add to quote", header button, /api/quote).
 * Off on the live site until it is ready; always on in local development so work can continue.
 * Turn it on for a deployment by setting NEXT_PUBLIC_QUOTE_ENABLED=true in Vercel (e.g. Preview only).
 */
export const QUOTE_ENABLED = process.env.NEXT_PUBLIC_QUOTE_ENABLED === "true" || process.env.NODE_ENV === "development";
