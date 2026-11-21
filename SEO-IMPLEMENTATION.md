# SEO, Search Console and GA4 implementation — V26 Inference

Status: implemented in the repository on 21 November 2026. **Not yet deployed** and
**not yet verified in Google Search Console**. No GA4 property or verification token
was created for this work.

Production domain: <https://v26-inference.com>
Repository: <https://github.com/Venky0827/v26-inference-web>
Hosting: GitHub Pages (static files, `CNAME` → `v26-inference.com`)

---

## 1. Existing website architecture

- Static HTML5, one hand-written `styles.css`, vanilla JavaScript. No framework,
  bundler or build step. Every file in the repository root is served as-is.
- Public pages: `/` (`index.html`), `/early-access.html`, `/contact.html`,
  `/privacy.html`, `/terms.html`.
- Non-public / non-indexable: `/admin.html` (private Sheet link), `/v26-logo.html`
  (internal brand-asset page), `/404.html` (error page).
- Beta registration is a **link-out to Google Forms**; responses live in a Google
  Sheet. There is no same-origin form, backend, auth, database or inference API.
- Existing configuration lives in `config.js` (`window.V26_CONFIG`), including the
  Google Form URL, Sheet URL, optional prefill map and analytics provider.
- Before this work: basic titles/descriptions/canonicals on public pages, a
  homepage-only minimal `Organization` JSON-LD block, `robots.txt`, a five-URL
  sitemap, an SVG OG image, a local-only analytics logger, and a one-button
  "OK" cookie notice.
- Deployment: `main` branch → GitHub Pages. `www.v26-inference.com` currently
  returns `301` to the apex domain. **HTTP currently returns `200` instead of
  redirecting to HTTPS** (see §15 and §14 — manual fix required).

## 2. Files created

| File | Purpose |
| --- | --- |
| `og-image.png` | 1200×630 PNG Open Graph/Twitter image rendered from `og-image.svg` (social platforms do not reliably render SVG). |
| `favicon-32x32.png` | Browser favicon. |
| `favicon-48x48.png` | 48px favicon (Google favicon guidance). |
| `favicon-192x192.png` | High-resolution favicon / manifest icon. |
| `apple-touch-icon.png` | 180×180 iOS home-screen icon (PNG instead of SVG). |
| `site.webmanifest` | Web app manifest with name, theme colour and icons. |
| `SEO-IMPLEMENTATION.md` | This runbook. |
| `SEO-REPORT.md` | Final implementation report and test evidence. |

`og-image.svg`, `favicon.svg` and `apple-touch-icon.svg` were kept as editable
sources. No image was invented; all are renders of the existing brand assets.

## 3. Files modified

| File | Change |
| --- | --- |
| `index.html` | New title/description/canonical/robots/OG/Twitter metadata, PNG OG image, favicon set, manifest, font preconnect/preload, Organization + WebSite JSON-LD, consent dialog, footer cookie-settings control, `defer` scripts. |
| `early-access.html` | Full metadata set, BreadcrumbList JSON-LD, visible breadcrumbs, skip link, `h3` → `h2`, consent UI, footer cookie settings, `defer` scripts. |
| `contact.html` | Full metadata set, BreadcrumbList, breadcrumbs, skip link, `h2` sections, "before you write" guidance, consent UI. |
| `privacy.html` | Full metadata set, BreadcrumbList, rewritten analytics/cookies/third-party disclosure (GA4, Google Forms/Sheets, GitHub Pages, fonts), live consent status, cookie-settings control. |
| `terms.html` | Full metadata set, BreadcrumbList, analytics reference, updated date, consent UI. |
| `404.html` | `noindex, nofollow`, correct head, PNG favicons, usable links. |
| `admin.html` | Stronger `noindex, nofollow, noarchive, nosnippet`, `referrer` policy, root-relative assets. |
| `v26-logo.html` | `noindex, nofollow`, descriptive title/description, valid ARIA wrappers. |
| `analytics.js` | Replaced the local-only logger with a consent manager + GA4 loader + first-party funnel log + event wiring. |
| `script.js` | Removed the old "OK" cookie handler (consent now lives in `analytics.js`); form-URL and copy-button behaviour unchanged. |
| `config.js` | Added `ga4MeasurementId` (placeholder) and documentation for `googleSiteVerification`. |
| `styles.css` | Removed render-blocking `@import`; added consent dialog, breadcrumb, link-button and screen-reader styles; darkened muted text to pass WCAG AA; underlined inline links; mobile consent layout. |
| `robots.txt` | Removed `Disallow: /admin.html` so crawlers can read the noindex meta; kept sitemap reference. |
| `sitemap.xml` | Reformatted, five canonical HTTPS URLs, no invented `lastmod`. |
| `og-image.svg` | Recentred the logo lockup for the 1200×630 render. |
| `README.md` | Updated routes, analytics/consent behaviour, admin indexing and deployment notes. |
| `.env.example` | Documented `GA4_MEASUREMENT_ID` (tooling only; the browser reads `config.js`). |

