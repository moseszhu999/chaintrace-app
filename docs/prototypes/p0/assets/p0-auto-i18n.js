(function () {
  function loadBusinessPatch() {
    if (document.querySelector('script[data-p0-business-i18n="true"]')) {
      window.ChainTraceP0BusinessI18n?.apply?.();
      return;
    }
    const script = document.createElement("script");
    script.src = "assets/p0-business-i18n.js?v=20260702-business1";
    script.defer = true;
    script.dataset.p0BusinessI18n = "true";
    script.onload = () => window.ChainTraceP0BusinessI18n?.apply?.();
    document.body.appendChild(script);
  }

  window.ChainTraceP0AutoI18n = {
    apply: loadBusinessPatch
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadBusinessPatch);
  } else {
    loadBusinessPatch();
  }
})();
