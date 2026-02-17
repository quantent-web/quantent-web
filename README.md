This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Responsive design checklist (home/styles)

Use this checklist before merging visual/style changes to reduce regressions:

- Typography
  - [ ] Confirm `h2` is controlled by the global `h2` selector (avoid redefining size/line-height in `.section-title`).
  - [ ] Verify body copy (`p`, `.section-lead`) stays at `18px / 32px`.
  - [ ] Verify secondary copy (`.muted`, `.card-text`, `.section-note`) stays at `16px / 26px`.

- Desktop review (`>= 641px`)
  - [ ] Confirm `.container` horizontal padding is `10%` on both sides.
  - [ ] Confirm card padding is `var(--space-8)`.
  - [ ] Confirm hero title and section headings keep expected rhythm (no clipping/overlap).

- Mobile review (`<= 640px`)
  - [ ] Confirm `.container` uses `var(--space-5)` side padding.
  - [ ] Confirm `h2` scales to `40px / 48px`.
  - [ ] Confirm hero title scales to `48px / 56px`.
  - [ ] Confirm cards use `var(--space-7)` and centered content.

- Interaction/smoke checks
  - [ ] Toggle light/dark themes and verify text contrast remains readable.
  - [ ] Check nav open/close behavior at narrow widths.
  - [ ] Scroll through all sections and verify no text overflow at common breakpoints (640, 768, 1024, 1280).
