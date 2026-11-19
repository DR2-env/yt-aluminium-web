# YT Aluminium website

Next.js 16 (App Router, Cache Components), Tailwind v4, three.js. Every page is prerendered from the price list data, so there is no database or backend to run.

## Run locally

```bash
npm install
npm run dev
```

## Where things live

- `src/data/catalogue.json` holds ranges, products, finishes per product and traced profile sections. Generated, do not hand edit.
- `public/products/` holds the product photos cut out of the price list.
- `src/lib/site.ts` holds phone numbers, address, hours and WhatsApp number.
- `src/lib/finishes.ts` holds the 19 finishes and their display colours.

## Updating the catalogue after a new price list

The catalogue data comes from `yt-catalogue.html` (built from the 16/02/2026 price list). After that file is updated, regenerate:

```bash
node scripts/extract-catalogue.mjs "/path/to/yt-catalogue.html"
```

## How quotes work

The quote list is stored in the visitor's browser. Sending it opens WhatsApp or email with a numbered list in YT codes, or copies it for WeChat. Nothing is sent to a server.

## Old Wix URLs

`next.config.ts` redirects the old `.html` pages (contact-us, about-us, our-products, new-stock) to the new routes.
