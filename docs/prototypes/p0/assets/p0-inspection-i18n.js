(function () {
  var langKey = "chaintrace-p0-language";
  var indexes = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  var rows = [
    ["Inspection Fact Node", "质检事实节点", "質檢事實節點", "検査事実ノード", "Nodo de inspección"],
    ["The normal branch shows Pass. Future inspector pages will own the actual inspection workflow.", "正常分支显示通过。未来质检方页面将负责实际质检工作流。", "正常分支顯示通過。未來質檢方頁面將負責實際質檢工作流。", "通常分岐では Pass を表示します。将来の検査員ページが実際の検査フローを担当します。", "La rama normal muestra aprobado. Las futuras páginas del inspector tendrán el flujo real."],
    ["Task Request", "任务请求", "任務請求", "タスク依頼", "Solicitud de tarea"],
    ["Inspection provider", "质检服务商", "質檢服務商", "検査プロバイダー", "Proveedor de inspección"],
    ["Priority", "优先级", "優先級", "優先度", "Prioridad"],
    ["Inspection location", "质检地点", "質檢地點", "検査地点", "Ubicación de inspección"],
    ["Task status", "任务状态", "任務狀態", "タスク状態", "Estado de tarea"],
    ["Closed", "已关闭", "已關閉", "クローズ", "Cerrado"],
    ["Evidence", "证据", "證據", "証拠", "Evidencia"],
    ["Report", "报告", "報告", "レポート", "Informe"],
    ["Photos", "照片", "照片", "写真", "Fotos"],
    ["Quantity note", "数量说明", "數量說明", "数量メモ", "Nota de cantidad"],
    ["Submitted", "已提交", "已提交", "提出済み", "Enviado"],
    ["Matched", "已匹配", "已匹配", "一致", "Coincide"],
    ["Impact", "影响", "影響", "影響", "Impacto"],
    ["Conclusion source", "结论来源", "結論來源", "結論ソース", "Fuente de conclusión"],
    ["Inspection provider submitted Pass", "质检服务商提交通过结论", "質檢服務商提交通過結論", "検査プロバイダーが Pass を提出", "Proveedor envió aprobado"],
    ["Pass supports review:", "通过结论支持审核：", "通過結論支持審核：", "Pass はレビューを支援:", "Aprobado apoya revisión:"],
    ["Continue to funding path", "继续到融资路径", "繼續到融資路徑", "資金調達パスへ進む", "Continuar a ruta de financiación"],
    ["Standard", "标准", "標準", "標準", "Estándar"]
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
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      var parent = node.parentElement;
      if (!parent || parent.closest("script, style")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var current = node.nodeValue.trim();
      var next = translate(current, language);
      if (next !== current) node.nodeValue = node.nodeValue.replace(current, next);
    });
    document.querySelectorAll("option").forEach(function (node) {
      var current = String(node.textContent || "").trim();
      var next = translate(current, language);
      if (next !== current) node.textContent = next;
    });
  }
  window.ChainTraceP0InspectionI18n = { apply: apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(apply, 0); });
  else setTimeout(apply, 0);
  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-language-select]")) setTimeout(apply, 0);
  });
})();
