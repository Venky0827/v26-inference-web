// V26 Inference — Phase 1 frontend config.
// Registration backend = Google Forms (link-out). No custom DB/auth in Phase 1.
// No secrets are committed here (see .env.example).
window.V26_CONFIG = {
  siteUrl: "https://v26-inference.com",
  // Phase 1: no live inference API. Keep null until beta.
  apiBaseUrl: null, // e.g. "https://api.v26-inference.com/v1" when live
  // 1. Create the Google Form (see GOOGLE_FORM_SETUP.md), then paste its share URL:
  //    e.g. "https://docs.google.com/forms/d/e/FORM_ID/viewform"
  googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdTvWD8TjviN_sAG6LXT5N6GBnrp14Sjw3Bf0lDx3tANDEPBA/viewform",
  // 2. Link the Form to Sheets (Responses → Link to Sheets), paste the Sheet URL:
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/1LuBd1FhSykQhvDMChNomsCimscPAbYed0y5DaR19ftc/edit",
  // 3. Optional prefill: map site params → Google Forms entry IDs to attribute
  //    campaigns inside the Sheet. Get IDs via Form → ⋮ → Get pre-filled link.
  //    e.g. { utm_source: "entry.123456789", utm_campaign: "entry.987654321", ref: "entry.555555555" }
  //    Leave {} to just append ?utm_source=…&ref=… (preserved in analytics regardless).
  googleFormPrefill: {},
  analyticsProvider: "local", // "local" | "plausible" | "posthog" | "none"
  contactEmail: "hello@v26-inference.com"
};
