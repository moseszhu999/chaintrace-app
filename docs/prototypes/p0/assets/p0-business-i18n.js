(function () {
  const langKey = "chaintrace-p0-language";
  const fallback = "en";
  const indexes = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  const rows = [
    ["Pacific Export LLC requests financing against a smart wearable shipment to Northstar Retail GmbH.", "Pacific Export LLC 以发往 Northstar Retail GmbH 的智能穿戴设备出货申请融资。", "Pacific Export LLC 以發往 Northstar Retail GmbH 的智慧穿戴裝置出貨申請融資。", "Pacific Export LLC は Northstar Retail GmbH 向けスマートウェアラブル出荷を担保に資金調達を申請しています。", "Pacific Export LLC solicita financiación contra un envío de wearables inteligentes a Northstar Retail GmbH."],
    ["Exporter created financing intent.", "出口商已创建融资意图。", "出口商已建立融資意圖。", "輸出者が資金調達意図を作成しました。", "El exportador creó la intención de financiación."],
    ["Invoice amount does not match PO.", "发票金额与 PO 不匹配。", "發票金額與 PO 不匹配。", "インボイス金額が PO と一致しません。", "El importe de factura no coincide con PO."],
    ["Agent created exporter task.", "Agent 已创建出口商任务。", "Agent 已建立出口商任務。", "Agent が輸出者タスクを作成しました。", "El Agent creó una tarea para el exportador."],
    ["Not created until material gap closes.", "材料缺口关闭前不会创建。", "材料缺口關閉前不會建立。", "資料ギャップが閉じるまで作成されません。", "No se crea hasta cerrar la brecha de materiales."],
    ["Cannot submit yet.", "暂不能提交。", "暫不能提交。", "まだ提出できません。", "Aún no se puede enviar."],
    ["No execution before review.", "审核前不执行。", "審核前不執行。", "レビュー前の実行はありません。", "Sin ejecución antes de revisión."],
    ["No funding result yet.", "尚无资金结果。", "尚無資金結果。", "資金結果はまだありません。", "Aún no hay resultado de fondos."],
    ["Inspection", "质检", "質檢", "検査", "Inspección"],
    ["Funding", "融资", "融資", "資金調達", "Financiación"],
    ["DeFi Check", "DeFi 检查", "DeFi 檢查", "DeFi チェック", "Verificación DeFi"],
    ["Result", "结果", "結果", "結果", "Resultado"],
    ["Bank + DeFi", "银行 + DeFi", "銀行 + DeFi", "銀行 + DeFi", "Banco + DeFi"],
    ["Current task action", "当前任务动作", "目前任務動作", "現在のタスク操作", "Acción de tarea actual"],
    ["Upload invoice explanation", "上传发票差异说明", "上傳發票差異說明", "インボイス差額説明をアップロード", "Subir explicación de factura"],
    ["Open material package", "打开材料包", "打開材料包", "資料パッケージを開く", "Abrir paquete de materiales"],
    ["Ask Agent to re-check", "让 Agent 重新检查", "讓 Agent 重新檢查", "Agent に再チェックを依頼", "Pedir al Agent revisar de nuevo"],
    ["Save and return later", "保存并稍后返回", "儲存並稍後返回", "保存して後で戻る", "Guardar y volver después"],
    ["Task note", "任务备注", "任務備註", "タスクメモ", "Nota de tarea"],
    ["Need to explain why invoice amount is higher than PO before submitting to review.", "提交审核前，需要解释为什么发票金额高于 PO。", "提交審核前，需要解釋為什麼發票金額高於 PO。", "レビュー提出前に、インボイス金額が PO より高い理由を説明する必要があります。", "Hay que explicar por qué la factura supera el PO antes de enviar a revisión."],
    ["The form is drawn as filled prototype data so reviewers can continue the flow.", "表单使用已填写的原型数据，方便评审者继续流程。", "表單使用已填寫的原型資料，方便評審者繼續流程。", "レビュー担当者がフローを続けられるよう、フォームは入力済みプロトタイプデータで表示されます。", "El formulario se muestra con datos de prototipo para que los revisores continúen el flujo."],
    ["Smart wearable shipment under confirmed purchase order. Exporter requests financing after shipment documents are prepared.", "已确认采购订单下的智能穿戴设备出货。出口商在出货文件准备后申请融资。", "已確認採購訂單下的智慧穿戴裝置出貨。出口商在出貨文件準備後申請融資。", "確認済み発注書に基づくスマートウェアラブル出荷。輸出者は出荷書類の準備後に資金調達を申請します。", "Envío de wearables inteligentes bajo orden confirmada. El exportador solicita financiación tras preparar documentos de envío."],
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
    ["United States", "美国", "美國", "米国", "Estados Unidos"],
    ["Singapore", "新加坡", "新加坡", "シンガポール", "Singapur"],
    ["Japan", "日本", "日本", "日本", "Japón"],
    ["United Kingdom", "英国", "英國", "英国", "Reino Unido"],
    ["Consumer electronics", "消费电子", "消費電子", "コンシューマー電子機器", "Electrónica de consumo"],
    ["Industrial components", "工业零部件", "工業零部件", "産業部品", "Componentes industriales"],
    ["Apparel and textiles", "服装与纺织品", "服裝與紡織品", "アパレル・繊維", "Ropa y textiles"],
    ["Food and agricultural goods", "食品与农产品", "食品與農產品", "食品・農産品", "Alimentos y productos agrícolas"],
    ["Every key step confirmed", "每个关键步骤都确认", "每個關鍵步驟都確認", "主要ステップごとに確認", "Cada paso clave confirmado"],
    ["Default assist and todos", "默认辅助与待办", "預設輔助與待辦", "標準支援とタスク", "Asistencia y tareas predeterminadas"],
    ["Low-risk only", "仅低风险", "僅低風險", "低リスクのみ", "Solo bajo riesgo"],
    ["Agent can prepare checklists and todos, but exporter remains responsible for trade materials.", "Agent 可以准备检查清单和待办，但出口商仍对贸易材料负责。", "Agent 可以準備檢查清單和待辦，但出口商仍對貿易材料負責。", "Agent はチェックリストとタスクを準備できますが、貿易資料の責任は輸出者にあります。", "El Agent puede preparar listas y tareas, pero el exportador sigue responsable de los materiales comerciales."],
    ["Trade parties and terms.", "贸易双方和条款。", "貿易雙方和條款。", "取引当事者と条件。", "Partes y términos comerciales."],
    ["Buyer purchase intent, USD 120,000.", "买方采购意图，USD 120,000。", "買方採購意圖，USD 120,000。", "買い手の購入意図、USD 120,000。", "Intención de compra del comprador, USD 120,000."],
    ["Payment claim, USD 128,000.", "付款主张，USD 128,000。", "付款主張，USD 128,000。", "支払請求、USD 128,000。", "Reclamación de pago, USD 128,000."],
    ["Quantity and packaging.", "数量和包装。", "數量和包裝。", "数量と梱包。", "Cantidad y empaque."],
    ["Independent goods fact.", "独立货物事实。", "獨立貨物事實。", "独立した商品事実。", "Hecho independiente de mercancía."],
    ["The invoice includes USD 8,000 in expedited packaging and inspection-related charges agreed after the original purchase order.", "发票包含 USD 8,000 的加急包装和质检相关费用，这些是在原采购订单之后协商确认的。", "發票包含 USD 8,000 的加急包裝和質檢相關費用，這些是在原採購訂單之後協商確認的。", "インボイスには、元の発注書後に合意された緊急梱包および検査関連費用 USD 8,000 が含まれます。", "La factura incluye USD 8,000 de empaque urgente y cargos de inspección acordados después de la orden original."],
    ["Submit supplemental explanation", "提交补充说明", "提交補充說明", "補足説明を提出", "Enviar explicación suplementaria"],
    ["Upload corrected invoice", "上传修正发票", "上傳修正發票", "修正インボイスをアップロード", "Subir factura corregida"],
    ["Upload corrected purchase order", "上传修正采购订单", "上傳修正採購訂單", "修正発注書をアップロード", "Subir orden de compra corregida"],
    ["Request manual review", "请求人工审核", "請求人工審核", "手動レビューを依頼", "Solicitar revisión manual"],
    ["Exporter finance manager", "出口商财务经理", "出口商財務經理", "輸出者の財務マネージャー", "Gerente financiero del exportador"],
    ["Exporter operations manager", "出口商运营经理", "出口商營運經理", "輸出者の運用マネージャー", "Gerente de operaciones del exportador"],
    ["External accountant", "外部会计", "外部會計", "外部会計士", "Contador externo"],
    ["The USD 8,000 difference is caused by added expedited packaging and inspection preparation charges approved by buyer email after the PO was issued.", "USD 8,000 的差异来自 PO 发出后买方通过邮件确认的加急包装和质检准备费用。", "USD 8,000 的差異來自 PO 發出後買方透過郵件確認的加急包裝和質檢準備費用。", "USD 8,000 の差額は、PO 発行後に買い手メールで承認された緊急梱包および検査準備費用によるものです。", "La diferencia de USD 8,000 proviene de empaque urgente y preparación de inspección aprobados por correo del comprador tras emitirse el PO."],
    ["Invoice amount is USD 8,000 higher than purchase order amount.", "发票金额比采购订单高 USD 8,000。", "發票金額比採購訂單高 USD 8,000。", "インボイス金額は発注書金額より USD 8,000 高くなっています。", "La factura supera la orden de compra por USD 8,000."],
    ["Exporter.", "出口商。", "出口商。", "輸出者。", "Exportador."],
    ["Supplemental explanation or corrected invoice/PO.", "补充说明或修正后的发票 / PO。", "補充說明或修正後的發票 / PO。", "補足説明または修正インボイス / PO。", "Explicación suplementaria o factura / PO corregido."],
    ["Funder can understand why the amounts differ.", "资金方可以理解金额差异原因。", "資金方可以理解金額差異原因。", "資金提供者が金額差異の理由を理解できること。", "El financiador puede entender por qué difieren los importes."],
    ["Ready to submit, or Manual review if explanation is weak.", "可提交；如果说明不足，则进入人工审核。", "可提交；如果說明不足，則進入人工審核。", "提出可能。説明が弱い場合は手動レビュー。", "Listo para enviar, o revisión manual si la explicación es débil."],
    ["Prototype behavior:", "原型行为：", "原型行為：", "プロトタイプ動作:", "Comportamiento del prototipo:"],
    ["clicking the action moves to inspection status as if the exporter submitted the explanation and Agent re-checked the case.", "点击动作会进入质检状态，就像出口商已提交说明且 Agent 已重新检查案件。", "點擊動作會進入質檢狀態，就像出口商已提交說明且 Agent 已重新檢查案件。", "アクションをクリックすると、輸出者が説明を提出し Agent が再チェックしたものとして検査ステータスへ進みます。", "al hacer clic se pasa al estado de inspección como si el exportador enviara la explicación y el Agent revisara de nuevo."],
    ["Standard", "标准", "標準", "標準", "Estándar"],
    ["Urgent", "紧急", "緊急", "緊急", "Urgente"],
    ["High-value shipment", "高价值出货", "高價值出貨", "高額出荷", "Envío de alto valor"],
    ["Dispute re-check", "争议复检", "爭議複檢", "紛争再チェック", "Revisión por disputa"],
    ["Inspection provider submitted Pass", "质检服务商提交通过结论", "質檢服務商提交通過結論", "検査プロバイダーが Pass を提出", "El proveedor de inspección envió aprobado"],
    ["Pass supports review:", "通过结论支持审核：", "通過結論支持審核：", "Pass はレビューを支援:", "Aprobado apoya revisión:"],
    ["this does not approve financing, but it allows the case to move into funding path selection.", "这不等于批准融资，但允许案件进入融资路径选择。", "這不等於批准融資，但允許案件進入融資路徑選擇。", "これは資金調達の承認ではありませんが、ケースを資金調達パス選択へ進めます。", "esto no aprueba la financiación, pero permite pasar a selección de ruta."],
    ["This normal branch uses bank-assisted review followed by DeFi execution check.", "正常分支采用银行辅助审核，然后进入 DeFi 执行检查。", "正常分支採用銀行輔助審核，然後進入 DeFi 執行檢查。", "通常分岐では銀行支援レビュー後に DeFi 実行チェックを行います。", "Esta rama normal usa revisión bancaria y luego verificación DeFi."],
    ["Core package and explanation are ready.", "核心材料包和说明已准备好。", "核心材料包和說明已準備好。", "主要資料パッケージと説明が準備済みです。", "Paquete principal y explicación listos."],
    ["Independent fact supports review.", "独立事实支持审核。", "獨立事實支持審核。", "独立事実がレビューを支援します。", "Hecho independiente apoya revisión."],
    ["Example Trade Finance Bank reviews case.", "Example Trade Finance Bank 审核案件。", "Example Trade Finance Bank 審核案件。", "Example Trade Finance Bank がケースをレビューします。", "Example Trade Finance Bank revisa el caso."],
    ["Rules, pool and pause after approval.", "批准后检查规则、资金池和暂停状态。", "批准後檢查規則、資金池和暫停狀態。", "承認後にルール、プール、一時停止を確認。", "Reglas, pool y pausa tras aprobación."],
    ["Exporter interpretation:", "出口商理解：", "出口商理解：", "輸出者向け解釈:", "Interpretación del exportador:"],
    ["the case is review-ready. The funder can allow, reject, reduce amount, request more material, or move to manual review.", "案件已具备审核条件。资金方可以允许、拒绝、降低金额、要求补充材料，或转人工审核。", "案件已具備審核條件。資金方可以允許、拒絕、降低金額、要求補充材料，或轉人工審核。", "ケースはレビュー可能です。資金提供者は許可、拒否、減額、資料追加要求、手動レビュー移行ができます。", "el caso está listo para revisión. El financiador puede permitir, rechazar, reducir importe, pedir más material o pasar a revisión manual."],
    ["Funder decision required", "需要资金方决策", "需要資金方決策", "資金提供者判断が必要", "Requiere decisión del financiador"],
    ["No bank node", "无银行节点", "無銀行節點", "銀行ノードなし", "Sin nodo bancario"],
    ["Agent + rule path", "Agent + 规则路径", "Agent + 規則路徑", "Agent + ルールパス", "Ruta Agent + regla"],
    ["Dispute or high risk", "争议或高风险", "爭議或高風險", "紛争または高リスク", "Disputa o alto riesgo"],
    ["exporter can see path and status, but cannot approve its own financing.", "出口商可以查看路径和状态，但不能批准自己的融资。", "出口商可以查看路徑和狀態，但不能批准自己的融資。", "輸出者はパスと状態を確認できますが、自分の資金調達を承認できません。", "el exportador puede ver ruta y estado, pero no puede aprobar su propia financiación."],
    ["DeFi execution is shown as a business state facade, not a technical console.", "DeFi 执行以业务状态外观展示，而不是技术控制台。", "DeFi 執行以業務狀態外觀展示，而不是技術控制台。", "DeFi 実行は技術コンソールではなく業務状態の外観として表示されます。", "La ejecución DeFi se muestra como estado de negocio, no como consola técnica."],
    ["Current conditions allow execution, but funds have not arrived until the funding result becomes Completed.", "当前条件允许执行，但只有资金结果变为已完成时才表示资金到账。", "目前條件允許執行，但只有資金結果變為已完成時才表示資金到帳。", "現在の条件では実行可能ですが、資金結果が完了になるまで着金ではありません。", "Las condiciones permiten ejecutar, pero los fondos no llegan hasta que el resultado sea completado."],
    ["Completed is different from allowed, approved, review-ready, or pool-available.", "已完成不同于已允许、已批准、可审核或资金池可用。", "已完成不同於已允許、已批准、可審核或資金池可用。", "完了は、許可済み、承認済み、レビュー可能、プール利用可能とは異なります。", "Completado es diferente de permitido, aprobado, listo para revisión o pool disponible."],
    ["Financing request created.", "融资请求已创建。", "融資請求已建立。", "資金調達リクエストが作成されました。", "Solicitud de financiación creada."],
    ["Mismatch explained.", "差异已解释。", "差異已解釋。", "不一致を説明済み。", "Diferencia explicada."],
    ["Independent fact submitted.", "独立事实已提交。", "獨立事實已提交。", "独立事実を提出済み。", "Hecho independiente enviado."],
    ["USD 92,000 allowed.", "已允许 USD 92,000。", "已允許 USD 92,000。", "USD 92,000 が許可済み。", "USD 92,000 permitido."],
    ["Rule, pool, pause passed.", "规则、资金池、暂停检查已通过。", "規則、資金池、暫停檢查已通過。", "ルール、プール、一時停止を通過。", "Regla, pool y pausa aprobados."],
    ["Funding execution completed.", "资金执行已完成。", "資金執行已完成。", "資金実行が完了しました。", "Ejecución de fondos completada."],
    ["Funding completed at USD 92,000 after funder reduction. Keep case summary available for finance records.", "资金方降低金额后，融资以 USD 92,000 完成。保留案件摘要用于财务记录。", "資金方降低金額後，融資以 USD 92,000 完成。保留案件摘要用於財務記錄。", "資金提供者の減額後、USD 92,000 で資金調達が完了しました。財務記録用にケースサマリーを保持します。", "Financiación completada en USD 92,000 tras reducción del financiador. Mantener resumen para registros financieros."],
    ["Pool insufficient", "资金池不足", "資金池不足", "プール不足", "Pool insuficiente"],
    ["Inspection dispute", "质检争议", "質檢爭議", "検査紛争", "Disputa de inspección"],
    ["Rule blocked", "规则阻断", "規則阻斷", "ルールブロック", "Regla bloqueada"],
    ["Platform paused", "平台暂停", "平台暫停", "プラットフォーム停止", "Plataforma pausada"],
    ["Need materials", "需要材料", "需要材料", "資料が必要", "Necesita materiales"],
    ["Wait and receive updates", "等待并接收更新", "等待並接收更新", "待機して更新を受け取る", "Esperar y recibir actualizaciones"],
    ["Ask Agent for next action", "询问 Agent 下一步", "詢問 Agent 下一步", "Agent に次アクションを確認", "Pedir siguiente acción al Agent"],
    ["Escalate to funder", "升级给资金方", "升級給資金方", "資金提供者へエスカレーション", "Escalar al financiador"],
    ["Close current case", "关闭当前案件", "關閉目前案件", "現在のケースを閉じる", "Cerrar caso actual"]
  ];

  const map = new Map(rows.map((row) => [row[0], row]));

  function language() {
    return localStorage.getItem(langKey) || fallback;
  }

  function translate(text, lang) {
    const original = String(text || "").trim();
    const row = map.get(original);
    return row ? row[indexes[lang] || 0] || original : original;
  }

  function translateTextNodes(lang) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.__chainTraceBusinessOriginal) node.__chainTraceBusinessOriginal = node.nodeValue.trim();
      const next = translate(node.__chainTraceBusinessOriginal, lang);
      node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), next);
    });
  }

  function translateValues(lang) {
    document.querySelectorAll("textarea, option").forEach((node) => {
      if (node.tagName === "OPTION") {
        if (!node.__chainTraceBusinessOriginal) node.__chainTraceBusinessOriginal = node.textContent.trim();
        node.textContent = translate(node.__chainTraceBusinessOriginal, lang);
        return;
      }
      if (!node.dataset.businessOriginalValue) node.dataset.businessOriginalValue = node.value;
      node.value = translate(node.dataset.businessOriginalValue, lang);
    });
  }

  function apply() {
    const lang = language();
    translateTextNodes(lang);
    translateValues(lang);
  }

  window.ChainTraceP0BusinessI18n = { apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(apply, 0));
  else setTimeout(apply, 0);
  document.addEventListener("change", (event) => {
    if (event.target && event.target.matches("[data-language-select]")) setTimeout(apply, 0);
  });
})();
