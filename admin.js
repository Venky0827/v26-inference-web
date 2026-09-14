// V26 Inference — Phase 1 placeholder admin (§23-25).
// WARNING: client-side gate only. Production requires server auth, sessions,
// rate limiting, MFA/TOTP, audit log. Do not rely on this gate publicly.
(function () {
  var gate = document.getElementById("admin-gate");
  if (!gate) return;
  var dash = document.getElementById("dash"), gateWrap = document.getElementById("gate");
  function unlock() { gateWrap.hidden = true; dash.hidden = false; render(); }
  if (sessionStorage.getItem("v26_admin_ok") === "1") unlock();
  gate.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = document.getElementById("admin-pass").value;
    var expected = localStorage.getItem("v26_admin");
    if (!expected) { localStorage.setItem("v26_admin", v || "change-me"); sessionStorage.setItem("v26_admin_ok", "1"); unlock(); return; }
    if (v === expected) { sessionStorage.setItem("v26_admin_ok", "1"); unlock(); }
    else document.getElementById("gate-msg").textContent = "Wrong passphrase.";
  });
  function rows() { return (window.V26Store ? window.V26Store.list() : []).slice().reverse(); }
  function fillSelect(id, key) {
    var s = document.getElementById(id);
    var vals = Array.from(new Set(rows().map(function (r) { return r[key] || ""; }).filter(Boolean)));
    vals.forEach(function (v) { var o = document.createElement("option"); o.value = v; o.textContent = v; s.appendChild(o); });
  }
  function render() {
    var data = rows();
    var q = (document.getElementById("q").value || "").toLowerCase();
    var fu = document.getElementById("f-use").value, fus = document.getElementById("f-usage").value, fs = document.getElementById("f-src").value;
    var f = data.filter(function (r) {
      if (fu && r.use_case !== fu) return false;
      if (fus && r.expected_usage !== fus) return false;
      if (fs && r.source !== fs) return false;
      if (q && ((r.email || "") + " " + (r.company || "") + " " + (r.name || "")).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var total = data.length;
    var today = data.filter(function (r) { return (r.created_at || "").slice(0, 10) === new Date().toISOString().slice(0, 10); }).length;
    var conv = "";
    try {
      var a = JSON.parse(localStorage.getItem("v26_analytics_v1") || "[]");
      var views = a.filter(function (x) { return x.event === "landing_page_view"; }).length || 1;
      conv = Math.round(1000 * total / views) / 10 + "%";
    } catch (e) { conv = "n/a"; }
    document.getElementById("metrics").innerHTML =
      metric(total, "Total registrations") + metric(today, "Registrations today") +
      metric(conv, "Visitor → registration") + metric(new Set(data.map(function (r) { return r.source; })).size, "Traffic sources");
    document.getElementById("rows").innerHTML = f.map(function (r) {
      return "<tr><td>" + esc(r.email) + "</td><td>" + esc(r.name) + "</td><td>" + esc(r.company) +
        "</td><td>" + esc(r.use_case) + "</td><td>" + esc(r.expected_usage) + "</td><td>" + esc((r.current_provider || []).join(", ")) +
        "</td><td>" + esc(r.source) + "</td><td>" + esc((r.created_at || "").slice(0, 10)) + "</td><td>" + esc(r.status) + "</td></tr>";
    }).join("") || '<tr><td colspan="9">No registrations yet.</td></tr>';
    window._filtered = f;
  }
  function metric(v, l) { return '<div class="metric"><strong>' + v + '</strong><span>' + l + '</span></div>'; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  fillSelect("f-use", "use_case"); fillSelect("f-usage", "expected_usage"); fillSelect("f-src", "source");
  ["q", "f-use", "f-usage", "f-src"].forEach(function (id) { document.getElementById(id).addEventListener("input", render); });
  document.getElementById("csv").addEventListener("click", function () {
    var rows = window._filtered || [];
    var cols = ["id", "email", "name", "company", "use_case", "use_case_other", "expected_usage", "current_provider", "comments", "referral_code", "utm_source", "utm_medium", "utm_campaign", "source", "created_at", "status", "email_verified", "marketing_consent"];
    var csv = [cols.join(",")].concat(rows.map(function (r) {
      return cols.map(function (c) {
        var v = r[c]; if (Array.isArray(v)) v = v.join("|");
        return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
      }).join(",");
    })).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "v26-waitlist.csv"; a.click();
  });
})();
