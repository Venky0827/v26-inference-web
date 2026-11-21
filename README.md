# V26 Inference — Phase 1 pre-launch website

Static, deploy-ready. Positioning: affordable AI inference for developers.
First model: Qwen3.8-27B — coming soon / beta only. No live API in Phase 1.

## Pages / routes
- `/` → `index.html` (hero, why, model, beta section, FAQ)
- `/early-access.html` → beta registration (Google Forms link-out)
- `/privacy.html`, `/terms.html`, `/contact.html`
- `/admin.html` → private Sheet link-out (no custom auth/DB in Phase 1)
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.svg`, `favicon-32x32.png`, `favicon-48x48.png`, `favicon-192x192.png`, `apple-touch-icon.png`, `og-image.png`, `404.html`
- `v26-logo.html` → internal brand-asset page (`noindex`)
- `SEO-IMPLEMENTATION.md` → SEO, Search Console, GA4 and consent runbook
- `GOOGLE_FORM_SETUP.md` → form build + prefill + DoD checklist

## Registration: Google Forms (link-out, no custom backend)
`config.js → googleFormUrl` (+ optional `googleSheetUrl`, `googleFormPrefill`).
Hero, announcement, model, and beta CTAs share that URL, open in a new tab
(`target=_blank rel=noopener noreferrer`), text `Get Free Beta Credits`.
UTM + `?ref=` appended automatically (prefill entry-IDs when configured);
clicks logged by `analytics.js`. Responses + CSV live in Google Sheets —
the Phase 1 lead database. Form fields, confirmation message, and Sheet
columns: see GOOGLE_FORM_SETUP.md. No auth, API keys, billing, metering,
dashboard, or inference API in this phase.

## Analytics (consent-gated)
`analytics.js` is the single analytics layer. Nothing is measured until the
visitor explicitly accepts analytics in the cookie banner. Accept/Reject is
persisted in `localStorage` (`v26_analytics_consent_v1`) and can be changed via
the footer “Cookie settings” control or the privacy page.

- GA4 loads only after consent and only when `config.js → ga4MeasurementId` is a
  real `G-XXXXXXXXXX` ID (the placeholder is rejected). Advertising consent stays
  denied, Google Signals and ad personalization are off, and one `page_view` is
  sent per page load (`send_page_view: false` + manual event).
- Events: `page_view`, `hero_cta_click`, `model_cta_click`, `beta_cta_click`,
  `google_form_click`, `faq_open`, `model_section_view`, `email_click`, plus
  `signup_click` / `docs_click` / `pricing_view` when a matching `data-track`
  placement is added. No names, emails, form contents, API keys or passwords are
  sent.
- `early_access_submit` and `contact_submit` are **not** fired automatically:
  registration completes on Google Forms and contact is a `mailto:` link. Call
  `V26Analytics.track("early_access_submit")` only from a same-origin handler
  that has confirmed a real success response.
- A first-party funnel log (`v26_analytics_v1`) is written only after consent;
  it is not sent anywhere unless `analyticsProvider` is set to Plausible/PostHog.

## Admin
`admin.html` links to the Google Sheet (restricted to the team). No custom
dashboard/auth in Phase 1. `/admin.html` is `noindex, nofollow`; `robots.txt`
does **not** disallow it so crawlers can read the noindex directive. Access
control must be enforced by Google Sheet permissions, not by robots.txt.

## Deploy
Static files deploy to GitHub Pages from `main` (custom domain in `CNAME`).
`www` currently redirects to the apex domain. Upload all files to Cloudflare
Pages / Vercel / Netlify / GitHub Pages if migrating. HTTPS, preview deploys,
`development/staging/production` via host envs. Secrets go in host env, never git
(see `.env.example`). Reserve `app/api/docs/status` subdomains (DNS only).

See `SEO-IMPLEMENTATION.md` for Search Console verification, GA4 setup, consent
behaviour, validation commands and GitHub Pages hosting limitations.

## Launch checklist delta (see spec §57)
Done in static: landing, mobile, positioning, not-live labels, form fields, consent,
privacy/terms, SEO/OG/sitemap/robots/favicon, cookie notice, analytics hooks, admin demo.
Still required server-side before public launch: database (PostgreSQL), email
verification, admin auth, rate limiting/CAPTCHA, error/uptime monitoring (Sentry),
CI/CD, browser/mobile testing, security review.

## Next phases (out of scope)
No GPU/vLLM, API keys, metering, billing, routing — per spec §59.

Note: `storage.js` / `admin.js` remain in the repo as unreferenced legacy from the
pre-Google-Forms draft. They are not loaded by any page; safe to delete.
