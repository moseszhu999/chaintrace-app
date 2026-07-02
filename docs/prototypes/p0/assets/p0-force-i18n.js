(function () {
  var langKey = "chaintrace-p0-language";
  var indexes = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  var rows = [
    ["Agent Assist", "Agent 辅助", "Agent 輔助", "Agent 支援", "Asistencia del Agent"],
    ["Invoice", "发票", "發票", "インボイス", "Factura"],
    ["PO amount", "PO 金额", "PO 金額", "PO 金額", "Importe PO"],
    ["Requested", "申请金额", "申請金額", "申請額", "Solicitado"],
    ["Path", "路径", "路徑", "パス", "Ruta"],
    ["Done", "已完成", "已完成", "完了", "Hecho"],
    ["Conflict", "冲突", "衝突", "不一致", "Conflicto"],
    ["Agent", "Agent", "Agent", "Agent", "Agent"],
    ["Waiting", "等待中", "等待中", "待機中", "Esperando"],
    ["Locked", "锁定", "鎖定", "ロック中", "Bloqueado"],
    ["No result", "无结果", "無結果", "結果なし", "Sin resultado"],
    ["Intent", "意图", "意圖", "意図", "Intención"],
    ["Materials", "材料", "材料", "資料", "Materiales"],
    ["Gap Todo", "缺口待办", "缺口待辦", "ギャップタスク", "Tarea de brecha"],
    ["Inspection", "质检", "質檢", "検査", "Inspección"],
    ["Funding", "融资", "融資", "資金調達", "Financiación"],
    ["DeFi Check", "DeFi 检查", "DeFi 檢查", "DeFi チェック", "Verificación DeFi"],
    ["Result", "结果", "結果", "結果", "Resultado"],
    ["Current gap", "当前缺口", "目前缺口", "現在のギャップ", "Brecha actual"],
    ["Invoice mismatch", "发票不匹配", "發票不匹配", "インボイス不一致", "Diferencia de factura"],
    ["Responsible party", "责任方", "責任方", "責任者", "Parte responsable"],
    ["Exporter", "出口商", "出口商", "輸出者", "Exportador"],
    ["Next action", "下一步动作", "下一步動作", "次のアクション", "Siguiente acción"],
    ["Upload explanation", "上传说明", "上傳說明", "説明をアップロード", "Subir explicación"],
    ["Submit to review", "提交审核", "提交審核", "レビューへ提出", "Enviar a revisión"],
    ["Disabled", "已禁用", "已停用", "無効", "Deshabilitado"],
    ["Exporter created financing intent.", "出口商已创建融资意图。", "出口商已建立融資意圖。", "輸出者が資金調達意図を作成しました。", "El exportador creó la intención de financiación."],
    ["Invoice amount does not match PO.", "发票金额与 PO 不匹配。", "發票金額與 PO 不匹配。", "インボイス金額が PO と一致しません。", "El importe de factura no coincide con PO."],
    ["Agent created exporter task.", "Agent 已创建出口商任务。", "Agent 已建立出口商任務。", "Agent が輸出者タスクを作成しました。", "El Agent creó una tarea para el exportador."],
    ["Not created until material gap closes.", "材料缺口关闭前不会创建。", "材料缺口關閉前不會建立。", "資料ギャップが閉じるまで作成されません。", "No se crea hasta cerrar la brecha de materiales."],
    ["Cannot submit yet.", "暂不能提交。", "暫不能提交。", "まだ提出できません。", "Aún no se puede enviar."],
    ["No execution before review.", "审核前不执行。", "審核前不執行。", "レビュー前の実行はありません。", "Sin ejecución antes de revisión."],
    ["No funding result yet.", "尚无资金结果。", "尚無資金結果。", "資金結果はまだありません。", "Aún no hay resultado de fondos."]
  ];
  function lang() { return localStorage.getItem(langKey) || "en"; }
  function findRow(value) {
    var text = String(value || "").trim();
    for (var i = 0; i < rows.length; i += 1) {
      for (var j = 0; j < rows[i].length; j += 1) {
        if (rows[i][j] === text) return rows[i];
      }
    }
    return null;
  }
  function translate(value, language) {
    var row = findRow(value);
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
    document.querySelectorAll("option, textarea").forEach(function (node) {
      var prop = node.tagName === "OPTION" ? "textContent" : "value";
      var current = String(node[prop] || "").trim();
      var next = translate(current, language);
      if (next !== current) node[prop] = next;
    });
  }
  window.ChainTraceP0ForceI18n = { apply: apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(apply, 0); });
  else setTimeout(apply, 0);
  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-language-select]")) setTimeout(apply, 0);
  });
})();
