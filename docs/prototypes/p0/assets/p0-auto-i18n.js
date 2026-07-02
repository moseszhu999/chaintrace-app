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
    add("p0cryptorail", "assets/p0-crypto-rail.js?v=cryptorail1");
    add("p0cryptorailzh", "assets/p0-crypto-rail-locale.js?v=zh1");
    add("p0intentassist", "assets/p0-intent-agent-assist.js?v=intentassist1");
    add("p0operatorrail", "assets/p0-operator-rail.js?v=operatorrail1");
    add("p0disputerail", "assets/p0-dispute-rail.js?v=disputerail1");
    add("p0auditrail", "assets/p0-audit-rail.js?v=auditrail1");
    add("p0settlementrail", "assets/p0-settlement-rail.js?v=settlementrail1");
    add("p0settlementcrypto", "assets/p0-settlement-crypto-rail.js?v=settlementcrypto1");
    add("p0insurerrail", "assets/p0-insurer-rail.js?v=insurerrail1");
    add("p0investorrail", "assets/p0-investor-rail.js?v=investorrail1");
    add("p0investorcrypto", "assets/p0-investor-crypto-rail.js?v=investorcrypto1");
    add("p0kybrail", "assets/p0-kyb-rail.js?v=kybrail1");
    add("p0kybcrypto", "assets/p0-kyb-crypto-rail.js?v=kybcrypto1");
    add("p0oraclerail", "assets/p0-oracle-rail.js?v=oraclerail1");
    add("p0oraclecrypto", "assets/p0-oracle-crypto-rail.js?v=oraclecrypto1");
    add("p0physicalrail", "assets/p0-physical-rail.js?v=physicalrail1");
    add("p0physicalcrypto", "assets/p0-physical-crypto-rail.js?v=physicalcrypto1");
    add("p0legalrail", "assets/p0-legal-rail.js?v=legalrail1");
    add("p0legalcrypto", "assets/p0-legal-crypto-rail.js?v=legalcrypto1");
    add("p0proofgraphrail", "assets/p0-proof-graph-rail.js?v=proofgraphrail1");
    add("p0proofgraphcrypto", "assets/p0-proof-graph-crypto-rail.js?v=proofgraphcrypto1");
    add("p0salesdemorail", "assets/p0-sales-demo-rail.js?v=salesdemo1");
  }

  window.ChainTraceP0AutoI18n = { apply: load };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load);
  else load();
})();