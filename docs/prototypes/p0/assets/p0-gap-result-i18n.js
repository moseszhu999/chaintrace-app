(function () {
  var langKey = "chaintrace-p0-language";
  var indexes = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  var rows = [
    ["Current task action", "当前任务动作", "目前任務動作", "現在のタスク操作", "Acción de tarea actual"],
    ["Upload invoice explanation", "上传发票差异说明", "上傳發票差異說明", "インボイス差額説明をアップロード", "Subir explicación de factura"],
    ["Open material package", "打开材料包", "打開材料包", "資料パッケージを開く", "Abrir paquete de materiales"],
    ["Ask Agent to re-check", "让 Agent 重新检查", "讓 Agent 重新檢查", "Agent に再チェックを依頼", "Pedir al Agent revisar de nuevo"],
    ["Save and return later", "保存并稍后返回", "儲存並稍後返回", "保存して後で戻る", "Guardar y volver después"],
    ["Task note", "任务备注", "任務備註", "タスクメモ", "Nota de tarea"],
    ["Need to explain why invoice amount is higher than PO before submitting to review.", "提交审核前，需要解释为什么发票金额高于 PO。", "提交審核前，需要解釋為什麼發票金額高於 PO。", "レビュー提出前に、インボイス金額が PO より高い理由を説明する必要があります。", "Hay que explicar por qué la factura supera el PO antes de enviar a revisión."],
    ["Start from intent", "从意图开始", "從意圖開始", "意図から開始", "Empezar desde intención"],
    ["Resolve current gap", "解决当前缺口", "解決目前缺口", "現在のギャップを解消", "Resolver brecha actual"],
    ["Funding Result", "资金结果", "資金結果", "資金結果", "Resultado de fondos"],
    ["Completed is different from allowed, approved, review-ready, or pool-available.", "已完成不同于已允许、已批准、可审核或资金池可用。", "已完成不同於已允許、已批准、可審核或資金池可用。", "完了は、許可済み、承認済み、レビュー可能、プール利用可能とは異なります。", "Completado es diferente de permitido, aprobado, listo para revisión o pool disponible."],
    ["Requested", "申请金额", "申請金額", "申請額", "Solicitado"],
    ["Funder allowed", "资金方允许", "資金方允許", "資金提供者許可", "Financiador permitió"],
    ["Executed", "已执行", "已執行", "実行済み", "Ejecutado"],
    ["Result", "结果", "結果", "結果", "Resultado"],
    ["Completed", "已完成", "已完成", "完了", "Completado"],
    ["Exporter decision on adjusted amount", "出口商对调整金额的决定", "出口商對調整金額的決定", "調整額に対する輸出者判断", "Decisión sobre importe ajustado"],
    ["Accept USD 92,000 completed amount", "接受 USD 92,000 完成金额", "接受 USD 92,000 完成金額", "USD 92,000 の完了額を承認", "Aceptar importe completado de USD 92,000"],
    ["Request review for original USD 96,000", "请求按原 USD 96,000 复核", "請求按原 USD 96,000 複核", "元の USD 96,000 で再レビュー依頼", "Solicitar revisión por USD 96,000 original"],
    ["Close and create new case later", "关闭并稍后新建案件", "關閉並稍後新建案件", "閉じて後で新規ケース作成", "Cerrar y crear nuevo caso después"],
    ["Case follow-up", "案件后续", "案件後續", "ケースフォロー", "Seguimiento del caso"],
    ["Archive with funding summary", "连同融资摘要归档", "連同融資摘要歸檔", "資金調達サマリー付きでアーカイブ", "Archivar con resumen de financiación"],
    ["Keep open for post-funding tracking", "保持打开用于融资后跟踪", "保持打開用於融資後追蹤", "資金調達後の追跡用に保持", "Mantener abierto para seguimiento"],
    ["Ask Agent to prepare report", "让 Agent 准备报告", "讓 Agent 準備報告", "Agent にレポート作成を依頼", "Pedir al Agent preparar informe"],
    ["Intent", "意图", "意圖", "意図", "Intención"],
    ["Financing request created.", "融资请求已创建。", "融資請求已建立。", "資金調達リクエストが作成されました。", "Solicitud de financiación creada."],
    ["Materials", "材料", "材料", "資料", "Materiales"],
    ["Mismatch explained.", "差异已解释。", "差異已解釋。", "不一致を説明済み。", "Diferencia explicada."],
    ["Inspection", "质检", "質檢", "検査", "Inspección"],
    ["Independent fact submitted.", "独立事实已提交。", "獨立事實已提交。", "独立事実を提出済み。", "Hecho independiente enviado."],
    ["Funder", "资金方", "資金方", "資金提供者", "Financiador"],
    ["USD 92,000 allowed.", "已允许 USD 92,000。", "已允許 USD 92,000。", "USD 92,000 が許可済み。", "USD 92,000 permitido."],
    ["DeFi Check", "DeFi 检查", "DeFi 檢查", "DeFi チェック", "Verificación DeFi"],
    ["Rule, pool, pause passed.", "规则、资金池、暂停检查已通过。", "規則、資金池、暫停檢查已通過。", "ルール、プール、一時停止を通過。", "Regla, pool y pausa aprobados."],
    ["Funding execution completed.", "资金执行已完成。", "資金執行已完成。", "資金実行が完了しました。", "Ejecución de fondos completada."],
    ["Return to role gate", "返回角色入口", "返回角色入口", "ロールゲートへ戻る", "Volver a puerta de rol"],
    ["Agent Closing Summary", "Agent 收尾摘要", "Agent 收尾摘要", "Agent クロージングサマリー", "Resumen final del Agent"],
    ["Material conflict", "材料冲突", "材料衝突", "資料不一致", "Conflicto de material"],
    ["Funding decision", "融资决策", "融資決策", "資金調達判断", "Decisión de financiación"],
    ["Execution", "执行", "執行", "実行", "Ejecución"],
    ["Exporter closing note", "出口商结案备注", "出口商結案備註", "輸出者クロージングメモ", "Nota final del exportador"],
    ["Exporter-visible Exception States", "出口商可见异常状态", "出口商可見異常狀態", "輸出者に見える例外状態", "Estados de excepción visibles"],
    ["The same result page also shows how blockers are explained when the happy path does not complete.", "同一个结果页也展示正常路径未完成时，阻断项如何向出口商解释。", "同一個結果頁也展示正常路徑未完成時，阻斷項如何向出口商解釋。", "同じ結果ページで、正常パスが完了しない場合のブロッカー説明も表示します。", "La misma página muestra cómo se explican bloqueos cuando la ruta feliz no se completa."]
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
    document.querySelectorAll("option, textarea").forEach(function (node) {
      var prop = node.tagName === "OPTION" ? "textContent" : "value";
      var current = String(node[prop] || "").trim();
      var next = translate(current, language);
      if (next !== current) node[prop] = next;
    });
  }
  window.ChainTraceP0GapResultI18n = { apply: apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(apply, 0); });
  else setTimeout(apply, 0);
  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-language-select]")) setTimeout(apply, 0);
  });
})();
