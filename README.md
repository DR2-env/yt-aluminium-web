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

Two range descriptions were corrected by hand in `catalogue.json` (Security: "All 19 colours across the range"; Shopfront: "mostly in 6.5 m lengths"). Make the same change in `yt-catalogue.html` before regenerating, or they will revert.

## Languages

English is served at bare paths (`/products`); Chinese, Korean and Arabic at `/zh`, `/ko` and `/ar` (Arabic is right to left). `src/proxy.ts` maps bare paths to the English route.

- Interface text: `src/i18n/dictionaries/{en,zh,ko,ar}.ts`. English is the source; the others must provide every key (TypeScript enforces this).
- Catalogue text (product names, ranges, finishes, pack sizes): `src/i18n/catalogue/{zh,ko,ar}.ts`, keyed by the English text.
- `node scripts/check-translations.mjs` fails if any catalogue string is missing a translation.

Translations were machine-drafted and should be reviewed by a native speaker familiar with the trade terms.

## 3D models and product images

- Profiles are extruded from the sections traced from the price list.
- Hardware and accessories without a drawing (locks, hinges, rollers, corners, clips, brackets, curtain fittings) are representative parametric models in `src/components/three/models.ts`.
- `node scripts/check-models.mjs` fails if any product has no 3D model.
- Catalogue pictures in `public/renders/` are pre-rendered from those models. After changing a model or adding products, run `npm run dev`, open `/dev/renders` and click "Render and save" (development only).

## How quotes work

The quote list is stored in the visitor's browser. Sending it opens WhatsApp or email with a numbered list in YT codes, or copies it for WeChat. Nothing is sent to a server.

## Old Wix URLs

`next.config.ts` redirects the old `.html` pages (contact-us, about-us, our-products, new-stock) to the new routes.
