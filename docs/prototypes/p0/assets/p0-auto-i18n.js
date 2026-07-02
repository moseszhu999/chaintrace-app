(function () {
  function add(id, src, done) {
    var old = document.getElementById(id);
    if (old) {
      if (done) done();
      return;
    }
    var s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.defer = true;
    s.onload = done;
    document.body.appendChild(s);
  }

  function apply() {
    if (window.ChainTraceP0BusinessI18n) window.ChainTraceP0BusinessI18n.apply();
    if (window.ChainTraceP0ProfileUiI18n) window.ChainTraceP0ProfileUiI18n.apply();
    if (window.ChainTraceP0FinalI18n) window.ChainTraceP0FinalI18n.apply();
  }

  function load() {
    add("p0b", "assets/p0-business-i18n.js?v=20260702b3", apply);
    add("p0p", "assets/p0-profile-ui-i18n.js?v=20260702p2", apply);
    add("p0f", "assets/p0-final-i18n.js?v=20260702f1", apply);
  }

  window.ChainTraceP0AutoI18n = { apply: load };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
