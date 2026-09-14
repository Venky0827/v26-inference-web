# V26 Inference — Phase 1 pre-launch website

Static, deploy-ready. Positioning: affordable AI inference for developers.
First model: Qwen3.8-27B — coming soon / beta only. No live API in Phase 1.

## Pages / routes
- `/` → `index.html` (hero, why, model, beta section, FAQ)
- `/early-access.html` → beta registration (Google Forms link-out)
- `/privacy.html`, `/terms.html`, `/contact.html`
- `/admin.html` → private Sheet link-out (no custom auth/DB in Phase 1)
- `robots.txt`, `sitemap.xml`, `favicon.svg`, `apple-touch-icon.svg`, `og-image.svg`, `404.html`
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

## Analytics (privacy-conscious)
Funnel: `landing_page_view → hero_cta_click / model_cta_click /
beta_cta_click → google_form_outbound_click → (Sheet registration)`.
Logged locally (`v26_analytics_v1`) with UTM/device; forwards to
Plausible/PostHog if their snippet is added.

## Admin
`admin.html` links to the Google Sheet (restricted to the team). No custom
dashboard/auth in Phase 1. `/admin.html` is `noindex` + disallowed in robots.

## Deploy
Upload all files to Cloudflare Pages / Vercel / Netlify / GitHub Pages.
Point `v26-inference.com` (primary) + `www` → deployment. HTTPS, preview deploys,
`development/staging/production` via host envs. Secrets go in host env, never git
(see `.env.example`). Reserve `app/api/docs/status` subdomains (DNS only).

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
