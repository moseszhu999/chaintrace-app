(function () {
  var langKey = "chaintrace-p0-language";
  var indexes = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  var rows = [
    ["Current task action", "当前任务动作", "目前任務動作", "現在のタスク操作", "Acción de tarea actual"],
    ["Upload invoice explanation", "上传发票差异说明", "上傳發票差異說明", "インボイス差額説明をアップロード", "Subir explicación de factura"],
    ["Task note", "任务备注", "任務備註", "タスクメモ", "Nota de tarea"],
    ["Start from intent", "从意图开始", "從意圖開始", "意図から開始", "Empezar desde intención"],
    ["Resolve current gap", "解决当前缺口", "解決目前缺口", "現在のギャップを解消", "Resolver brecha actual"]
  ];
  function lang() { return localStorage.getItem(langKey) || "en"; }
  function rowFor(value) {
    var text = String(value || "").trim();
    for (var i = 0; i < rows.length; i += 1) {
      for (var j = 0; j < rows[i].length; j += 1) {
        if (rows[i][j] === text) return rows[i];
      }
    }
    return null;
  }
  function translate(value, language) {
    var row = rowFor(value);
    if (!row) return value;
    return row[indexes[language] || 0] || row[0];
  }
  function apply() {
    var language = lang();
    document.querySelectorAll("body *").forEach(function (node) {
      if (node.children.length) return;
      var current = String(node.textContent || "").trim();
      var next = translate(current, language);
      if (next !== current) node.textContent = next;
    });
    document.querySelectorAll("option").forEach(function (node) {
      var current = String(node.textContent || "").trim();
      var next = translate(current, language);
      if (next !== current) node.textContent = next;
    });
  }
  window.ChainTraceP0GapLabelI18n = { apply: apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(apply, 0); });
  else setTimeout(apply, 0);
  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-language-select]")) setTimeout(apply, 0);
  });
})();
