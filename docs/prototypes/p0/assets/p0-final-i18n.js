(function () {
  var langKey = "chaintrace-p0-language";
  var idx = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  var rows = [
    ["Role Gate", "角色入口", "角色入口", "ロールゲート", "Puerta de rol"],
    ["One wallet maps to one business role. Agent mode is selectable, but it does not change the role boundary.", "一个钱包对应一个业务角色。Agent 模式可以选择，但不会改变角色边界。", "一個錢包對應一個業務角色。Agent 模式可以選擇，但不會改變角色邊界。", "1つのウォレットは1つの業務ロールに対応します。Agent モードは選択できますが、ロール境界は変わりません。", "Una billetera corresponde a un rol de negocio. El modo Agent es seleccionable, pero no cambia el límite del rol."],
    ["Recognized Business Identity", "已识别的业务身份", "已識別的業務身分", "認識済みの事業ID", "Identidad de negocio reconocida"],
    ["Business meaning:", "业务含义：", "業務含義：", "業務上の意味:", "Significado de negocio:"],
    ["this user can create and manage its own financing cases. It cannot review funding, edit inspection conclusions, or operate platform rules.", "该用户可以创建和管理自己的融资案件，但不能审核融资、编辑质检结论或操作平台规则。", "該使用者可以建立和管理自己的融資案件，但不能審核融資、編輯質檢結論或操作平台規則。", "このユーザーは自分の資金調達ケースを作成・管理できますが、資金審査、検査結論の編集、プラットフォームルールの操作はできません。", "este usuario puede crear y gestionar sus propios casos de financiación. No puede revisar financiación, editar conclusiones de inspección ni operar reglas de plataforma."],
    ["What is not shown here", "这里不展示什么", "這裡不展示什麼", "ここで表示しないもの", "Lo que no se muestra aquí"],
    ["Public marketing homepage", "公开营销首页", "公開行銷首頁", "公開マーケティングページ", "Página pública de marketing"],
    ["Role picker for real users", "真实用户角色选择器", "真實使用者角色選擇器", "実用户向けロール選択", "Selector de rol para usuarios reales"],
    ["Proof/hash product page", "证明/hash 产品页", "證明/hash 產品頁", "proof/hash 製品ページ", "Página de producto proof/hash"],
    ["Funder or platform controls", "资金方或平台控制项", "資金方或平台控制項", "資金提供者または平台操作", "Controles de financiador o plataforma"],
    ["Not P0", "非 P0", "非 P0", "P0 対象外", "No P0"],
    ["Not allowed", "不允许", "不允許", "許可されない", "No permitido"],
    ["Deferred", "延后", "延後", "後回し", "Diferido"],
    ["Out of role", "角色外", "角色外", "ロール範囲外", "Fuera del rol"],
    ["Agent Todo", "Agent 待办", "Agent 待辦", "Agent タスク", "Tarea del Agent"],
    ["Agent assists, but does not edit the invoice or invent the explanation.", "Agent 辅助处理，但不会编辑发票或编造说明。", "Agent 輔助處理，但不會編輯發票或編造說明。", "Agent は支援しますが、インボイス編集や説明の捏造はしません。", "El Agent asiste, pero no edita la factura ni inventa la explicación."],
    ["Todo: Explain Invoice Amount Difference", "待办：说明发票金额差异", "待辦：說明發票金額差異", "タスク：インボイス金額差異の説明", "Tarea: explicar diferencia de factura"],
    ["Critical", "关键", "關鍵", "重要", "Crítico"],
    ["Resolution type", "解决类型", "解決類型", "解決タイプ", "Tipo de resolución"],
    ["Who is responsible", "谁负责", "誰負責", "担当者", "Quién es responsable"],
    ["Supporting file", "支持文件", "支持文件", "補足ファイル", "Archivo de soporte"],
    ["Return target", "返回目标", "返回目標", "戻り先", "Destino de retorno"],
    ["Ready to submit", "可提交", "可提交", "提出可能", "Listo para enviar"],
    ["Explanation text", "说明文本", "說明文字", "説明テキスト", "Texto de explicación"],
    ["Business reason", "业务原因", "業務原因", "業務理由", "Razón de negocio"],
    ["Responsible role", "责任角色", "責任角色", "責任ロール", "Rol responsable"],
    ["Suggested material", "建议材料", "建議材料", "推奨資料", "Material sugerido"],
    ["Completion standard", "完成标准", "完成標準", "完了基準", "Criterio de cierre"],
    ["Return state", "返回状态", "返回狀態", "戻り状態", "Estado de retorno"],
    ["After Re-check Preview", "重新检查后预览", "重新檢查後預覽", "再チェック後プレビュー", "Vista tras revisión"],
    ["Invoice mismatch", "发票不匹配", "發票不匹配", "インボイス不一致", "Diferencia de factura"],
    ["Explained", "已解释", "已解釋", "説明済み", "Explicado"],
    ["Submission readiness", "提交准备度", "提交準備度", "提出準備状況", "Preparación de envío"],
    ["Next node", "下一节点", "下一節點", "次ノード", "Siguiente nodo"],
    ["Inspection task", "质检任务", "質檢任務", "検査タスク", "Tarea de inspección"],
    ["Agent boundary", "Agent 边界", "Agent 邊界", "Agent 境界", "Límite del Agent"],
    ["No fact creation", "不创建事实", "不建立事實", "事実作成なし", "Sin crear hechos"],
    ["Prototype behavior:", "原型行为：", "原型行為：", "プロトタイプ動作:", "Comportamiento del prototipo:"],
    ["clicking the action moves to inspection status as if the exporter submitted the explanation and Agent re-checked the case.", "点击动作会进入质检状态，就像出口商已提交说明且 Agent 已重新检查案件。", "點擊動作會進入質檢狀態，就像出口商已提交說明且 Agent 已重新檢查案件。", "アクションをクリックすると、輸出者が説明を提出し Agent が再チェックしたものとして検査ステータスへ進みます。", "al hacer clic se pasa al estado de inspección como si el exportador enviara la explicación y el Agent revisara de nuevo."],
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
    ["Return to role gate", "返回角色入口", "返回角色入口", "ロールゲートへ戻る", "Volver a puerta de rol"],
    ["Agent Closing Summary", "Agent 收尾摘要", "Agent 收尾摘要", "Agent クロージングサマリー", "Resumen final del Agent"],
    ["Material conflict", "材料冲突", "材料衝突", "資料不一致", "Conflicto de material"],
    ["Funding decision", "融资决策", "融資決策", "資金調達判断", "Decisión de financiación"],
    ["Execution", "执行", "執行", "実行", "Ejecución"],
    ["Exporter closing note", "出口商结案备注", "出口商結案備註", "輸出者クロージングメモ", "Nota final del exportador"],
    ["Exporter-visible Exception States", "出口商可见异常状态", "出口商可見異常狀態", "輸出者に見える例外状態", "Estados de excepción visibles"],
    ["The same result page also shows how blockers are explained when the happy path does not complete.", "同一个结果页也展示正常路径未完成时，阻断项如何向出口商解释。", "同一個結果頁也展示正常路徑未完成時，阻斷項如何向出口商解釋。", "同じ結果ページで、正常パスが完了しない場合のブロッカー説明も表示します。", "La misma página muestra cómo se explican bloqueos cuando la ruta feliz no se completa."]
  ];
  var map = new Map(rows.map(function (row) { return [row[0], row]; }));
  function lang() { return localStorage.getItem(langKey) || "en"; }
  function tr(text, language) {
    var original = String(text || "").trim();
    var row = map.get(original);
    return row ? row[idx[language] || 0] || original : original;
  }
  function run() {
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
      if (!node.__p0FinalOriginal) node.__p0FinalOriginal = node.nodeValue.trim();
      node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), tr(node.__p0FinalOriginal, language));
    });
    document.querySelectorAll("option, textarea").forEach(function (node) {
      var prop = node.tagName === "OPTION" ? "textContent" : "value";
      if (!node.__p0FinalOriginal) node.__p0FinalOriginal = String(node[prop] || "").trim();
      node[prop] = tr(node.__p0FinalOriginal, language);
    });
  }
  window.ChainTraceP0FinalI18n = { apply: run };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(run, 0); });
  else setTimeout(run, 0);
  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-language-select]")) setTimeout(run, 0);
  });
})();