## 4. SEO changes

### Titles, descriptions, canonicals

| Page | Title | Canonical |
| --- | --- | --- |
| `/` | V26 Inference \| Affordable AI Inference API for Developers | `https://v26-inference.com/` |
| `/early-access.html` | Join the V26 Beta \| Free Credits for Qwen3.8-27B | `https://v26-inference.com/early-access.html` |
| `/contact.html` | Contact V26 Inference \| Questions & Partnerships | `https://v26-inference.com/contact.html` |
| `/privacy.html` | Privacy Notice \| V26 Inference | `https://v26-inference.com/privacy.html` |
| `/terms.html` | Pre-Launch Terms \| V26 Inference | `https://v26-inference.com/terms.html` |

Every public page now has a unique title and meta description, a self-referencing
HTTPS canonical, `index, follow` robots directives, Open Graph metadata
(`og:site_name`, `og:locale`, `og:type`, `og:title`, `og:description`, `og:url`,
`og:image` with type/width/height/alt), Twitter `summary_large_image` metadata,
`lang="en"`, the mobile viewport, and a full favicon set.

Homepage description (as proposed, accurate to the current pre-launch site):

> V26 Inference is preparing affordable, developer-focused AI inference with an
> OpenAI-compatible API. Join the beta for updates and launch announcements.

### Semantic HTML and internal linking

- One `<h1>` per page; subpages now use `h2` for section/card headings.
- Visible breadcrumbs (`Home / Page`) on all public subpages plus matching
  `BreadcrumbList` JSON-LD.
- Skip-to-content link on every public page.
- Navigation and footer `aria-label`s, `aria-current="page"` on breadcrumbs.
- Footer links connect Home, Early access/beta, Contact, Privacy and Terms across
  the site. No broken internal links (checked; see `SEO-REPORT.md`).
- No `<img>` elements exist on the site, so no alt attributes or lazy-loading
  were needed; all icons are inline SVG with `aria-hidden="true"` and adjacent
  text labels.

### Favicon and social image

- `favicon.svg`, `favicon-32x32.png`, `favicon-48x48.png`,
  `favicon-192x192.png`, `apple-touch-icon.png` (180×180), `site.webmanifest`.
- Social image is now `https://v26-inference.com/og-image.png` (1200×630 PNG),
  with dimensions and alt text. The SVG remains the source file.

## 5. Sitemap configuration

`/sitemap.xml` contains exactly the five public, canonical, indexable pages:

- `https://v26-inference.com/`
- `https://v26-inference.com/early-access.html`
- `https://v26-inference.com/contact.html`
- `https://v26-inference.com/privacy.html`
- `https://v26-inference.com/terms.html`

Excluded: `admin.html`, `v26-logo.html`, `404.html`, and any planned subdomain.
`lastmod` is deliberately omitted rather than invented. XML is valid (checked with
`xmllint`). After deployment it must be reachable at
<https://v26-inference.com/sitemap.xml>.

## 6. robots.txt configuration

```txt
# V26 Inference — https://v26-inference.com
# Public pages are crawlable. Admin and internal pages are protected with
# authentication/noindex rather than a robots.txt Disallow, so crawlers can
# read their noindex directive.
User-agent: *
Allow: /

Sitemap: https://v26-inference.com/sitemap.xml
```

`admin.html` is not disallowed. It carries
`<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">`, which
Google can only read if the URL is crawlable. Real protection is the Google Sheet
permission model; robots.txt is not an access-control mechanism.

## 7. Structured data (JSON-LD)

Homepage, one `@graph`:

- `Organization` — name `V26 Inference`, URL, email `hello@v26-inference.com`,
  description, logo (`apple-touch-icon.png`, 180×180).
