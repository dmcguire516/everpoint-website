# Everpoint Website

Production marketing site for Everpoint, a technology integration company
serving homes and small businesses throughout the Charleston Lowcountry.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- vinext / Cloudflare Workers

## Local development

```bash
pnpm install
pnpm dev
```

## Validation

```bash
pnpm lint
pnpm build
```

## Contact form

The on-site contact form posts to `/api/contact`. The Cloudflare Worker verifies
Cloudflare Turnstile and sends each inquiry through Resend.

Required runtime variables:

- `TURNSTILE_SITE_KEY` — Turnstile widget site key.
- `TURNSTILE_SECRET_KEY` — matching Turnstile secret.
- `RESEND_API_KEY` — Resend API key authorized to send from the verified
  Everpoint domain.

Optional runtime variables:

- `RESEND_FROM_EMAIL` — defaults to `Everpoint Website <hello@everpoint.tech>`.
- `CONTACT_TO_EMAIL` — defaults to `hello@everpoint.tech`.

For local development, copy `.env.example` to `.env.local` and supply the
values. For production, configure the same variables in the hosting
environment, mark the Turnstile secret and Resend API key as secrets, then
rebuild and redeploy.

Deployment checklist:

1. Add `everpoint.tech` and `www.everpoint.tech` to the Turnstile widget’s
   allowed hostnames.
2. Verify `everpoint.tech` as a sending domain in Resend. Add only the DNS
   records Resend provides; preserve the existing Google Workspace MX records.
3. Add the runtime variables to the production hosting project.
4. Deploy a new version and submit a real test inquiry.

## Brand assets

Authoritative Everpoint identity files are stored in `public/brand`. The source
package is not committed; only the approved web-ready SVG and raster assets are
included.
