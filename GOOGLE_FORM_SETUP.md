# Google Form setup — V26 Inference Phase 1

> **STATUS: LIVE.** Built and verified 2026-09-14.
> - Form: https://docs.google.com/forms/d/e/1FAIpQLSdTvWD8TjviN_sAG6LXT5N6GBnrp14Sjw3Bf0lDx3tANDEPBA/viewform
> - Sheet: https://docs.google.com/spreadsheets/d/1LuBd1FhSykQhvDMChNomsCimscPAbYed0y5DaR19ftc/edit ("V26 Inference — Beta responses")
> - Published (Anyone with the link), verified-email collection ON, confirmation message set.
> - End-to-end test submitted and verified in Sheet, then deleted (0 responses at handoff).

The website links out to this form; responses + Sheet ARE the Phase 1 lead database.
No custom backend/auth in this phase.

## 1. Create the form
1. Google Forms → Blank form → title: `V26 Inference — Beta registration`.
2. Description: `Qwen3.8-27B API access is coming soon. Join the beta and receive free credits when the API launches.`

## 2. Fields (exact order recommended)
| # | Question | Type | Required | Choices / notes |
|---|----------|------|----------|-----------------|
| 1 | Email address | Settings → Collect email addresses → **Verified** (no separate question; Google records verified Gmail) | Yes |
| 2 | What will you build / use V26 for? | Multiple choice or Dropdown | Yes | AI application; Coding / developer tools; AI agents; RAG / knowledge assistant; Chatbot; Research / experimentation; Internal enterprise application; Other (+ add "Other" with free text) |
| 3 | Expected monthly token usage | Multiple choice or Dropdown | Yes | Less than 1M tokens/month; 1–10M tokens/month; 10–100M tokens/month; 100M–1B tokens/month; More than 1B tokens/month; Not sure |
| 4 | Name | Short answer | No | |
| 5 | Company / Organization | Short answer | No | |
| 6 | Current AI provider | Checkboxes (multiple) | No | OpenAI; Anthropic; Google; OpenRouter; Groq; Together AI; Fireworks; Hugging Face; Self-hosted; Other; Nothing currently |
| 7 | Country / Region | Short answer or Dropdown | No | |
| 8 | How did you hear about V26? | Multiple choice (+ Other) | No | Google; Reddit; Hacker News; LinkedIn; X; GitHub; YouTube; Direct; Referral; Other |
| 9 | Additional comments | Paragraph | No | e.g. current model/API in use |
| 10 | I agree to receive V26 Inference beta and product updates (see v26-inference.com/privacy and /terms) | Multiple choice Yes/No or Checkbox | Yes (require Yes) | Consent evidence for §16 |

## 3. Confirmation message (Settings → Presentation) — Phase 1.1 exact text
> You're on the V26 beta list.
>
> We're preparing Qwen3.8-27B inference infrastructure now.
>
> We'll notify you when the API opens.
>
> Know a developer who needs affordable AI inference? Share V26 with them — send them to https://v26-inference.com.

## 4. Link to Sheets (Responses → Link to Sheets → Create)
Recommended columns (auto Timestamp + your questions):
`Timestamp, Email, Name, Company, Use Case, Expected Usage, Current Provider, Country, Referral / Source, Comments, Marketing Consent`
Sheet access: restricted to the team. Export via File → Download → CSV.

## 5. Get the URLs
- Form: Send → link icon → Shorten URL → copy `https://docs.google.com/forms/d/e/FORM_ID/viewform`.
- Sheet: copy its URL.
- Paste both into `config.js` (`googleFormUrl`, `googleSheetUrl`) and `.env.example` (`GOOGLE_FORM_URL`, `GOOGLE_SHEET_URL`). All `[data-gform]` CTAs update automatically.

## 6. UTM / source attribution (two layers) — Phase 1.1 §7
- **Always on (no setup):** the site appends `?utm_source=…&utm_medium=…&utm_campaign=…&utm_content=…&utm_term=…&ref=…` to the form URL and logs every CTA + outbound click in `analytics.js` (funnel: `page_view → hero_cta_click / model_cta_click / beta_cta_click → google_form_click` → Sheet registrations = Visitor → Beta registration). UTM values persist in localStorage so attribution survives navigation (/ → /early-access.html).
- **Inside the Sheet (optional, recommended):** Form → ⋮ → Get pre-filled link → fill a hidden/short field (e.g. `Referral / Source`) per UTM param → Get link → copy the `entry.XXXXXXXX` IDs → set `googleFormPrefill` in `config.js`, e.g. `{ utm_source: "entry.111", utm_campaign: "entry.222", ref: "entry.333" }`. Test with `https://v26-inference.com/?utm_source=linkedin&utm_medium=social&utm_campaign=beta-launch`.

## 7. Definition-of-Done test
- [x] Form created, fields + Sheet linked, confirmation message set (Phase 1.1 text + share line).
- [x] Required fields minimized: only Email (verified), Use case, Expected monthly token usage. Name, Company, Current AI provider, Country/Region, Additional comments optional.
- [x] URLs pasted in `config.js`; hero, announcement, model, and beta CTAs all open the form in a new tab (`target=_blank rel=noopener noreferrer`).
- [x] Desktop + mobile CTA works; clicks log `page_view, hero_cta_click, model_cta_click, beta_cta_click, google_form_click` (+ legacy aliases).
- [x] Test submit with `?utm_source=test&utm_medium=social&utm_campaign=beta-launch&utm_content=hero` appears in the Sheet; no live-API language anywhere on site.

As-built notes: Dropdowns have no free-text Other, so Q1/Q2 use a plain "Other" option
plus a separate optional short-answer "If you chose Other above…". Q6/Q8 use native
add-Other with free text. Consent is a required single checkbox (must check to submit).
UTM/`ref` params are appended to the form URL and kept in site analytics (no entry-ID
prefill mapping configured — optional future step via Get pre-filled link).