- `WebSite` — name, URL, description, `inLanguage: en`, publisher reference.

Public subpages:

- `BreadcrumbList` with absolute `item` URLs and correct `position` values.

Deliberately **not** added:

- `SoftwareApplication` / `Product` — the inference API is not publicly available,
  so Product/Offer/availability/pricing markup would be inaccurate.
- `Article` — there are no published technical articles.
- Reviews, ratings, address, telephone, social profiles, pricing, availability —
  none are verified.

All JSON-LD blocks parse as valid JSON. Validate with
<https://validator.schema.org/> and Google's Rich Results Test after deployment.

## 8. Google Search Console verification procedure

A **Domain property** is recommended. It covers apex, `www` and all subdomains and
uses DNS, so no file needs to be added to this repository.

1. Open <https://search.google.com/search-console>.
2. **Add property → Domain** → enter `v26-inference.com` → Continue.
3. Google displays a TXT record such as
   `google-site-verification=<TOKEN_FROM_GOOGLE>`. **Use Google's real token; never
   invent or commit one.**
4. At the authoritative DNS provider for `v26-inference.com`, add:

   | Type | Name/Host | Value | TTL |
   | --- | --- | --- | --- |
   | TXT | `@` (apex) | `google-site-verification=<TOKEN_FROM_GOOGLE>` | Auto / 3600 |

   If the provider appends the domain automatically, use `@` or leave the host
   blank. Do not create a CNAME for verification.
5. Confirm propagation:

   ```bash
   dig +short TXT v26-inference.com
   # or: nslookup -type=TXT v26-inference.com
   ```

6. Return to Search Console and click **Verify**. Keep the TXT record in place.
7. **Sitemaps → Add a new sitemap** → `sitemap.xml` → Submit. The resulting URL is
   `https://v26-inference.com/sitemap.xml`.
8. **URL Inspection** → paste each public URL → **Test live URL** → confirm
   "URL is available to Google" and that the canonical matches → **Request indexing**.
9. Monitor **Pages** (indexing coverage), **Sitemaps**, **Core Web Vitals** and
   **Performance** over the following days/weeks.

Optional URL-prefix verification (only if DNS is unavailable): add Google's static
`<meta name="google-site-verification" content="...">` tag to the `<head>` of
`index.html`, deploy, then verify. The `googleSiteVerification` value in `config.js`
is documentation only; `analytics.js` does not inject it because Google checks the
raw HTML.

Do not claim verification succeeded until Search Console shows the property as
verified. It has **not** been done in this repository.

## 9. GA4 setup instructions

1. Create/choose a Google Analytics 4 property for V26 Inference.
2. **Admin → Data streams → Add stream → Web**:
   - URL: `https://v26-inference.com`
   - Stream name: `V26 website`
3. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
4. Open `config.js` and replace the placeholder:

   ```js
   ga4MeasurementId: "G-XXXXXXXXXX", // ← replace with the real ID
   ```

5. Commit and deploy. Do **not** add a separate `gtag.js` snippet to the HTML;
   `analytics.js` is the single loader and already sets Consent Mode v2.
6. In a fresh browser profile, open the site, click **Accept**, then confirm the
   stream receives a `page_view` in **Reports → Realtime** or **Admin → DebugView**.
7. Recommended **key events** (Admin → Events): `beta_cta_click`,
   `google_form_click`, optionally `hero_cta_click` and `model_cta_click`. Do not
   mark `page_view` as a conversion.
8. Optionally link GA4 to Search Console (Admin → Product links) after GSC
   verification.

The placeholder `G-XXXXXXXXXX` is rejected by `analytics.js`, so the repository as
shipped makes **no Google Analytics requests**.

## 10. Analytics consent behaviour

`analytics.js` is the only analytics integration. Choice key:
`localStorage["v26_analytics_consent_v1"]` = `"granted"` | `"denied"`.

| State | What happens |
| --- | --- |
| First visit (no choice) | Consent dialog is shown. No GA script, no GA cookies, no first-party event log. |
| **Accept** | GA4 script is injected, Consent Mode v2 is set (`analytics_storage: granted`; advertising signals denied), one `page_view` is sent, then events forward. |
| **Reject** | No GA script, no first-party event log. Any existing `_ga` / `_ga_*` cookies this site can access are expired. |
| Change choice | Footer **Cookie settings** (or the privacy-page control) reopens the dialog. Rejection after acceptance stops further events and clears GA cookies. |
| Advertising | `ad_storage`, `ad_user_data`, `ad_personalization` remain `denied`; Google Signals and ad personalization are disabled. |
| Persistence | The choice survives navigation/reloads via localStorage. |

