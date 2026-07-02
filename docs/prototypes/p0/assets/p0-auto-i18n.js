(function () {
  function add(id, src, cb) {
    if (document.getElementById(id)) {
      if (cb) cb();
      return;
    }
    var s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.defer = true;
    s.onload = cb;
    document.body.appendChild(s);
  }

  function apply() {
    if (window.ChainTraceP0BusinessI18n) window.ChainTraceP0BusinessI18n.apply();
    if (window.ChainTraceP0ProfileUiI18n) window.ChainTraceP0ProfileUiI18n.apply();
    if (window.ChainTraceP0FinalI18n) window.ChainTraceP0FinalI18n.apply();
    if (window.ChainTraceP0ForceI18n) window.ChainTraceP0ForceI18n.apply();
    if (window.ChainTraceP0IntentI18n) window.ChainTraceP0IntentI18n.apply();
    if (window.ChainTraceP0InspectionI18n) window.ChainTraceP0InspectionI18n.apply();
  }

  function load() {
    add("p0c2", "assets/p0-contrast-fix.js?v=c2");
    add("p0b5", "assets/p0-business-i18n.js?v=b5", apply);
    add("p0p4", "assets/p0-profile-ui-i18n.js?v=p4", apply);
    add("p0f3", "assets/p0-final-i18n.js?v=f3", apply);
    add("p0x2", "assets/p0-force-i18n.js?v=x2", apply);
    add("p0i1", "assets/p0-intent-i18n.js?v=i1", apply);
    add("p0inspection", "assets/p0-inspection-i18n.js?v=inspection1", apply);
    add("p0agentrail", "assets/p0-agent-rail.js?v=agentrail1");
  }

  window.ChainTraceP0AutoI18n = { apply: load };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load);
  else load();
})();
