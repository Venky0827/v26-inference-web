// V26 Inference — Phase 1 waitlist store.
// Placeholder backend-ready store. Uses localStorage until waitlistEndpoint is set.
// Schema follows spec §18: waitlist_users.
(function () {
  var KEY = "v26_waitlist_users_v1";
  var RATE_KEY = "v26_waitlist_rate_v1";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function readAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch (e) { return []; }
  }
  function writeAll(rows) {
    localStorage.setItem(KEY, JSON.stringify(rows));
  }
  // Basic XSS-safe trim + length cap. Server must re-validate (§20).
  function cleanStr(v, max) {
    v = String(v == null ? "" : v).trim().slice(0, max || 500);
    return v.replace(/[<>"']/g, "");
  }
  function cleanEmail(v) {
    return String(v || "").trim().toLowerCase().slice(0, 254);
  }
  function checkRateLimit() {
    var now = Date.now();
    var arr = [];
    try { arr = JSON.parse(localStorage.getItem(RATE_KEY) || "[]"); } catch (e) {}
    arr = arr.filter(function (t) { return now - t < 60 * 60 * 1000; });
    if (arr.length >= 5) return false; // 5 submits/hour/device (server must enforce its own)
    arr.push(now);
    localStorage.setItem(RATE_KEY, JSON.stringify(arr));
    return true;
  }
  function getQueryParams() {
    var p = new URLSearchParams(window.location.search);
    function g(k) { return cleanStr(p.get(k) || "", 200); }
    return {
      referral_code: g("ref") || cleanStr(localStorage.getItem("v26_ref") || "", 100),
      utm_source: g("utm_source"), utm_medium: g("utm_medium"),
      utm_campaign: g("utm_campaign"), utm_term: g("utm_term"),
      utm_content: g("utm_content")
    };
  }
  function detectSource(utmSource) {
    if (utmSource) return utmSource;
    var r = document.referrer || "";
    if (!r) return "direct";
    if (r.indexOf("google") >= 0) return "google";
    if (r.indexOf("reddit") >= 0) return "reddit";
    if (r.indexOf("news.ycombinator") >= 0 || r.indexOf("hacker news") >= 0) return "hackernews";
    if (r.indexOf("linkedin") >= 0) return "linkedin";
    if (r.indexOf("x.com") >= 0 || r.indexOf("twitter") >= 0) return "x";
    if (r.indexOf("github") >= 0) return "github";
    if (r.indexOf("youtube") >= 0) return "youtube";
    try {
      if (new URL(r).hostname !== window.location.hostname) return "referral";
    } catch (e) {}
    return "direct";
  }

  async function submitRemote(payload) {
    var ep = window.V26_CONFIG && window.V26_CONFIG.waitlistEndpoint;
    if (!ep) return null;
    var res = await fetch(ep, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    var data = null;
    try { data = await res.json(); } catch (e) {}
    if (res.status === 409) { var err = new Error("duplicate"); err.code = "duplicate"; throw err; }
    if (!res.ok || (data && data.ok === false)) {
      var err2 = new Error((data && data.error) || ("http_" + res.status));
      err2.code = "remote"; err2.fields = data && data.fields;
      throw err2;
    }
    return data;
  }

  // Returns {ok, id} or throws {code: invalid|duplicate|ratelimit|consent|remote}
  async function create(input) {
    var email = cleanEmail(input.email);
    if (!EMAIL_RE.test(email)) { var e1 = new Error("invalid_email"); e1.code = "invalid"; throw e1; }
    var use_case = cleanStr(input.use_case, 100);
    var expected_usage = cleanStr(input.expected_usage, 100);
    if (!use_case || !expected_usage) { var e2 = new Error("missing_fields"); e2.code = "invalid"; throw e2; }
    if (!input.marketing_consent && !input.essential_consent) {
      // Spec §16: marketing consent separate; essential service notice required.
      var e3 = new Error("consent_required"); e3.code = "consent"; throw e3;
    }
    if (input.honeypot) { var e4 = new Error("bot_detected"); e4.code = "invalid"; throw e4; }
    if (!checkRateLimit()) { var e5 = new Error("rate_limited"); e5.code = "ratelimit"; throw e5; }

    var q = getQueryParams();
    if (q.referral_code) { try { localStorage.setItem("v26_ref", q.referral_code); } catch (e) {} }
    var payload = {
      email: email,
      name: cleanStr(input.name, 120),
      company: cleanStr(input.company, 160),
      use_case: use_case,
      use_case_other: cleanStr(input.use_case_other, 200),
      expected_usage: expected_usage,
      current_provider: (input.current_provider || []).map(function (x) { return cleanStr(x, 60); }).slice(0, 10),
      comments: cleanStr(input.comments, 1000),
      referral_code: cleanStr(input.referral_code || q.referral_code, 100),
      utm_source: q.utm_source, utm_medium: q.utm_medium, utm_campaign: q.utm_campaign,
      utm_term: q.utm_term, utm_content: q.utm_content,
      source: detectSource(q.utm_source),
      country: "", // filled server-side where legally appropriate
      marketing_consent: !!input.marketing_consent,
      status: "new", email_verified: false
    };

    // Prefer real backend when configured.
    if (window.V26_CONFIG && window.V26_CONFIG.waitlistEndpoint) {
      return { remote: await submitRemote(payload), payload: payload };
    }
    // Phase 1 placeholder: local record with server-shape fields.
    var rows = readAll();
    if (rows.some(function (r) { return r.email === email; })) {
      var dup = new Error("duplicate"); dup.code = "duplicate"; throw dup;
    }
    var now = new Date().toISOString();
    var row = Object.assign({ id: "local_" + Date.now().toString(36), created_at: now, updated_at: now }, payload);
    rows.push(row);
    writeAll(rows);
    return { ok: true, id: row.id, payload: payload };
  }

  function list() { return readAll(); }

  window.V26Store = { create: create, list: list, getQueryParams: getQueryParams };
})();