- No analytics script is loaded before consent (verified with network inspection).
- Exactly one `page_view` per page load: `send_page_view: false` plus a manual
  `page_view` guarded by a per-load flag.
- The first-party funnel log (`v26_analytics_v1`) is written only after consent and
  is not transmitted anywhere by default (`analyticsProvider: "local"`).
- If `analyticsProvider` is set to `"none"`, analytics and the consent prompt are
  disabled entirely.
- Plausible/PostHog forwarding is supported only when explicitly configured and
  consented; do not run two providers for the same events without deciding which
  one owns conversions.

## 11. Conversion events

| Event | Trigger | Status |
| --- | --- | --- |
| `page_view` | Page load after consent (once) | Implemented |
| `hero_cta_click` | Hero "Join the Beta" (`data-track="hero_cta"`) | Implemented |
| `model_cta_click` | Model CTA and "Explore Qwen3.8-27B" | Implemented |
| `beta_cta_click` | Access/early-access CTAs | Implemented |
| `google_form_click` | Any `[data-gform]` outbound link | Implemented |
| `faq_open` | FAQ `<summary>` click | Implemented |
| `model_section_view` | Model/access section 30% visible | Implemented |
| `email_click` | Any `mailto:` link (no address sent) | Implemented |
| `signup_click` | `data-track="signup"` if added | Supported |
| `docs_click` | `data-track="docs"` if a docs site is added | Supported |
| `pricing_view` | `data-track="pricing"` if a pricing page is added | Supported |
| `early_access_submit` | **Not fired automatically** | See below |
| `contact_submit` | **Not fired automatically** | See below |

**Why the submit events are not fired:** registration completes on
`docs.google.com/forms`, and contact is a `mailto:` link. The site cannot observe a
successful submission, so firing `early_access_submit` on a CTA click would
over-count. The Google Sheet remains the source of truth for registrations. If the
form is later moved same-origin, call:

```js
V26Analytics.track("early_access_submit", { method: "native_form" });
```

only inside the success handler (after a 2xx response). The same rule applies to
`contact_submit`.

PII is never sent: `analytics.js` drops keys such as `email`, `name`, `phone`,
`password`, `token`, `api_key`, `message`, `comments`, `content` and `address`,
truncates strings to 100 characters, and sends only placement/label/section
metadata. The old `google_form_click` handler no longer sends the full form URL.

## 12. Lighthouse results

Run locally on 21 November 2026 against `python3 -m http.server 8099` with Chrome
152 / Lighthouse 12. These are lab results, not field data.

| Page | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | **98** | **100** | **100** | **100** |
| `/early-access.html` | — | **100** | **100** | **100** |
| `/contact.html` | — | **100** | **100** | **100** |
| `/privacy.html` | — | **100** | **100** | **100** |
| `/terms.html` | — | **100** | **100** | **100** |

Homepage Core Web Vitals (lab):

- LCP **1.8 s** (target ≤ 2.5 s)
- TBT **0 ms** (INP proxy; target ≤ 200 ms)
- CLS **0** (target ≤ 0.1)
- FCP 1.8 s · Speed Index 1.8 s · TTI 1.8 s

Changes that helped: removed the CSS `@import` font chain, added
preconnect/preload, deferred scripts, converted OG/favicons to PNG, darkened the
muted text token to `#6b6e7c` (WCAG AA), and underlined inline links.

Re-run after deployment with PageSpeed Insights (mobile field + lab data) and the
Search Console Core Web Vitals report. Scores will differ from localhost.

## 13. Deployment instructions

```bash
cd /Users/venkateshbandaru/Downloads/v26-inference

git add index.html early-access.html contact.html privacy.html terms.html \
        404.html admin.html v26-logo.html \
        analytics.js script.js config.js styles.css \
        robots.txt sitemap.xml og-image.svg og-image.png \
        favicon-32x32.png favicon-48x48.png favicon-192x192.png \
        apple-touch-icon.png site.webmanifest \
        README.md .env.example SEO-IMPLEMENTATION.md SEO-REPORT.md

git commit -m "feat(seo): technical SEO, sitemap, structured data, GSC readiness and consent-gated GA4"
git push origin main
```

