// V26 Inference — privacy-conscious analytics (Google Forms Phase 1).
// Required funnel: landing_page_view → hero_cta_click / model_cta_click /
// beta_cta_click → google_form_outbound_click → (registration in Google Sheets).
// Default: local-only log. Forwards to Plausible/PostHog when their snippet exists.
(function () {
  var KEY = "v26_analytics_v1";
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a.slice(-500))); } catch (e) {} }
  function ctx() {
    var p = new URLSearchParams(window.location.search);
    return {
      path: window.location.pathname,
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
      device: window.innerWidth < 780 ? "mobile" : "desktop",
      ts: new Date().toISOString()
    };
  }
  function track(event, props) {
    var rec = Object.assign({ event: event }, ctx(), props || {});
    var a = read(); a.push(rec); write(a);
    try {
      if (window.plausible) window.plausible(event, { props: props });
      if (window.posthog) window.posthog.capture(event, rec);
    } catch (e) {}
  }
  // Placement (data-track) → spec event name.
  var TRACK_MAP = {
    hero_cta: "hero_cta_click",
    model_cta: "model_cta_click",
    model_cta_secondary: "model_cta_click",
    beta_cta: "beta_cta_click",
    announcement_cta: "beta_cta_click"
  };
  window.V26Analytics = { track: track };
  document.addEventListener("DOMContentLoaded", function () {
    if ((window.V26_CONFIG || {}).analyticsProvider === "none") return;
    // 1. Landing page visit
    track("landing_page_view");
    var seen = {};
    try {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !seen[en.target.id]) { seen[en.target.id] = 1; track("model_section_view", { section: en.target.id }); }
        });
      }, { threshold: 0.3 });
      ["model", "waitlist"].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    } catch (e) {}
    // 2-4. CTA clicks (hero / model / beta) via data-track
    document.querySelectorAll("[data-track]").forEach(function (el) {
      el.addEventListener("click", function () {
        var placement = el.getAttribute("data-track");
        var evt = TRACK_MAP[placement] || (placement + "_click");
        track(evt, { placement: placement, label: (el.textContent || "").trim().slice(0, 80) });
      });
    });
    // 5. Google Form outbound click (all link-outs, with placement)
    document.querySelectorAll("[data-gform]").forEach(function (el) {
      el.addEventListener("click", function () {
        track("google_form_outbound_click", {
          placement: el.getAttribute("data-track") || "unknown",
          href: (el.getAttribute("href") || "").slice(0, 200)
        });
      });
    });
    document.querySelectorAll("#faq details summary").forEach(function (s) {
      s.addEventListener("click", function () { track("faq_open", { q: s.textContent.trim().slice(0, 120) }); });
    });
  });
})();
