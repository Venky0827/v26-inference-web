// V26 Inference — consent-gated analytics (GA4 + first-party funnel log).
//
// Privacy model:
//   * Nothing is measured until the visitor explicitly chooses "Accept".
//   * "Reject" is the default state; GA4 is never loaded and no events are stored.
//   * Advertising consent (ad_storage / ad_user_data / ad_personalization) stays
//     denied even after analytics consent, unless separately configured.
//   * The choice is persisted in localStorage and can be changed at any time via
//     any [data-cookie-settings] control (footer "Cookie settings", privacy page).
//
// GA4 is loaded from config.js -> ga4MeasurementId. The placeholder
// "G-XXXXXXXXXX" is intentionally invalid and will never load a script.
//
// Public API (kept backwards compatible with the Phase 1 integration):
//   window.V26Analytics.track(name, props)
//   window.V26Analytics.pageView()
//   window.V26Analytics.getConsent()        -> "granted" | "denied" | null
//   window.V26Analytics.setConsent(choice)  -> "granted" | "denied"
//   window.V26Analytics.openConsentBanner()
//
// Conversion events: only call track("early_access_submit") / track("contact_submit")
// from a handler that has confirmed a real success response. The current site sends
// registration to Google Forms, so those events are not fired automatically.
(function () {
  "use strict";

  var CONSENT_KEY = "v26_analytics_consent_v1";
  var LEGACY_KEY = "v26_cookie_ok";
  var LOG_KEY = "v26_analytics_v1";
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var PLACEHOLDER_ID = "G-XXXXXXXXXX";
  var MAX_LOG = 500;

  var cfg = window.V26_CONFIG || {};
  var provider = cfg.analyticsProvider || "local";
  var consent = readConsent();
  var gaLoaded = false;
  var pageViewSent = false;

  // ---------------------------------------------------------------- storage
  function readConsent() {
    try {
      var v = localStorage.getItem(CONSENT_KEY);
      return v === "granted" || v === "denied" ? v : null;
    } catch (e) { return null; }
  }
  function writeConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      localStorage.removeItem(LEGACY_KEY); // migrate away from the old "OK" flag
    } catch (e) {}
  }
  function readLog() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function writeLog(rows) {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(rows.slice(-MAX_LOG))); }
    catch (e) {}
  }

  // ------------------------------------------------------------- UTM capture
  // First-party, functional attribution. UTM values are appended to the Google
  // Form URL by script.js so registrations can be attributed in the Sheet.
  function persistedUtm() {
    var out = {};
    try {
      var p = new URLSearchParams(window.location.search);
      UTM_KEYS.forEach(function (k) {
        var v = p.get(k);
        if (v) {
          out[k] = v.slice(0, 120);
          try { localStorage.setItem("v26_" + k, out[k]); } catch (e) {}
        } else {
          try { var s = localStorage.getItem("v26_" + k); if (s) out[k] = s; } catch (e) {}
        }
      });
      var ref = p.get("ref");
      if (ref) {
        out.ref = ref.slice(0, 120);
        try { localStorage.setItem("v26_ref", out.ref); } catch (e) {}
      } else {
        try { var r = localStorage.getItem("v26_ref"); if (r) out.ref = r; } catch (e) {}
      }
    } catch (e) {}
    return out;
  }

  // --------------------------------------------------------------- sanitise
  // Never forward free-form content. Only short scalar campaign/UI metadata.
  var BLOCKED = /^(email|e_?mail|name|first_?name|last_?name|phone|password|token|api_?key|secret|message|comments?|form_?content|content|address)$/i;
  function sanitise(props) {
    var out = {};
    Object.keys(props || {}).forEach(function (k) {
      if (BLOCKED.test(k)) return;
      var v = props[k];
      if (typeof v === "string") out[k] = v.slice(0, 100);
      else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
    });
    return out;
  }

  function context() {
    return {
      path: window.location.pathname,
      device: window.innerWidth < 780 ? "mobile" : "desktop",
      ts: new Date().toISOString()
    };
  }

  function logEvent(name, props) {
    var rec = Object.assign({ event: name }, context(), persistedUtm(), props || {});
    var rows = readLog();
    rows.push(rec);
    writeLog(rows);
  }

  // -------------------------------------------------------------------- GA4
  function measurementId() {
    var id = String(cfg.ga4MeasurementId || "").trim();
    if (!id || id === PLACEHOLDER_ID) return "";
    return /^G-[A-Z0-9]{4,}$/.test(id) ? id : "";
  }

  function gaReady() {
    return !!(window.gtag && gaLoaded);
  }

  function loadGa() {
    if (gaLoaded) return gaReady();
    var id = measurementId();
    if (!id) return false;
    if (provider === "none") return false;

    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    // Consent Mode v2. Advertising signals stay denied; analytics is granted
    // because this function only runs after explicit consent.
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
      functionality_storage: "granted",
      security_storage: "granted"
    });
    window.gtag("js", new Date());
    window.gtag("config", id, {
      send_page_view: false,          // page_view is sent exactly once, manually
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: "SameSite=Lax;Secure"
    });

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    return true;
  }

  function gaEvent(name, props) {
    if (!gaReady()) return;
    var payload = sanitise(props);
    payload.event_source = "v26_web";
    window.gtag("event", name, payload);
  }

  function sendPageView() {
    if (consent !== "granted" || provider === "none") return;
    var loaded = loadGa();
    if (pageViewSent) return;
    pageViewSent = true;
    var props = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search
    };
    if (loaded) window.gtag("event", "page_view", props);
    logEvent("page_view", {});
    if (provider === "plausible" && window.plausible) {
      try { window.plausible("page_view"); } catch (e) {}
    }
    if (provider === "posthog" && window.posthog && window.posthog.capture) {
      try { window.posthog.capture("page_view", props); } catch (e) {}
    }
  }

  // ------------------------------------------------------------------ track
  function track(name, props) {
    if (consent !== "granted" || provider === "none") return;
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(name)) return;
    var clean = sanitise(props);
    logEvent(name, clean);
    gaEvent(name, clean); // no-op until the GA4 script is configured + loaded
    if (provider === "plausible" && window.plausible) {
      try { window.plausible(name, { props: clean }); } catch (e) {}
    }
    if (provider === "posthog" && window.posthog && window.posthog.capture) {
      try { window.posthog.capture(name, clean); } catch (e) {}
    }
  }

  // ---------------------------------------------------------------- consent
  function clearGaCookies() {
    try {
      var host = window.location.hostname;
      var parts = host.split(".");
      var domains = ["", host, "." + host];
      if (parts.length > 2) domains.push("." + parts.slice(-2).join("."));
      document.cookie.split(";").forEach(function (c) {
        var name = c.split("=")[0].trim();
        if (name !== "_gid" && name.indexOf("_ga") !== 0) return;
        domains.forEach(function (d) {
          document.cookie = name + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "") + "; SameSite=Lax";
        });
      });
    } catch (e) {}
  }

  function setConsent(value) {
    if (value !== "granted" && value !== "denied") return consent;
    consent = value;
    writeConsent(value);
    updateConsentUi();
    hideBanner();

    if (value === "granted") {
      if (loadGa()) {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied"
        });
      }
      sendPageView();
    } else {
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied"
        });
      }
      clearGaCookies();
    }
    try {
      window.dispatchEvent(new CustomEvent("v26:consent", { detail: { consent: value } }));
    } catch (e) {}
    return consent;
  }

  // --------------------------------------------------------------------- UI
  function banner() { return document.getElementById("cookie-banner"); }
  function showBanner() {
    var b = banner();
    if (!b) return;
    b.hidden = false;
    b.setAttribute("tabindex", "-1");
    b.focus({ preventScroll: true });
  }
  function hideBanner() {
    var b = banner();
    if (b) b.hidden = true;
  }
  function updateConsentUi() {
    var label = consent === "granted" ? "Accepted" : consent === "denied" ? "Rejected" : "Not set";
    document.querySelectorAll("[data-consent-status]").forEach(function (el) {
      el.textContent = label;
    });
  }

  function bindUi() {
    var accept = document.getElementById("cookie-accept");
    var reject = document.getElementById("cookie-reject");
    if (accept) accept.addEventListener("click", function () { setConsent("granted"); });
    if (reject) reject.addEventListener("click", function () { setConsent("denied"); });

    document.querySelectorAll("[data-cookie-settings]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        showBanner();
      });
    });

    updateConsentUi();
    if (provider !== "none" && consent === null) showBanner();
  }

  // ----------------------------------------------------------------- events
  var TRACK_MAP = {
    hero_cta: "hero_cta_click",
    model_cta: "model_cta_click",
    model_cta_secondary: "model_cta_click",
    beta_cta: "beta_cta_click",
    announcement_cta: "beta_cta_click",
    signup: "signup_click",
    docs: "docs_click",
    pricing: "pricing_view"
  };

  function wireEvents() {
    document.querySelectorAll("[data-track]").forEach(function (el) {
      el.addEventListener("click", function () {
        var placement = el.getAttribute("data-track") || "";
        var evt = TRACK_MAP[placement] || (/^[a-z0-9_]+$/.test(placement) ? placement : "cta_click");
        var props = { placement: placement };
        var label = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
        if (label) props.label = label;
        track(evt, props);
      });
    });

    // Registration intent. The actual registration completes on Google Forms,
    // so this is deliberately NOT named early_access_submit.
    document.querySelectorAll("[data-gform]").forEach(function (el) {
      el.addEventListener("click", function () {
        track("google_form_click", {
          placement: el.getAttribute("data-track") || "unknown"
        });
      });
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
      el.addEventListener("click", function () {
        var scope = el.closest("footer") ? "footer" : "page";
        track("email_click", { placement: scope });
      });
    });

    // The `toggle` event fires after the disclosure state changes and also
    // covers keyboard activation. A click handler would count both opening
    // and closing an answer as an "open" event.
    document.querySelectorAll("#faq details").forEach(function (detail) {
      detail.addEventListener("toggle", function () {
        if (!detail.open) return;
        var summary = detail.querySelector("summary");
        if (!summary) return;
        track("faq_open", { question: summary.textContent.replace(/\s+/g, " ").trim().slice(0, 100) });
      });
    });

    try {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !seen[en.target.id]) {
            seen[en.target.id] = 1;
            track("model_section_view", { section: en.target.id });
          }
        });
      }, { threshold: 0.3 });
      ["model", "waitlist"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) io.observe(el);
      });
    } catch (e) {}
  }

  // ------------------------------------------------------------------- boot
  window.V26Analytics = {
    track: track,
    pageView: sendPageView,
    getConsent: function () { return consent; },
    setConsent: setConsent,
    openConsentBanner: showBanner
  };

  function boot() {
    bindUi();
    if (consent === "granted" && provider !== "none") {
      sendPageView();
    }
    wireEvents();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