GitHub Pages publishes `main` automatically (Settings → Pages). Then verify:

```bash
curl -sSI https://v26-inference.com/robots.txt
curl -sS  https://v26-inference.com/sitemap.xml | xmllint --noout -
curl -sSI https://v26-inference.com/og-image.png
curl -sS  https://v26-inference.com/ | grep -E 'canonical|og:image|application/ld\+json'
```

Do not commit unrelated local files (`amq-backup-20260924/`,
`amq-keycloak-sso-fix-report.md`).

## 14. Remaining manual actions

1. **Enable HTTPS enforcement.** `http://v26-inference.com/` currently returns
   `200` over plain HTTP. GitHub repo → **Settings → Pages → Enforce HTTPS**.
   Re-test with `curl -sSI http://v26-inference.com/` (expect `301` to HTTPS).
2. **Create the GA4 property**, copy the real `G-` ID into `config.js`, deploy.
3. **Add the Search Console Domain property**, add Google's TXT record at DNS,
   verify, submit `sitemap.xml`, inspect and request indexing.
4. **Validate structured data** with the Rich Results Test and Schema.org validator
   after deployment (no live URL has the new markup yet).
5. **Refresh social previews** (LinkedIn Post Inspector, X Card Validator,
   Facebook Sharing Debugger) so they pick up `og-image.png`.
6. **Legal review** of the privacy notice, terms and consent wording. The
   implementation is engineering, not a legal compliance certification.
7. Optional: put Cloudflare in front of GitHub Pages to add security headers and
   HTTP→HTTPS/HSTS (see §15).
8. Optional: move beta registration to a same-origin form so
   `early_access_submit` can be measured after a real success response.
9. Optional: remove `v26-logo.html` from production, or keep it noindexed.
10. Optional: add `docs`/`pricing` pages and wire `data-track="docs"` /
    `data-track="pricing"` when those pages actually exist.

## 15. Known limitations

- **No real GA4 ID is configured.** The placeholder never loads a script. Analytics
  remains inert until step 2 above.
- **Search Console is not configured or verified.** No token was invented or added.
- **GitHub Pages cannot set arbitrary response headers.** There is no repo-level
  control for HSTS, CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy` or `Permissions-Policy`. GitHub Pages serves
  `cache-control: max-age=600` and does not support custom cache rules.
  Recommended fix: proxy the domain through Cloudflare (orange cloud) and add
  response headers / Transform Rules there. Example starting point (test in
  report-only mode first, because the site uses inline styles, inline JSON-LD and
  third-party fonts):

  ```txt
  /*
    Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: geolocation=(), microphone=(), camera=()
  ```

  A restrictive CSP needs hashes/nonces for the inline JSON-LD and styles; do not
  deploy a blanket `default-src 'self'` without testing Google Fonts, jsDelivr and
  Google Analytics.
- **No `early_access_submit` / `contact_submit` measurement** because registration
  and contact complete off-site. CTA intent (`beta_cta_click`,
  `google_form_click`) is measured; the Sheet is the registration source of truth.
- **No pricing or docs pages**, so `pricing_view` and `docs_click` are supported but
  not emitted.
- **No Article schema** because there are no articles. **No Product /
  SoftwareApplication schema** because the API is not publicly available.
- **Consent is not a legal compliance guarantee.** It is a good-faith,
  consent-gated implementation; have counsel review jurisdiction-specific
  requirements (GDPR/ePrivacy, CCPA/CPRA, etc.).
- **Font dependency:** the primary Nexon WOFF is ~443 KB from jsDelivr and is
  preloaded. Self-hosting/subsetting would improve privacy and mobile performance;
  changing it may alter the visual design, so it was left as-is.
- **Inline `style=""` attributes** exist in the original pages. They are valid HTML
  but `html-validate`'s optional `no-inline-style` rule flags them; they were not
  refactored to avoid visual risk.
- **`/index.html` also resolves** alongside `/`. The canonical points to `/`; no
  redirect rule exists on GitHub Pages.
- **`www` → apex** currently works with a `301`; keep the DNS/CNAME configuration.
- **Sitemap `lastmod` is omitted** intentionally rather than fabricated.
- Lighthouse numbers are local lab results and will differ on production/mobile.
