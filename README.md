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

## Contact forms (production setup)

### Endpoints in this project
- `POST /api/contact`: used by the Contact Stepper modal and inline contact form.
- `POST /api/newsletter`: used by the footer newsletter form.

### Vercel environment variables
In **Vercel → Project Settings → Environment Variables**, define these values for Production (and Preview if needed):

- `SMTP_HOST` = your SMTP host (example: `smtp.sendgrid.net`)
- `SMTP_PORT` = your SMTP port (`587` for STARTTLS or `465` for SMTPS)
- `SMTP_USER` = SMTP username
- `SMTP_PASS` = SMTP password or API key
- `CONTACT_TO` = `aaron.fajardo@quant-ent.com`
- `CONTACT_FROM` = `no-reply@quant-ent.com` (or a sender address explicitly allowed by your SMTP provider)

> Do not hardcode credentials in code. Use environment variables only.

### SMTP provider notes
If you do not already have a provider, any of these are suitable:
- SendGrid
- Mailgun
- Postmark
- SMTP mailbox/provider tied to `quant-ent.com`

### DNS checklist (required for deliverability)
Apply these DNS records in your DNS provider for `quant-ent.com`:

1. **SPF**
   - Add/update TXT record for SPF including your SMTP provider.
   - Keep a single SPF record for the domain.
2. **DKIM**
   - Add all DKIM CNAME/TXT records provided by the SMTP provider.
   - Verify DKIM status in provider dashboard.
3. **DMARC**
   - Add TXT record at `_dmarc.quant-ent.com`.
   - Start with monitoring policy (for example `p=none`) and later tighten (`quarantine`/`reject`).

### Local and production sanity checks
1. Run locally:
   - `npm run dev`
2. Open `http://localhost:3000` and test:
   - Contact Stepper completes and shows success/error state.
   - Footer newsletter shows success/error state.
3. API checks (examples):
   - Valid contact request returns `200`.
   - Repeat contact requests from same IP more than 5 times in 10 minutes returns `429`.
   - Contact request with honeypot field (`hp`) filled returns `200` with no email send.
   - Contact request with invalid `Origin`/`Host` returns `403`.
4. In production, verify that contact emails are delivered to `aaron.fajardo@quant-ent.com`.
