(function () {
  var langKey = "chaintrace-p0-language";
  var indexes = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  var rows = [
    ["Financing Intent Draft", "融资意图草稿", "融資意圖草稿", "資金調達意図ドラフト", "Borrador de intención de financiación"],
    ["The form is drawn as filled prototype data so reviewers can continue the flow.", "表单使用已填写的原型数据，方便评审者继续流程。", "表單使用已填寫的原型資料，方便評審者繼續流程。", "レビュー担当者がフローを続けられるよう、フォームは入力済みプロトタイプデータで表示されます。", "El formulario se muestra con datos de prototipo para que los revisores continúen el flujo."],
    ["Financing type", "融资类型", "融資類型", "資金調達タイプ", "Tipo de financiación"],
    ["Settlement currency", "结算币种", "結算幣種", "決済通貨", "Moneda de liquidación"],
    ["Requested amount", "申请金额", "申請金額", "申請額", "Importe solicitado"],
    ["Expected funding time", "期望到账时间", "期望到帳時間", "希望資金化時期", "Tiempo esperado de financiación"],
    ["Buyer", "买方", "買方", "買い手", "Comprador"],
    ["Buyer country", "买方国家", "買方國家", "買い手の国", "País del comprador"],
    ["Goods category", "货物类别", "貨物類別", "商品カテゴリ", "Categoría de mercancía"],
    ["Shipment quantity", "出货数量", "出貨數量", "出荷数量", "Cantidad de envío"],
    ["Trade note", "贸易备注", "貿易備註", "貿易メモ", "Nota comercial"],
    ["Agent Setup", "Agent 设置", "Agent 設定", "Agent 設定", "Configuración del Agent"],
    ["Manual", "人工确认", "人工確認", "手動確認", "Manual"],
    ["Semi-auto", "半自动", "半自動", "半自動", "Semiautomático"],
    ["Full-auto", "全自动", "全自動", "全自動", "Automático"],
    ["Boundary:", "边界：", "邊界：", "境界：", "Límite:"],
    ["Agent can prepare checklists and todos, but exporter remains responsible for trade materials.", "Agent 可以准备检查清单和待办，但出口商仍对贸易材料负责。", "Agent 可以準備檢查清單和待辦，但出口商仍對貿易材料負責。", "Agent はチェックリストとタスクを準備できますが、貿易資料の責任は輸出者にあります。", "El Agent puede preparar listas y tareas, pero el exportador sigue responsable de los materiales comerciales."],
    ["Post-shipment receivable financing", "出货后应收账款融资", "出貨後應收帳款融資", "出荷後売掛債権ファイナンス", "Financiación de cuentas por cobrar post-envío"],
    ["Purchase order financing", "采购订单融资", "採購訂單融資", "発注書ファイナンス", "Financiación de orden de compra"],
    ["Invoice financing", "发票融资", "發票融資", "インボイスファイナンス", "Financiación de factura"],
    ["Settlement / guarantee release", "结算 / 保证金释放", "結算 / 保證金釋放", "決済 / 保証解除", "Liquidación / liberación de garantía"],
    ["USD / USDC settlement", "USD / USDC 结算", "USD / USDC 結算", "USD / USDC 決済", "Liquidación USD / USDC"],
    ["USD bank transfer", "USD 银行转账", "USD 銀行轉帳", "USD 銀行送金", "Transferencia bancaria USD"],
    ["EUR / EURC settlement", "EUR / EURC 结算", "EUR / EURC 結算", "EUR / EURC 決済", "Liquidación EUR / EURC"],
    ["CNY settlement", "CNY 结算", "CNY 結算", "CNY 決済", "Liquidación CNY"],
    ["As soon as possible", "尽快", "盡快", "できるだけ早く", "Lo antes posible"],
    ["Within 3 business days", "3 个工作日内", "3 個工作日內", "3営業日以内", "En 3 días hábiles"],
    ["Within 7 business days", "7 个工作日内", "7 個工作日內", "7営業日以内", "En 7 días hábiles"],
    ["Flexible / negotiable", "可灵活协商", "可彈性協商", "柔軟 / 交渉可", "Flexible / negociable"],
    ["Germany", "德国", "德國", "ドイツ", "Alemania"],
    ["Consumer electronics", "消费电子", "消費電子", "コンシューマー電子機器", "Electrónica de consumo"],
    ["2,000 units", "2,000 件", "2,000 件", "2,000 個", "2.000 unidades"],
    ["Smart wearable shipment under confirmed purchase order. Exporter requests financing after shipment documents are prepared.", "已确认采购订单下的智能穿戴设备出货。出口商在出货文件准备后申请融资。", "已確認採購訂單下的智慧穿戴裝置出貨。出口商在出貨文件準備後申請融資。", "確認済み発注書に基づくスマートウェアラブル出荷。輸出者は出荷書類の準備後に資金調達を申請します。", "Envío de wearables inteligentes bajo orden confirmada. El exportador solicita financiación tras preparar documentos de envío."]
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
  window.ChainTraceP0IntentI18n = { apply: apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(apply, 0); });
  else setTimeout(apply, 0);
  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-language-select]")) setTimeout(apply, 0);
  });
})();
