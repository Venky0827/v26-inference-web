// V26 Inference — Google Forms link-out handler (Phase 1).
// All registration CTAs ([data-gform]) share one URL from config.js and open
// in a new tab. Appends UTM/ref for attribution: uses googleFormPrefill
// entry-ID map when configured, else plain ?utm_*=&ref= params (always kept
// in local analytics). See GOOGLE_FORM_SETUP.md.
(function () {
  function $(id) { return document.getElementById(id); }

  // Cookie banner (local-only analytics notice).
  try {
    var banner = $("cookie-banner"), okBtn = $("cookie-ok");
    if (banner && okBtn) {
      if (!localStorage.getItem("v26_cookie_ok")) banner.hidden = false;
      okBtn.addEventListener("click", function () {
        localStorage.setItem("v26_cookie_ok", "1");
        banner.hidden = true;
      });
    }
  } catch (e) {}

  function buildFormUrl(base) {
    try {
      var u = new URL(base);
      var page = new URLSearchParams(window.location.search);
      var cfg = window.V26_CONFIG || {};
      var prefill = cfg.googleFormPrefill || {};
      var ref = page.get("ref");
      if (ref) { try { localStorage.setItem("v26_ref", ref); } catch (e) {} }
      else { try { ref = localStorage.getItem("v26_ref"); } catch (e) {} }
      var names = { utm_source: page.get("utm_source"), utm_medium: page.get("utm_medium"), utm_campaign: page.get("utm_campaign"), utm_term: page.get("utm_term"), utm_content: page.get("utm_content"), ref: ref };
      Object.keys(names).forEach(function (k) {
        var v = names[k];
        if (!v) return;
        if (prefill[k]) u.searchParams.set(prefill[k], v); // entry.XXXXXXX prefill
        else if (!u.searchParams.get(k === "ref" ? "ref" : k)) u.searchParams.set(k === "ref" ? "ref" : k, v);
      });
      return u.toString();
    } catch (e) { return base; }
  }

  function apply() {
    var cfg = window.V26_CONFIG || {};
    var url = cfg.googleFormUrl || "";
    if (!url) return;
    var finalUrl = (url.indexOf("FORM_ID") >= 0 || url.indexOf("REPLACE-ME") >= 0) ? url : buildFormUrl(url);
    document.querySelectorAll("[data-gform]").forEach(function (a) { a.href = finalUrl; });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();

  // Code copy buttons ([data-copy] -> element id). Minimal, no dependencies.
  // Feedback is optimistic (immediate); clipboard + execCommand fallback run
  // fire-and-forget so headless/denied clipboard permissions can't stall UI.
  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
    } catch (e) {}
  }
  try {
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var el = document.getElementById(btn.getAttribute("data-copy"));
        if (!el) return;
        var prev = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = prev; }, 1600);
        try {
          var text = el.textContent || "";
          if (navigator.clipboard && navigator.clipboard.writeText) {
            var p = navigator.clipboard.writeText(text);
            if (p && typeof p.catch === "function") p.catch(function () { fallbackCopy(text); });
          } else {
            fallbackCopy(text);
          }
        } catch (e) { fallbackCopy(el.textContent || ""); }
      });
    });
  } catch (e) {}
})();
