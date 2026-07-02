(function () {
  function addScript(id, src, onload) {
    if (document.getElementById(id)) {
      if (onload) onload();
      return;
    }
    var script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.defer = true;
    script.onload = onload;
    document.body.appendChild(script);
  }

  function applyAll() {
    if (window.ChainTraceP0BusinessI18n) window.ChainTraceP0BusinessI18n.apply();
    if (window.ChainTraceP0ProfileUiI18n) window.ChainTraceP0ProfileUiI18n.apply();
  }

  function loadAll() {
    addScript("p0-business-i18n-loader", "assets/p0-business-i18n.js?v=20260702-business2", applyAll);
    addScript("p0-profile-ui-i18n-loader", "assets/p0-profile-ui-i18n.js?v=20260702-profile1", applyAll);
  }

  window.ChainTraceP0AutoI18n = { apply: loadAll };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAll);
  } else {
    loadAll();
  }
})();
